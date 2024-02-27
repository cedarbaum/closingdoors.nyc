import { Alert } from "@/generated/proto/transiter/public";
import { getNycDateTimeStringFromSeconds } from "@/utils/dateTimeUtils";
import apiQuotaAvailable, { rateLimitingEnabled } from "@/utils/rateLimiting";
import {
  getAlerts,
  getHumanReadableActivePeriodFromAlert,
  getRouteIsRunning,
  getRoutes,
} from "@/utils/transiterUtils";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  ChatCompletionFunctions,
  ChatCompletionRequestMessage,
  Configuration,
  OpenAIApi,
} from "openai";
import {
  Client,
  DirectionsResponse,
  TransitMode,
  TransitRoutingPreference,
  TravelMode,
} from "@googlemaps/google-maps-services-js";
import assert from "assert";
import log from "@/utils/log";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export type DatasourceType = "google_maps";
export type Datasource = {
  type: DatasourceType;
  attributions: string[];
  warnings: string[];
  urls: string[];
};

export type ChatData = {
  nextMessage: string;
  datasources: Datasource[];
};

type Error = {
  error: string;
};

type Message = {
  id: string;
  text: string;
  role: "user" | "assistant" | "system";
};

const MESSAGE_HISTORY_LIMIT = parseInt(
  process.env.NEXT_PUBLIC_CHAT_MESSAGE_HISTORY_LIMIT || "5"
);

const MAX_MESSAGE_LENGTH = parseInt(
  process.env.NEXT_PUBLIC_CHAT_MAX_MESSAGE_LENGTH || "2048"
);

const MAX_FUNCTION_CALLS = parseInt(
  process.env.NEXT_PUBLIC_CHAT_MAX_FUNCTION_CALLS || "5"
);

type ChatTransitMode = "subway" | "bus" | "subway_and_bus";
type ChatTransitRoutingPreference = "less_walking" | "fewer_transfers" | "none";

const functions: ChatCompletionFunctions[] = [
  {
    name: "get_running_routes",
    description: "Get all currently running routes in a transit system",
    parameters: {
      type: "object",
      properties: {
        system: {
          type: "string",
          description: "The transit system",
        },
      },
    },
  },
  {
    name: "get_route_alerts",
    description: "Get service alerts for routes in a transit system",
    parameters: {
      type: "object",
      properties: {
        system: {
          type: "string",
          description: "The transit system",
        },
        routes: {
          type: "array",
          items: {
            type: "string",
          },
          description: "The routes to get alerts for",
        },
      },
    },
  },
  {
    name: "get_transit_directions",
    description: "Get transit directions between two locations",
    parameters: {
      type: "object",
      properties: {
        origin: {
          type: "string",
          description: "The origin location",
        },
        destination: {
          type: "string",
          description: "The destination location",
        },
        transit_mode: {
          type: "string",
          descrition: "The mode of transit",
          enum: ["subway", "bus", "subway_and_bus"],
        },
        transit_routing_preference: {
          type: "string",
          descrition: "Transit routing preferences",
          enum: ["less_walking", "fewer_transfers", "none"],
        },
      },
      required: ["origin", "destination"],
    },
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatData | Error>
) {
  if (rateLimitingEnabled() && !(await apiQuotaAvailable(req))) {
    res.status(429).json({ error: "Exceeded request limit" });
    return;
  }

  const { messages, context } = JSON.parse(req.body) as {
    messages: Message[];
    context: {
      userLocation?: {
        latitude: number;
        longitude: number;
      };
    };
  };

  const validMessages = messages.filter(
    (m) => m.role === "assistant" || m.role === "user"
  );
  const limitedMessages = validMessages.slice(
    Math.max(validMessages.length - MESSAGE_HISTORY_LIMIT, 0)
  );

  for (const message of limitedMessages) {
    if (message.text.length > MAX_MESSAGE_LENGTH) {
      res.status(400).json({ error: "Message too long" });
      return;
    }
  }

  const systemPrompt = {
    role: "system",
    content: `You're a chatbot that knows all about NYC subway system. Users will ask you questions about the subway and you will answer them.
Whenever you reference a subway route letter or number, always enclose it in square brackets.
Whenever you reference a running route, ensure the symbol is enclosed in square brackets.
${
  context.userLocation
    ? `The user's current location is ${context.userLocation.latitude},${context.userLocation.longitude}`
    : ""
}`,
  };

  const allMessages = [
    systemPrompt,
    ...limitedMessages.map((m) => ({
      role: m.role,
      content: m.text,
    })),
  ] as ChatCompletionRequestMessage[];

  let numFunctionCalls = 0;
  const datasources: Datasource[] = [];

  function addOrMergeDatasource(
    datasourceType: DatasourceType,
    attributions: string[],
    warnings: string[],
    urls: string[]
  ) {
    const existingDatasource = datasources.find(
      (d) => d.type === datasourceType
    );
    if (existingDatasource === undefined) {
      datasources.push({
        type: datasourceType,
        attributions,
        warnings,
        urls,
      });
    } else {
      existingDatasource.attributions.push(...attributions);
      existingDatasource.warnings.push(...warnings);
      existingDatasource.urls.push(...urls);
    }
  }

  do {
    try {
      const response = await openai.createChatCompletion(
        {
          model: "gpt-3.5-turbo-0613",
          messages: allMessages,
          functions: functions,
          function_call: "auto",
        },
        { timeout: 15000 }
      );

      const functionCall = response.data.choices[0].message?.function_call;
      const functionArgs = JSON.parse(functionCall?.arguments ?? "{}");
      const responseMessageContent = response.data.choices[0].message?.content;

      if (functionCall !== undefined) {
        allMessages.push(response.data.choices[0].message!);
        switch (functionCall.name) {
          case "get_running_routes":
            allMessages.push({
              role: "function",
              name: "get_running_routes",
              content: JSON.stringify(
                (await getRunningRoutes("us-ny-subway")).map((r) => `${r.id}`)
              ),
            });
            break;
          case "get_route_alerts":
            allMessages.push({
              role: "function",
              name: "get_route_alerts",
              content: JSON.stringify(
                await getRouteAlerts("us-ny-subway", functionArgs.routes)
              ),
            });
            break;
          case "get_transit_directions":
            if (!functionArgs.origin || !functionArgs.destination) {
              throw new Error(
                "get_transit_directions requires origin and destination"
              );
            }

            const { directions, warnings, copyrights, error, url } =
              await get_transit_directions(
                functionArgs.origin,
                functionArgs.destination,
                functionArgs.transit_mode,
                functionArgs.transit_routing_preference
              );

            if (error) {
              allMessages.push({
                role: "function",
                name: "get_transit_directions",
                content: error,
              });
              break;
            }

            addOrMergeDatasource(
              "google_maps",
              copyrights ? [copyrights] : [],
              warnings ?? [],
              url ? [url] : []
            );

            allMessages.push({
              role: "function",
              name: "get_transit_directions",
              content: JSON.stringify(directions),
            });
            break;
          default:
            throw new Error(`Unknown function call: ${functionCall.name}`);
        }
      } else {
        res.status(200).json({
          nextMessage: responseMessageContent!,
          datasources,
        });
        return;
      }
    } catch (e: any) {
      log.error(e?.message);
      throw e;
    }
  } while (numFunctionCalls++ < MAX_FUNCTION_CALLS);

  log.error("Too many function calls", numFunctionCalls);
  res.status(429).json({ error: "Too many functional calls." });
}

async function getRunningRoutes(system: string) {
  const routes = await getRoutes(system);
  return routes.filter((r) => getRouteIsRunning(r));
}

async function getRouteAlerts(system: string, routes?: string[]) {
  const routesSet = routes ? new Set(routes.map((r) => r.toUpperCase())) : null;
  let allRoutes = await getRoutes(system as string, true);
  allRoutes =
    routesSet !== null
      ? allRoutes.filter((route) => routesSet.has(route.id))
      : allRoutes;

  // Map alert ID to alert
  const alerts = await getAlerts(system as string);
  const alertIdToAlert = new Map(
    alerts.map((alert) => [alert.id, alert] as [string, Alert])
  );

  // Map each alert to all routes it affects. This is to avoid outputting
  // the same alert text multiple times, which is slow/expensive.
  const alertIdToAffectedRoutes = new Map<string, string[]>();
  for (const alert of alerts) {
    for (const route of allRoutes) {
      if (!route.alerts.find((a) => a.id === alert.id)) {
        continue;
      }

      if (!alertIdToAffectedRoutes.has(alert.id)) {
        alertIdToAffectedRoutes.set(alert.id, []);
      }

      alertIdToAffectedRoutes.get(alert.id)?.push(route.id);
      alertIdToAffectedRoutes.get(alert.id)?.sort();
    }
  }

  // For every route group, map it to all alerts effecting every
  // route in the group.
  const routeGroupsToAllAlerts = new Map<string, string[]>();
  for (const [alertId, affectedRoutes] of Array.from(
    alertIdToAffectedRoutes.entries()
  )) {
    const routeGroup = affectedRoutes.join(",");
    if (!routeGroupsToAllAlerts.has(routeGroup)) {
      routeGroupsToAllAlerts.set(routeGroup, []);
    }

    routeGroupsToAllAlerts.get(routeGroup)?.push(alertId);
  }

  const getCurrentActivePeriod = (alert: Alert | undefined) => {
    if (alert === undefined) {
      return undefined;
    }

    const humanReadableActivePeriod =
      getHumanReadableActivePeriodFromAlert(alert);

    if (humanReadableActivePeriod !== undefined) {
      return humanReadableActivePeriod;
    }

    if (alert.currentActivePeriod !== undefined) {
      return {
        startsAt: alert?.currentActivePeriod?.startsAt
          ? getNycDateTimeStringFromSeconds(
              parseInt(
                alert?.currentActivePeriod?.startsAt! as unknown as string
              )
            )
          : undefined,
        endsAt: alert?.currentActivePeriod?.endsAt
          ? getNycDateTimeStringFromSeconds(
              parseInt(alert?.currentActivePeriod?.endsAt! as unknown as string)
            )
          : undefined,
      };
    }

    return undefined;
  };

  return Array.from(routeGroupsToAllAlerts).map(([routeGroup, alertIds]) => {
    return {
      affected_routes: routeGroup.split(","),
      alerts:
        alertIds
          ?.map((alertId) => alertIdToAlert.get(alertId))
          .filter((a) => a !== undefined)
          .map((a) => ({
            header: a?.header.find((h) => h.language === "en")?.text,
            description: a?.description.find((d) => d.language === "en")?.text,
            url: a?.url?.find((u) => u.language === "en")?.text,
            cause: a?.cause as unknown as string,
            effect: a?.effect as unknown as string,
            current_active_period: getCurrentActivePeriod(a),
          })) ?? [],
    };
  });
}

type DirectionStep = {
  distance: string;
  duration: string;
  html_instructions: string;
  travel_mode: string;
  arrival_stop?: string;
  arrival_time?: string;
  departure_stop?: string;
  departure_time?: string;
  headsign?: string;
  line?: string;
  num_stops?: number;
};

type Directions = {
  start_address: string;
  end_address: string;
  distance: string;
  duration: string;
  arrival_time: string;
  departure_time: string;
  steps: DirectionStep[];
};

async function get_transit_directions(
  origin: string,
  destination: string,
  chatTransitMode?: ChatTransitMode,
  chatTransitRoutingPreference?: ChatTransitRoutingPreference
): Promise<{
  directions?: Directions;
  url?: string;
  warnings?: string[];
  copyrights?: string;
  error?: string;
}> {
  log.debug("get_transit_directions", {
    origin,
    destination,
    chatTransitMode,
    chatTransitRoutingPreference,
  });

  let transit_mode: TransitMode[];
  switch (chatTransitMode) {
    case "subway_and_bus":
      transit_mode = [TransitMode.bus, TransitMode.subway];
      break;
    case "bus":
      transit_mode = [TransitMode.bus];
      break;
    case "subway":
    default:
      transit_mode = [TransitMode.subway];
      break;
  }

  let transit_routing_preference: TransitRoutingPreference | undefined;
  switch (chatTransitRoutingPreference) {
    case "less_walking":
      transit_routing_preference = TransitRoutingPreference.less_walking;
      break;
    case "fewer_transfers":
      transit_routing_preference = TransitRoutingPreference.fewer_transfers;
      break;
    case "none":
    default:
      transit_routing_preference = undefined;
      break;
  }

  let directionsResponse: DirectionsResponse;
  try {
    const client = new Client({});
    directionsResponse = await client.directions({
      params: {
        origin,
        destination,
        mode: TravelMode.transit,
        alternatives: true,
        transit_mode,
        transit_routing_preference,
        region: "us",
        key: process.env.GOOGLE_MAPS_API_KEY!,
      },
      timeout: 1000,
    });
  } catch (err: any) {
    const responseData = err?.response as DirectionsResponse | undefined;

    // Find which waypoint, if any, could not be geocoded
    const indexOfInvalidWaypoint =
      responseData?.data?.geocoded_waypoints?.findIndex(
        (g) => g.geocoder_status === "ZERO_RESULTS"
      );

    if (indexOfInvalidWaypoint !== undefined) {
      if (indexOfInvalidWaypoint === 0) {
        return {
          error: `Couldn't find a location called "${origin}". Try using a more specific location or address.`,
        };
      } else if (indexOfInvalidWaypoint === 1) {
        return {
          error: `Couldn't find a location called "${destination}". Try using a more specific location or address.`,
        };
      }
    }

    throw err;
  }

  if (directionsResponse.data.routes.length === 0) {
    return {
      error: `Couldn't find a route between "${origin}" and "${destination}"`,
    };
  }

  // No waypoints, so there should only be one leg
  assert(directionsResponse.data.routes[0].legs.length === 1);

  const steps: DirectionStep[] = [];
  for (const step of directionsResponse.data.routes[0].legs[0].steps) {
    const transitDetails = step.transit_details;
    if (transitDetails) {
      const arrivalStop = transitDetails.arrival_stop?.name;
      const arrivalTime = transitDetails.arrival_time?.text;
      const departureStop = transitDetails.departure_stop?.name;
      const departureTime = transitDetails.departure_time?.text;
      const line = transitDetails.line?.short_name;
      const headsign = transitDetails.headsign;
      const numStops = transitDetails.num_stops;

      steps.push({
        distance: step.distance.text,
        duration: step.duration.text,
        html_instructions: step.html_instructions,
        travel_mode: step.travel_mode,
        arrival_stop: arrivalStop,
        arrival_time: arrivalTime,
        departure_stop: departureStop,
        departure_time: departureTime,
        line: line,
        headsign: headsign,
        num_stops: numStops,
      });
    } else {
      steps.push({
        distance: step.distance.text,
        duration: step.duration.text,
        html_instructions: step.html_instructions,
        travel_mode: step.travel_mode,
      });
    }
  }

  const directions = {
    start_address: directionsResponse.data.routes[0].legs[0]?.start_address,
    end_address: directionsResponse.data.routes[0].legs[0]?.end_address,
    distance: directionsResponse.data.routes[0].legs[0].distance?.text,
    duration: directionsResponse.data.routes[0].legs[0].duration?.text,
    arrival_time: directionsResponse.data.routes[0].legs[0].arrival_time?.text,
    departure_time:
      directionsResponse.data.routes[0].legs[0].departure_time?.text,
    steps: steps,
  };

  const googleMapsUrl = encodeURI(
    `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=transit`
  );

  return {
    directions,
    warnings: directionsResponse.data.routes[0].warnings,
    copyrights: directionsResponse.data.routes[0].copyrights,
    url: googleMapsUrl,
  };
}

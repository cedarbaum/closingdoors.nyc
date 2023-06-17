import { Alert } from "@/generated/proto/transiter/public";
import { getNycDateTimeStringFromSeconds } from "@/utils/DateTimeUtils";
import apiQuotaAvailable from "@/utils/RateLimiting";
import {
  getAlerts,
  getRouteIsRunning,
  getRoutes,
} from "@/utils/TransiterUtils";
import { DateTime } from "luxon";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  ChatCompletionFunctions,
  ChatCompletionRequestMessage,
  Configuration,
  OpenAIApi,
} from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

type Data = {
  nextMessage: string;
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
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | Error>
) {
  if (!(await apiQuotaAvailable(req))) {
    res.status(429).json({ error: "Exceeded request limit" });
    return;
  }

  const { messages } = JSON.parse(req.body) as {
    messages: Message[];
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
Whenever you reference a running route, ensure the symbol is enclosed in square brackets.`,
  };

  const allMessages = [
    systemPrompt,
    ...limitedMessages.map((m) => ({
      role: m.role,
      content: m.text,
    })),
  ] as ChatCompletionRequestMessage[];

  let numFunctionCalls = 0;
  do {
    try {
      const response = await openai.createChatCompletion(
        {
          model: "gpt-3.5-turbo-0613",
          messages: allMessages,
          functions: functions,
          function_call: "auto",
        },
        { timeout: 10000 }
      );

      const functionCall = response.data.choices[0].message?.function_call;
      const functionArgs = JSON.parse(functionCall?.arguments ?? "{}");
      const responseMessageContent = response.data.choices[0].message?.content;

      if (functionCall !== undefined) {
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
          default:
            throw new Error(`Unknown function call: ${functionCall.name}`);
        }
      } else {
        res.status(200).json({ nextMessage: responseMessageContent! });
        return;
      }
    } catch (e: any) {
      console.error(e?.message);
      throw e;
    }
  } while (numFunctionCalls++ < MAX_FUNCTION_CALLS);

  console.error("Too many function calls", numFunctionCalls);
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
            current_active_period: a?.currentActivePeriod
              ? {
                  startsAt: a?.currentActivePeriod?.startsAt
                    ? getNycDateTimeStringFromSeconds(
                        parseInt(
                          a?.currentActivePeriod?.startsAt! as unknown as string
                        )
                      )
                    : undefined,
                  endsAt: a?.currentActivePeriod?.endsAt
                    ? getNycDateTimeStringFromSeconds(
                        parseInt(
                          a?.currentActivePeriod?.endsAt! as unknown as string
                        )
                      )
                    : undefined,
                }
              : undefined,
          })) ?? [],
    };
  });
}

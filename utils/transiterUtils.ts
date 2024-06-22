import {
  Alert,
  ListAlertsReply,
  ListRoutesReply,
  ListStopsReply,
  Route,
  Shape,
  Stop,
  Trip,
  Vehicle,
} from "@/generated/proto/transiter/public";

const TRANSITER_URL = process.env.TRANSITER_URL!;

export async function getNearbyStops(
  system: string,
  latitude: string,
  longitude: string,
  max_distance_km: number | string,
  limit?: number | number | null
) {
  const stopsDataResp = await fetch(
    `${TRANSITER_URL}/systems/${system}/stops?` +
      new URLSearchParams({
        search_mode: "DISTANCE",
        latitude: latitude,
        longitude: longitude,
        max_distance: max_distance_km.toString(),
        limit: limit ? limit.toString() : "500",
        skip_service_maps: "true",
        skip_transfers: "true",
      })
  );

  if (!stopsDataResp.ok) {
    throw new Error(`Failed to fetch stops for ${system}`);
  }

  return ((await stopsDataResp.json()) as ListStopsReply).stops;
}

export async function getRoutes(system: string, skip_service_maps = false) {
  const routesResp = await fetch(
    `${TRANSITER_URL}/systems/${system}/routes?` +
      new URLSearchParams({
        skip_service_maps: skip_service_maps.toString(),
      })
  );

  if (!routesResp.ok) {
    throw new Error(
      `Failed to get routes for system ${system} with status ${routesResp.status}`
    );
  }

  return ((await routesResp.json()) as ListRoutesReply).routes;
}

export async function getAlerts(system: string) {
  const alertsResp = await fetch(`${TRANSITER_URL}/systems/${system}/alerts`);

  if (!alertsResp.ok) {
    throw new Error(
      `Failed to get alerts for system ${system} with status ${alertsResp.status}`
    );
  }

  return ((await alertsResp.json()) as ListAlertsReply).alerts;
}

export async function getTrip(
  system: string,
  route_id: string,
  trip_id: string
) {
  const tripResp = await fetch(
    `${TRANSITER_URL}/systems/${system}/routes/${route_id}/trips/${trip_id}`
  );

  if (!tripResp.ok) {
    throw new Error(
      `Failed to get trip for system ${system} with status ${tripResp.status}`
    );
  }

  return (await tripResp.json()) as Trip;
}

export async function getStop(system: string, stop_id: string) {
  const stopResp = await fetch(
    `${TRANSITER_URL}/systems/${system}/stops/${stop_id}`
  );

  if (!stopResp.ok) {
    throw new Error(
      `Failed to get stop for system ${system} with status ${stopResp.status}`
    );
  }

  return (await stopResp.json()) as Stop;
}

export async function getShape(system: string, shape: string) {
  const shapeResp = await fetch(
    `${TRANSITER_URL}/systems/${system}/shapes/${shape}`
  );

  if (!shapeResp.ok) {
    throw new Error(
      `Failed to get shape for system ${system} with status ${shapeResp.status}`
    );
  }

  return (await shapeResp.json()) as Shape;
}

export async function getVehicle(system: string, vehicle_id: string) {
  const vehicleResp = await fetch(
    `${TRANSITER_URL}/systems/${system}/vehicles/${vehicle_id}`
  );

  if (!vehicleResp.ok) {
    throw new Error(
      `Failed to get vehicle for system ${system} with status ${vehicleResp.status}`
    );
  }

  return (await vehicleResp.json()) as Vehicle;
}

export async function listStopsByIds(
  system: string,
  ids: string[],
  skip_service_maps = false,
  skip_transfers = false,
  skip_stop_times = false,
  skip_alerts = false
) {
  const params = new URLSearchParams({
    skip_service_maps: skip_service_maps.toString(),
    skip_transfers: skip_transfers.toString(),
    skip_stop_times: skip_stop_times.toString(),
    skip_alerts: skip_alerts.toString(),
    only_return_specified_ids: true.toString(),
  });

  for (const id of ids) {
    params.append("id", id);
  }

  const stopsResp = await fetch(
    `${TRANSITER_URL}/systems/${system}/stops?` + params
  );

  if (!stopsResp.ok) {
    throw new Error(
      `Failed to get stops for system ${system} with status ${stopsResp.status}`
    );
  }

  return ((await stopsResp.json()) as ListStopsReply).stops;
}

export function getRouteIsRunning(route: Route): boolean | undefined {
  const stops = route.serviceMaps?.find(
    (map) => map.configId === "realtime"
  )?.stops;
  if (stops === undefined) {
    return undefined;
  }

  return stops.length > 0;
}

export function getNYCTAlertsMetadata(alert: Alert | undefined) {
  return alert?.description.find(
    (description) =>
      description.language ===
      "github.com/jamespfennell/gtfs/extensions/nyctalerts/Metadata"
  )?.text;
}

export function getHumanReadableActivePeriodFromAlert(alert: Alert) {
  const alertMetadata = getNYCTAlertsMetadata(alert);
  if (alertMetadata === undefined) {
    return undefined;
  }

  const parsedMetadata = JSON.parse(alertMetadata);
  if (parsedMetadata?.HumanReadableActivePeriod !== undefined) {
    return parsedMetadata.HumanReadableActivePeriod;
  }

  return undefined;
}

import {
  Alert,
  ListAlertsReply,
  ListRoutesReply,
  ListStopsReply,
  Route,
} from "@/generated/proto/transiter/public";

const TRANSITER_URL = process.env.TRANSITER_URL!;

export async function getNearbyStops(
  system: string,
  latitude: string,
  longitude: string,
  max_distance_km: number | string
) {
  const stopsDataResp = await fetch(
    `${TRANSITER_URL}/systems/${system}/stops?` +
      new URLSearchParams({
        search_mode: "DISTANCE",
        latitude: latitude,
        longitude: longitude,
        max_distance: max_distance_km.toString(),
        limit: "500",
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

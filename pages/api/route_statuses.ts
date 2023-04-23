import {
  Alert,
  ListAlertsReply,
  ListRoutesReply,
  Route,
} from "@/generated/proto/transiter/public";
import type { NextApiRequest, NextApiResponse } from "next";

const TRANSITER_URL = process.env.TRANSITER_URL!;

export type RouteStatuses = {
  route: string;
  running?: boolean;
  alerts: Alert[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RouteStatuses[] | { error: string }>
) {
  const { system, routes, get_is_running } = req.query;
  if (system === undefined) {
    res.status(400).json({ error: "system is required" });
    return;
  }

  const routesSet = routes
    ? new Set((routes as string).split(",").map((r) => r.toUpperCase()))
    : null;
  let allRoutes = await getRoutes(system as string, get_is_running !== "true");
  allRoutes =
    routesSet !== null
      ? allRoutes.filter((route) => routesSet.has(route.id))
      : allRoutes;

  const alerts = await getAlerts(system as string);
  const alertIdToAlert = new Map(
    alerts.map((alert) => [alert.id, alert] as [string, Alert])
  );

  const routeStatusesResp = allRoutes.map((route) => {
    return {
      route: route.id,
      running: get_is_running === "true" ? getRouteIsRunning(route) : undefined,
      alerts:
        route.alerts
          ?.map((alertRef) => alertIdToAlert.get(alertRef.id))
          .filter((a) => a !== undefined) ?? [],
    };
  }) as RouteStatuses[];

  res.status(200).json(routeStatusesResp);
}

function getRouteIsRunning(route: Route): boolean | undefined {
  const stops = route.serviceMaps?.find(
    (map) => map.configId === "realtime"
  )?.stops;
  if (stops === undefined) {
    return undefined;
  }

  return stops.length > 0;
}

async function getRoutes(system: string, skip_service_maps = false) {
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

async function getAlerts(system: string) {
  const alertsResp = await fetch(`${TRANSITER_URL}/systems/${system}/alerts`);

  if (!alertsResp.ok) {
    throw new Error(
      `Failed to get alerts for system ${system} with status ${alertsResp.status}`
    );
  }

  return ((await alertsResp.json()) as ListAlertsReply).alerts;
}

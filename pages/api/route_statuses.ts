import { Alert } from "@/generated/proto/transiter/public";
import {
  getAlerts,
  getRouteIsRunning,
  getRoutes,
} from "@/utils/TransiterUtils";
import type { NextApiRequest, NextApiResponse } from "next";

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

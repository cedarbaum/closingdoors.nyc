export const runtime = "edge";

import { Alert } from "@/generated/proto/transiter/public";
import {
  getAlerts,
  getRouteIsRunning,
  getRoutes,
} from "@/utils/transiterUtils";

export type RouteStatuses = {
  route: string;
  running?: boolean;
  alerts: Alert[];
};

export default async function handler(req: Request) {
  const { system, routes, get_is_running, only_get_routes_with_alerts } =
    getEdgeQueryParams(req);
  if (system === null) {
    return new Response("Missing system", { status: 400 });
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
    alerts.map((alert) => [alert.id, alert] as [string, Alert]),
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

  if (only_get_routes_with_alerts === "true") {
    return new Response(
      JSON.stringify(routeStatusesResp.filter((r) => r.alerts.length > 0)),
      { status: 200 },
    );
  }

  return new Response(JSON.stringify(routeStatusesResp), { status: 200 });
}

function getEdgeQueryParams(req: Request) {
  const searchParams = new URL(req.url ?? "").searchParams;
  return {
    system: searchParams.get("system"),
    routes: searchParams.get("routes"),
    get_is_running: searchParams.get("get_is_running"),
    only_get_routes_with_alerts: searchParams.get(
      "only_get_routes_with_alerts",
    ),
  };
}

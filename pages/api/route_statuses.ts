import {
  Alert,
  ListTripsReply,
  ListAlertsReply,
  ListRoutesReply,
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
  const { system, routes, get_is_running, get_is_running_best_effort } =
    req.query;
  if (system === undefined) {
    res.status(400).json({ error: "system is required" });
    return;
  }

  const routesSet = routes
    ? new Set((routes as string).split(",").map((r) => r.toUpperCase()))
    : null;
  let allRoutes = await getRoutes(system as string);
  allRoutes =
    routesSet !== null
      ? allRoutes.filter((route) => routesSet.has(route.id))
      : allRoutes;

  let routeToTripStatus: Map<string, boolean | undefined> | null = null;
  if (get_is_running === "true") {
    const routeTripCalls = allRoutes.map(async (route) => {
      try {
        const trips = await getTrips(system as string, route.id);
        return [route.id, trips?.length > 0] as [string, boolean];
      } catch (err: any) {
        if (
          get_is_running_best_effort === undefined ||
          get_is_running_best_effort !== "true"
        ) {
          throw err;
        }

        console.error(
          `Failed to get route trips for ${route.id} with error ${err}, returning undefined for running`
        );

        return [route.id, undefined] as [string, boolean | undefined];
      }
    });

    const routeTripStatus = await Promise.all(routeTripCalls);
    routeToTripStatus = new Map(routeTripStatus);
  }

  const alerts = await getAlerts(system as string);
  const alertIdToAlert = new Map(
    alerts.map((alert) => [alert.id, alert] as [string, Alert])
  );

  const routeStatusesResp = allRoutes.map((route) => {
    return {
      route: route.id,
      running: routeToTripStatus ? routeToTripStatus.get(route.id) : undefined,
      alerts:
        route.alerts
          ?.map((alertRef) => alertIdToAlert.get(alertRef.id))
          .filter((a) => a !== undefined) ?? [],
    };
  }) as RouteStatuses[];

  res.status(200).json(routeStatusesResp);
}

async function getRoutes(system: string) {
  const routesResp = await fetch(`${TRANSITER_URL}/systems/${system}/routes`);

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

async function getTrips(system: string, route: string) {
  const tripsResp = await fetch(
    `${TRANSITER_URL}/systems/${system}/routes/${route}/trips`
  );

  if (!tripsResp.ok) {
    throw new Error(
      `Failed to get trips for route ${route} with status ${tripsResp.status}`
    );
  }

  return ((await tripsResp.json()) as ListTripsReply).trips;
}

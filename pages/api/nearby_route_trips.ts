import {
  Stop as TransiterStop,
  StopTime,
} from "@/generated/proto/transiter/public";
import { getNearbyStops } from "@/utils/TransiterUtils";
import haversineDistance from "haversine-distance";
import type { NextApiRequest, NextApiResponse } from "next";

export type Stop = {
  id: string;
  name: string;
  distance: number;
};

export type Trip = {
  id: string;
  arrival: number;
};

export type RouteTrips = {
  route: string;
  trips: Trip[];
};

export type StopRouteTrips = {
  stop: Stop;
  routeTrips: RouteTrips[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StopRouteTrips[] | { error: string }>
) {
  const { system, latitude, longitude, routes, direction_id, stop_type } =
    req.query;
  if (latitude === undefined || longitude === undefined) {
    res.status(400).json({ error: "Missing latitude or longitude" });
    return;
  }

  if (system === undefined) {
    res.status(400).json({ error: "Missing system" });
    return;
  }

  const stops = await getNearbyStops(
    system as string,
    latitude as string,
    longitude as string,
    getMaxStopDistance(system as string)
  );

  const stopDistanceByStopId = new Map<string, number>(
    stops.map((stop) => [
      stop.id,
      haversineDistance(
        { lat: stop.latitude!, lon: stop.longitude! },
        {
          lat: parseFloat(latitude as string),
          lon: parseFloat(longitude as string),
        }
      ),
    ])
  );

  const routesSet = routes
    ? new Set((routes as string).split(",").map((r) => r.toUpperCase()))
    : null;

  const stopRouteTrips = stops
    .filter(
      (stop) =>
        stop_type === undefined ||
        (stop_type === "parent" && stop.parentStop === undefined) ||
        (stop_type === "child" && stop.parentStop !== undefined)
    )
    .map((stop) => ({
      stop: {
        id: stop.id,
        name: stop.name!,
        distance: stopDistanceByStopId.get(stop.id)!,
      },
      routeTrips: getTripsByRouteForStop(
        stop,
        routesSet,
        direction_id !== undefined ? direction_id === "true" : null
      ),
    }))
    .filter(({ routeTrips }) => routeTrips.length > 0)
    .sort((a, b) => a.stop.distance - b.stop.distance) as StopRouteTrips[];

  res.status(200).json(stopRouteTrips);
}

function getTripsByRouteForStop(
  stop: TransiterStop,
  routes: Set<string> | null,
  direction_id: boolean | null
) {
  const stopTimesByRoute = stop.stopTimes
    .filter(
      (stopTime) =>
        stopTime.trip !== undefined &&
        (direction_id === null || stopTime?.trip.directionId === direction_id)
    )
    .reduce((grouped, stopTime) => {
      const route = stopTime.trip!.route!.id!;
      const routeGroup = grouped.get(route) || [];
      return grouped.set(route, [...routeGroup, stopTime]);
    }, new Map<string, StopTime[]>());

  return Array.from(stopTimesByRoute.entries())
    .filter(([route, _]) => routes === null || routes.has(route))
    .map(([route, stopTimes]) => ({
      route,
      trips: stopTimes
        .filter(
          (stopTime) =>
            stopTime?.arrival?.time !== undefined ||
            stopTime?.departure?.time !== undefined
        )
        .map((stopTime) => ({
          id: stopTime.trip!.id!,
          // BUG: arrival is number in proto schema but string in API response
          arrival: parseInt(
            (stopTime?.arrival?.time
              ? stopTime.arrival.time
              : stopTime.departure!.time!) as unknown as string
          ),
        })),
    }))
    .filter(({ trips }) => trips.length > 0);
}

function getMaxStopDistance(system: string) {
  switch (system) {
    case "us-ny-subway":
      return process.env.NEXT_PUBLIC_US_NY_SUBWAY_MAX_STOP_DISTANCE_KM!;
    case "us-ny-path":
      return process.env.NEXT_PUBLIC_US_NY_PATH_MAX_STOP_DISTANCE_KM!;
    default:
      return process.env.NEXT_PUBLIC_MAX_STOP_DISTANCE_KM!;
  }
}

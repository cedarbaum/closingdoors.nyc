export const runtime = "edge";

import {
  Stop as TransiterStop,
  StopTime,
} from "@/generated/proto/transiter/public";
import { getNearbyStops } from "@/utils/transiterUtils";
import haversineDistance from "haversine-distance";

export type Stop = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance: number;
};

export type Trip = {
  id: string;
  arrival: number;
  direction_id: boolean;
  destination: {
    id: string;
    name: string;
  };
};

export type RouteTrips = {
  route: string;
  route_color?: string;
  trips: Trip[];
};

export type StopRouteTrips = {
  stop: Stop;
  routeTrips: RouteTrips[];
};

export default async function handler(req: Request) {
  let {
    system,
    latitude,
    longitude,
    routes,
    direction_id,
    stop_type,
    max_stops,
  } = getEdgeQueryParams(req);

  if (latitude === null || longitude === null) {
    return new Response("Missing latitude or longitude", { status: 400 });
  }

  if (system === null) {
    return new Response("Missing system", { status: 400 });
  }

  // If direction_id is unspecified or invalid, return both
  if (direction_id !== "true" && direction_id !== "false") {
    direction_id = null;
  }

  let max_stops_as_number: number | null = null;
  if (max_stops !== null) {
    max_stops_as_number = parseInt(max_stops as string);
    if (isNaN(max_stops_as_number)) {
      return new Response("Invalid max_stops", { status: 400 });
    }
  }

  const stops = await getNearbyStops(
    system as string,
    latitude as string,
    longitude as string,
    getMaxStopDistance(system as string),
    max_stops_as_number,
  );

  const stopDistanceByStopId = new Map<string, number>(
    stops.map((stop) => [
      stop.id,
      haversineDistance(
        { lat: stop.latitude!, lon: stop.longitude! },
        {
          lat: parseFloat(latitude as string),
          lon: parseFloat(longitude as string),
        },
      ),
    ]),
  );

  const routesSet = routes
    ? new Set((routes as string).split(",").map((r) => r.toUpperCase()))
    : null;

  const stopRouteTrips = stops
    .filter(
      (stop) =>
        stop_type === null ||
        (stop_type === "parent" && stop.parentStop === undefined) ||
        (stop_type === "child" && stop.parentStop !== undefined),
    )
    .map((stop) => ({
      stop: {
        id: stop.id,
        name: stop.name!,
        latitude: stop.latitude!,
        longitude: stop.longitude!,
        distance: stopDistanceByStopId.get(stop.id)!,
      },
      routeTrips: getTripsByRouteForStop(
        stop,
        routesSet,
        direction_id !== null ? direction_id === "true" : null,
      ),
    }))
    .filter(({ routeTrips }) => routeTrips.length > 0)
    .sort((a, b) => a.stop.distance - b.stop.distance) as StopRouteTrips[];

  return new Response(JSON.stringify(stopRouteTrips), {
    headers: { "Content-Type": "application/json" },
  });
}

function getTripsByRouteForStop(
  stop: TransiterStop,
  routes: Set<string> | null,
  direction_id: boolean | null,
) {
  const stopTimesByRoute = stop.stopTimes
    .filter(
      (stopTime) =>
        stopTime.trip !== undefined &&
        (direction_id === null || stopTime?.trip.directionId === direction_id),
    )
    .reduce((grouped, stopTime) => {
      const route = stopTime.trip!.route!.id!;
      const routeGroup = grouped.get(route) || [];
      return grouped.set(route, [...routeGroup, stopTime]);
    }, new Map<string, StopTime[]>());

  const routeIdToRouteColor = new Map<string, string>(
    stop.stopTimes
      .filter((stopTime) => stopTime.trip !== undefined)
      .map((stopTime) => [
        stopTime.trip!.route!.id!,
        stopTime.trip!.route!.color!,
      ]),
  );

  return Array.from(stopTimesByRoute.entries())
    .filter(([route, _]) => routes === null || routes.has(route))
    .map(([route, stopTimes]) => ({
      route,
      route_color: routeIdToRouteColor.get(route),
      trips: stopTimes
        .filter(
          (stopTime) =>
            stopTime?.arrival?.time !== undefined ||
            stopTime?.departure?.time !== undefined,
        )
        .map((stopTime) => ({
          id: stopTime.trip!.id!,
          // arrival/departure time are strings to avoid precision loss
          arrival: parseInt(
            (stopTime?.arrival?.time
              ? stopTime.arrival.time
              : stopTime.departure!.time!) as unknown as string,
          ),
          direction_id: stopTime.trip!.directionId!,
          destination: {
            id: stopTime.trip!.destination!.id!,
            name: stopTime.trip!.destination!.name!,
          },
        }))
        .sort((a, b) => a.arrival - b.arrival),
    }))
    .filter(({ trips }) => trips.length > 0);
}

function getEdgeQueryParams(req: Request) {
  const searchParams = new URL(req.url ?? "").searchParams;
  return {
    system: searchParams.get("system"),
    latitude: searchParams.get("latitude"),
    longitude: searchParams.get("longitude"),
    routes: searchParams.get("routes"),
    direction_id: searchParams.get("direction_id"),
    stop_type: searchParams.get("stop_type"),
    max_stops: searchParams.get("max_stops"),
  };
}

function getMaxStopDistance(system: string) {
  switch (system) {
    case "us-ny-subway":
      return process.env.NEXT_PUBLIC_US_NY_SUBWAY_MAX_STOP_DISTANCE_KM!;
    case "us-ny-path":
      return process.env.NEXT_PUBLIC_US_NY_PATH_MAX_STOP_DISTANCE_KM!;
    case "us-ny-nycbus":
      return process.env.NEXT_PUBLIC_US_NY_NYCBUS_MAX_STOP_DISTANCE_KM!;
    default:
      return process.env.NEXT_PUBLIC_MAX_STOP_DISTANCE_KM!;
  }
}

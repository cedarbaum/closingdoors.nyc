import {
  Stop as TransiterStop,
  ListStopsReply,
  StopTime,
} from "@/generated/proto/transiter/public";
import haversineDistance from "haversine-distance";
import type { NextApiRequest, NextApiResponse } from "next";

const TRANSITER_URL = process.env.TRANSITER_URL!;

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
  const { system, latitude, longitude, routes, stop_id_suffix } = req.query;
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
    longitude as string
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

  const routesSet = new Set(routes as string[]);
  const stopRouteTrips = stops
    .filter(
      (stop) =>
        stop_id_suffix === undefined ||
        stop.id.endsWith(stop_id_suffix as string)
    )
    .map((stop) => ({
      stop: {
        id: stop.id,
        name: stop.name!,
        distance: stopDistanceByStopId.get(stop.id)!,
      },
      routeTrips: getTripsByRouteForStop(stop, routesSet),
    }))
    .filter(({ routeTrips }) => routeTrips.length > 0)
    .sort((a, b) => a.stop.distance - b.stop.distance) as StopRouteTrips[];

  res.status(200).json(stopRouteTrips);
}

function getTripsByRouteForStop(stop: TransiterStop, routes: Set<string>) {
  const stopTimesByRoute = stop.stopTimes
    .filter((stopTime) => stopTime.trip !== undefined)
    .reduce((grouped, stopTime) => {
      const route = stopTime.trip!.route!.id!;
      const routeGroup = grouped.get(route) || [];
      return grouped.set(route, [...routeGroup, stopTime]);
    }, new Map<string, StopTime[]>());

  return Array.from(stopTimesByRoute.entries())
    .filter(([route, _]) => routes.has(route))
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

async function getNearbyStops(
  system: string,
  latitude: string,
  longitude: string
) {
  const stopsDataResp = await fetch(
    `${TRANSITER_URL}/systems/${system}/stops?` +
      new URLSearchParams({
        search_mode: "DISTANCE",
        latitude: latitude,
        longitude: longitude,
        max_distance: "4.8",
        limit: "500",
        skip_service_maps: "true",
        skip_transfers: "true",
      })
  );

  return ((await stopsDataResp.json()) as ListStopsReply).stops;
}

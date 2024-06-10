export const runtime = "edge";

import { Shape, Stop, Vehicle } from "@/generated/proto/transiter/public";
import {
  getShape,
  getTrip,
  getVehicle,
  listStopsByIds,
} from "@/utils/transiterUtils";

export type TripInfo = {
  stops: Stop[];
  shape?: Shape;
  vehicle?: Vehicle;
};

export default async function handler(req: Request) {
  const { system, route_id, trip_id } = getEdgeQueryParams(req);
  if (system === null) {
    return new Response("Missing system", { status: 400 });
  }

  if (route_id === null) {
    return new Response("Missing route_id", { status: 400 });
  }

  if (trip_id === null) {
    return new Response("Missing trip_id", { status: 400 });
  }

  const trip = await getTrip(
    system as string,
    route_id as string,
    trip_id as string,
  );
  const stopsIDs = trip.stopTimes
    .map((stopTime) => stopTime.stop?.id)
    .filter((id) => id !== undefined) as string[];
  const stops = await listStopsByIds(
    system as string,
    stopsIDs,
    true,
    true,
    true,
    false,
  );

  let shape = undefined;
  if (trip.shape !== undefined) {
    shape = await getShape(system as string, trip.shape.id);
  }

  let vehicle = undefined;
  if (trip.vehicle !== undefined) {
    const fullVehicle = await getVehicle(system as string, trip.vehicle.id);
    // Vehicle without location isn't useful, so only return it if it has a location
    if (
      fullVehicle.latitude !== undefined &&
      fullVehicle.longitude !== undefined
    ) {
      vehicle = fullVehicle;
    }
  }

  return new Response(JSON.stringify({ stops, shape, vehicle }), {
    status: 200,
  });
}

function getEdgeQueryParams(req: Request) {
  const searchParams = new URL(req.url ?? "").searchParams;
  return {
    system: searchParams.get("system"),
    route_id: searchParams.get("route_id"),
    trip_id: searchParams.get("trip_id"),
  };
}

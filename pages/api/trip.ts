import { Shape, Stop, Vehicle } from "@/generated/proto/transiter/public";
import {
  getShape,
  getTrip,
  getVehicle,
  listStopsByIds,
} from "@/utils/TransiterUtils";
import type { NextApiRequest, NextApiResponse } from "next";

export type TripInfo = {
  stops: Stop[];
  shape?: Shape;
  vehicle?: Vehicle;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TripInfo | { error: string }>
) {
  const { system, route_id, trip_id } = req.query;
  if (system === undefined) {
    res.status(400).json({ error: "system is required" });
    return;
  }

  if (route_id === undefined) {
    res.status(400).json({ error: "route_id is required" });
    return;
  }

  if (trip_id === undefined) {
    res.status(400).json({ error: "trip_id is required" });
    return;
  }

  const trip = await getTrip(
    system as string,
    route_id as string,
    trip_id as string
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
    false
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

  res.status(200).json({ stops, shape, vehicle });
}

import { StopRouteTrips } from "@/pages/api/nearby_route_trips";
import { DateTime } from "luxon";

export function applyQaToStopRouteTrips(
  now: DateTime,
  stopRouteTrips: StopRouteTrips[] | undefined,
  excludedRoutes: null | Set<string> = null,
  staleThresholdSeconds: number = 15
): StopRouteTrips[] | undefined {
  if (stopRouteTrips === undefined) {
    return undefined;
  }

  return stopRouteTrips
    .map((stopRouteTrip) => {
      const stopRouteTrips = stopRouteTrip.routeTrips.map((routeTrip) => {
        const nonStaleTrips = routeTrip.trips.filter((trip) => {
          // Remove significantly stale trips
          const estimatedArrival = DateTime.fromSeconds(trip.arrival);
          const delta = estimatedArrival.diff(now).toMillis();
          return delta >= -staleThresholdSeconds * 1000;
        });

        return {
          ...routeTrip,
          trips: nonStaleTrips,
        };
      });
      return {
        ...stopRouteTrip,
        routeTrips: stopRouteTrips.filter(
          (stopRouteTrip) =>
            stopRouteTrip.trips.length > 0 &&
            (excludedRoutes === null ||
              !excludedRoutes.has(stopRouteTrip.route))
        ),
      };
    })
    .filter((stopRouteTrip) => stopRouteTrip.routeTrips.length > 0);
}

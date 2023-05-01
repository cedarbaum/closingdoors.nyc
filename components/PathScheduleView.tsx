import { usePosition } from "@/utils/usePosition";
import { useEffect, useState } from "react";
import { DurationFormat } from "./TripArrivalTime";
import { useQuery } from "react-query";
import { StopRouteTrips } from "@/pages/api/nearby_route_trips";
import { FullScreenError } from "./FullScreenError";
import { DateTime } from "luxon";
import { applyQaToStopRouteTrips } from "@/utils/ScheduleUtils";
import { StopHeader } from "./StopHeader";
import DirectionSelectors, { Direction } from "./DirectionsSelector";
import { PathTripArrivalTime } from "./PathTripArrivalTime";
import { queryTypes, useQueryState } from "next-usequerystate";
import { kmToMi } from "@/utils/GeoUtils";
import { NjOrNy, PathRoute } from "@/utils/PathRoutes";
import { PathLoadingView } from "./PathLoadingView";

interface LatLonPair {
  lat: number;
  lon: number;
}

// Newark - Harrison Shuttle Train
const excludedPathRoutes = new Set<PathRoute>(["74320"]);

export default function PathScheduleView() {
  const {
    latitude,
    longitude,
    error: locationErrorMessage,
  } = usePosition(
    true,
    {
      maximumAge: 60 * 1000,
      timeout: 30 * 1000,
      enableHighAccuracy: false,
    },
    { minDistanceToUpdateMeters: 50 }
  );
  const [direction, setDirection] = useQueryState(
    "direction",
    queryTypes.stringEnum<NjOrNy>(Object.values(NjOrNy)).withDefault(NjOrNy.NJ)
  );

  const [, setTime] = useState(Date.now());
  const [durationFormat, setDurationFormat] = useState(
    DurationFormat.MinuteCeiling
  );

  const {
    data: nearbyTripsData,
    isLoading: nearbyTripsLoading,
    isFetching: nearbyTripsFetching,
    error: nearbyTripsError,
  } = useQuery(
    ["nearby_trips_path", latitude, longitude, direction],
    async () => {
      const nearbyRouteTrips = await fetch(
        "/api/nearby_route_trips?" +
          new URLSearchParams({
            system: "us-ny-path",
            latitude: latitude!.toString(),
            longitude: longitude!.toString(),
            direction_id: direction === NjOrNy.NY ? "true" : "false",
          })
      );

      if (!nearbyRouteTrips.ok) {
        throw new Error("Failed to fetch nearby route trips");
      }

      return (await nearbyRouteTrips.json()) as StopRouteTrips[];
    },
    {
      enabled: latitude !== undefined && longitude !== undefined,
      refetchInterval: 10000,
    }
  );

  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const directionSelectors = (
    <DirectionSelectors
      direction={direction === NjOrNy.NJ ? Direction.North : Direction.South}
      directionChanged={(dir) => {
        if (dir === Direction.North) {
          setDirection(NjOrNy.NJ);
        } else {
          setDirection(NjOrNy.NY);
        }
      }}
      northBoundAlias={NjOrNy.NJ}
      southBoundAlias={NjOrNy.NY}
    />
  );

  const loadingView = (
    <div className="flex flex-col w-full h-full">
      {directionSelectors}
      <PathLoadingView excludedPathRoutes={excludedPathRoutes} />;
    </div>
  );

  if (
    nearbyTripsLoading ||
    (!locationErrorMessage &&
      (latitude === undefined || longitude === undefined))
  ) {
    return loadingView;
  }

  if (
    locationErrorMessage &&
    (latitude === undefined || longitude === undefined)
  ) {
    return (
      <FullScreenError
        error={
          <>
            Failed to get current location. Please ensure location access is
            enabled.
          </>
        }
      />
    );
  }

  if (nearbyTripsError) {
    return (
      <FullScreenError
        error={
          <>An error occurred while fetching schedules. Will retry shortly.</>
        }
      />
    );
  }

  const now = DateTime.now();
  const sanitizedNearbyTripsData = applyQaToStopRouteTrips(
    now,
    nearbyTripsData,
    excludedPathRoutes,
    30
  );

  // If data is stale, show loading view
  if (nearbyTripsFetching && sanitizedNearbyTripsData?.length === 0) {
    return loadingView;
  }

  if (
    sanitizedNearbyTripsData?.length === 0 ||
    sanitizedNearbyTripsData === undefined
  ) {
    return (
      <FullScreenError
        error={
          <>
            {`No PATH routes appear to be running at any stops within
            ~${kmToMi(
              parseFloat(
                process.env.NEXT_PUBLIC_US_NY_PATH_MAX_STOP_DISTANCE_KM!
              )
            ).toPrecision(1)} MI of you.`}
          </>
        }
      />
    );
  }

  return (
    <>
      {directionSelectors}
      <table className="w-full border-spacing-0 border-collapse">
        {sanitizedNearbyTripsData.map((stopRouteTrip) => {
          const header = (
            <thead
              key={stopRouteTrip.stop.id}
              className="p-0 sticky top-0 z-50"
            >
              <tr>
                <th className="p-0">
                  <StopHeader stopName={stopRouteTrip.stop.name} />
                </th>
              </tr>
            </thead>
          );

          const stopRows = stopRouteTrip?.routeTrips
            .flatMap((routeTrip) => {
              return routeTrip.trips.slice(0, 2).map((trip, idx) => {
                const estimatedArrival = DateTime.fromSeconds(trip.arrival);
                const delta = estimatedArrival.diff(now);

                return [
                  trip.arrival,
                  <tr key={`${stopRouteTrip.stop.id}${trip.id}${idx}`}>
                    <td className="p-0">
                      <PathTripArrivalTime
                        onClickTimeText={() => {
                          setDurationFormat(
                            durationFormat === DurationFormat.Exact
                              ? DurationFormat.MinuteCeiling
                              : DurationFormat.Exact
                          );
                        }}
                        timeUntilArrival={delta}
                        durationFormat={durationFormat}
                        route={routeTrip.route as PathRoute}
                        direction={direction}
                      />
                    </td>
                  </tr>,
                ] as [number, JSX.Element];
              });
            })
            .sort((t1, t2) => t1[0] - t2[0])
            .map((t) => t[1]);

          const tbody = (
            <tbody key={`${stopRouteTrip.stop.id}header`}>{stopRows}</tbody>
          );

          return [header, tbody];
        })}
      </table>
    </>
  );
}

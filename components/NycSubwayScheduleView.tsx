import React, { useEffect, useState } from "react";
import {
  Alert,
  Direction,
  NearbyTrainTimesDocument,
  NearbyTrainTimesQuery,
  NearbyTrainTimesQueryVariables,
} from "@/generated/gql/graphql";
import { usePosition } from "@/utils/usePosition";
import { NycSubwayStopHeader } from "@/components/NycSubwayStopHeader";
import {
  DurationFormat,
  NycSubwayTripArrivalTime,
} from "@/components/NycSubwayTripArrivalTime";
import { DateTime } from "luxon";
import { FullScreenError } from "@/components/FullScreenError";
import haversineDistance from "haversine-distance";
import { NycSubwayLoadingView } from "@/components/NycSubwayLoadingView";
import { MtaAlertList, Behavior } from "@/components/MtaAlertList";
import { getMtaAlertPropsFromRouteAlerts } from "@/utils/AlertUtils";
import { useRouter } from "next/router";
import useQueryWithPolling from "@/utils/useQueryWithPolling";

export interface ScheduleViewProps {
  stops?: Set<string>;
  routes: Set<string>;
  direction: Direction;
}

export interface StatusIconProps {
  color: string;
  onClick?(): void;
}

interface LatLonPair {
  lat: number;
  lon: number;
}

function routesQueryParamToSet(queryParam: string | null) {
  return queryParam == null
    ? new Set<string>()
    : new Set<string>(queryParam.split(","));
}

function directionQueryParamToDirection(queryParam: string | null) {
  return queryParam?.toLowerCase() === "north"
    ? Direction.North
    : Direction.South;
}

const NycSubwayScheduleView: React.FC = () => {
  const router = useRouter();
  const direction = directionQueryParamToDirection(
    router.query.direction as string | null
  );
  const routes = routesQueryParamToSet(router.query.routes as string | null);

  let {
    latitude,
    longitude,
    error: locationErrorMessage,
  } = usePosition(true, {
    maximumAge: 60 * 1000,
    timeout: 30 * 1000,
    enableHighAccuracy: false,
  });
  const [lastLocation, setLastLocation] = useState<LatLonPair | undefined>(
    undefined
  );
  const [, setTime] = useState(Date.now());
  const [durationFormat, setDurationFormat] = useState(
    DurationFormat.MinuteCeiling
  );

  if (
    latitude !== undefined &&
    longitude !== undefined &&
    lastLocation !== undefined
  ) {
    if (
      haversineDistance(lastLocation, { lat: latitude, lon: longitude }) < 50
    ) {
      latitude = lastLocation.lat;
      longitude = lastLocation.lon;
    }
  }

  const [result] = useQueryWithPolling<
    NearbyTrainTimesQuery,
    NearbyTrainTimesQueryVariables
  >(
    {
      query: NearbyTrainTimesDocument,
      variables: {
        lat: latitude,
        lon: longitude,
        direction,
        routes: Array.from(routes),
      },
      pause: latitude === undefined || longitude === undefined,
    },
    10000
  );

  const { data, fetching, error } = result;

  useEffect(() => {
    if (latitude !== undefined && longitude !== undefined) {
      setLastLocation({ lat: latitude, lon: longitude });
    }
  }, [latitude, longitude]);

  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  if (
    fetching ||
    (!locationErrorMessage &&
      (latitude === undefined || longitude === undefined))
  ) {
    return <NycSubwayLoadingView />;
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

  if (error) {
    return (
      <FullScreenError
        error={
          <>An error occurred while fetching schedules. Will retry shortly.</>
        }
      />
    );
  }

  const alertMessages = getMtaAlertPropsFromRouteAlerts(
    data?.routeStatuses?.flatMap(
      (routeStatus) => routeStatus.alerts as Alert[]
    ) ?? []
  );

  if (data?.nearbyTrainTimes?.stopRouteTrips?.length === 0) {
    return (
      <FullScreenError
        error={
          <>Selected routes don&apos;t appear to be running at any stops near you.</>
        }
        errorDetails={
          alertMessages?.length > 0 ? (
            <MtaAlertList
              alerts={alertMessages}
              behavior={Behavior.None}
              hideAlertIcon
            />
          ) : undefined
        }
      />
    );
  }

  const now = DateTime.now();
  if (data?.nearbyTrainTimes?.updatedAt) {
    const updateDelta = now.diff(
      DateTime.fromSeconds(data?.nearbyTrainTimes?.updatedAt)
    );
    if (updateDelta.toMillis() >= 2 * 60 * 1000) {
      return (
        <FullScreenError
          error={
            <>
              Data retrieved from server is out of date. Will retry to fetch new
              data shortly.
            </>
          }
        />
      );
    }
  }

  return (
    <>
      {alertMessages !== undefined && (
        <MtaAlertList alerts={alertMessages} behavior={Behavior.Collapsable} />
      )}
      <table className="w-full border-spacing-0 border-collapse">
        {data!.nearbyTrainTimes!.stopRouteTrips!.map((stopRouteTrip) => {
          const stopWithDirection = `${
            stopRouteTrip!.stop!.stopId
          }${direction}`;
          const header = (
            <thead key={stopWithDirection} className="p-0 sticky top-0 z-50">
              <tr>
                <th className="p-0">
                  <NycSubwayStopHeader stopName={stopRouteTrip!.stop!.name} />
                </th>
              </tr>
            </thead>
          );

          const stopRows = stopRouteTrip?.routeTrips
            .flatMap((routeTrip) => {
              return routeTrip!
                .trips!.filter((trip) => {
                  // Remove significantly stale trips (more than 30 seconds old)
                  const estimatedArrival = DateTime.fromSeconds(trip!.arrival);
                  const delta = estimatedArrival.diff(now).toMillis();
                  return delta >= -15 * 1000;
                })
                .slice(0, 2)
                .map((trip, idx) => {
                  const estimatedArrival = DateTime.fromSeconds(trip!.arrival);
                  const delta = estimatedArrival.diff(now);

                  return [
                    trip!.arrival,
                    <tr key={`${stopWithDirection}${trip!.tripId}${idx}`}>
                      <td className="p-0">
                        <NycSubwayTripArrivalTime
                          onClickTimeText={() => {
                            setDurationFormat(
                              durationFormat === DurationFormat.Exact
                                ? DurationFormat.MinuteCeiling
                                : DurationFormat.Exact
                            );
                          }}
                          route={routeTrip!.route}
                          timeUntilArrival={delta}
                          durationFormat={durationFormat}
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
            <tbody key={`${stopWithDirection}header`}>{stopRows}</tbody>
          );

          return [header, tbody];
        })}
      </table>
    </>
  );
};

export default NycSubwayScheduleView;

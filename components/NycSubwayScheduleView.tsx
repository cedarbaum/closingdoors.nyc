import React, { useEffect, useState } from "react";
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
import { useQuery } from "react-query";
import { RouteStatuses } from "@/pages/api/route_statuses";
import { StopRouteTrips } from "@/pages/api/nearby_route_trips";
import { Alert } from "@/generated/proto/transiter/public";
import { SubwayDirection } from "@/utils/SubwayLines";

export interface ScheduleViewProps {
  stops?: Set<string>;
  routes: Set<string>;
  direction: SubwayDirection;
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
  return queryParam?.toLowerCase() === "n" ||
    queryParam?.toLowerCase() === "north"
    ? SubwayDirection.North
    : SubwayDirection.South;
}

const NycSubwayScheduleView: React.FC = () => {
  const router = useRouter();
  const direction = directionQueryParamToDirection(
    router.query.direction as string | null
  );
  const routes = routesQueryParamToSet(router.query.routes as string | null);
  const routesString = Array.from(routes).join(",");

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

  const {
    data: routeStatusData,
    isLoading: routeStatusLoading,
    error: routeStatusError,
  } = useQuery(
    ["route_statuses", routesString],
    async () => {
      const routeStatusesResp = await fetch(
        "/api/route_statuses?" +
          new URLSearchParams({
            system: "us-ny-subway",
            routes: routesString,
          })
      );
      if (!routeStatusesResp.ok) {
        throw new Error("Failed to fetch route statuses");
      }

      return (await routeStatusesResp.json()) as RouteStatuses[];
    },
    {
      refetchInterval: 10000,
    }
  );

  const {
    data: nearbyTripsData,
    isLoading: nearbyTripsLoading,
    error: nearbyTripsError,
  } = useQuery(
    ["nearby_trips", latitude, longitude, routesString, direction],
    async () => {
      const nearbyRouteTrips = await fetch(
        "/api/nearby_route_trips?" +
          new URLSearchParams({
            system: "us-ny-subway",
            latitude: latitude!.toString(),
            longitude: longitude!.toString(),
            routes: routesString,
            stop_id_suffix: direction,
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
    nearbyTripsLoading ||
    routeStatusLoading ||
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

  if (nearbyTripsError || routeStatusError) {
    return (
      <FullScreenError
        error={
          <>An error occurred while fetching schedules. Will retry shortly.</>
        }
      />
    );
  }

  const alertMessages = getMtaAlertPropsFromRouteAlerts(
    routeStatusData?.flatMap((routeStatus) => routeStatus.alerts as Alert[]) ??
      []
  );

  if (nearbyTripsData?.length === 0) {
    return (
      <FullScreenError
        error={
          <>
            Selected routes don&apos;t appear to be running at any stops near
            you.
          </>
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
  return (
    <>
      {alertMessages !== undefined && (
        <MtaAlertList alerts={alertMessages} behavior={Behavior.Collapsable} />
      )}
      <table className="w-full border-spacing-0 border-collapse">
        {nearbyTripsData?.map((stopRouteTrip) => {
          const stopWithDirection = `${stopRouteTrip!.stop!.id}${direction}`;
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
                    <tr key={`${stopWithDirection}${trip!.id}${idx}`}>
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

import React, { useEffect, useState } from "react";
import { WatchMode, usePosition } from "@/utils/usePosition";
import { StopHeader } from "@/components/StopHeader";
import { NycSubwayTripArrivalTime } from "@/components/NycSubwayTripArrivalTime";
import { DateTime } from "luxon";
import { FullScreenError } from "@/components/FullScreenError";
import { NycSubwayLoadingView } from "@/components/NycSubwayLoadingView";
import { AlertList, Behavior } from "@/components/AlertList";
import { getMtaAlertPropsFromRouteAlerts } from "@/utils/alertUtils";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { RouteStatuses } from "@/pages/api/route_statuses";
import { StopRouteTrips } from "@/pages/api/nearby_route_trips";
import { Alert } from "@/generated/proto/transiter/public";
import { SubwayDirection } from "@/utils/subwayLines";
import { applyQaToStopRouteTrips } from "@/utils/scheduleUtils";
import { formatKmToLocalizedString } from "@/utils/measurementUtils";
import { useSettings } from "@/pages/settings";

export interface ScheduleViewProps {
  stops?: Set<string>;
  routes: Set<string>;
  direction: SubwayDirection;
}

export interface StatusIconProps {
  color: string;
  onClick?(): void;
}

function routesQueryParamToSet(queryParam: string | null) {
  return queryParam == null
    ? new Set<string>()
    : new Set<string>(queryParam.split(","));
}

function directionQueryParamToDirection(queryParam: string | null) {
  const lowerCaseQueryParam = queryParam?.toLowerCase();
  switch (lowerCaseQueryParam) {
    case "n":
    case "north":
      return SubwayDirection.North;
    case "s":
    case "south":
      return SubwayDirection.South;
    default:
      return undefined;
  }
}

function directionIdToDirection(directionId: boolean) {
  return directionId ? SubwayDirection.South : SubwayDirection.North;
}

const NycSubwayScheduleView: React.FC = () => {
  const router = useRouter();
  const direction = directionQueryParamToDirection(
    router.query.direction as string | null,
  );
  const routes = routesQueryParamToSet(router.query.routes as string | null);
  const routesString = Array.from(routes).join(",");

  const {
    latitude,
    longitude,
    error: locationErrorMessage,
  } = usePosition(
    { mode: WatchMode.Poll, interval: 10000 },
    {
      maximumAge: 60 * 1000,
      timeout: 30 * 1000,
      enableHighAccuracy: false,
    },
  );

  const [, setTime] = useState(Date.now());
  const isDisplayingErrorRef = React.useRef(false);

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
          }),
      );
      if (!routeStatusesResp.ok) {
        throw new Error("Failed to fetch route statuses");
      }

      return (await routeStatusesResp.json()) as RouteStatuses[];
    },
    {
      refetchInterval: 10000,
    },
  );

  const {
    data: nearbyTripsData,
    isLoading: nearbyTripsLoading,
    isFetching: nearbyTripsFetching,
    error: nearbyTripsError,
  } = useQuery(
    ["nearby_trips_us_ny_subway", routesString, direction],
    async () => {
      let directionId = "both";
      if (direction === SubwayDirection.North) {
        directionId = "false";
      } else if (direction === SubwayDirection.South) {
        directionId = "true";
      }

      const nearbyRouteTrips = await fetch(
        "/api/nearby_route_trips?" +
          new URLSearchParams({
            system: "us-ny-subway",
            latitude: latitude!.toString(),
            longitude: longitude!.toString(),
            routes: routesString,
            direction_id: directionId,
            stop_type: "parent",
          }),
      );

      if (!nearbyRouteTrips.ok) {
        throw new Error("Failed to fetch nearby route trips");
      }

      return (await nearbyRouteTrips.json()) as StopRouteTrips[];
    },
    {
      enabled: latitude !== undefined && longitude !== undefined,
      refetchInterval: 10000,
    },
  );

  const { distanceUnit } = useSettings();

  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  if (
    !isDisplayingErrorRef.current &&
    (nearbyTripsLoading ||
      routeStatusLoading ||
      (!locationErrorMessage &&
        (latitude === undefined || longitude === undefined)))
  ) {
    return <NycSubwayLoadingView />;
  }

  if (
    locationErrorMessage &&
    (latitude === undefined || longitude === undefined)
  ) {
    isDisplayingErrorRef.current = true;
    return (
      <FullScreenError
        system="us-ny-subway"
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
    isDisplayingErrorRef.current = true;
    return (
      <FullScreenError
        system="us-ny-subway"
        error={
          <>An error occurred while fetching schedules. Will retry shortly.</>
        }
      />
    );
  }

  const alertMessages = getMtaAlertPropsFromRouteAlerts(
    routeStatusData?.flatMap((routeStatus) => routeStatus.alerts as Alert[]) ??
      [],
  );

  const now = DateTime.now();
  const sanitizedNearbyTripsData = applyQaToStopRouteTrips(
    now,
    nearbyTripsData,
  );

  // If data is stale, show loading view
  if (!isDisplayingErrorRef && nearbyTripsFetching && sanitizedNearbyTripsData?.length === 0) {
    return <NycSubwayLoadingView />;
  }

  if (
    sanitizedNearbyTripsData?.length === 0 ||
    sanitizedNearbyTripsData === undefined
  ) {
    isDisplayingErrorRef.current = true;
    return (
      <FullScreenError
        system="us-ny-subway"
        error={
          <>
            {`Selected routes don't appear to be running at any stops within
            ${formatKmToLocalizedString(
              parseFloat(
                process.env.NEXT_PUBLIC_US_NY_SUBWAY_MAX_STOP_DISTANCE_KM!,
              ),
              distanceUnit,
            )} of you.`}
          </>
        }
        errorDetails={
          alertMessages?.length > 0 ? (
            <AlertList
              alerts={alertMessages}
              behavior={Behavior.None}
              hideAlertIcon
            />
          ) : undefined
        }
      />
    );
  }

  isDisplayingErrorRef.current = false;
  return (
    <>
      {alertMessages !== undefined && (
        <AlertList alerts={alertMessages} behavior={Behavior.Collapsable} />
      )}
      <table className="w-full border-spacing-0 border-collapse">
        {sanitizedNearbyTripsData.map((stopRouteTrip) => {
          const header = (
            <thead
              key={`${stopRouteTrip.stop.id}header`}
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
                    <td className="p-2">
                      <NycSubwayTripArrivalTime
                        route={routeTrip.route}
                        timeUntilArrival={delta}
                        direction={directionIdToDirection(trip.direction_id)}
                      />
                    </td>
                  </tr>,
                ] as [number, JSX.Element];
              });
            })
            .sort((t1, t2) => t1[0] - t2[0])
            .map((t) => t[1]);

          const tbody = (
            <tbody key={`${stopRouteTrip.stop.id}body`}>{stopRows}</tbody>
          );

          return [header, tbody];
        })}
      </table>
    </>
  );
};

export default NycSubwayScheduleView;

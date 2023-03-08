import React, { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import {
  Alert,
  Direction,
  NearbyTrainTimesDocument,
  NearbyTrainTimesQuery,
  NearbyTrainTimesQueryVariables,
} from "../graphql/generated";
import { usePosition } from "use-position";
import { StopHeader } from "../StopHeader/StopHeader";
import { DURATION_FORMAT, TripView } from "../TripView/TripView";
import { DateTime } from "luxon";
import { DIRECTION } from "../utils/SubwayLines";
import { ErrorPage } from "../ErrorPage/ErrorPage";
import haversineDistance from "haversine-distance";
import * as S from "./ScheduleView.styles";
import { LoadingView } from "../LoadingView/LoadingView";
import { AlertsHeader, Behavior } from "../AlertsHeader/AlertsHeader";
import { getAlertPropsFromRouteAlerts } from "../Alert/AlertHelpers";

export interface ScheduleViewProps {
  stops?: Set<string>;
  routes: Set<string>;
  direction: DIRECTION;
}

export interface StatusIconProps {
  color: string;
  onClick?(): void;
}

interface LatLonPair {
  lat: number;
  lon: number;
}

export const ScheduleView: React.FC<ScheduleViewProps> = (props) => {
  let {
    latitude,
    longitude,
    errorMessage: locationErrorMessage,
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
    DURATION_FORMAT.MinuteCeiling
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

  let { loading, error, data } = useQuery<
    NearbyTrainTimesQuery,
    NearbyTrainTimesQueryVariables
  >(NearbyTrainTimesDocument, {
    variables: {
      lat: latitude,
      lon: longitude,
      direction:
        props.direction === DIRECTION.DOWNTOWN
          ? Direction.South
          : Direction.North,
      routes: Array.from(props.routes),
    },
    skip: latitude === undefined || longitude === undefined,
    pollInterval: 10000,
  });

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
    loading ||
    (locationErrorMessage === undefined &&
      (latitude === undefined || longitude === undefined))
  ) {
    return <LoadingView />;
  }

  if (locationErrorMessage) {
    return (
      <ErrorPage
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
      <ErrorPage
        error={
          <>An error occurred while fetching schedules. Will retry shortly.</>
        }
      />
    );
  }

  const alertMessages = getAlertPropsFromRouteAlerts(
    data?.routeStatuses?.flatMap(
      (routeStatus) => routeStatus.alerts as Alert[]
    ) ?? []
  );

  if (data?.nearbyTrainTimes?.stopRouteTrips?.length === 0) {
    return (
      <ErrorPage
        error={
          <>Selected routes don't appear to be running at any stops near you.</>
        }
        errorDetails={
          alertMessages?.length > 0 ? (
            <S.AlertsErrorContainer>
              <AlertsHeader
                alerts={alertMessages}
                behavior={Behavior.None}
                headerFontSizeEm={1.5}
                showHeaderBottomBorder
                hideAlertIcon
              />
            </S.AlertsErrorContainer>
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
        <ErrorPage
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
    <S.Container>
      {alertMessages !== undefined && (
        <AlertsHeader
          alerts={alertMessages}
          behavior={Behavior.Collapsable}
          addLeftRightPadding
        />
      )}
      <S.Table>
        {data!.nearbyTrainTimes!.stopRouteTrips!.map((stopRouteTrip) => {
          const stopWithDirection = `${stopRouteTrip!.stop!.stopId}${
            props.direction
          }`;
          const header = (
            <S.StickyThead key={stopWithDirection}>
              <tr>
                <S.Th key={`${stopWithDirection}header`}>
                  <StopHeader stopName={stopRouteTrip!.stop!.name} />
                </S.Th>
              </tr>
            </S.StickyThead>
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
                      <S.Td>
                        <TripView
                          onClickTimeText={() => {
                            setDurationFormat(
                              durationFormat === DURATION_FORMAT.Exact
                                ? DURATION_FORMAT.MinuteCeiling
                                : DURATION_FORMAT.Exact
                            );
                          }}
                          route={routeTrip!.route}
                          timeUntilArrival={delta}
                          durationFormat={durationFormat}
                          direction={props.direction}
                        />
                      </S.Td>
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
      </S.Table>
    </S.Container>
  );
};

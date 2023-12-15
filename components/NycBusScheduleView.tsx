import { WatchMode, usePosition } from "@/utils/usePosition";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";
import { StopRouteTrips } from "@/pages/api/nearby_route_trips";
import { FullScreenError } from "./FullScreenError";
import { DateTime } from "luxon";
import { applyQaToStopRouteTrips } from "@/utils/ScheduleUtils";
import { StopHeader } from "./StopHeader";
import { formatKmToLocalizedString } from "@/utils/MeasurementUtils";
import { useSettings } from "@/pages/settings";
import { NycBusTripArrivalTime } from "./NycBusTripArrivalTime";
import {
  Map as ReactMapGl,
  GeolocateControl,
  Layer,
  Marker,
  Source,
  MapRef,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { TripInfo } from "@/pages/api/trip";
import { RouteStatuses } from "@/pages/api/route_statuses";
import Image from "next/image";
import ToggleFollowBusControl from "./ToggleFollowBusControl";
import mapboxgl from "mapbox-gl";
import { Alert } from "@/generated/proto/transiter/public";
import { Behavior, MtaAlertList } from "./MtaAlertList";
import { getMtaAlertPropsFromRouteAlerts } from "@/utils/AlertUtils";
import { NycBusLoadingView } from "./NycBusLoadingView";
import { M15 } from "@/utils/NycBus";
import { InformationCircleIcon } from "@heroicons/react/20/solid";

interface FocusedTripData {
  tripId: string;
  routeId: string;
  routeColor?: string;
}

interface MapContextContent {
  type: "info" | "error" | "warning";
  text: string;
}

export default function NycBusScheduleView() {
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
  const isDisplayingErrorRef = useRef(false);

  const {
    data: nearbyTripsData,
    isLoading: nearbyTripsLoading,
    isFetching: nearbyTripsFetching,
    error: nearbyTripsError,
  } = useQuery(
    ["nearby_trips_us_ny_buses"],
    async () => {
      const nearbyRouteTrips = await fetch(
        "/api/nearby_route_trips?" +
          new URLSearchParams({
            system: "us-ny-nycbus",
            latitude: latitude!.toString(),
            longitude: longitude!.toString(),
            direction_id: "both",
            max_stops: getMaxNumStops().toString(),
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

  const [focusedTrip, setFocusedTrip] = useState<FocusedTripData | undefined>(
    undefined,
  );
  const [followBus, setFollowBus] = useState(true);

  const {
    data: routeStatuses,
    isLoading: routeStatusesLoading,
    error: routeStatusesError,
  } = useQuery(
    ["all_route_statuses", "us-ny-nycbus"],
    async () => {
      const routeStatusesResp = await fetch(
        "/api/route_statuses?" +
          new URLSearchParams({
            system: "us-ny-nycbus",
            get_is_running: "false",
            only_get_routes_with_alerts: "true",
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

  let alertsByRoute: Map<string, Alert[]> | undefined = undefined;
  if (routeStatuses && !routeStatusesError) {
    alertsByRoute = new Map(
      routeStatuses.map((routeStatus) => [
        routeStatus.route,
        routeStatus.alerts,
      ]),
    );
  }

  const {
    data: focusedTripData,
    isLoading: focusedTripLoading,
    error: focusedTripError,
  } = useQuery(
    ["focused_trip", "us-ny-nycbus", focusedTrip?.tripId],
    async () => {
      const tripInfo = await fetch(
        "/api/trip?" +
          new URLSearchParams({
            system: "us-ny-nycbus",
            route_id: focusedTrip!.routeId,
            trip_id: focusedTrip!.tripId,
          }),
      );

      if (!tripInfo.ok) {
        throw new Error("Failed to fetch nearby route trips");
      }

      return (await tripInfo.json()) as TripInfo;
    },
    {
      enabled: focusedTrip !== undefined,
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

  const usingMockedLocation =
    process.env.NEXT_PUBLIC_MOCK_LAT !== undefined &&
    process.env.NEXT_PUBLIC_MOCK_LNG !== undefined;

  const mapRef = useRef<MapRef>(null);
  const geoControlRef = useRef<mapboxgl.GeolocateControl>(null);
  useEffect(() => {
    if (usingMockedLocation) {
      return;
    }
    // Activate as soon as the control is loaded
    geoControlRef.current?.trigger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoControlRef.current, usingMockedLocation]);

  useEffect(() => {
    if (!followBus) {
      return;
    }

    if (mapRef.current === null || !mapRef.current.loaded) {
      return;
    }

    if (latitude === undefined || longitude === undefined) {
      return;
    }

    if (focusedTrip === undefined) {
      mapRef.current.setCenter([longitude!, latitude!]);
      mapRef.current.setZoom(14);
      return;
    }

    if (
      focusedTripData?.vehicle?.latitude === undefined ||
      focusedTripData?.vehicle?.longitude === undefined
    ) {
      return;
    }

    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([longitude!, latitude!]);
    bounds.extend([
      focusedTripData.vehicle.longitude!,
      focusedTripData.vehicle.latitude!,
    ]);
    mapRef.current?.fitBounds(bounds, {
      padding: 50,
      maxZoom: 14,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    followBus,
    mapRef.current,
    longitude,
    latitude,
    focusedTrip,
    focusedTripData?.vehicle?.latitude,
    focusedTripData?.vehicle?.longitude,
  ]);

  const [mapContextContent, setMapContextContent] = useState<
    MapContextContent | undefined
  >(undefined);
  useEffect(() => {
    if (focusedTrip === undefined) {
      setMapContextContent({
        type: "info",
        text: "Select a trip to see it on the map",
      });
    } else if (focusedTripData?.vehicle === undefined && !focusedTripLoading) {
      setMapContextContent({
        type: "warning",
        text: "Could not get vehicle location for this trip",
      });
    } else if (focusedTripError) {
      setMapContextContent({
        type: "error",
        text: "Failed to fetch trip information",
      });
    } else {
      setMapContextContent(undefined);
    }
  }, [focusedTrip, focusedTripData, focusedTripLoading, focusedTripError]);

  const loadingView = (
    <div className="flex flex-col w-full h-full">
      <NycBusLoadingView />
    </div>
  );

  if (
    !isDisplayingErrorRef.current &&
    (nearbyTripsLoading ||
      (!locationErrorMessage &&
        (latitude === undefined || longitude === undefined)))
  ) {
    return loadingView;
  }

  if (
    locationErrorMessage &&
    (latitude === undefined || longitude === undefined)
  ) {
    isDisplayingErrorRef.current = true;
    return (
      <FullScreenError
        system="us-ny-nycbus"
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
    isDisplayingErrorRef.current = true;
    return (
      <FullScreenError
        system="us-ny-nycbus"
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
    new Set(),
    30,
  );

  // If data is stale, show loading view
  if (nearbyTripsFetching && sanitizedNearbyTripsData?.length === 0) {
    return loadingView;
  }

  if (
    sanitizedNearbyTripsData?.length === 0 ||
    sanitizedNearbyTripsData === undefined
  ) {
    isDisplayingErrorRef.current = true;
    return (
      <FullScreenError
        system="us-ny-nycbus"
        error={
          <>
            {`No bus routes appear to be running at any stops within
            ${formatKmToLocalizedString(
              parseFloat(
                process.env.NEXT_PUBLIC_US_NY_NYCBUS_MAX_STOP_DISTANCE_KM!,
              ),
              distanceUnit,
            )} of you.`}
          </>
        }
      />
    );
  }

  let vehicleMarker = undefined;
  let routeSource = undefined;
  let stopsSource = undefined;
  let nearbyStopsSource = undefined;
  if (focusedTrip !== undefined && focusedTripData !== undefined) {
    const stopsGeoJson = {
      type: "FeatureCollection",
      features: focusedTripData.stops.map((stop) => {
        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [stop.longitude, stop.latitude],
          },
          properties: {
            name: stop.name,
          },
        };
      }),
    };

    stopsSource = (
      <Source id="stops-source" type="geojson" data={stopsGeoJson}>
        <Layer
          id="stops"
          type="circle"
          paint={{
            "circle-radius": 6,
            "circle-color": `#${focusedTrip.routeColor}`,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#fff",
          }}
        />
      </Source>
    );

    const routeGeoJson = {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: focusedTripData.shape?.points.map((shapePoint) => {
          return [shapePoint.longitude, shapePoint.latitude];
        }),
      },
    };
    routeSource = (
      <Source id="focused-route" type="geojson" data={routeGeoJson}>
        <Layer
          id="route"
          type="line"
          paint={{
            "line-color": `#${focusedTrip.routeColor}`,
            "line-width": 4,
          }}
        />
      </Source>
    );

    if (focusedTripData.vehicle !== undefined) {
      vehicleMarker = (
        <Marker
          key={focusedTripData.vehicle.id}
          longitude={focusedTripData.vehicle.longitude!}
          latitude={focusedTripData.vehicle.latitude!}
        >
          <div className="w-[2.25em] h-[2.25em]">
            <Image src="/mta-alert-icons/bus.svg" alt="Bus" fill />
          </div>
        </Marker>
      );
    }
  } else if (!focusedTripLoading) {
    // If we're not focused on a trip, display all nearby stops on a layer
    const nearbyStopsGeoJson = {
      type: "FeatureCollection",
      features: sanitizedNearbyTripsData.flatMap((stopRouteTrips) => {
        return stopRouteTrips.routeTrips.map((routeTrip) => {
          return {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [
                stopRouteTrips.stop.longitude,
                stopRouteTrips.stop.latitude,
              ],
            },
            properties: {
              name: stopRouteTrips.stop.name,
              route: routeTrip.route,
              routeColor: routeTrip.route_color,
            },
          };
        });
      }),
    };

    nearbyStopsSource = (
      <Source id="nearby-stops" type="geojson" data={nearbyStopsGeoJson}>
        <Layer
          id="stops"
          type="circle"
          paint={{
            "circle-radius": 6,
            "circle-color": M15.color,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#fff",
          }}
        />
      </Source>
    );
  }

  let mockLocationMarker = undefined;
  if (usingMockedLocation) {
    mockLocationMarker = (
      <Marker
        key="mock-location"
        longitude={parseFloat(process.env.NEXT_PUBLIC_MOCK_LNG!)}
        latitude={parseFloat(process.env.NEXT_PUBLIC_MOCK_LAT!)}
      >
        <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white animate-pulseKeyFramesAnimation" />
      </Marker>
    );
  }

  isDisplayingErrorRef.current = false;
  return (
    <div className="flex flex-col h-full">
      <div className="pt-[10px] sticky top-0 bg-black z-[60]">
        <ReactMapGl
          ref={mapRef}
          mapLib={import("mapbox-gl")}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!}
          initialViewState={{
            longitude: -100,
            latitude: 40,
            zoom: 3.5,
          }}
          style={{ width: "100%", height: 250 }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
        >
          {mapContextContent && <MapContextBar {...mapContextContent} />}
          <GeolocateControl
            ref={geoControlRef}
            showUserLocation
            trackUserLocation
          />
          <ToggleFollowBusControl enabled onToggle={setFollowBus} />
          {nearbyStopsSource}
          {routeSource}
          {stopsSource}
          {vehicleMarker}
          {mockLocationMarker}
        </ReactMapGl>
      </div>
      {focusedTrip?.routeId && alertsByRoute?.has(focusedTrip.routeId) && (
        <MtaAlertList
          alerts={getMtaAlertPropsFromRouteAlerts(
            alertsByRoute.get(focusedTrip.routeId!)!,
          )}
          behavior={Behavior.Collapsable}
        />
      )}
      <div className="grow overflow-auto scrollbar-hide snap-y bg-black">
        <table className="w-full bg-black p-0">
          {sanitizedNearbyTripsData.map((stopRouteTrip) => {
            const header = (
              <thead
                key={stopRouteTrip.stop.id}
                className="p-0 sticky top-0 z-50 snap-start bg-black"
              >
                <tr className="bg-black">
                  <th className="p-0 bg-black">
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
                  const isFocusedTrip = focusedTrip?.tripId === trip.id;

                  return [
                    trip.arrival,
                    <tr
                      key={`${stopRouteTrip.stop.id}${trip.id}${idx}`}
                      onClick={(e) => {
                        setFocusedTrip({
                          tripId: trip.id,
                          routeId: routeTrip.route,
                          routeColor: routeTrip.route_color,
                        });
                      }}
                    >
                      <td>
                        <div
                          className={`p-2 bg-black ${
                            isFocusedTrip
                              ? "border-4 border-white"
                              : "cursor-pointer"
                          }`}
                        >
                          <NycBusTripArrivalTime
                            timeUntilArrival={delta}
                            route={routeTrip.route}
                            routeColor={routeTrip.route_color}
                            destination={trip.destination.name}
                            showAlertIcon={alertsByRoute?.has(routeTrip.route)}
                            isFocused={isFocusedTrip}
                          />
                        </div>
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
      </div>
    </div>
  );
}

function MapContextBar({ text, type }: MapContextContent) {
  let bgColor;
  switch (type) {
    case "info":
      bgColor = "bg-blue-500";
      break;
    case "error":
      bgColor = "bg-yellow-500";
      break;
    case "warning":
      bgColor = "bg-yellow-500";
      break;
  }

  let textColor;
  switch (type) {
    case "info":
      textColor = "text-white";
      break;
    case "error":
      textColor = "text-black";
      break;
    case "warning":
      textColor = "text-black";
      break;
  }

  let icon;
  switch (type) {
    case "info":
      icon = <InformationCircleIcon className="w-4 h-4 mr-1" />;
      break;
    case "warning":
      icon = <InformationCircleIcon className="w-4 h-4 mr-1" />;
      break;
    case "error":
      icon = <InformationCircleIcon className="w-4 h-4 mr-1" />;
      break;
  }

  return (
    <div
      className={`absolute z-[100] top-0 left-0 flex flex-row items-center
justify-between h-10 py-2 px-3 font-bold ${bgColor} ${textColor} w-fit max-w-[80%]`}
    >
      {icon}
      {text}
    </div>
  );
}

function getMaxNumStops() {
  if (process.env.NEXT_PUBLIC_US_NY_BUSES_MAX_STOPS === undefined) {
    return 30;
  }
  return parseInt(process.env.NEXT_PUBLIC_US_NY_BUSES_MAX_STOPS!);
}

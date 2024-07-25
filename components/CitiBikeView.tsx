import { WatchMode, usePosition } from "@/utils/usePosition";
import { Fragment, useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";
import { FullScreenError, RelativeFullScreenError } from "./FullScreenError";
import { formatKmToLocalizedString } from "@/utils/measurementUtils";
import { useSettings } from "@/pages/settings";
import {
  Map as ReactMapGl,
  GeolocateControl,
  Layer,
  Marker,
  Source,
  MapRef,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import { CitiBikeStation } from "@/pages/api/citi_bike";
import { CitiBikeStationView } from "./CitiBikeStationView";
import {
  CitiBikeActionBar,
  CitiBikeActionBarFilterState,
} from "./CitiBikeActionBar";
import { MapMouseEvent } from "mapbox-gl";
import { CitiBikeStationHeader } from "./CitiBikeStationHeader";
import { CitiBikeLoadingView } from "./CitiBikeLoadingView";
import { citiBikeLightBlue } from "@/utils/citiBikeColors";
import useMapStyle from "@/utils/useMapStyle";
import { DataStatusOverlay } from "./DataStatusOverlay";

export default function CitiBikeView() {
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
  const isDisplayingErrorRef = useRef(false);
  const [focusedStationId, setFocusedStationId] = useState<string | undefined>(
    undefined,
  );
  const [filterBarState, setFilterBarState] =
    useState<CitiBikeActionBarFilterState>("all");

  const {
    data: citiBikeStations,
    dataUpdatedAt: citiBikeStationsUpdatedAt,
    isLoading: citiBikeStationsLoading,
    isFetching: citiBikeStationsFetching,
    error: citiBikeStationsError,
  } = useQuery(
    ["nearby_citi_bikes"],
    async () => {
      const nearbyRouteTrips = await fetch(
        "/api/citi_bike?" +
          new URLSearchParams({
            latitude: latitude!.toString(),
            longitude: longitude!.toString(),
            max_results: "20",
          }),
      );

      if (!nearbyRouteTrips.ok) {
        throw new Error("Failed to fetch nearby route trips");
      }

      return (await nearbyRouteTrips.json()) as CitiBikeStation[];
    },
    {
      enabled: latitude !== undefined && longitude !== undefined,
      refetchInterval: 10000,
    },
  );

  const { distanceUnit } = useSettings();
  const { mapStyleUrl } = useMapStyle();

  const usingMockedLocation =
    process.env.NEXT_PUBLIC_MOCK_LAT !== undefined &&
    process.env.NEXT_PUBLIC_MOCK_LNG !== undefined;

  const mapRef = useRef<MapRef>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const onClickHandlerRef = useRef<any>(null);
  useEffect(() => {
    if (!mapRef.current?.loaded) {
      return;
    }

    if (onClickHandlerRef.current) {
      mapRef.current.off("click", "stations", onClickHandlerRef.current);
    }

    onClickHandlerRef.current = (e: MapMouseEvent) => {
      const features = mapRef.current!.queryRenderedFeatures(e.point, {
        layers: ["stations"],
      });

      if (features.length === 0) {
        setFocusedStationId(undefined);
        return;
      }

      const id = features[0]?.properties?.id;
      if (!id) {
        console.error("No id found in properties", features[0]);
        setFocusedStationId(undefined);
        return;
      }

      setFocusedStationId(id);

      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    mapRef.current.on("click", "stations", onClickHandlerRef.current);
  }, [mapRef.current, mapLoaded]);

  const filteredCitiBikeStations =
    citiBikeStations?.filter((station) => {
      if (filterBarState === "all") {
        return true;
      }

      if (filterBarState === "ebikes") {
        return station.num_ebikes_available > 0 && station.is_renting;
      }

      if (filterBarState === "spaces") {
        return station.num_docks_available > 0 && station.is_returning;
      }

      return false;
    }) ?? [];

  const geoControlRef = useRef<mapboxgl.GeolocateControl>(null);
  const focusedStation = filteredCitiBikeStations.find(
    (station) => station.station_id === focusedStationId,
  );

  useEffect(() => {
    if (usingMockedLocation) {
      return;
    }
    // Activate as soon as the control is loaded
    geoControlRef.current?.trigger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usingMockedLocation, mapLoaded]);

  useEffect(() => {
    if (mapRef.current === null || !mapRef.current.loaded) {
      return;
    }

    if (latitude === undefined || longitude === undefined) {
      return;
    }

    if (!focusedStation) {
      mapRef.current.setCenter([longitude!, latitude!]);
      mapRef.current.setZoom(14);
      return;
    }

    if (focusedStation.lat === undefined || focusedStation.lon === undefined) {
      return;
    }

    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([longitude!, latitude!]);
    bounds.extend([focusedStation.lon, focusedStation.lat]);
    mapRef.current?.fitBounds(bounds, {
      padding: 50,
      maxZoom: 14,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedStation, mapRef.current, longitude, latitude, mapLoaded]);

  const loadingView = (
    <div className="flex flex-col w-full h-full">
      <CitiBikeLoadingView />
    </div>
  );

  if (
    !isDisplayingErrorRef.current &&
    (citiBikeStationsLoading ||
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
        system="us-ny-nyccitibike"
        error={
          <>
            Failed to get current location. Please ensure location access is
            enabled.
          </>
        }
      />
    );
  }

  if (citiBikeStationsError && (filteredCitiBikeStations.length === 0)) {
    isDisplayingErrorRef.current = true;
    return (
      <FullScreenError
        system="us-ny-nyccitibike"
        error={
          <>
            An error occurred while fetching nearby bikes. Will retry shortly.
          </>
        }
      />
    );
  }

  let errorUnderMap = null;
  if (filteredCitiBikeStations.length === 0 || citiBikeStations === undefined) {
    isDisplayingErrorRef.current = true;
    errorUnderMap = (
      <RelativeFullScreenError
        system="us-ny-nyccitibike"
        error={
          <>
            {`No nearby stations within
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

  const nearbyStationsGeoJson = {
    type: "FeatureCollection",
    features: filteredCitiBikeStations.map((station) => {
      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [station.lon, station.lat],
        },
        properties: {
          id: station.station_id,
          name: station.name,
          focused: station.station_id === focusedStationId,
        },
      };
    }),
  };

  const nearbyStationsSource = (
    <Source id="nearby-stations" type="geojson" data={nearbyStationsGeoJson}>
      <Layer
        id="stations"
        type="circle"
        paint={{
          "circle-radius": [
            "case",
            ["boolean", ["get", "focused"], false],
            10,
            7,
          ],
          "circle-color": citiBikeLightBlue,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
        }}
      />
    </Source>
  );

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
          mapStyle={mapStyleUrl}
          onLoad={() => {
            setMapLoaded(true);
          }}
        >
          <GeolocateControl
            ref={geoControlRef}
            showUserLocation
            trackUserLocation
          />
          {nearbyStationsSource}
          {mockLocationMarker}
        </ReactMapGl>
      </div>
      <CitiBikeActionBar
        filter={filterBarState}
        onFilterChange={setFilterBarState}
      />
      {errorUnderMap}
      <div className="grow overflow-auto scrollbar-hide bg-black">
        <table className="w-full bg-black p-0">
          {filteredCitiBikeStations.map((station) => {
            const isFocusedStation = station.station_id === focusedStationId;
            return (
              <Fragment key={station.station_id}>
                <thead className="p-0 sticky top-0 z-50 snap-start bg-black">
                  <tr className="bg-black">
                    <th className="p-0 bg-black">
                      <CitiBikeStationHeader stationName={station.name} />
                    </th>
                  </tr>
                </thead>
                <tbody className="scroll-mt-[44px]" id={station.station_id}>
                  <tr onClick={() => setFocusedStationId(station.station_id)}>
                    <td
                      className={`bg-black ${
                        isFocusedStation
                          ? "border-4 border-white"
                          : "cursor-pointer"
                      }`}
                    >
                      <CitiBikeStationView station={station} />
                    </td>
                  </tr>
                </tbody>
              </Fragment>
            );
          })}
        </table>
      </div>
      <DataStatusOverlay lastUpdate={citiBikeStationsUpdatedAt} />
    </div>
  );
}

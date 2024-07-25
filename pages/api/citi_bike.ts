import { NextApiRequest, NextApiResponse } from "next";

import { Gbfs } from "../../utils/gbfs/v2.3/gbfs";
import { StationInformation } from "../../utils/gbfs/v2.3/station_information";
import { StationStatus } from "../../utils/gbfs/v2.3/station_status";
import { fetchJsonAndThrow } from "../../utils/fetchUtils";
import haversineDistance from "haversine-distance";

const citiBikeSystemUrl =
  process.env.NEXT_PUBLIC_CITIBIKE_GBFS_URL ??
  "https://gbfs.citibikenyc.com/gbfs/2.3/gbfs.json";
const maxResults = parseFloat(
  process.env.NEXT_PUBLIC_CITIBIKE_MAX_RESULTS || "100",
);
const maxDistanceM =
  parseFloat(
    process.env.NEXT_PUBLIC_CITIBIKE_MAX_STATION_DISTANCE_KM || "3.2",
  ) * 1000;
const minStationsWithClassicBikes = parseFloat(
  process.env.NEXT_PUBLIC_CITIBIKE_MIN_STATIONS_WITH_CLASSIC_BIKES || "10",
);
const minStationsWithSpaces = parseFloat(
  process.env.NEXT_PUBLIC_CITIBIKE_MIN_STATIONS_WITH_SPACES || "10",
);
const minStationsWithEbikes = parseFloat(
  process.env.NEXT_PUBLIC_CITIBIKE_MIN_STATIONS_WITH_EBIKES || "10",
);

export type CitiBikeStationInfoAndStatus =
  StationInformation["data"]["stations"][0] &
    StationStatus["data"]["stations"][0];

export type CitiBikeStation = {
  station_id: string;
  name: string;
  lat: number;
  lon: number;
  distance: number;
  num_classic_bikes_available: number;
  num_ebikes_available: number;
  num_docks_available: number;
  is_renting: boolean;
  is_returning: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CitiBikeStation[] | { error: string }>,
) {
  const { latitude, longitude } = req.query as {
    latitude: string;
    longitude: string;
  };

  if (!latitude || !longitude) {
    return res.status(400).json({
      error: "Missing user location",
    });
  }

  const gbfsData = await fetchJsonAndThrow<Gbfs>(citiBikeSystemUrl);
  const englishFeeds = gbfsData.data["en"];
  if (!englishFeeds) {
    return res.status(404).json({
      error: "No English GBFS feeds found",
    });
  }

  const stationInformationUrl = englishFeeds.feeds.find(
    (f) => f.name === "station_information",
  )?.url;
  if (!stationInformationUrl) {
    return res.status(404).json({
      error: "No station_information feed found",
    });
  }

  const stationStatusUrl = englishFeeds.feeds.find(
    (f) => f.name === "station_status",
  )?.url;
  if (!stationStatusUrl) {
    return res.status(404).json({
      error: "No station_status feed found",
    });
  }

  const stationInformationPromise = fetchJsonAndThrow<StationInformation>(
    stationInformationUrl,
  );
  const stationStatusPromise =
    fetchJsonAndThrow<StationStatus>(stationStatusUrl);

  const [stationInformation, stationStatus] = (await Promise.all([
    stationInformationPromise,
    stationStatusPromise,
  ])) as [StationInformation, StationStatus];

  // Join station information and status
  const stations = stationInformation.data.stations.map((station) => {
    const status = stationStatus.data.stations.find(
      (s) => s.station_id === station.station_id,
    );
    return {
      ...station,
      ...status,
    };
  }) as CitiBikeStationInfoAndStatus[];

  // A station should be installed and be able to rent and/or return bikes
  const workingStations = stations.filter(
    (s) => s.is_installed && (s.is_renting || s.is_returning),
  );

  type CitiBikeAccumulator = {
    stations: CitiBikeStation[];
    stationsWithClassicBikes: number;
    stationsWithEBikes: number;
    stationsWithSpaces: number;
  };
  const nearbyWorkingStations = workingStations
    .map(
      (s) =>
        ({
          station_id: s.station_id,
          name: s.name,
          lat: s.lat,
          lon: s.lon,
          num_classic_bikes_available: getNumClassicBikes(s),
          num_ebikes_available: getNumEBikes(s),
          num_docks_available: s.num_docks_available ?? 0,
          vehichles_available: s.vehicle_types_available,
          dock_available: s.vehicle_docks_available,
          is_renting: s.is_renting,
          is_returning: s.is_returning,
          distance: haversineDistance(
            {
              lat: parseFloat(latitude),
              lng: parseFloat(longitude),
            },
            {
              lat: s.lat,
              lng: s.lon,
            },
          ),
        }) as CitiBikeStation,
    )
    .sort((a, b) => a.distance - b.distance)
    .filter((s) => s.distance <= maxDistanceM)
    .reduce<CitiBikeAccumulator>(
      (acc, s) => {
        const hasClassicBikes = s.num_classic_bikes_available && s.is_renting;
        const hasEBikes = s.num_ebikes_available && s.is_renting;
        const hasSpaces = s.num_docks_available && s.is_returning;

        acc.stationsWithClassicBikes += hasClassicBikes ? 1 : 0;
        acc.stationsWithEBikes += hasEBikes ? 1 : 0;
        acc.stationsWithSpaces += hasSpaces ? 1 : 0;

        // Add stations until we reach the minimum number of stations with
        // classic bikes, ebikes and spaces
        if (
          acc.stationsWithClassicBikes <= minStationsWithClassicBikes &&
          acc.stationsWithEBikes <= minStationsWithEbikes &&
          acc.stationsWithSpaces <= minStationsWithSpaces
        ) {
          acc.stations.push(s);
        }

        return acc;
      },
      {
        stations: [],
        stationsWithClassicBikes: 0,
        stationsWithEBikes: 0,
        stationsWithSpaces: 0,
      },
    )
    .stations.slice(0, maxResults);

  return res.status(200).json(nearbyWorkingStations);
}

const CLASSIC_BIKE_TYPE_ID = "1";
const EBIKE_TYPE_ID = "2";

function getNumClassicBikes(station: CitiBikeStationInfoAndStatus): number {
  if (!station.vehicle_types_available) {
    return station.num_bikes_available - station.num_ebikes_available;
  }

  return (
    station.vehicle_types_available?.find(
      (v) => v.vehicle_type_id === CLASSIC_BIKE_TYPE_ID,
    )?.count ?? 0
  );
}

function getNumEBikes(station: CitiBikeStationInfoAndStatus): number {
  if (!station.vehicle_types_available) {
    return station.num_ebikes_available;
  }

  return (
    station.vehicle_types_available?.find(
      (v) => v.vehicle_type_id === EBIKE_TYPE_ID,
    )?.count ?? 0
  );
}

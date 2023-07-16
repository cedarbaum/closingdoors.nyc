import { useState, useEffect } from "react";

const defaultSettings = {
  enableHighAccuracy: false,
  timeout: Infinity,
  maximumAge: 0,
};

interface GeolocationPositionWithTimestamp {
  readonly accuracy: number;
  readonly heading: number | null;
  readonly latitude: number;
  readonly longitude: number;
  readonly speed: number | null;
  readonly timestamp: EpochTimeStamp;
}

export enum WatchMode {
  None,
  Watch,
  Poll,
}

export interface WatchOptions {
  mode: WatchMode;
  interval?: number;
  skip?: boolean;
}

const mockLat = process.env.NEXT_PUBLIC_MOCK_LAT;
const mockLng = process.env.NEXT_PUBLIC_MOCK_LNG;

export const usePosition = (
  { mode, interval, skip }: WatchOptions = { mode: WatchMode.None },
  userSettings: PositionOptions = {}
) => {
  const settings = {
    ...defaultSettings,
    ...userSettings,
  };

  const [position, setPosition] = useState<
    GeolocationPositionWithTimestamp | undefined
  >(undefined);
  const [error, setError] = useState<string | null>(null);

  const onChange = ({ coords, timestamp }: GeolocationPosition) => {
    if (mockLat !== undefined && mockLng !== undefined) {
      setPosition({
        latitude: parseFloat(mockLat),
        longitude: parseFloat(mockLng),
        accuracy: 0,
        speed: 0,
        heading: 0,
        timestamp: Date.now(),
      });
      return;
    }

    setError(null);
    setPosition({
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
      speed: coords.speed,
      heading: coords.heading,
      timestamp,
    });
  };

  const onError = (error: GeolocationPositionError) => {
    if (mockLat !== undefined && mockLng !== undefined) {
      return;
    }

    setError(error.message);
  };

  useEffect(() => {
    if (skip) {
      return;
    }

    if (!navigator || !navigator.geolocation) {
      setError("Geolocation is not supported");
      return;
    }

    if (mode === WatchMode.Watch) {
      const watcher = navigator.geolocation.watchPosition(
        onChange,
        onError,
        settings
      );
      return () => navigator.geolocation.clearWatch(watcher);
    } else if (mode == WatchMode.Poll) {
      navigator.geolocation.getCurrentPosition(onChange, onError, settings);
      const poller = setInterval(
        () =>
          navigator.geolocation.getCurrentPosition(onChange, onError, settings),
        interval
      );
      return () => clearInterval(poller);
    }

    navigator.geolocation.getCurrentPosition(onChange, onError, settings);
  }, [
    mode,
    interval,
    settings.enableHighAccuracy,
    settings.timeout,
    settings.maximumAge,
    skip,
  ]);

  return { ...position, error };
};

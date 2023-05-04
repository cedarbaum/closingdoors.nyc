import { useState, useEffect } from "react";

const defaultSettings = {
  skip: false,
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
}

export const usePosition = (
  { mode, interval }: WatchOptions = { mode: WatchMode.None },
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
    setError(error.message);
  };

  useEffect(() => {
    if (settings.skip) {
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
        () => navigator.geolocation.getCurrentPosition(onChange, onError),
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
    settings.skip,
  ]);

  return { ...position, error };
};

import React from "react";
import { Duration } from "luxon";
import humanizeDuration from "humanize-duration";

export enum DurationFormat {
  MinuteCeiling,
  Exact,
}

export interface TripArrivalTimeProps {
  routeDisplay: React.ReactNode;
  timeUntilArrival: Duration;
  durationFormat?: DurationFormat;
  onClickTimeText?(): void;
}

export const TripArrivalTime: React.FC<TripArrivalTimeProps> = (props) => {
  const durationAbsValue =
    props.timeUntilArrival.toMillis() < 0
      ? props.timeUntilArrival.negate()
      : props.timeUntilArrival;
  const displayArrivingNow =
    props.timeUntilArrival.toMillis() < 15 * 1000 &&
    props.durationFormat === DurationFormat.MinuteCeiling;
  const lessThanAMin = durationAbsValue.toMillis() < 60 * 1000;
  const staleTrip =
    props.timeUntilArrival.toMillis() < -1 * 30 * 1000 ||
    (props.durationFormat === DurationFormat.Exact &&
      props.timeUntilArrival.toMillis() < 0);
  const shortEnglishHumanizer = humanizeDuration.humanizer({
    language: "shortEn",
    languages: {
      shortEn: {
        h: (units: any) => (units && units > 1 ? "hrs" : "hr"),
        m: (units: any) => (units && units > 1 ? "mins" : "min"),
        s: (units: any) => (units && units > 1 ? "secs" : "sec"),
      },
    },
  });

  let durationStr: string;
  if (props.durationFormat === DurationFormat.Exact) {
    const formatStr =
      durationAbsValue.milliseconds >= 3600 * 1000 ? "h:mm:ss" : "m:ss";
    durationStr = durationAbsValue.toFormat(formatStr);
  } else {
    if (lessThanAMin) {
      durationStr = shortEnglishHumanizer(durationAbsValue.milliseconds, {
        units: ["m", "s"],
        round: true,
      });
    } else {
      const ceilingMinutesMilliseconds =
        Math.ceil(durationAbsValue.milliseconds / (60 * 1000)) * (60 * 1000);
      durationStr = shortEnglishHumanizer(ceilingMinutesMilliseconds, {
        units: ["h", "m"],
        round: true,
      });
    }
  }

  return (
    <div className="p-2 w-full bg-black flex items-center justify-between">
      <div className="flex items-center">{props.routeDisplay}</div>
      <div className="mr-4 text-4xl">
        {!staleTrip ? (
          <span
            className={`text-white cursor-pointer whitespace-nowrap ${
              displayArrivingNow ? "animate-arrivalTimeFadeInOutAnimation" : ""
            }`}
            onClick={() => props.onClickTimeText && props.onClickTimeText()}
          >
            {displayArrivingNow ? "Now" : durationStr}
          </span>
        ) : (
          <span
            className="text-mtaYellow cursor-pointer whitespace-nowrap"
            onClick={() => props.onClickTimeText && props.onClickTimeText()}
          >{`${durationStr} ago`}</span>
        )}
      </div>
    </div>
  );
};

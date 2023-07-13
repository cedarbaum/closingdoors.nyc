import React, { useContext } from "react";
import { Duration } from "luxon";
import humanizeDuration from "humanize-duration";
import { ScheduleCountdownDisplayFormat, useSettings } from "@/pages/settings";
import { PopoverAlertContext } from "./Layout";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

export interface TripArrivalTimeProps {
  routeDisplay: React.ReactNode;
  timeUntilArrival: Duration;
  interactive?: boolean;
}

export const TripArrivalTime: React.FC<TripArrivalTimeProps> = ({
  routeDisplay,
  timeUntilArrival,
  interactive = true,
}) => {
  const {
    schedule: { countdownDisplayFormat },
    setScheduleCountdownDisplayFormat,
  } = useSettings();

  const setAlert = useContext(PopoverAlertContext);
  const cycleFormattingOptions = () => {
    if (!interactive) {
      return;
    }

    // Cycle formatting options
    const countdownDisplayFormatOptions = [
      ScheduleCountdownDisplayFormat.MinuteRounded,
      ScheduleCountdownDisplayFormat.Exact,
      ScheduleCountdownDisplayFormat.MinuteFloor,
      ScheduleCountdownDisplayFormat.MinuteCeiling,
    ];

    const currentOptionIdx = countdownDisplayFormatOptions.indexOf(
      countdownDisplayFormat
    );
    const nextOptionIdx =
      (currentOptionIdx + 1) % countdownDisplayFormatOptions.length;
    const nextOption = countdownDisplayFormatOptions[nextOptionIdx];
    setScheduleCountdownDisplayFormat(nextOption);

    function notifyUserOfFormatChange(newFormat: string) {
      setAlert({
        content: (
          <div className="flex items-center">
            <InformationCircleIcon className="w-6 h-6 mr-2" />
            <span>
              <b>Countdown format:</b> {newFormat}
            </span>
          </div>
        ),
        type: "info",
      });
    }

    switch (nextOption) {
      case ScheduleCountdownDisplayFormat.Exact:
        notifyUserOfFormatChange("Exact");
        break;
      case ScheduleCountdownDisplayFormat.MinuteRounded:
        notifyUserOfFormatChange("Minute Rounded");
        break;
      case ScheduleCountdownDisplayFormat.MinuteFloor:
        notifyUserOfFormatChange("Minute Floor");
        break;
      case ScheduleCountdownDisplayFormat.MinuteCeiling:
        notifyUserOfFormatChange("Minute Ceiling");
        break;
    }
  };

  const durationAbsValue =
    timeUntilArrival.toMillis() < 0
      ? timeUntilArrival.negate()
      : timeUntilArrival;
  const displayArrivingNow =
    timeUntilArrival.toMillis() < 15 * 1000 &&
    countdownDisplayFormat !== ScheduleCountdownDisplayFormat.Exact;
  const lessThanAMin = durationAbsValue.toMillis() < 60 * 1000;
  const staleTrip =
    timeUntilArrival.toMillis() < -1 * 30 * 1000 ||
    (countdownDisplayFormat === ScheduleCountdownDisplayFormat.Exact &&
      timeUntilArrival.toMillis() < 0);
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
  if (
    lessThanAMin &&
    countdownDisplayFormat !== ScheduleCountdownDisplayFormat.Exact
  ) {
    durationStr = shortEnglishHumanizer(durationAbsValue.milliseconds, {
      units: ["m", "s"],
      round: true,
    });
  } else if (countdownDisplayFormat === ScheduleCountdownDisplayFormat.Exact) {
    const formatStr =
      durationAbsValue.milliseconds >= 3600 * 1000 ? "h:mm:ss" : "m:ss";
    durationStr = durationAbsValue.toFormat(formatStr);
  } else if (
    countdownDisplayFormat === ScheduleCountdownDisplayFormat.MinuteFloor
  ) {
    const floorMinutesMilliseconds =
      Math.floor(durationAbsValue.milliseconds / (60 * 1000)) * (60 * 1000);
    durationStr = shortEnglishHumanizer(floorMinutesMilliseconds, {
      units: ["h", "m"],
      round: true,
    });
  } else if (
    countdownDisplayFormat === ScheduleCountdownDisplayFormat.MinuteCeiling
  ) {
    const ceilingMinutesMilliseconds =
      Math.ceil(durationAbsValue.milliseconds / (60 * 1000)) * (60 * 1000);
    durationStr = shortEnglishHumanizer(ceilingMinutesMilliseconds, {
      units: ["h", "m"],
      round: true,
    });
  } else {
    // MinuteRounded
    const roundedMinutesMilliseconds =
      Math.round(durationAbsValue.milliseconds / (60 * 1000)) * (60 * 1000);
    durationStr = shortEnglishHumanizer(roundedMinutesMilliseconds, {
      units: ["h", "m"],
      round: true,
    });
  }

  return (
    <div className="w-full bg-black flex items-center justify-between">
      <div className="flex items-center">{routeDisplay}</div>
      <div className="text-4xl">
        {!staleTrip ? (
          <span
            className={`text-white ${
              interactive ? "cursor-pointer" : ""
            } whitespace-nowrap ${
              displayArrivingNow ? "animate-arrivalTimeFadeInOutAnimation" : ""
            }`}
            onClick={cycleFormattingOptions}
          >
            {displayArrivingNow ? "Now" : durationStr}
          </span>
        ) : (
          <span
            className="text-mtaYellow cursor-pointer whitespace-nowrap"
            onClick={cycleFormattingOptions}
          >{`${durationStr} ago`}</span>
        )}
      </div>
    </div>
  );
};

import React from "react";
import { NycSubwayIcon } from "./NycSubwayIcon";
import { allRoutes } from "@/utils/SubwayLines";
import { Duration } from "luxon";
import humanizeDuration from "humanize-duration";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import { Direction } from "@/generated/gql/graphql";

export enum DurationFormat {
  MinuteCeiling,
  Exact,
}

export interface NycSubwayTripArrivalTimeProps {
  route: string;
  direction: Direction;
  timeUntilArrival: Duration;
  durationFormat?: DurationFormat;
  onClickTimeText?(): void;
}

export const NycSubwayTripArrivalTime: React.FC<
  NycSubwayTripArrivalTimeProps
> = (props) => {
  const isDiamond = props.route.endsWith("X");
  const route = allRoutes.find(
    (route) =>
      route.name === props.route &&
      (route.isDiamond === isDiamond ||
        (!isDiamond && route.isDiamond === undefined))
  );
  const normalizedRouteName = isDiamond
    ? props.route.substring(0, props.route.length - 1)
    : props.route;

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

  const directionArrow =
    props.direction === Direction.North ? (
      <ArrowUpIcon className="w-[40px] h-[40px] text-white" />
    ) : (
      <ArrowDownIcon className="w-[40px] h-[40px] text-white" />
    );

  return (
    <div className="p-2 w-full bg-black flex items-center justify-between">
      <div className="flex items-center">
        <NycSubwayIcon
          route={normalizedRouteName}
          isDiamond={isDiamond}
          width={50}
          height={50}
        />
        <div className="ml-4">
          {route?.isShuttle ? (
            <span className="text-white text-4xl">
              {props.direction === Direction.North
                ? route.northAlias
                : route.southAlias}
            </span>
          ) : (
            directionArrow
          )}
        </div>
      </div>
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

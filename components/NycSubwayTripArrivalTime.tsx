import React from "react";
import { NycSubwayIcon } from "./NycSubwayIcon";
import { SubwayDirection, allRoutes } from "@/utils/subwayLines";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import { TripArrivalTime, TripArrivalTimeProps } from "./TripArrivalTime";

export interface NycSubwayTripArrivalTimeProps
  extends Omit<TripArrivalTimeProps, "routeDisplay"> {
  route: string;
  direction: SubwayDirection;
  headsign?: string;
  destination?: string;
}

export const NycSubwayTripArrivalTime: React.FC<
  NycSubwayTripArrivalTimeProps
> = (props) => {
  const isDiamond = props.route.toLowerCase().endsWith("x");
  const normalizedRouteName = isDiamond
    ? props.route.substring(0, props.route.length - 1)
    : props.route;
  const route = allRoutes.find(
    (route) =>
      route.name === normalizedRouteName &&
      (route.isDiamond === isDiamond ||
        (!isDiamond && route.isDiamond === undefined)),
  );

  const directionArrow =
    props.direction === SubwayDirection.North ? (
      <ArrowUpIcon className="w-[40px] h-[40px] text-white" />
    ) : (
      <ArrowDownIcon className="w-[40px] h-[40px] text-white" />
    );

  const routeDisplay = (
    <div className="flex flex-col">
      <div className="flex flex-row items-center">
        <NycSubwayIcon
          route={normalizedRouteName}
          isDiamond={isDiamond}
          width={50}
          height={50}
        />
        <div className="ml-4">
          {route?.useDirectionAliases ? (
            <span className="text-white text-4xl">
              {props.direction === SubwayDirection.North
                ? route.northAlias
                : route.southAlias}
            </span>
          ) : (
            directionArrow
          )}
        </div>
      </div>
      {(props.headsign || props.destination) && (
        <span className="text-white text-sm mt-1 max-w-[min(14rem,calc(50vw))] text-left overflow-hidden whitespace-nowrap text-ellipsis uppercase">
          → {props.destination ? props.destination : props.headsign}
        </span>
      )}
    </div>
  );

  return <TripArrivalTime {...props} routeDisplay={routeDisplay} />;
};

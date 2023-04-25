import React from "react";
import { TripArrivalTime, TripArrivalTimeProps } from "./TripArrivalTime";
import { NjOrNy, PathRoute, routeIdToPathMetadata } from "@/utils/PathRoutes";

export interface PathTripArrivalTimeProps
  extends Omit<TripArrivalTimeProps, "routeDisplay"> {
  route: PathRoute;
  direction: NjOrNy;
}

export const PathTripArrivalTime: React.FC<PathTripArrivalTimeProps> = (
  props
) => {
  const subLabel = routeIdToPathMetadata.get(props.route)?.subLabel ? (
    <div className="text-xs">
      {routeIdToPathMetadata.get(props.route)?.subLabel!(props.direction)}
    </div>
  ) : null;

  const routeDisplay = (
    <div className="flex text-white items-center">
      <div className="w-[50px] h-[50px]">
        {routeIdToPathMetadata.get(props.route)?.icon}
      </div>
      <div className="flex flex-col justify-center ml-4 text-3xl uppercase">
        {routeIdToPathMetadata.get(props.route)?.label(props.direction)}
        {subLabel !== null && subLabel}
      </div>
    </div>
  );

  return <TripArrivalTime {...props} routeDisplay={routeDisplay} />;
};

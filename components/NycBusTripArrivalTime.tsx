import React from "react";
import { TripArrivalTime, TripArrivalTimeProps } from "./TripArrivalTime";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";

export interface NycBusTripArrivalTimeProps
  extends Omit<TripArrivalTimeProps, "routeDisplay"> {
  route: string;
  routeColor?: string;
  headsign?: string;
  destination: string;
  showAlertIcon?: boolean;
  isFocused?: boolean;
}

export const NycBusTripArrivalTime: React.FC<NycBusTripArrivalTimeProps> = ({
  route,
  routeColor,
  destination,
  headsign,
  showAlertIcon,
  isFocused,
  ...props
}: NycBusTripArrivalTimeProps) => {
  const routeColorAsHex = routeColor ? `#${routeColor}` : "#000000";
  const routeDisplay = (
    <div className="relative">
      <div
        className="relative flex text-white text-xl font-bold w-fit p-2 rounded-md"
        style={{ backgroundColor: routeColorAsHex }}
      >
        {route}
        {showAlertIcon && (
          <ExclamationCircleIcon className="absolute w-[20px] h-[20px] right-[-10px] top-[-7px] z-30 select-none text-[#FFFF00] animate-alertIconAnimation" />
        )}
      </div>
      <div className="flex text-white text-sm mt-1">
        → {headsign ? shortedHeadsign(headsign) : destination}
      </div>
    </div>
  );

  return (
    <TripArrivalTime
      {...props}
      interactive={isFocused}
      routeDisplay={routeDisplay}
    />
  );
};

function shortedHeadsign(headsign: string): string {
  // Remove "SELECT BUS" prefix
  const selectBusPrifix = "SELECT BUS";
  if (headsign.toUpperCase().startsWith(selectBusPrifix)) {
    return headsign.substring(selectBusPrifix.length).trim();
  }
  return headsign;
}

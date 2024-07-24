import React from "react";
import clsx from "clsx";
import { BoltIcon } from "@heroicons/react/20/solid";
import { CitiBikeStation } from "@/pages/api/citi_bike";
import ParkingIcon from "../public/citibike-icons/parking.svg";

export interface CitiBikeStationProps {
  station: CitiBikeStation;
}

export const CitiBikeStationView: React.FC<CitiBikeStationProps> = ({
  station,
}: CitiBikeStationProps) => {
  return (
    <div className="w-full p-2 flex flex-row text-white">
      <div className="w-1/3 flex flex-col">
        <div
          className={clsx(
            "relative text-2xl font-bold",
            !station.is_renting && "text-gray-400 line-through decoration-[3px]",
          )}
        >
          {station.num_bikes_available - station.num_ebikes_available}
        </div>
        <span>
          <span className="text-sm mr-1">Classic</span>
        </span>
      </div>
      <div className="w-1/3 flex flex-col">
        <div
          className={clsx(
            "relative text-2xl font-bold",
            !station.is_renting && "text-gray-400 line-through decoration-[3px]",
          )}
        >
          {station.num_ebikes_available}
        </div>
        <span>
          <BoltIcon className="h-4 w-4 inline mr-1" fill="yellow" />
          <span className="text-sm">Bikes</span>
        </span>
      </div>
      <div className="w-1/3 flex flex-col">
        <div
          className={clsx(
            "relative text-2xl font-bold",
            !station.is_returning && "text-gray-400 line-through decoration-[3px]",
          )}
        >
          {station.num_docks_available}
        </div>
        <span>
          <ParkingIcon className="h-4 w-4 inline mr-1" fill="white" />
          <span className="text-sm">Spots</span>
        </span>
      </div>
    </div>
  );
};

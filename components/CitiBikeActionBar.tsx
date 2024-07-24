import React from "react";
import { BoltIcon } from "@heroicons/react/20/solid";
import { clsx } from "clsx";
import ParkingIcon from "../public/citibike-icons/parking.svg";
import BikeIcon from "../public/citibike-icons/bike.svg";

export type CitiBikeActionBarFilterState = "all" | "ebikes" | "spaces";

export interface CitiBikeActionBarProps {
  filter: CitiBikeActionBarFilterState;
  onFilterChange?: (filter: CitiBikeActionBarFilterState) => void;
}

const unselectedColor = "#9ca3af";

export const CitiBikeActionBar: React.FC<CitiBikeActionBarProps> = ({
  filter,
  onFilterChange,
}: CitiBikeActionBarProps) => {
  return (
    <div className="w-full px-1 py-4 flex flex-row text-white">
      <div
        className="h-[50px] w-1/3 flex flex-col items-center justify-center"
        onClick={() => onFilterChange?.("all")}
      >
        <BikeIcon
          className="h-6 w-6 mb-2"
          fill={filter === "all" ? "white" : unselectedColor}
        />
        <span
          className={clsx(
            "text-xs",
            filter === "all" ? "text-white" : "text-gray-400",
          )}
        >
          All stations
        </span>
      </div>
      <div
        className="h-[50px] w-1/3 flex flex-col items-center justify-center"
        onClick={() => onFilterChange?.("ebikes")}
      >
        <BoltIcon
          className="h-6 w-6 mb-2"
          fill={filter === "ebikes" ? "yellow" : unselectedColor}
        />
        <span
          className={clsx(
            "text-xs",
            filter === "ebikes" ? "text-white" : "text-gray-400",
          )}
        >
          E-Bikes only
        </span>
      </div>
      <div
        className="h-[50px] w-1/3 flex flex-col items-center justify-center"
        onClick={() => onFilterChange?.("spaces")}
      >
        <ParkingIcon
          className="h-6 w-6 mb-2"
          fill={filter === "spaces" ? "white" : unselectedColor}
        />
        <span
          className={clsx(
            "text-xs",
            filter === "spaces" ? "text-white" : "text-gray-400",
          )}
        >
          Spaces only
        </span>
      </div>
    </div>
  );
};

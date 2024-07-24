import React from "react";
import BikeIcon from "../public/citibike-icons/bike.svg";
import { citiBikeLightBlue } from "@/utils/citiBikeColors";

export function CitiBikeLoadingView() {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <BikeIcon className="w-16 h-16 animate-pulse" fill={citiBikeLightBlue} />
    </div>
  );
}

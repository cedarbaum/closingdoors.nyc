import React from "react";

export interface CitiBikeStationHeaderProps {
  stationName: string;
}

export const CitiBikeStationHeader: React.FC<CitiBikeStationHeaderProps> = ({
  stationName,
}) => {
  return (
    <div className="w-ful flex items-center bg-black">
      <span className="p-2 text-white text-left overflow-hidden max-w-[min(28rem,calc(100vw))] whitespace-nowrap text-ellipsis uppercase text-xl">
        {stationName}
      </span>
    </div>
  );
};

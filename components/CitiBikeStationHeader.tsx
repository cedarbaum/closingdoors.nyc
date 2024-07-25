import React from "react";

export interface CitiBikeStationHeaderProps {
  stationName: string;
}

export const CitiBikeStationHeader: React.FC<CitiBikeStationHeaderProps> = ({
  stationName,
}) => {
  return (
    <div className="w-full flex items-center bg-black h-[44px]">
      <span className="p-2 text-white text-left overflow-hidden max-w-[min(28rem,calc(100vw))] whitespace-nowrap text-ellipsis uppercase text-xl">
        {stationName}
      </span>
    </div>
  );
};

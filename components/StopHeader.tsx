import React from "react";

export interface StopHeaderProps {
  stopName: string;
}

export const StopHeader: React.FC<StopHeaderProps> = ({ stopName }) => {
  return (
    <div className="w-full flex items-center bg-black">
      <span className="p-2 text-white text-left overflow-hidden max-w-[min(28rem,calc(100vw))] whitespace-nowrap text-ellipsis uppercase text-xl">
        {stopName}
      </span>
    </div>
  );
};

import React from "react";
import { allRoutes } from "@/utils/nycBus";

export function NycBusLoadingView() {
  return (
    <div className="w-full h-full flex justify-center items-center">
      {allRoutes.map(({ color }, idx) => {
        return (
          <div
            className="relative w-[50px] h-[25px] rounded-md animate-pathLoadingKeyframesAnimation opacity-50 mx-1 border-2 border-white"
            key={`icon${idx}`}
            style={{
              animationDelay: `${idx * 0.2}s`,
              backgroundColor: color,
            }}
          />
        );
      })}
    </div>
  );
}

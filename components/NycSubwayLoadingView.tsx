import React from "react";
import { allLines } from "@/utils/SubwayLines";

const animationDelays = [0, -0.4, -0.8, -0.4, -0.8, -1.2, -0.8, -1.2, -1.6];

export const NycSubwayLoadingView: React.FC = () => {
  // Based on https://github.com/loadingio/css-spinner/blob/master/dist/grid.html
  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="inline-block relative w-[80px] h-[80px]">
        {Array.from(Array(9).keys()).map((_, idx) => {
          const row = Math.floor(idx / 3);
          const col = idx % 3;
          const top = 8 + row * 24;
          const left = 8 + col * 24;

          return (
            <div
              key={idx}
              className="absolute w-[16px] h-[16px] rounded-full animate-nycSubwayLaodingKeyframesAnimation"
              style={{
                top,
                left,
                background: allLines[idx].color,
                animationDelay: `${animationDelays[idx]}s`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

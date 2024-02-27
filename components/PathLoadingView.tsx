import React from "react";
import { PathRoute, routeIdToPathMetadata } from "@/utils/pathRoutes";

export function PathLoadingView({
  excludedPathRoutes,
}: {
  excludedPathRoutes?: Set<PathRoute>;
}) {
  return (
    <div className="w-full h-full flex justify-center items-center">
      {Array.from(routeIdToPathMetadata.entries())
        .filter(([routeId]) => excludedPathRoutes?.has(routeId) !== true)
        .map(([_, { icon }], idx) => {
          return (
            <div
              className="w-6 h-6 mx-1 animate-pathLoadingKeyframesAnimation opacity-50"
              key={`icon${idx}`}
              style={{
                animationDelay: `${idx * 0.2}s`,
              }}
            >
              {icon}
            </div>
          );
        })}
    </div>
  );
}

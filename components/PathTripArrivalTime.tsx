import React from "react";
import { TripArrivalTime, TripArrivalTimeProps } from "./TripArrivalTime";
import { NjOrNy } from "./PathScheduleView";

export interface PathTripArrivalTimeProps
  extends Omit<TripArrivalTimeProps, "routeDisplay"> {
  route: string;
  direction: NjOrNy;
}

interface PathRouteMetadata {
  name: string;
  label: (njOrNy: NjOrNy) => string;
  subLabel?: (njOrNy: NjOrNy) => string;
  icon: React.ReactNode;
}

const routeIdToPathMetadata = new Map<string, PathRouteMetadata>([
  [
    "862",
    {
      name: "NWK-WTC",
      icon: <SolidCircleIcon color="#D63D2E" />,
      label: (njOrNy) => (njOrNy === "NJ" ? "NWK" : "WTC"),
    },
  ],
  [
    "861",
    {
      name: "JSQ-33",
      icon: <SolidCircleIcon color="#EFAB43" />,
      label: (njOrNy) => (njOrNy === "NJ" ? "JSQ" : "33RD"),
    },
  ],
  [
    "1024",
    {
      name: "JSQ-33 (via HOB)",
      icon: <MultiColorCircleIcon leftColor="#2B85BB" rightColor="#EFAB43" />,
      label: (njOrNy) => (njOrNy === "NJ" ? "JSQ" : "33RD"),
      subLabel: (njOrNy) => "via HOB",
    },
  ],
  [
    "859",
    {
      name: "HOB-33",
      icon: <SolidCircleIcon color="#2B85BB" />,
      label: (njOrNy) => (njOrNy === "NJ" ? "HOB" : "33RD"),
    },
  ],
  [
    "860",
    {
      name: "HOB-WTC",
      icon: <SolidCircleIcon color="#469C22" />,
      label: (njOrNy) => (njOrNy === "NJ" ? "HOB" : "WTC"),
    },
  ],
  // Not supported currently
  [
    "74320",
    {
      name: "Newark - Harrison Shuttle Train",
      icon: null,
      label: (njOrNy) => "",
    },
  ],
]);

export const PathTripArrivalTime: React.FC<PathTripArrivalTimeProps> = (
  props
) => {
  const subLabel = routeIdToPathMetadata.get(props.route)?.subLabel ? (
    <div className="text-xs">
      {routeIdToPathMetadata.get(props.route)?.subLabel!(props.direction)}
    </div>
  ) : null;

  const routeDisplay = (
    <div className="flex text-white items-center">
      {routeIdToPathMetadata.get(props.route)?.icon}
      <div className="flex flex-col justify-center ml-4 text-3xl uppercase">
        {routeIdToPathMetadata.get(props.route)?.label(props.direction)}
        {subLabel !== null && subLabel}
      </div>
    </div>
  );

  return <TripArrivalTime {...props} routeDisplay={routeDisplay} />;
};

function SolidCircleIcon({ color }: { color: string }) {
  return (
    <div
      style={{
        width: 50,
        height: 50,
        backgroundColor: color,
        borderRadius: 99999,
        border: "2px solid white",
      }}
    />
  );
}

function MultiColorCircleIcon({
  leftColor,
  rightColor,
}: {
  leftColor: string;
  rightColor: string;
}) {
  return (
    <div
      style={{
        width: 50,
        height: 50,
        background: `linear-gradient(to right, ${leftColor} 50%, ${rightColor} 50%)`,
        borderRadius: 99999,
        border: "2px solid white",
      }}
    />
  );
}

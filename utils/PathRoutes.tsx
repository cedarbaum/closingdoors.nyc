import {
  PathMulticolorCircleIcon,
  PathSolidCircleIcon,
} from "@/components/PathIcons";

export type PathRoute = "862" | "861" | "1024" | "859" | "860" | "74320";

export enum NjOrNy {
  NJ = "NJ",
  NY = "NY",
}

export interface PathRouteMetadata {
  name: string;
  label: (njOrNy: NjOrNy) => string;
  subLabel?: (njOrNy: NjOrNy) => string;
  icon: React.ReactNode;
}

export const routeIdToPathMetadata = new Map<PathRoute, PathRouteMetadata>([
  [
    "862",
    {
      name: "NWK-WTC",
      icon: <PathSolidCircleIcon color="#D63D2E" />,
      label: (njOrNy) => (njOrNy === "NJ" ? "NWK" : "WTC"),
    },
  ],
  [
    "861",
    {
      name: "JSQ-33",
      icon: <PathSolidCircleIcon color="#EFAB43" />,
      label: (njOrNy) => (njOrNy === "NJ" ? "JSQ" : "33RD"),
    },
  ],
  [
    "1024",
    {
      name: "JSQ-33 (via HOB)",
      icon: (
        <PathMulticolorCircleIcon leftColor="#2B85BB" rightColor="#EFAB43" />
      ),
      label: (njOrNy) => (njOrNy === "NJ" ? "JSQ" : "33RD"),
      subLabel: (njOrNy) => "via HOB",
    },
  ],
  [
    "859",
    {
      name: "HOB-33",
      icon: <PathSolidCircleIcon color="#2B85BB" />,
      label: (njOrNy) => (njOrNy === "NJ" ? "HOB" : "33RD"),
    },
  ],
  [
    "860",
    {
      name: "HOB-WTC",
      icon: <PathSolidCircleIcon color="#469C22" />,
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

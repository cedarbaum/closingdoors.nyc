import usePrefersColorScheme from "use-prefers-color-scheme";
import { useSettings } from "../pages/settings";

const LIGHT_STYLE_URL = "mapbox://styles/mapbox/streets-v12";
const DARK_STYLE_URL = "mapbox://styles/mapbox/dark-v11";
const LIGHT_STYLE = { mapStyleUrl: LIGHT_STYLE_URL, mapStyle: "light" } as const;
const DARK_STYLE = { mapStyleUrl: DARK_STYLE_URL, mapStyle: "dark" } as const;

export type MapStyle = {
  mapStyleUrl: string;
  mapStyle: "light" | "dark";
}

export default function useMapStyle(): MapStyle {
  const settting = useSettings();
  const systemTheme = usePrefersColorScheme();
  if (!settting?.settingsReady) return LIGHT_STYLE;
  if (settting.mapStyle === "dark") return DARK_STYLE;
  if (settting.mapStyle === "light") return LIGHT_STYLE;

  // Use system theme
  return systemTheme === "dark" ? DARK_STYLE : LIGHT_STYLE
}

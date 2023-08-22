import { System } from "./System";

export function getEnabledSystems() {
  const enabledSystems = process.env.NEXT_PUBLIC_ENABLED_SYSTEMS?.split(
    ","
  ) as System[];

  // Only subway is enabled by default
  if (!enabledSystems) return ["us-ny-subway"];
  return enabledSystems;
}

export function getSystemEnabled(system: System) {
  return getEnabledSystems().includes(system);
}

export function getChatEnabled() {
  return process.env.NEXT_PUBLIC_CHAT_ENABLED === "true";
}

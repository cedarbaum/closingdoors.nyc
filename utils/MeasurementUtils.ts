import { DistanceUnits } from "@/pages/settings";

export function kmToMi(km: number) {
  return km * 0.621371;
}

export function formatKmToLocalizedString(
  km: number,
  distanceUnits: DistanceUnits
) {
  switch (distanceUnits) {
    case "km":
      return `${km.toPrecision(1)} KM`;
    case "mi":
    default:
      return `${kmToMi(km).toPrecision(1)} MI`;
  }
}

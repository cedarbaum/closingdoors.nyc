import { DateTime } from "luxon";

export function getNycDateTimeStringFromSeconds(seconds: number) {
  const dt = DateTime.fromSeconds(seconds).setZone("America/New_York");
  return dt.toLocaleString(DateTime.DATETIME_FULL);
}

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextApiRequest } from "next";
import requestIp from "request-ip";

const APP_NAME = "closingdoors.nyc";
const GLOBAL_API_LIMIT_ID = `${APP_NAME}_GLOBAL_LIMIT`;

const globalRequestLimit = parseInt(process.env.DAILY_API_LIMIT!);
const globalRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.fixedWindow(globalRequestLimit, "24 h"),
});

const perIpPerMinRequestLimit = parseInt(process.env.PER_IP_PER_MIN_LIMIT!);
const ipLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(perIpPerMinRequestLimit, "1 m"),
});

export default async function apiQuotaAvailable(req: NextApiRequest) {
  const { success: globalRateOk } = await globalRateLimit.limit(
    GLOBAL_API_LIMIT_ID
  );

  if (!globalRateOk) {
    return false;
  }

  const detectedIp = requestIp.getClientIp(req);
  const perIpLimitId = `${APP_NAME}_${detectedIp}`;

  const { success: perIpOk } = await ipLimit.limit(perIpLimitId);
  return perIpOk;
}

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextApiRequest } from "next";
import requestIp from "request-ip";

const RATE_LIMIT_PREFIX = "closingdoors.nyc";

let globalRateLimit: Ratelimit | null = null;
let ipLimit: Ratelimit | null = null;

export function rateLimitingEnabled() {
  return process.env.ENABLE_RATE_LIMITING === "true";
}

if (rateLimitingEnabled()) {
  const globalRequestLimit = parseInt(process.env.DAILY_API_LIMIT!);
  globalRateLimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.fixedWindow(globalRequestLimit, "24 h"),
    prefix: `${RATE_LIMIT_PREFIX}-global`,
  });

  const perIpPerMinRequestLimit = parseInt(process.env.PER_IP_PER_MIN_LIMIT!);
  ipLimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(perIpPerMinRequestLimit, "1 m"),
    prefix: `${RATE_LIMIT_PREFIX}-ip`,
  });
}

export default async function apiQuotaAvailable(req: NextApiRequest) {
  if (globalRateLimit === null || ipLimit === null) {
    throw new Error("Rate limiters not initialized");
  }

  const { success: globalRateOk } = await globalRateLimit.limit(
    "globalRateLimit"
  );

  if (!globalRateOk) {
    return false;
  }

  const detectedIp = requestIp.getClientIp(req) ?? "unknown";
  const { success: perIpOk } = await ipLimit.limit(detectedIp);
  return perIpOk;
}

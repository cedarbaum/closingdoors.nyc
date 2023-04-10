import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: "/api/graphql",
};

export function middleware(request: NextRequest) {
  // Use production endpoint if AppSync URL/key are not set
  if (!process.env.APPSYNC_ENDPOINT || !process.env.APPSYNC_API_KEY) {
    request.nextUrl.href = "https://closingdoors.nyc/graphql"
    return NextResponse.rewrite(request.nextUrl)
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-api-key", process.env.APPSYNC_API_KEY);
  request.nextUrl.href = process.env.APPSYNC_ENDPOINT;

  return NextResponse.rewrite(request.nextUrl, {
    request: {
      headers: requestHeaders,
    },
  });
}

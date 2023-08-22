# [closingdoors.nyc](https://closingdoors.nyc/)

A minimalist NYC subway, bus, and PATH schedule viewer written in React.

<p align="center">
  <img src="./.images/subway_schedule.png" width="250" />
  <img src="./.images/bus_schedule.png" width="250" />
  <img src="./.images/path_schedule.png" width="250" />
</p>

## Setup

### Schedule data

This project relies on [Transiter](https://github.com/jamespfennell/transiter) for fetching data. After running Transiter locally or hosting it, set the `TRANSITER_URL` environment variable (it is recommended to use a `.env.local` file) to the base URL of the HTTP endpoint:

```
TRANSITER_URL="http://localhost:8080"
```

You will also need to install the NYC Subway, bus, and PATH systems within Transiter.

Transiter uses gRPC protobuf definitions for it's API. TypeScript types can be generated from this, which are then used to annotate the data returned from Transiter. To generate new types:

1. Install the [Buf CLI](https://buf.build/product/cli/)
2. Copy the newest `public.proto` file from Transiter to `proto/transiter/`
3. From the `proto/` directory, run `buf generate`

The above only needs to be done if the API definition changes, since generated files are checked in.

### Configuring max stop distance for each system

The maximum range (in KM) to fetch stops for each system, can be configured with the below environment variables:

```
# Default max stop distance if not specified for a system,
NEXT_PUBLIC_MAX_STOP_DISTANCE_KM=3.2

# Max distance for NYC Subway stops
NEXT_PUBLIC_US_NY_SUBWAY_MAX_STOP_DISTANCE_KM=3.2

# Max distance for NYC Bus stops
NEXT_PUBLIC_US_NY_NYCBUS_MAX_STOP_DISTANCE_KM=1.6

# Max distance for PATH stops
NEXT_PUBLIC_US_NY_PATH_MAX_STOP_DISTANCE_KM=10.0
```

Additionally, since the NYC bus system is very dense, the max number of stops returned can also be limited using:

```
NEXT_PUBLIC_US_NY_BUSES_MAX_STOPS=30
```

### Chat feature (experimental)

In addition to Transiter, the chat feature requires an OpenAI API key and a Google Maps API key:

```
# Google maps API credentials
OPENAI_API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
GOOGLE_MAPS_API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

Also, by default, a Redis URL and access token from [Upstash](https://upstash.com/) are used to enable rate limiting:

```
# Redis credentials
UPSTASH_REDIS_REST_URL="https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
UPSTASH_REDIS_REST_TOKEN="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Daily and per IP address limits
DAILY_API_LIMIT=1000
PER_IP_PER_MIN_LIMIT=5
```

This can be manually disabled by modifying the [RateLimiting](./utils/RateLimiting.ts) file.

## Building and running

1. `npm install`
2. `npm run dev`

## Similar projects

- [realtimerail.nyc](https://github.com/jamespfennell/realtimerail.nyc-react)
- [WTFT](https://github.com/jonthornton/WTFT)

## Licensing and attributions

- Usage of the MTA's subway icons and other intellectual property has been granted through their [licensing program](https://new.mta.info/doing-business-with-us/licensing-program).
- Subway icons are directly from or based on this project: https://github.com/louh/mta-subway-bullets

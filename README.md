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

You will also need to install the NYC Subway and PATH systems within Transiter.

Note that while we try to stay in sync with the mainline of Transiter, the version used in this application is a forked version that can sometimes be incompatible with the official version: [Transiter (closingdoors branch)](https://github.com/cedarbaum/transiter/tree/closingdoors). This version can be found on [Docker Hub](https://hub.docker.com/r/scedarbaum/transiter).

Transiter uses gRPC protobuf definitions for it's API. TypeScript types can be generated from this, which are then used to annotate the data returned from Transiter. To generate new types:

1. Install the [Buf CLI](https://buf.build/product/cli/)
2. Copy the newest `public.proto` file from Transiter to `proto/transiter/`
3. From the `proto/` directory, run `buf generate`

The above only needs to be done if the API definition changes, since generated files are checked in.

### Chat feature (experimental)

In addition to Transiter, the chat feature requires an OpenAI API key and a Google Maps API key:

```
OPENAI_API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
GOOGLE_MAPS_API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

Also, by default, a Redis URL and access token from [Upstash](https://upstash.com/) are used to enable rate limiting:

```
UPSTASH_REDIS_REST_URL="https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
UPSTASH_REDIS_REST_TOKEN="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
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

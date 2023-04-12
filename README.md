# [closingdoors.nyc](https://closingdoors.nyc/)

A minimalist subway schedule viewer written in React.

<p align="center">
  <img src="./.images/home.PNG" width="250" />
  <img src="./.images/schedule.PNG" width="250" />
  <img src="./.images/alert.png" width="250" />
</p>

## Setup

This project relies on [Transiter](https://github.com/jamespfennell/transiter) for fetching data. After running Transiter locally or hosting it, set the `TRANSITER_URL` environment variable (it is recommended to use a `.env.local` file) to the base URL of the HTTP endpoint.

### Generating protobuf types

Transiter uses gRPC protobuf definitions for it's API. TypeScript types can be generated from this, which are then used to annotate the data returned from Transiter. To generate new types:

1. Install the [Buf CLI](https://buf.build/product/cli/)
2. Copy the newest `public.proto` file from Transiter to `proto/transiter/`
3. From the `proto/` directory, run `buf generate`

The above only needs to be done if the API definition changes, as generated files are checked in.

## Building and running

1. `npm install`
2. `npm run dev`

## Similar projects

- [realtimerail.nyc](https://github.com/jamespfennell/realtimerail.nyc-react)
- [WTFT](https://github.com/jonthornton/WTFT)

## Licensing and attributions

- Usage of the MTA's subway icons and other intellectual property has been granted through their [licensing program](https://new.mta.info/doing-business-with-us/licensing-program).
- Subway icons are directly from or based on this project: https://github.com/louh/mta-subway-bullets

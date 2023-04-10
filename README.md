# [closingdoors.nyc](https://closingdoors.nyc/)

A minimalist subway schedule viewer written in React.

An implementation of the backend GraphQL interface can be found [here](https://github.com/cedarbaum/transiter-graphql-proxy).

<p align="center">
  <img src="./.images/home.PNG" width="250" />
  <img src="./.images/schedule.PNG" width="250" />
  <img src="./.images/alert.png" width="250" />
</p>

## Setup and build

### Building and running

1. `npm install`
2. `npm run dev`

### Using a custom AppSync endpoint

By default, the app will proxy requests to the production endpoint ([https://closingdoors.nyc](https://closingdoors.nyc)).

To change this to another AppSync (AWS managed GraphQL) endpoint, set the following environment variables in a `.env.local` file:

```
APPSYNC_ENDPOINT="YOUR FULL APPSYNC URL"
APPSYNC_API_KEY="YOUR APPSYNC API KEY"
```

## Similar projects

- [realtimerail.nyc](https://github.com/jamespfennell/realtimerail.nyc-react)
- [WTFT](https://github.com/jonthornton/WTFT)

## Licensing and attributions

- Usage of the MTA's subway icons and other intellectual property has been granted through their [licensing program](https://new.mta.info/doing-business-with-us/licensing-program).
- Subway icons are directly from or based on this project: https://github.com/louh/mta-subway-bullets

# [closingdoors.nyc](https://closingdoors.nyc/)

A minimalist subway schedule viewer written in React.

An implementation of the backend GraphQL interface can be found [here](https://github.com/cedarbaum/GraphQlMtaApiBackend).  

<p align="center">
  <img src="./.images/home.PNG" width="300" />
  <img src="./.images/schedule.PNG" width="300" /> 
</p>


## Setup and build

### Initial setup

Currently, this project requires Font Awesome Pro for some of its icons (see: https://github.com/cedarbaum/closingdoors.nyc/issues/1). To configure NPM to pull in the required packages, [configure access](https://fontawesome.com/docs/web/setup/packages#_1-configure-access).

### Building

1. `npm run build`
2. `npm start`: starts page at [http://localhost:3000](http://localhost:3000)
To use storybook:

1. `npm run storybook`

### Deploying to AWS

See the infrastructure [README](./infrastructure/README.md).

## Similar projects

- [realtimerail.nyc](https://github.com/jamespfennell/realtimerail.nyc-react)
- [WTFT](https://github.com/jonthornton/WTFT)

## Licensing

- Usage of the MTA's subway icons and other intellectual property has been granted through their [licensing program](https://new.mta.info/doing-business-with-us/licensing-program).

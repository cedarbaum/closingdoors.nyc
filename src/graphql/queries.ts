/* tslint:disable */
/* eslint-disable */

export const nearestStations = /* GraphQL */ `
  query NearestStations($lat: Float, $lon: Float, $numStations: Int) {
    nearestStations(lat: $lat, lon: $lon, numStations: $numStations) {
      id
      name
    }
  }
`;

export const trainTimes = /* GraphQL */ `
  query TrainTimes($services: [String]!, $directions: [Direction]) {
    trainTimes(services: $services, directions: $directions) {
        stationServiceTrips {
            serviceTrips {
                service
                trips {
                    arrival
                }
            }
            stationId
        }
        updatedAt
    }
  }
`;

export const systemMetadata = /* GraphQL */ `
    query SystemMetadata {
        systemMetadata {
            runningServices {
            services
            updatedAt
            }
        }
    }
`;


/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "query RouteStatuses {\n  routeStatuses {\n    routeId\n    running\n    alerts {\n      cause\n      effect\n      id\n      messages {\n        descriptions {\n          text\n          language\n        }\n        headers {\n          text\n          language\n        }\n        urls {\n          text\n          language\n        }\n      }\n    }\n  }\n}\n\nquery NearbyTrainTimes($routes: [String!]!, $lat: Float, $lon: Float, $direction: Direction!) {\n  routeStatuses(routes: $routes) {\n    routeId\n    alerts {\n      cause\n      effect\n      id\n      messages {\n        descriptions {\n          text\n          language\n        }\n        headers {\n          text\n          language\n        }\n        urls {\n          text\n          language\n        }\n      }\n    }\n  }\n  nearbyTrainTimes(routes: $routes, lat: $lat, lon: $lon, direction: $direction) {\n    stopRouteTrips {\n      routeTrips {\n        route\n        trips {\n          arrival\n          tripId\n        }\n      }\n      stop {\n        distance\n        stopId\n        name\n      }\n    }\n    updatedAt\n  }\n}": types.RouteStatusesDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query RouteStatuses {\n  routeStatuses {\n    routeId\n    running\n    alerts {\n      cause\n      effect\n      id\n      messages {\n        descriptions {\n          text\n          language\n        }\n        headers {\n          text\n          language\n        }\n        urls {\n          text\n          language\n        }\n      }\n    }\n  }\n}\n\nquery NearbyTrainTimes($routes: [String!]!, $lat: Float, $lon: Float, $direction: Direction!) {\n  routeStatuses(routes: $routes) {\n    routeId\n    alerts {\n      cause\n      effect\n      id\n      messages {\n        descriptions {\n          text\n          language\n        }\n        headers {\n          text\n          language\n        }\n        urls {\n          text\n          language\n        }\n      }\n    }\n  }\n  nearbyTrainTimes(routes: $routes, lat: $lat, lon: $lon, direction: $direction) {\n    stopRouteTrips {\n      routeTrips {\n        route\n        trips {\n          arrival\n          tripId\n        }\n      }\n      stop {\n        distance\n        stopId\n        name\n      }\n    }\n    updatedAt\n  }\n}"): (typeof documents)["query RouteStatuses {\n  routeStatuses {\n    routeId\n    running\n    alerts {\n      cause\n      effect\n      id\n      messages {\n        descriptions {\n          text\n          language\n        }\n        headers {\n          text\n          language\n        }\n        urls {\n          text\n          language\n        }\n      }\n    }\n  }\n}\n\nquery NearbyTrainTimes($routes: [String!]!, $lat: Float, $lon: Float, $direction: Direction!) {\n  routeStatuses(routes: $routes) {\n    routeId\n    alerts {\n      cause\n      effect\n      id\n      messages {\n        descriptions {\n          text\n          language\n        }\n        headers {\n          text\n          language\n        }\n        urls {\n          text\n          language\n        }\n      }\n    }\n  }\n  nearbyTrainTimes(routes: $routes, lat: $lat, lon: $lon, direction: $direction) {\n    stopRouteTrips {\n      routeTrips {\n        route\n        trips {\n          arrival\n          tripId\n        }\n      }\n      stop {\n        distance\n        stopId\n        name\n      }\n    }\n    updatedAt\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;
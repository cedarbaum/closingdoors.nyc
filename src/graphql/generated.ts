import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Alert = {
  __typename?: 'Alert';
  cause?: Maybe<Scalars['String']>;
  effect?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  messages: AlertMessage;
};

export type AlertMessage = {
  __typename?: 'AlertMessage';
  descriptions: Array<Text>;
  headers: Array<Text>;
  urls: Array<Text>;
};

export enum Direction {
  North = 'NORTH',
  South = 'SOUTH'
}

export type Query = {
  __typename?: 'Query';
  nearbyTrainTimes?: Maybe<TrainTimesResponse>;
  routeStatuses: Array<RouteStatus>;
};


export type QueryNearbyTrainTimesArgs = {
  direction: Direction;
  lat?: InputMaybe<Scalars['Float']>;
  lon?: InputMaybe<Scalars['Float']>;
  routes: Array<Scalars['String']>;
};


export type QueryRouteStatusesArgs = {
  routes?: InputMaybe<Array<Scalars['String']>>;
};

export type RouteStatus = {
  __typename?: 'RouteStatus';
  alerts: Array<Alert>;
  routeId: Scalars['String'];
  running: Scalars['Boolean'];
};

export type RouteTrips = {
  __typename?: 'RouteTrips';
  route: Scalars['String'];
  trips: Array<Trip>;
};

export type Stop = {
  __typename?: 'Stop';
  distance: Scalars['Float'];
  name: Scalars['String'];
  stopId: Scalars['String'];
};

export type StopRouteTrips = {
  __typename?: 'StopRouteTrips';
  routeTrips: Array<RouteTrips>;
  stop: Stop;
};

export type Text = {
  __typename?: 'Text';
  language: Scalars['String'];
  text: Scalars['String'];
};

export type TrainTimesResponse = {
  __typename?: 'TrainTimesResponse';
  stopRouteTrips: Array<StopRouteTrips>;
  updatedAt?: Maybe<Scalars['Float']>;
};

export type Trip = {
  __typename?: 'Trip';
  arrival: Scalars['Float'];
  tripId: Scalars['String'];
};

export type RouteStatusesQueryVariables = Exact<{ [key: string]: never; }>;


export type RouteStatusesQuery = { __typename?: 'Query', routeStatuses: Array<{ __typename?: 'RouteStatus', routeId: string, running: boolean, alerts: Array<{ __typename?: 'Alert', cause?: string | null, effect?: string | null, id?: string | null, messages: { __typename?: 'AlertMessage', descriptions: Array<{ __typename?: 'Text', text: string, language: string }>, headers: Array<{ __typename?: 'Text', text: string, language: string }>, urls: Array<{ __typename?: 'Text', text: string, language: string }> } }> }> };

export type NearbyTrainTimesQueryVariables = Exact<{
  routes: Array<Scalars['String']> | Scalars['String'];
  lat?: InputMaybe<Scalars['Float']>;
  lon?: InputMaybe<Scalars['Float']>;
  direction: Direction;
}>;


export type NearbyTrainTimesQuery = { __typename?: 'Query', routeStatuses: Array<{ __typename?: 'RouteStatus', routeId: string, alerts: Array<{ __typename?: 'Alert', cause?: string | null, effect?: string | null, id?: string | null, messages: { __typename?: 'AlertMessage', descriptions: Array<{ __typename?: 'Text', text: string, language: string }>, headers: Array<{ __typename?: 'Text', text: string, language: string }>, urls: Array<{ __typename?: 'Text', text: string, language: string }> } }> }>, nearbyTrainTimes?: { __typename?: 'TrainTimesResponse', updatedAt?: number | null, stopRouteTrips: Array<{ __typename?: 'StopRouteTrips', routeTrips: Array<{ __typename?: 'RouteTrips', route: string, trips: Array<{ __typename?: 'Trip', arrival: number, tripId: string }> }>, stop: { __typename?: 'Stop', distance: number, stopId: string, name: string } }> } | null };


export const RouteStatusesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RouteStatuses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"routeStatuses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"routeId"}},{"kind":"Field","name":{"kind":"Name","value":"running"}},{"kind":"Field","name":{"kind":"Name","value":"alerts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cause"}},{"kind":"Field","name":{"kind":"Name","value":"effect"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"descriptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"language"}}]}},{"kind":"Field","name":{"kind":"Name","value":"headers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"language"}}]}},{"kind":"Field","name":{"kind":"Name","value":"urls"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"language"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<RouteStatusesQuery, RouteStatusesQueryVariables>;
export const NearbyTrainTimesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"NearbyTrainTimes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"routes"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lat"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lon"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"direction"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Direction"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"routeStatuses"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"routes"},"value":{"kind":"Variable","name":{"kind":"Name","value":"routes"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"routeId"}},{"kind":"Field","name":{"kind":"Name","value":"alerts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cause"}},{"kind":"Field","name":{"kind":"Name","value":"effect"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"descriptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"language"}}]}},{"kind":"Field","name":{"kind":"Name","value":"headers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"language"}}]}},{"kind":"Field","name":{"kind":"Name","value":"urls"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"language"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"nearbyTrainTimes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"routes"},"value":{"kind":"Variable","name":{"kind":"Name","value":"routes"}}},{"kind":"Argument","name":{"kind":"Name","value":"lat"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lat"}}},{"kind":"Argument","name":{"kind":"Name","value":"lon"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lon"}}},{"kind":"Argument","name":{"kind":"Name","value":"direction"},"value":{"kind":"Variable","name":{"kind":"Name","value":"direction"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stopRouteTrips"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"routeTrips"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"route"}},{"kind":"Field","name":{"kind":"Name","value":"trips"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"arrival"}},{"kind":"Field","name":{"kind":"Name","value":"tripId"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"stop"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"distance"}},{"kind":"Field","name":{"kind":"Name","value":"stopId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<NearbyTrainTimesQuery, NearbyTrainTimesQueryVariables>;
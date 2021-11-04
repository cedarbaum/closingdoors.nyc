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

export enum Direction {
  North = 'NORTH',
  South = 'SOUTH'
}

export type Station = {
  __typename?: 'Station';
  id: Scalars['ID'];
  name: Scalars['String'];
};

export type Trip = {
  __typename?: 'Trip';
  id: Scalars['ID'];
  arrival: Scalars['Float'];
  delayed?: Maybe<Scalars['Boolean']>;
};

export type ServiceTrips = {
  __typename?: 'ServiceTrips';
  service: Scalars['String'];
  trips: Array<Maybe<Trip>>;
};

export type StationServiceTrips = {
  __typename?: 'StationServiceTrips';
  stationId: Scalars['ID'];
  serviceTrips: Array<Maybe<ServiceTrips>>;
};

export type TrainTimesResponse = {
  __typename?: 'TrainTimesResponse';
  stationServiceTrips: Array<Maybe<StationServiceTrips>>;
  updatedAt: Scalars['Float'];
};

export type RunningServices = {
  __typename?: 'RunningServices';
  services: Array<Scalars['String']>;
  updatedAt: Scalars['Float'];
};

export type SystemMetadata = {
  __typename?: 'SystemMetadata';
  runningServices: RunningServices;
};

export type Query = {
  __typename?: 'Query';
  nearestStations?: Maybe<Array<Maybe<Station>>>;
  trainTimes?: Maybe<TrainTimesResponse>;
  systemMetadata?: Maybe<SystemMetadata>;
};


export type QueryNearestStationsArgs = {
  lat?: InputMaybe<Scalars['Float']>;
  lon?: InputMaybe<Scalars['Float']>;
  numStations?: InputMaybe<Scalars['Int']>;
};


export type QueryTrainTimesArgs = {
  stations?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  services: Array<InputMaybe<Scalars['String']>>;
  directions?: InputMaybe<Array<InputMaybe<Direction>>>;
};

export type NearestStationsQuery = {
  __typename?: 'NearestStationsQuery';
  nearestStations?: Maybe<Array<Maybe<Station>>>;
};


export type NearestStationsQueryNearestStationsArgs = {
  lat?: InputMaybe<Scalars['Float']>;
  lon?: InputMaybe<Scalars['Float']>;
  numStations?: InputMaybe<Scalars['Int']>;
};

export type TrainTimesQuery = {
  __typename?: 'TrainTimesQuery';
  trainTimes?: Maybe<TrainTimesResponse>;
};


export type TrainTimesQueryTrainTimesArgs = {
  stations?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  services: Array<InputMaybe<Scalars['String']>>;
  directions?: InputMaybe<Array<InputMaybe<Direction>>>;
};

export type SystemMetadataQuery = {
  __typename?: 'SystemMetadataQuery';
  systemMetadata?: Maybe<SystemMetadata>;
};
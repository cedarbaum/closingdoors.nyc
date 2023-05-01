/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "";

/**
 * Public API
 *
 * The Transiter public API is based around hierarchal resources, like many REST APIs.
 * This is the resource hierarchy:
 *
 * ```
 * System
 * |- Agency
 * |- Alert
 * |- Feed
 * |   |- Feed update
 * |- Route
 * |   |- Trip
 * |       |- Vehicle with no ID
 * |- Stop
 * |- Transfer
 * |- Vehicle with ID
 * ```
 *
 * For each resource there is a proto message type, a list endpoint, and a get endpoints.
 * For stops, the message is [Stop](#stop), the list endpoint is [ListStops], and the get endpoint is [GetStop].
 *
 * The URLs in the HTTP API are determined by the hierarchy; thus:
 *
 * - List all systems has URL `/systems`,
 * - Get system with ID `<system_id>` has URL `/systems/<system_id>`,
 * - List all routes in the system has URL `/systems/<system_id>/routes`,
 * - Get route has URL `/systems/<system_id>/routes/<route_id>`,
 *
 * and so on.
 *
 * Many resources refer to other resources across the hierarchy.
 * For example, each route has an agency it is attached to.
 * Each stop has a list of service maps, each of which contains a set of routes.
 * In these situations the resource message contains a _reference_ to the other resource.
 * The [Route](#route) message contains an agency reference, in the form of an [Agency.Reference](#agencyreference)
 * message.
 * These reference messages contain at least enough information to uniquely identify the resource.
 * However they also contain additional information that is considered generally useful;
 * thus, the [Stop.Reference](#stopreference) message contains the stop's name.
 * What counts as "considered generally" is obviously very subjective and open to change.
 *
 * The following table summarizes all of the resources and their types.
 * The right-most column describes the source_of the resource.
 * The public API is a read-only API so all of the resources come from somewhere else.
 *
 * | Resource    | Reference type | List endpoint | Get endpoint | Source |
 * | ----------- | --------------- | ---------- | ------------------ | -------|
 * | [Agency](#agency)   | [Agency.Reference](#agencyreference) | [GetAgency] | [ListAgency]  | GTFS static
 * | Alert       | System          | [Alert]    | [Alert.Reference]    | GTFS realtime
 * | Feed        | System          |            |                    | system config
 * | Feed update | Feed            |            |                    | Transiter update process
 * | Route       | System          |            |                    | GTFS static
 * | Trip        | Route           |            |                    | GTFS realtime
 * | Stop        | System          |            |                    | GTFS static
 * | System      | None            |            |                    | system config
 * | Transfer    | System          |            |                    | GTFS static
 * | Vehicle     | System or trip  |            |                    | GTFS realtime
 */

/** Request payload for the entrypoint endpoint. */
export interface EntrypointRequest {
}

/** Response payload for the entrypoint endpoint. */
export interface EntrypointReply {
  /** Version and other information about this Transiter binary. */
  transiter:
    | EntrypointReply_TransiterDetails
    | undefined;
  /** Systems that are installed in this Transiter instance. */
  systems: ChildResources | undefined;
}

/** Message containing version information about a Transiter binary. */
export interface EntrypointReply_TransiterDetails {
  /** The version of the Transiter binary this instance is running. */
  version: string;
  /** URL of the Transiter GitHub respository. */
  href: string;
  /** Information about the CI build invocation that built this Transiter binary. */
  build?: EntrypointReply_TransiterDetails_Build | undefined;
}

/** Message containing information about a specific Transiter CI build. */
export interface EntrypointReply_TransiterDetails_Build {
  /** The GitHub build number. */
  number: string;
  /** Time the binary was built, in the form of a human readable string. */
  builtAt: string;
  /** Time the binary was built, in the form of a Unix timestamp. */
  builtAtTimestamp: string;
  /** Hash of the Git commit that the binary was built at. */
  gitCommitHash: string;
  /** URL of the GitHub actions CI run. */
  href: string;
}

/** Request payload for the list systems endpoint. */
export interface ListSystemsRequest {
}

/** Response payload for the list systems endpoint. */
export interface ListSystemsReply {
  /** List of systems. */
  systems: System[];
}

/** Request payload for the get system endpoint. */
export interface GetSystemRequest {
  /**
   * ID of the system to get.
   *
   * This is a URL parameter in the HTTP API.
   */
  systemId: string;
}

/** Request payload for the list agencies endpoint. */
export interface ListAgenciesRequest {
  /**
   * ID of the system for which to list agencies.
   *
   * This is a URL parameter in the HTTP API.
   */
  systemId: string;
}

/** Response payload for the list agencies endpoint. */
export interface ListAgenciesReply {
  /** List of agencies. */
  agencies: Agency[];
}

/** Request payload for the get agency endpoint. */
export interface GetAgencyRequest {
  /**
   * ID of the system the agency is in.
   *
   * This is a URL parameter in the HTTP API.
   */
  systemId: string;
  /**
   * ID of the agency.
   *
   * This is a URL parameter in the HTTP API.
   */
  agencyId: string;
}

/** Request payload for the list stops endpoint. */
export interface ListStopsRequest {
  /**
   * ID of the system for which to list stops.
   *
   * This is a URL parameter in the HTTP API.
   */
  systemId: string;
  /** The type of search to perform when listing stops. */
  searchMode?:
    | ListStopsRequest_SearchMode
    | undefined;
  /**
   * If true, only return stops whose IDs are specified in the repeated `id` field.
   * Only supported when the search mode is ID.
   */
  onlyReturnSpecifiedIds: boolean;
  /**
   * IDs to return if `only_return_specified_ids` is set to true. It is an error to
   * populate this field if `only_return_specified_ids` is false.
   * Only supported when the search mode is ID.
   */
  id: string[];
  /**
   * ID of the first stop to return. If not set, the stop with the smallest ID will be first.
   * Only supported when the search mode is ID.
   */
  firstId?:
    | string
    | undefined;
  /**
   * Maximum number of stops to return.
   * This is supported in all search modes.
   * For performance reasons, if it is larger than 100 it is rounded down to 100.
   */
  limit?:
    | number
    | undefined;
  /**
   * If true, the stop times field will not be populated.
   * This will generally make the response faster to generate.
   */
  skipStopTimes: boolean;
  /**
   * If true, the service maps field will not be populated.
   * This will generally make the response faster to generate.
   */
  skipServiceMaps: boolean;
  /**
   * If true, the alerts field will not be populated.
   * This will generally make the response faster to generate.
   */
  skipAlerts: boolean;
  /**
   * If true, the transfers field will not be populated.
   * This will generally make the response faster to generate.
   */
  skipTransfers: boolean;
  /**
   * The maximum distance in kilometers that a stop must be from
   * latitude, longitude to be listed when using DISTANCE search mode.
   */
  maxDistance?:
    | number
    | undefined;
  /** The latitude relative to the returned stops when using DISTANCE search mode. */
  latitude?:
    | number
    | undefined;
  /** The longitude relative to the returned stops when using DISTANCE search mode. */
  longitude?: number | undefined;
}

/** The possible search modes when listing stops. */
export enum ListStopsRequest_SearchMode {
  /** ID - Return a paginated list of stops sorted by stop ID. */
  ID = 0,
  /** DISTANCE - Return all stops within max_distance of (latitude, longitude), sorted by the distance. */
  DISTANCE = 1,
  UNRECOGNIZED = -1,
}

export function listStopsRequest_SearchModeFromJSON(object: any): ListStopsRequest_SearchMode {
  switch (object) {
    case 0:
    case "ID":
      return ListStopsRequest_SearchMode.ID;
    case 1:
    case "DISTANCE":
      return ListStopsRequest_SearchMode.DISTANCE;
    case -1:
    case "UNRECOGNIZED":
    default:
      return ListStopsRequest_SearchMode.UNRECOGNIZED;
  }
}

export function listStopsRequest_SearchModeToJSON(object: ListStopsRequest_SearchMode): string {
  switch (object) {
    case ListStopsRequest_SearchMode.ID:
      return "ID";
    case ListStopsRequest_SearchMode.DISTANCE:
      return "DISTANCE";
    case ListStopsRequest_SearchMode.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

/** Response payload for the list stops endpoint. */
export interface ListStopsReply {
  /** List of stops. */
  stops: Stop[];
  /** ID of the next stop to return, if there are more results. */
  nextId?: string | undefined;
}

/** Reqeust payload for the get stop endpoint. */
export interface GetStopRequest {
  /**
   * ID of the system the stop is in.
   *
   * This is a URL parameter in the HTTP API.
   */
  systemId: string;
  /**
   * ID of the stop.
   *
   * This is a URL parameter in the HTTP API.
   */
  stopId: string;
  /**
   * If true, the stop times field will not be populated.
   * This will generally make the response faster to generate.
   */
  skipStopTimes: boolean;
  /**
   * If true, the service maps field will not be populated.
   * This will generally make the response faster to generate.
   */
  skipServiceMaps: boolean;
  /**
   * If true, the alerts field will not be populated.
   * This will generally make the response faster to generate.
   */
  skipAlerts: boolean;
  /**
   * If true, the transfers field will not be populated.
   * This will generally make the response faster to generate.
   */
  skipTransfers: boolean;
}

/** Request payload for the list routes endpoint. */
export interface ListRoutesRequest {
  /**
   * ID of the system for which to list routes.
   *
   * This is a URL parameter in the HTTP API.
   */
  systemId: string;
  /**
   * If true, the estimated headway fields will not be populated.
   * This will generally make the response faster to generate.
   */
  skipEstimatedHeadways: boolean;
  /**
   * If true, the service maps field will not be populated.
   * This will generally make the response faster to generate.
   */
  skipServiceMaps: boolean;
  /**
   * If true, the alerts field will not be populated.
   * This will generally make the response faster to generate.
   */
  skipAlerts: boolean;
}

/** Response payload for the list routes endpoint. */
export interface ListRoutesReply {
  /** List of routes. */
  routes: Route[];
}

/** Request payload for the get route endpoint. */
export interface GetRouteRequest {
  /**
   * ID of the system the route is in.
   *
   * This is a URL parameter in the HTTP API.
   */
  systemId: string;
  /**
   * ID of the route.
   *
   * This is a URL parameter in the HTTP API.
   */
  routeId: string;
  /**
   * If true, the estimated headway field will not be populated.
   * This will generally make the response faster to generate.
   */
  skipEstimatedHeadways: boolean;
  /**
   * If true, the service maps field will not be populated.
   * This will generally make the response faster to generate.
   */
  skipServiceMaps: boolean;
  /**
   * If true, the alerts field will not be populated.
   * This will generally make the response faster to generate.
   */
  skipAlerts: boolean;
}

/** Request payload for the list trips endpoint. */
export interface ListTripsRequest {
  /**
   * ID of the system the route is in.
   *
   * This is a URL parameter in the HTTP API.
   */
  systemId: string;
  /**
   * ID of the route for which to list trips
   *
   * This is a URL parameter in the HTTP API.
   */
  routeId: string;
}

/** Response payload for the list trips endpoint. */
export interface ListTripsReply {
  /** List of trips. */
  trips: Trip[];
}

/** Request payload for the list alerts endpoint. */
export interface ListAlertsRequest {
  /**
   * ID of the system for which to list alerts.
   *
   * This is a URL parameter in the HTTP API.
   */
  systemId: string;
  /**
   * If non-empty, only alerts with the provided IDs are returned.
   * This is interpreted as a filtering condition, so it is not an error to provide non-existent IDs.
   *
   * If empty, all alerts in the system are returned.
   * TODO: add a boolean filter_on_alert_ids field
   */
  alertId: string[];
}

/** Response payload for the list alerts endpoiont. */
export interface ListAlertsReply {
  /** List of alerts. */
  alerts: Alert[];
}

/** Request payload for the get alert endpoint. */
export interface GetAlertRequest {
  /**
   * ID of the system the alert is in.
   *
   * This is a URL parameter in the HTTP API.
   */
  systemId: string;
  /**
   * ID of the alert.
   *
   * This is a URL parameter in the HTTP API.
   */
  alertId: string;
}

/** Request payload for the get trip endpoint. */
export interface GetTripRequest {
  /**
   * ID of the system the trip is in.
   *
   * This is a URL parameter in the HTTP API.
   */
  systemId: string;
  /**
   * ID of the route the trip is in.
   *
   * This is a URL parameter in the HTTP API.
   */
  routeId: string;
  /**
   * ID of the route.
   *
   * This is a URL parameter in the HTTP API.
   */
  tripId: string;
}

/** Request payload for the list feeds endpoint. */
export interface ListFeedsRequest {
  /** ID of the system for which to list feeds. */
  systemId: string;
}

/** Response payload for the list feeds endpoint. */
export interface ListFeedsReply {
  /** List of feeds. */
  feeds: Feed[];
}

/** Request payload for the list feed updates endpoint. */
export interface ListFeedUpdatesRequest {
  /**
   * ID of the system the feed is in.
   *
   * This is a URL parameter in the HTTP API.
   */
  systemId: string;
  /**
   * ID of the feed for which to list updates.
   *
   * This is a URL parameter in the HTTP API.
   */
  feedId: string;
}

/** Response payload for the list feed updates endpoint. */
export interface ListFeedUpdatesReply {
  /** List of updates. */
  updates: FeedUpdate[];
}

/** Request payload for the get feed endpoint. */
export interface GetFeedRequest {
  /**
   * ID of the system the feed is in.
   *
   * This is a URL parameter in the HTTP API.
   */
  systemId: string;
  /**
   * ID of the feed.
   *
   * This is a URL parameter in the HTTP API.
   */
  feedId: string;
}

/** Request payload for the list transfers endpoint. */
export interface ListTransfersRequest {
  /** ID of the system for which to list transfers. */
  systemId: string;
}

/** Response payload for the list transfers endpoint. */
export interface ListTransfersReply {
  /** List of transfers. */
  transfers: Transfer[];
}

/** The System resource. */
export interface System {
  /** ID of the system as specified in the install request. */
  id: string;
  /** Generic metadata about the system resource. */
  resource:
    | Resource
    | undefined;
  /** Name of the system as specified in the system configuration file. */
  name: string;
  /** Status of the system. */
  status: System_Status;
  agencies: ChildResources | undefined;
  feeds: ChildResources | undefined;
  routes: ChildResources | undefined;
  stops: ChildResources | undefined;
  transfers: ChildResources | undefined;
}

/** Enum describing the possible statuses of a system. */
export enum System_Status {
  /** UNKNOWN - Unknown status, included for protobuf reasons. */
  UNKNOWN = 0,
  /** INSTALLING - The system is currently being installed through an asychronous install request. */
  INSTALLING = 1,
  /** ACTIVE - The system was successfully installed and is now active. */
  ACTIVE = 2,
  /** INSTALL_FAILED - The system was added through an asynchronous install request, but the install failed. */
  INSTALL_FAILED = 3,
  /** UPDATING - The system is currently being updated through an asynchronous update request. */
  UPDATING = 4,
  /** UPDATE_FAILED - An asynchronous update of the system failed. */
  UPDATE_FAILED = 5,
  /** DELETING - The system is in the process of being deleted through an asynchronous delete request. */
  DELETING = 6,
  UNRECOGNIZED = -1,
}

export function system_StatusFromJSON(object: any): System_Status {
  switch (object) {
    case 0:
    case "UNKNOWN":
      return System_Status.UNKNOWN;
    case 1:
    case "INSTALLING":
      return System_Status.INSTALLING;
    case 2:
    case "ACTIVE":
      return System_Status.ACTIVE;
    case 3:
    case "INSTALL_FAILED":
      return System_Status.INSTALL_FAILED;
    case 4:
    case "UPDATING":
      return System_Status.UPDATING;
    case 5:
    case "UPDATE_FAILED":
      return System_Status.UPDATE_FAILED;
    case 6:
    case "DELETING":
      return System_Status.DELETING;
    case -1:
    case "UNRECOGNIZED":
    default:
      return System_Status.UNRECOGNIZED;
  }
}

export function system_StatusToJSON(object: System_Status): string {
  switch (object) {
    case System_Status.UNKNOWN:
      return "UNKNOWN";
    case System_Status.INSTALLING:
      return "INSTALLING";
    case System_Status.ACTIVE:
      return "ACTIVE";
    case System_Status.INSTALL_FAILED:
      return "INSTALL_FAILED";
    case System_Status.UPDATING:
      return "UPDATING";
    case System_Status.UPDATE_FAILED:
      return "UPDATE_FAILED";
    case System_Status.DELETING:
      return "DELETING";
    case System_Status.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

/** Reference is the reference type for the system resource. */
export interface System_Reference {
  id: string;
  resource: Resource | undefined;
}

/** The resource message contains generic metadata that applies to all resources. */
export interface Resource {
  path: string;
  href?: string | undefined;
}

/**
 * Description of a collection of child resources for a resource.
 * This message and fields using this message exist to support API discoverability.
 */
export interface ChildResources {
  /** Number of child resources. */
  count: number;
  /** URL of the endpoint to list child resources. */
  href?: string | undefined;
}

/**
 * The Stop resource.
 *
 * This resource corresponds to the [stop type in the GTFS static
 * specification](https://developers.google.com/transit/gtfs/reference#stopstxt).
 * Most of the static fields in the resource come directly from the `stops.txt` table.
 * Transiter adds some additional related fields (transfers, alerts, stop times)
 *   and computed fields (service maps).
 */
export interface Stop {
  /** ID of the stop. This is the `stop_id` column in `stops.txt`. */
  id: string;
  /** Generic metadata about the stop resource. */
  resource:
    | Resource
    | undefined;
  /**
   * System corresponding to this stop.
   * This is the parent resource in Transiter's resource hierarchy.
   */
  system:
    | System_Reference
    | undefined;
  /** Code of the stop. This is the `stop_code` column in `stops.txt`. */
  code?:
    | string
    | undefined;
  /** Name of the stop. This is the `stop_name` column in `stops.txt`. */
  name?:
    | string
    | undefined;
  /** Description of the stop. This is the `stop_desc` column in `stops.txt`. */
  description?:
    | string
    | undefined;
  /** Zone ID of the stop. This is the `zone_id` column in `stops.txt`. */
  zoneId?:
    | string
    | undefined;
  /** Latitude of the stop. This is the `stop_lat` column in `stops.txt`. */
  latitude?:
    | number
    | undefined;
  /** Longitude of the stop. This is the `stop_lon` column in `stops.txt`. */
  longitude?:
    | number
    | undefined;
  /** URL of a webpage about the stop. This is the `stop_url` column in `stops.txt`. */
  url?:
    | string
    | undefined;
  /** Type of the stop. This is the `platform_type` column in `stops.txt`. */
  type: Stop_Type;
  /** Parent stop. This is determined using the `parent_station` column in `stops.txt`. */
  parentStop?:
    | Stop_Reference
    | undefined;
  /** Child stops. This are determined using the `parent_station` column in `stops.txt`. */
  childStops: Stop_Reference[];
  /** Timezone of the stop. This is the `stop_timezone` column in `stops.txt`. */
  timezone?:
    | string
    | undefined;
  /** If there is wheelchair boarding for this stop. This is the `wheelchair_boarding` column in `stops.txt`. */
  wheelchairBoarding?:
    | boolean
    | undefined;
  /** Platform code of the stop. This is the `platform_code` column in `stops.txt`. */
  platformCode?:
    | string
    | undefined;
  /** List of service maps for this stop. */
  serviceMaps: Stop_ServiceMap[];
  /**
   * Active alerts for this stop.
   *
   * These are determined using the `informed_entity` field in
   * the [GTFS realtime alerts
   * message](https://developers.google.com/transit/gtfs-realtime/reference#message-alert).
   */
  alerts: Alert_Reference[];
  /**
   * List of realtime stop times for this stop.
   *
   * A stop time is an event at which a trip calls at a stop.
   */
  stopTimes: StopTime[];
  /**
   * Transfers out of this stop.
   *
   * These are determined using the `from_stop_id` field in the GTFS static `transfers.txt` file.
   */
  transfers: Transfer[];
  /** List of headsign rules for this stop. */
  headsignRules: Stop_HeadsignRule[];
}

/** Enum describing the possible stop types */
export enum Stop_Type {
  STOP = 0,
  STATION = 1,
  ENTRANCE_OR_EXIT = 2,
  GENERIC_NODE = 3,
  BOARDING_AREA = 4,
  UNRECOGNIZED = -1,
}

export function stop_TypeFromJSON(object: any): Stop_Type {
  switch (object) {
    case 0:
    case "STOP":
      return Stop_Type.STOP;
    case 1:
    case "STATION":
      return Stop_Type.STATION;
    case 2:
    case "ENTRANCE_OR_EXIT":
      return Stop_Type.ENTRANCE_OR_EXIT;
    case 3:
    case "GENERIC_NODE":
      return Stop_Type.GENERIC_NODE;
    case 4:
    case "BOARDING_AREA":
      return Stop_Type.BOARDING_AREA;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Stop_Type.UNRECOGNIZED;
  }
}

export function stop_TypeToJSON(object: Stop_Type): string {
  switch (object) {
    case Stop_Type.STOP:
      return "STOP";
    case Stop_Type.STATION:
      return "STATION";
    case Stop_Type.ENTRANCE_OR_EXIT:
      return "ENTRANCE_OR_EXIT";
    case Stop_Type.GENERIC_NODE:
      return "GENERIC_NODE";
    case Stop_Type.BOARDING_AREA:
      return "BOARDING_AREA";
    case Stop_Type.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

/**
 * Message describing the service maps view in stops.
 *
 * See the service maps documentation for more information on this
 * message and the associated field.
 */
export interface Stop_ServiceMap {
  /** Config ID of the service map, as specified in the system configuration file. */
  configId: string;
  /**
   * List of routes which call at this stop.
   *
   * This list may be empty, in which case the stop has no service in the service map.
   */
  routes: Route_Reference[];
}

/** Message describing a headsign rule. */
export interface Stop_HeadsignRule {
  /** Stop the rule is for. */
  stop:
    | Stop_Reference
    | undefined;
  /** Priority of the rule (lower is higher priority). */
  priority: number;
  /** NYCT track. */
  track?:
    | string
    | undefined;
  /** Headsign. */
  headsign: string;
}

/** Reference is the reference type for the stop resource. */
export interface Stop_Reference {
  id: string;
  resource: Resource | undefined;
  system: System_Reference | undefined;
  name?: string | undefined;
}

/**
 * Message describing a realtime stop time.
 *
 * A stop time is an event in which a trip calls at a stop.
 * This message corresponds to the [GTFS realtime `StopTimeUpdate`
 * message](https://developers.google.com/transit/gtfs-realtime/reference#message-stoptimeupdate)
 */
export interface StopTime {
  /** The stop. */
  stop:
    | Stop_Reference
    | undefined;
  /** The trip. */
  trip:
    | Trip_Reference
    | undefined;
  /** Arrival time. */
  arrival:
    | StopTime_EstimatedTime
    | undefined;
  /** Departure time. */
  departure:
    | StopTime_EstimatedTime
    | undefined;
  /**
   * If this stop time is in the future.
   * This field is *not* based on the arrival or departure time.
   * Instead, a stop time is considered in the future if it appeared in the most recent
   * GTFS realtime feed for its trip.
   * When this stop time disappears from the trip, Transiter marks it as past and freezes
   * its data.
   */
  future: boolean;
  /** Stop sequence. */
  stopSequence: number;
  /** Headsign. */
  headsign?:
    | string
    | undefined;
  /** Track, from the NYCT realtime extension. */
  track?: string | undefined;
}

/**
 * Message describing the arrival or departure time of a stop time.
 * This corresponds to the [GTFS realtime `StopTimeEvent`
 * message](https://developers.google.com/transit/gtfs-realtime/reference#message-stoptimeevent).
 */
export interface StopTime_EstimatedTime {
  time?: number | undefined;
  delay?: number | undefined;
  uncertainty?: number | undefined;
}

export interface Trip {
  id: string;
  /** Generic metadata about the trip resource. */
  resource:
    | Resource
    | undefined;
  /**
   * Route corresponding to this trip.
   * This is the parent resource in Transiter's resource hierarchy.
   * It is determined using the `route_id` field in the GTFS realtime feed.
   */
  route: Route_Reference | undefined;
  startedAt?: number | undefined;
  vehicle?: Vehicle_Reference | undefined;
  directionId: boolean;
  stopTimes: StopTime[];
}

/** Reference is the reference type for the trip resource. */
export interface Trip_Reference {
  id: string;
  resource: Resource | undefined;
  route: Route_Reference | undefined;
  destination: Stop_Reference | undefined;
  vehicle?: Vehicle_Reference | undefined;
  directionId: boolean;
}

export interface Vehicle {
}

/** Reference is the reference type for the vehicle resource. */
export interface Vehicle_Reference {
  id: string;
}

/**
 * The Route resource.
 *
 * This resource corresponds to the [route type in the GTFS static
 * specification](https://developers.google.com/transit/gtfs/reference#routestxt).
 * Most of the fields in the resource come directly from the `routes.txt` table.
 * Transiter adds some additional related fields (agency, alerts)
 *   and computed fields (estimated headway, service maps).
 */
export interface Route {
  /** ID of the route. This is the `route_id` column in `routes.txt`. */
  id: string;
  /** Generic metadata about the route resource. */
  resource:
    | Resource
    | undefined;
  /**
   * System corresponding to this route.
   * This is the parent resource in Transiter's resource hierarchy.
   */
  system:
    | System_Reference
    | undefined;
  /** Short name of the route. This is the `route_short_name` column in `routes.txt`. */
  shortName?:
    | string
    | undefined;
  /** Long name of the route. This is the `route_long_name` column in `routes.txt`. */
  longName?:
    | string
    | undefined;
  /** Color of the route. This is the `route_color` column in `routes.txt`. */
  color: string;
  /** Text color of the route. This is the `route_text_color` column in `routes.txt`. */
  textColor: string;
  /** Description of the route. This is the `route_desc` column in `routes.txt`. */
  description?:
    | string
    | undefined;
  /** URL of a web page about the route. This is the `route_url` column in `routes.txt`. */
  url?:
    | string
    | undefined;
  /** Sort order of the route. This is the `route_sort_order` column in `routes.txt`. */
  sortOrder?:
    | number
    | undefined;
  /** Continuous pickup policy. This is the `continuous_pickup` column in `routes.txt`. */
  continuousPickup: Route_ContinuousPolicy;
  /** Continuous dropoff policy. This is the `continuous_dropoff` column in `routes.txt`. */
  continuousDropOff: Route_ContinuousPolicy;
  /** Type of the route. This is the `route_type` column in `routes.txt`. */
  type: Route_Type;
  /**
   * Agency this route is associated to.
   *
   * This is determined using the `agency_id` column in `routes.txt`.
   */
  agency:
    | Agency_Reference
    | undefined;
  /**
   * Active alerts for this route.
   *
   * These are determined using the `informed_entity` field in
   * the [GTFS realtime alerts
   * message](https://developers.google.com/transit/gtfs-realtime/reference#message-alert).
   */
  alerts: Alert_Reference[];
  /**
   * An estimate of the interval of time between consecutive realtime trips, in seconds.
   *
   * If there is insufficient data to compute an estimate, the field will be empty.
   *
   * The estimate is computed as follows.
   * For each stop that has realtime trips for the route,
   *  the list of arrival times for those trips is examined.
   * The difference between consecutive arrival times is calculated.
   * If there are `N` trips, there will be `N-1` such arrival time diffs.
   * The estimated headway is the average of these diffs across
   * all stops.
   */
  estimatedHeadway?:
    | number
    | undefined;
  /** List of service maps for this route. */
  serviceMaps: Route_ServiceMap[];
}

/** Enum describing possible policies for continuous pickup or drop-off. */
export enum Route_ContinuousPolicy {
  /** ALLOWED - Continuous pickup or drop-off allowed. */
  ALLOWED = 0,
  /** NOT_ALLOWED - Continuous pickup or drop-off not allowed. */
  NOT_ALLOWED = 1,
  /** PHONE_AGENCY - Must phone the agency to arrange continuous pickup or drop-off. */
  PHONE_AGENCY = 2,
  /** COORDINATE_WITH_DRIVER - Must coordinate with driver to arrange continuous pickup or drop-off. */
  COORDINATE_WITH_DRIVER = 3,
  UNRECOGNIZED = -1,
}

export function route_ContinuousPolicyFromJSON(object: any): Route_ContinuousPolicy {
  switch (object) {
    case 0:
    case "ALLOWED":
      return Route_ContinuousPolicy.ALLOWED;
    case 1:
    case "NOT_ALLOWED":
      return Route_ContinuousPolicy.NOT_ALLOWED;
    case 2:
    case "PHONE_AGENCY":
      return Route_ContinuousPolicy.PHONE_AGENCY;
    case 3:
    case "COORDINATE_WITH_DRIVER":
      return Route_ContinuousPolicy.COORDINATE_WITH_DRIVER;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Route_ContinuousPolicy.UNRECOGNIZED;
  }
}

export function route_ContinuousPolicyToJSON(object: Route_ContinuousPolicy): string {
  switch (object) {
    case Route_ContinuousPolicy.ALLOWED:
      return "ALLOWED";
    case Route_ContinuousPolicy.NOT_ALLOWED:
      return "NOT_ALLOWED";
    case Route_ContinuousPolicy.PHONE_AGENCY:
      return "PHONE_AGENCY";
    case Route_ContinuousPolicy.COORDINATE_WITH_DRIVER:
      return "COORDINATE_WITH_DRIVER";
    case Route_ContinuousPolicy.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

/**
 * Enum describing possible route types.
 * This corresponds to possible values of the `route_type` column in `routes.txt`.
 */
export enum Route_Type {
  LIGHT_RAIL = 0,
  SUBWAY = 1,
  RAIL = 2,
  BUS = 3,
  FERRY = 4,
  CABLE_TRAM = 5,
  AERIAL_LIFT = 6,
  FUNICULAR = 7,
  TROLLEY_BUS = 11,
  MONORAIL = 12,
  UNKNOWN = 100,
  UNRECOGNIZED = -1,
}

export function route_TypeFromJSON(object: any): Route_Type {
  switch (object) {
    case 0:
    case "LIGHT_RAIL":
      return Route_Type.LIGHT_RAIL;
    case 1:
    case "SUBWAY":
      return Route_Type.SUBWAY;
    case 2:
    case "RAIL":
      return Route_Type.RAIL;
    case 3:
    case "BUS":
      return Route_Type.BUS;
    case 4:
    case "FERRY":
      return Route_Type.FERRY;
    case 5:
    case "CABLE_TRAM":
      return Route_Type.CABLE_TRAM;
    case 6:
    case "AERIAL_LIFT":
      return Route_Type.AERIAL_LIFT;
    case 7:
    case "FUNICULAR":
      return Route_Type.FUNICULAR;
    case 11:
    case "TROLLEY_BUS":
      return Route_Type.TROLLEY_BUS;
    case 12:
    case "MONORAIL":
      return Route_Type.MONORAIL;
    case 100:
    case "UNKNOWN":
      return Route_Type.UNKNOWN;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Route_Type.UNRECOGNIZED;
  }
}

export function route_TypeToJSON(object: Route_Type): string {
  switch (object) {
    case Route_Type.LIGHT_RAIL:
      return "LIGHT_RAIL";
    case Route_Type.SUBWAY:
      return "SUBWAY";
    case Route_Type.RAIL:
      return "RAIL";
    case Route_Type.BUS:
      return "BUS";
    case Route_Type.FERRY:
      return "FERRY";
    case Route_Type.CABLE_TRAM:
      return "CABLE_TRAM";
    case Route_Type.AERIAL_LIFT:
      return "AERIAL_LIFT";
    case Route_Type.FUNICULAR:
      return "FUNICULAR";
    case Route_Type.TROLLEY_BUS:
      return "TROLLEY_BUS";
    case Route_Type.MONORAIL:
      return "MONORAIL";
    case Route_Type.UNKNOWN:
      return "UNKNOWN";
    case Route_Type.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

/**
 * Message describing the service maps view in routes.
 *
 * See the service maps documentation for more information on this
 * message and the associated field.
 */
export interface Route_ServiceMap {
  /** Config ID of the service map, as specified in the system configuration file. */
  configId: string;
  /**
   * Ordered list of stop at which this route calls.
   *
   * This list may be empty, in which case the route has no service in the service map.
   */
  stops: Stop_Reference[];
}

/** Reference is the reference type for the route resource. */
export interface Route_Reference {
  id: string;
  resource: Resource | undefined;
  system: System_Reference | undefined;
  color: string;
}

/**
 * The feed resource.
 *
 * Each feed is defined in the system configuration file.
 * Feeds are included in the public API because there are non-admin use-cases for this resource.
 * For example, an app might publish the staleness of realtime data
 *   by checking for the last succesful feed update.
 *
 * More detailed information on a feed -- its full configuration, and the
 *   current status of its periodic updates -- can be retrieved through the admin API.
 */
export interface Feed {
  /** ID of the feed, as specified in the system configuration file. */
  id: string;
  /** Generic metadata about the feed resource. */
  resource:
    | Resource
    | undefined;
  /**
   * System corresponding to this feed.
   * This is the parent resource in Transiter's resource hierarchy.
   */
  system:
    | System_Reference
    | undefined;
  /** Updates for this feed. */
  updates: ChildResources | undefined;
}

/** Reference is the reference type for the feed resource. */
export interface Feed_Reference {
  id: string;
  resource: Resource | undefined;
  system: System_Reference | undefined;
}

/**
 * The Agency resource.
 *
 * This resource corresponds to the [agency type in the GTFS static
 * specification](https://developers.google.com/transit/gtfs/reference#agencytxt).
 * Most of the fields in the resource come directly from the `agency.txt` table.
 * Transiter adds some additional related fields (alerts).
 */
export interface Agency {
  /** ID of the agency. This is the `agency_id` column in `agency.txt`. */
  id: string;
  /** Generic metadata about the agency resource. */
  resource:
    | Resource
    | undefined;
  /**
   * System corresponding to this agency.
   * This is the parent resource in Transiter's resource hierarchy.
   */
  system:
    | System_Reference
    | undefined;
  /** Name of the agency. This is the `agency_name` column in `agency.txt`. */
  name: string;
  /** URL of the agency. This is the `agency_url` column in `agency.txt`. */
  url: string;
  /** Timezone of the agency. This is the `agency_timezone` column in `agency.txt`. */
  timezone: string;
  /** Language of the agency. This is the `agency_lang` column in `agency.txt`. */
  language?:
    | string
    | undefined;
  /** Phone number of the agency. This is the `agency_phone` column in `agency.txt`. */
  phone?:
    | string
    | undefined;
  /**
   * URL where tickets for the agency's services ban be bought.
   * This is the `agency_fare_url` column in `agency.txt`.
   */
  fareUrl?:
    | string
    | undefined;
  /** Email address of the agency. This is the `agency_email` column in `agency.txt`. */
  email?: string | undefined;
  routes: Route_Reference[];
  /**
   * List of active alerts for the agency.
   *
   * These are determined using the `informed_entity` field in
   * the [GTFS realtime alerts
   * message](https://developers.google.com/transit/gtfs-realtime/reference#message-alert).
   */
  alerts: Alert_Reference[];
}

/** Reference is the reference type for the agency resource. */
export interface Agency_Reference {
  id: string;
  resource: Resource | undefined;
  system: System_Reference | undefined;
  name: string;
}

/**
 * The Alert resource.
 *
 * This resource corresponds to the [alert type in the GTFS realtime
 * specification](https://developers.google.com/transit/gtfs-realtime/reference#message-alert).
 *
 * TODO; alphabetize the messages
 */
export interface Alert {
  /**
   * ID of the alert. This corresponds to the [ID field in the feed entity
   * message](https://developers.google.com/transit/gtfs-realtime/reference#message-feedentity)
   * corresponding to the alert.
   */
  id: string;
  /** Generic metadata about the alert resource. */
  resource:
    | Resource
    | undefined;
  /**
   * System corresponding to this alert.
   * This is the parent resource in Transiter's resource hierarchy.
   */
  system:
    | System_Reference
    | undefined;
  /** Cause of the alert. This corresponds to the `cause` field in the realtime alert message. */
  cause: Alert_Cause;
  /** Effect of the alert. This corresponds to the `effect` field in the realtime alert message. */
  effect: Alert_Effect;
  /**
   * The current active period, if the alert is currently active.
   * If the alert is not active this is empty.
   */
  currentActivePeriod?:
    | Alert_ActivePeriod
    | undefined;
  /**
   * All active periods for this alert.
   * Transiter guarantees that these active periods have no overlap.
   */
  allActivePeriods: Alert_ActivePeriod[];
  /**
   * Header of the alert, in zero or more languages.
   * This corresponds to the `header_text` field in the realtime alert message.
   */
  header: Alert_Text[];
  /**
   * Description of the alert, in zero or more languages.
   * This corresponds to the `description_text` field in the realtime alert message.
   */
  description: Alert_Text[];
  /**
   * URL for additional information about the alert, in zero or more languages.
   * This corresponds to the `url` field in the realtime alert message.
   */
  url: Alert_Text[];
}

/**
 * Cause is the same as the [cause enum in the GTFS realtime
 * specification](https://developers.google.com/transit/gtfs-realtime/reference#enum-cause),
 * except `UNKNOWN_CAUSE` has value 0 instead of 1 to satisfy proto3 requirements.
 */
export enum Alert_Cause {
  UNKNOWN_CAUSE = 0,
  OTHER_CAUSE = 2,
  TECHNICAL_PROBLEM = 3,
  STRIKE = 4,
  DEMONSTRATION = 5,
  ACCIDENT = 6,
  HOLIDAY = 7,
  WEATHER = 8,
  MAINTENANCE = 9,
  CONSTRUCTION = 10,
  POLICE_ACTIVITY = 11,
  MEDICAL_EMERGENCY = 12,
  UNRECOGNIZED = -1,
}

export function alert_CauseFromJSON(object: any): Alert_Cause {
  switch (object) {
    case 0:
    case "UNKNOWN_CAUSE":
      return Alert_Cause.UNKNOWN_CAUSE;
    case 2:
    case "OTHER_CAUSE":
      return Alert_Cause.OTHER_CAUSE;
    case 3:
    case "TECHNICAL_PROBLEM":
      return Alert_Cause.TECHNICAL_PROBLEM;
    case 4:
    case "STRIKE":
      return Alert_Cause.STRIKE;
    case 5:
    case "DEMONSTRATION":
      return Alert_Cause.DEMONSTRATION;
    case 6:
    case "ACCIDENT":
      return Alert_Cause.ACCIDENT;
    case 7:
    case "HOLIDAY":
      return Alert_Cause.HOLIDAY;
    case 8:
    case "WEATHER":
      return Alert_Cause.WEATHER;
    case 9:
    case "MAINTENANCE":
      return Alert_Cause.MAINTENANCE;
    case 10:
    case "CONSTRUCTION":
      return Alert_Cause.CONSTRUCTION;
    case 11:
    case "POLICE_ACTIVITY":
      return Alert_Cause.POLICE_ACTIVITY;
    case 12:
    case "MEDICAL_EMERGENCY":
      return Alert_Cause.MEDICAL_EMERGENCY;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Alert_Cause.UNRECOGNIZED;
  }
}

export function alert_CauseToJSON(object: Alert_Cause): string {
  switch (object) {
    case Alert_Cause.UNKNOWN_CAUSE:
      return "UNKNOWN_CAUSE";
    case Alert_Cause.OTHER_CAUSE:
      return "OTHER_CAUSE";
    case Alert_Cause.TECHNICAL_PROBLEM:
      return "TECHNICAL_PROBLEM";
    case Alert_Cause.STRIKE:
      return "STRIKE";
    case Alert_Cause.DEMONSTRATION:
      return "DEMONSTRATION";
    case Alert_Cause.ACCIDENT:
      return "ACCIDENT";
    case Alert_Cause.HOLIDAY:
      return "HOLIDAY";
    case Alert_Cause.WEATHER:
      return "WEATHER";
    case Alert_Cause.MAINTENANCE:
      return "MAINTENANCE";
    case Alert_Cause.CONSTRUCTION:
      return "CONSTRUCTION";
    case Alert_Cause.POLICE_ACTIVITY:
      return "POLICE_ACTIVITY";
    case Alert_Cause.MEDICAL_EMERGENCY:
      return "MEDICAL_EMERGENCY";
    case Alert_Cause.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

/**
 * Effect is the same as the [effect enum in the GTFS realtime
 * specification](https://developers.google.com/transit/gtfs-realtime/reference#enum-effect),
 * except `UNKNOWN_EFFECT` has value 0 instead of 1 to satisfy proto3 requirements.
 */
export enum Alert_Effect {
  UNKNOWN_EFFECT = 0,
  NO_SERVICE = 1,
  REDUCED_SERVICE = 2,
  SIGNIFICANT_DELAYS = 3,
  DETOUR = 4,
  ADDITIONAL_SERVICE = 5,
  MODIFIED_SERVICE = 6,
  OTHER_EFFECT = 7,
  STOP_MOVED = 9,
  NO_EFFECT = 10,
  ACCESSIBILITY_ISSUE = 11,
  UNRECOGNIZED = -1,
}

export function alert_EffectFromJSON(object: any): Alert_Effect {
  switch (object) {
    case 0:
    case "UNKNOWN_EFFECT":
      return Alert_Effect.UNKNOWN_EFFECT;
    case 1:
    case "NO_SERVICE":
      return Alert_Effect.NO_SERVICE;
    case 2:
    case "REDUCED_SERVICE":
      return Alert_Effect.REDUCED_SERVICE;
    case 3:
    case "SIGNIFICANT_DELAYS":
      return Alert_Effect.SIGNIFICANT_DELAYS;
    case 4:
    case "DETOUR":
      return Alert_Effect.DETOUR;
    case 5:
    case "ADDITIONAL_SERVICE":
      return Alert_Effect.ADDITIONAL_SERVICE;
    case 6:
    case "MODIFIED_SERVICE":
      return Alert_Effect.MODIFIED_SERVICE;
    case 7:
    case "OTHER_EFFECT":
      return Alert_Effect.OTHER_EFFECT;
    case 9:
    case "STOP_MOVED":
      return Alert_Effect.STOP_MOVED;
    case 10:
    case "NO_EFFECT":
      return Alert_Effect.NO_EFFECT;
    case 11:
    case "ACCESSIBILITY_ISSUE":
      return Alert_Effect.ACCESSIBILITY_ISSUE;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Alert_Effect.UNRECOGNIZED;
  }
}

export function alert_EffectToJSON(object: Alert_Effect): string {
  switch (object) {
    case Alert_Effect.UNKNOWN_EFFECT:
      return "UNKNOWN_EFFECT";
    case Alert_Effect.NO_SERVICE:
      return "NO_SERVICE";
    case Alert_Effect.REDUCED_SERVICE:
      return "REDUCED_SERVICE";
    case Alert_Effect.SIGNIFICANT_DELAYS:
      return "SIGNIFICANT_DELAYS";
    case Alert_Effect.DETOUR:
      return "DETOUR";
    case Alert_Effect.ADDITIONAL_SERVICE:
      return "ADDITIONAL_SERVICE";
    case Alert_Effect.MODIFIED_SERVICE:
      return "MODIFIED_SERVICE";
    case Alert_Effect.OTHER_EFFECT:
      return "OTHER_EFFECT";
    case Alert_Effect.STOP_MOVED:
      return "STOP_MOVED";
    case Alert_Effect.NO_EFFECT:
      return "NO_EFFECT";
    case Alert_Effect.ACCESSIBILITY_ISSUE:
      return "ACCESSIBILITY_ISSUE";
    case Alert_Effect.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

/**
 * The active period message describes a period when an alert is active.
 * It corresponds the the [time range message in the GTFS realtime
 * specification](https://developers.google.com/transit/gtfs-realtime/reference#message-timerange).
 */
export interface Alert_ActivePeriod {
  /**
   * Unix timestamp of the start time of the active period.
   * If not set, the alert be interpreted
   * as being always active up to the end time.
   */
  startsAt?:
    | number
    | undefined;
  /**
   * Unix timestamp of the end time of the active period.
   * If not set, the alert be interpreted as being indefinitely active.
   */
  endsAt?: number | undefined;
}

/**
 * The text message describes an alert header/description/URL in a specified language.
 * It corresponds the the [translation message in the GTFS realtime
 * specification](https://developers.google.com/transit/gtfs-realtime/reference#message-translation).
 */
export interface Alert_Text {
  /** Content of the text. */
  text: string;
  /** Language of this text. */
  language: string;
}

/** Reference is the reference type for the agency resource. */
export interface Alert_Reference {
  id: string;
  resource: Resource | undefined;
  system: System_Reference | undefined;
  cause: Alert_Cause;
  effect: Alert_Effect;
}

export interface Transfer {
  /**
   * TODO: id, system, resource
   * Probably will use the pk of the DB row for the ID
   */
  fromStop: Stop_Reference | undefined;
  toStop: Stop_Reference | undefined;
  type: Transfer_Type;
  minTransferTime?: number | undefined;
  distance?: number | undefined;
}

export enum Transfer_Type {
  RECOMMENDED = 0,
  TIMED = 1,
  REQUIRES_TIME = 2,
  NO_POSSIBLE = 3,
  UNRECOGNIZED = -1,
}

export function transfer_TypeFromJSON(object: any): Transfer_Type {
  switch (object) {
    case 0:
    case "RECOMMENDED":
      return Transfer_Type.RECOMMENDED;
    case 1:
    case "TIMED":
      return Transfer_Type.TIMED;
    case 2:
    case "REQUIRES_TIME":
      return Transfer_Type.REQUIRES_TIME;
    case 3:
    case "NO_POSSIBLE":
      return Transfer_Type.NO_POSSIBLE;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Transfer_Type.UNRECOGNIZED;
  }
}

export function transfer_TypeToJSON(object: Transfer_Type): string {
  switch (object) {
    case Transfer_Type.RECOMMENDED:
      return "RECOMMENDED";
    case Transfer_Type.TIMED:
      return "TIMED";
    case Transfer_Type.REQUIRES_TIME:
      return "REQUIRES_TIME";
    case Transfer_Type.NO_POSSIBLE:
      return "NO_POSSIBLE";
    case Transfer_Type.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

/**
 * The feed update resource.
 *
 * Each feed update event
 *   -- triggered manually though the admin API, or automatically by the scheduler --
 * generates a feed update resource.
 * This resource is updated as the feed update progresses.
 * A background task in Transiter periodically garbage collects old updates.
 */
export interface FeedUpdate {
  /**
   * ID of the feed update. This is the primary key of the associated Postgres
   * database row so it's actually globally unique.
   */
  id: string;
  /** Generic metadata about the feed update resource. */
  resource:
    | Resource
    | undefined;
  /**
   * Feed corresponding to this update.
   * This is the parent resource in Transiter's resource hierarchy.
   */
  feed:
    | Feed_Reference
    | undefined;
  /** Unix timestamp of when the update started. */
  startedAt: number;
  /** Whether the update has finished. If false, the update is still in progress. */
  finished: boolean;
  /**
   * Unix timestamp of when the update finished.
   * Only populated if the update is finished.
   */
  finishedAt?:
    | number
    | undefined;
  /**
   * Result of the update.
   * Only populated if the update is finished.
   */
  result?:
    | FeedUpdate_Result
    | undefined;
  /**
   * Number of bytes in the downloaded feed data.
   * Only populated if the update succesfully downloaded the data.
   */
  contentLength?:
    | number
    | undefined;
  /**
   * Hash of the downloaded feed data. This is used to skip updates
   * if the feed data hasn't changed.
   * Only populated if the update succesfully downloaded the data.
   */
  contentHash?:
    | string
    | undefined;
  /**
   * Error message of the update.
   * Only populated if the update finished in an error
   */
  errorMessage?: string | undefined;
}

export enum FeedUpdate_Result {
  /** UPDATED - Finished succesfully. */
  UPDATED = 0,
  /** NOT_NEEDED - The update was skipped because the downloaded data was identical to the data for the last succesful update. */
  NOT_NEEDED = 1,
  /** DOWNLOAD_ERROR - Failed to download feed data. */
  DOWNLOAD_ERROR = 2,
  /** EMPTY_FEED - Feed data was empty. */
  EMPTY_FEED = 3,
  /**
   * INVALID_FEED_CONFIG - The feed configuration is invalid. This typically indicates a bug in Transiter because
   * the feed configuration is validated when the system is being installed.
   */
  INVALID_FEED_CONFIG = 4,
  /** INVALID_PARSER - The parser specified in the feed configuration is invalid. */
  INVALID_PARSER = 5,
  /**
   * PARSE_ERROR - Failed to parse the feed data.
   * This means the feed data was corrupted or otherwise invalid.
   */
  PARSE_ERROR = 6,
  /**
   * UPDATE_ERROR - Failed to update the database using the new feed data.
   * This typically indicates a bug in Transiter or a transient error connecting to the database.
   */
  UPDATE_ERROR = 7,
  /** INTERNAL_ERROR - An internal unspecified error occured. */
  INTERNAL_ERROR = 8,
  UNRECOGNIZED = -1,
}

export function feedUpdate_ResultFromJSON(object: any): FeedUpdate_Result {
  switch (object) {
    case 0:
    case "UPDATED":
      return FeedUpdate_Result.UPDATED;
    case 1:
    case "NOT_NEEDED":
      return FeedUpdate_Result.NOT_NEEDED;
    case 2:
    case "DOWNLOAD_ERROR":
      return FeedUpdate_Result.DOWNLOAD_ERROR;
    case 3:
    case "EMPTY_FEED":
      return FeedUpdate_Result.EMPTY_FEED;
    case 4:
    case "INVALID_FEED_CONFIG":
      return FeedUpdate_Result.INVALID_FEED_CONFIG;
    case 5:
    case "INVALID_PARSER":
      return FeedUpdate_Result.INVALID_PARSER;
    case 6:
    case "PARSE_ERROR":
      return FeedUpdate_Result.PARSE_ERROR;
    case 7:
    case "UPDATE_ERROR":
      return FeedUpdate_Result.UPDATE_ERROR;
    case 8:
    case "INTERNAL_ERROR":
      return FeedUpdate_Result.INTERNAL_ERROR;
    case -1:
    case "UNRECOGNIZED":
    default:
      return FeedUpdate_Result.UNRECOGNIZED;
  }
}

export function feedUpdate_ResultToJSON(object: FeedUpdate_Result): string {
  switch (object) {
    case FeedUpdate_Result.UPDATED:
      return "UPDATED";
    case FeedUpdate_Result.NOT_NEEDED:
      return "NOT_NEEDED";
    case FeedUpdate_Result.DOWNLOAD_ERROR:
      return "DOWNLOAD_ERROR";
    case FeedUpdate_Result.EMPTY_FEED:
      return "EMPTY_FEED";
    case FeedUpdate_Result.INVALID_FEED_CONFIG:
      return "INVALID_FEED_CONFIG";
    case FeedUpdate_Result.INVALID_PARSER:
      return "INVALID_PARSER";
    case FeedUpdate_Result.PARSE_ERROR:
      return "PARSE_ERROR";
    case FeedUpdate_Result.UPDATE_ERROR:
      return "UPDATE_ERROR";
    case FeedUpdate_Result.INTERNAL_ERROR:
      return "INTERNAL_ERROR";
    case FeedUpdate_Result.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

function createBaseEntrypointRequest(): EntrypointRequest {
  return {};
}

export const EntrypointRequest = {
  encode(_: EntrypointRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EntrypointRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEntrypointRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): EntrypointRequest {
    return {};
  },

  toJSON(_: EntrypointRequest): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<EntrypointRequest>, I>>(base?: I): EntrypointRequest {
    return EntrypointRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<EntrypointRequest>, I>>(_: I): EntrypointRequest {
    const message = createBaseEntrypointRequest();
    return message;
  },
};

function createBaseEntrypointReply(): EntrypointReply {
  return { transiter: undefined, systems: undefined };
}

export const EntrypointReply = {
  encode(message: EntrypointReply, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.transiter !== undefined) {
      EntrypointReply_TransiterDetails.encode(message.transiter, writer.uint32(10).fork()).ldelim();
    }
    if (message.systems !== undefined) {
      ChildResources.encode(message.systems, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EntrypointReply {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEntrypointReply();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.transiter = EntrypointReply_TransiterDetails.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.systems = ChildResources.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): EntrypointReply {
    return {
      transiter: isSet(object.transiter) ? EntrypointReply_TransiterDetails.fromJSON(object.transiter) : undefined,
      systems: isSet(object.systems) ? ChildResources.fromJSON(object.systems) : undefined,
    };
  },

  toJSON(message: EntrypointReply): unknown {
    const obj: any = {};
    message.transiter !== undefined &&
      (obj.transiter = message.transiter ? EntrypointReply_TransiterDetails.toJSON(message.transiter) : undefined);
    message.systems !== undefined &&
      (obj.systems = message.systems ? ChildResources.toJSON(message.systems) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<EntrypointReply>, I>>(base?: I): EntrypointReply {
    return EntrypointReply.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<EntrypointReply>, I>>(object: I): EntrypointReply {
    const message = createBaseEntrypointReply();
    message.transiter = (object.transiter !== undefined && object.transiter !== null)
      ? EntrypointReply_TransiterDetails.fromPartial(object.transiter)
      : undefined;
    message.systems = (object.systems !== undefined && object.systems !== null)
      ? ChildResources.fromPartial(object.systems)
      : undefined;
    return message;
  },
};

function createBaseEntrypointReply_TransiterDetails(): EntrypointReply_TransiterDetails {
  return { version: "", href: "", build: undefined };
}

export const EntrypointReply_TransiterDetails = {
  encode(message: EntrypointReply_TransiterDetails, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.version !== "") {
      writer.uint32(10).string(message.version);
    }
    if (message.href !== "") {
      writer.uint32(18).string(message.href);
    }
    if (message.build !== undefined) {
      EntrypointReply_TransiterDetails_Build.encode(message.build, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EntrypointReply_TransiterDetails {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEntrypointReply_TransiterDetails();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.version = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.href = reader.string();
          continue;
        case 3:
          if (tag != 26) {
            break;
          }

          message.build = EntrypointReply_TransiterDetails_Build.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): EntrypointReply_TransiterDetails {
    return {
      version: isSet(object.version) ? String(object.version) : "",
      href: isSet(object.href) ? String(object.href) : "",
      build: isSet(object.build) ? EntrypointReply_TransiterDetails_Build.fromJSON(object.build) : undefined,
    };
  },

  toJSON(message: EntrypointReply_TransiterDetails): unknown {
    const obj: any = {};
    message.version !== undefined && (obj.version = message.version);
    message.href !== undefined && (obj.href = message.href);
    message.build !== undefined &&
      (obj.build = message.build ? EntrypointReply_TransiterDetails_Build.toJSON(message.build) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<EntrypointReply_TransiterDetails>, I>>(
    base?: I,
  ): EntrypointReply_TransiterDetails {
    return EntrypointReply_TransiterDetails.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<EntrypointReply_TransiterDetails>, I>>(
    object: I,
  ): EntrypointReply_TransiterDetails {
    const message = createBaseEntrypointReply_TransiterDetails();
    message.version = object.version ?? "";
    message.href = object.href ?? "";
    message.build = (object.build !== undefined && object.build !== null)
      ? EntrypointReply_TransiterDetails_Build.fromPartial(object.build)
      : undefined;
    return message;
  },
};

function createBaseEntrypointReply_TransiterDetails_Build(): EntrypointReply_TransiterDetails_Build {
  return { number: "", builtAt: "", builtAtTimestamp: "", gitCommitHash: "", href: "" };
}

export const EntrypointReply_TransiterDetails_Build = {
  encode(message: EntrypointReply_TransiterDetails_Build, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.number !== "") {
      writer.uint32(26).string(message.number);
    }
    if (message.builtAt !== "") {
      writer.uint32(34).string(message.builtAt);
    }
    if (message.builtAtTimestamp !== "") {
      writer.uint32(42).string(message.builtAtTimestamp);
    }
    if (message.gitCommitHash !== "") {
      writer.uint32(50).string(message.gitCommitHash);
    }
    if (message.href !== "") {
      writer.uint32(58).string(message.href);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EntrypointReply_TransiterDetails_Build {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEntrypointReply_TransiterDetails_Build();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 3:
          if (tag != 26) {
            break;
          }

          message.number = reader.string();
          continue;
        case 4:
          if (tag != 34) {
            break;
          }

          message.builtAt = reader.string();
          continue;
        case 5:
          if (tag != 42) {
            break;
          }

          message.builtAtTimestamp = reader.string();
          continue;
        case 6:
          if (tag != 50) {
            break;
          }

          message.gitCommitHash = reader.string();
          continue;
        case 7:
          if (tag != 58) {
            break;
          }

          message.href = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): EntrypointReply_TransiterDetails_Build {
    return {
      number: isSet(object.number) ? String(object.number) : "",
      builtAt: isSet(object.builtAt) ? String(object.builtAt) : "",
      builtAtTimestamp: isSet(object.builtAtTimestamp) ? String(object.builtAtTimestamp) : "",
      gitCommitHash: isSet(object.gitCommitHash) ? String(object.gitCommitHash) : "",
      href: isSet(object.href) ? String(object.href) : "",
    };
  },

  toJSON(message: EntrypointReply_TransiterDetails_Build): unknown {
    const obj: any = {};
    message.number !== undefined && (obj.number = message.number);
    message.builtAt !== undefined && (obj.builtAt = message.builtAt);
    message.builtAtTimestamp !== undefined && (obj.builtAtTimestamp = message.builtAtTimestamp);
    message.gitCommitHash !== undefined && (obj.gitCommitHash = message.gitCommitHash);
    message.href !== undefined && (obj.href = message.href);
    return obj;
  },

  create<I extends Exact<DeepPartial<EntrypointReply_TransiterDetails_Build>, I>>(
    base?: I,
  ): EntrypointReply_TransiterDetails_Build {
    return EntrypointReply_TransiterDetails_Build.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<EntrypointReply_TransiterDetails_Build>, I>>(
    object: I,
  ): EntrypointReply_TransiterDetails_Build {
    const message = createBaseEntrypointReply_TransiterDetails_Build();
    message.number = object.number ?? "";
    message.builtAt = object.builtAt ?? "";
    message.builtAtTimestamp = object.builtAtTimestamp ?? "";
    message.gitCommitHash = object.gitCommitHash ?? "";
    message.href = object.href ?? "";
    return message;
  },
};

function createBaseListSystemsRequest(): ListSystemsRequest {
  return {};
}

export const ListSystemsRequest = {
  encode(_: ListSystemsRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListSystemsRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListSystemsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): ListSystemsRequest {
    return {};
  },

  toJSON(_: ListSystemsRequest): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<ListSystemsRequest>, I>>(base?: I): ListSystemsRequest {
    return ListSystemsRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ListSystemsRequest>, I>>(_: I): ListSystemsRequest {
    const message = createBaseListSystemsRequest();
    return message;
  },
};

function createBaseListSystemsReply(): ListSystemsReply {
  return { systems: [] };
}

export const ListSystemsReply = {
  encode(message: ListSystemsReply, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.systems) {
      System.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListSystemsReply {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListSystemsReply();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.systems.push(System.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ListSystemsReply {
    return { systems: Array.isArray(object?.systems) ? object.systems.map((e: any) => System.fromJSON(e)) : [] };
  },

  toJSON(message: ListSystemsReply): unknown {
    const obj: any = {};
    if (message.systems) {
      obj.systems = message.systems.map((e) => e ? System.toJSON(e) : undefined);
    } else {
      obj.systems = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<ListSystemsReply>, I>>(base?: I): ListSystemsReply {
    return ListSystemsReply.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ListSystemsReply>, I>>(object: I): ListSystemsReply {
    const message = createBaseListSystemsReply();
    message.systems = object.systems?.map((e) => System.fromPartial(e)) || [];
    return message;
  },
};

function createBaseGetSystemRequest(): GetSystemRequest {
  return { systemId: "" };
}

export const GetSystemRequest = {
  encode(message: GetSystemRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.systemId !== "") {
      writer.uint32(10).string(message.systemId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetSystemRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetSystemRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.systemId = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): GetSystemRequest {
    return { systemId: isSet(object.systemId) ? String(object.systemId) : "" };
  },

  toJSON(message: GetSystemRequest): unknown {
    const obj: any = {};
    message.systemId !== undefined && (obj.systemId = message.systemId);
    return obj;
  },

  create<I extends Exact<DeepPartial<GetSystemRequest>, I>>(base?: I): GetSystemRequest {
    return GetSystemRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<GetSystemRequest>, I>>(object: I): GetSystemRequest {
    const message = createBaseGetSystemRequest();
    message.systemId = object.systemId ?? "";
    return message;
  },
};

function createBaseListAgenciesRequest(): ListAgenciesRequest {
  return { systemId: "" };
}

export const ListAgenciesRequest = {
  encode(message: ListAgenciesRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.systemId !== "") {
      writer.uint32(10).string(message.systemId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListAgenciesRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListAgenciesRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.systemId = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ListAgenciesRequest {
    return { systemId: isSet(object.systemId) ? String(object.systemId) : "" };
  },

  toJSON(message: ListAgenciesRequest): unknown {
    const obj: any = {};
    message.systemId !== undefined && (obj.systemId = message.systemId);
    return obj;
  },

  create<I extends Exact<DeepPartial<ListAgenciesRequest>, I>>(base?: I): ListAgenciesRequest {
    return ListAgenciesRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ListAgenciesRequest>, I>>(object: I): ListAgenciesRequest {
    const message = createBaseListAgenciesRequest();
    message.systemId = object.systemId ?? "";
    return message;
  },
};

function createBaseListAgenciesReply(): ListAgenciesReply {
  return { agencies: [] };
}

export const ListAgenciesReply = {
  encode(message: ListAgenciesReply, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.agencies) {
      Agency.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListAgenciesReply {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListAgenciesReply();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.agencies.push(Agency.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ListAgenciesReply {
    return { agencies: Array.isArray(object?.agencies) ? object.agencies.map((e: any) => Agency.fromJSON(e)) : [] };
  },

  toJSON(message: ListAgenciesReply): unknown {
    const obj: any = {};
    if (message.agencies) {
      obj.agencies = message.agencies.map((e) => e ? Agency.toJSON(e) : undefined);
    } else {
      obj.agencies = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<ListAgenciesReply>, I>>(base?: I): ListAgenciesReply {
    return ListAgenciesReply.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ListAgenciesReply>, I>>(object: I): ListAgenciesReply {
    const message = createBaseListAgenciesReply();
    message.agencies = object.agencies?.map((e) => Agency.fromPartial(e)) || [];
    return message;
  },
};

function createBaseGetAgencyRequest(): GetAgencyRequest {
  return { systemId: "", agencyId: "" };
}

export const GetAgencyRequest = {
  encode(message: GetAgencyRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.systemId !== "") {
      writer.uint32(10).string(message.systemId);
    }
    if (message.agencyId !== "") {
      writer.uint32(18).string(message.agencyId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetAgencyRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetAgencyRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.systemId = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.agencyId = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): GetAgencyRequest {
    return {
      systemId: isSet(object.systemId) ? String(object.systemId) : "",
      agencyId: isSet(object.agencyId) ? String(object.agencyId) : "",
    };
  },

  toJSON(message: GetAgencyRequest): unknown {
    const obj: any = {};
    message.systemId !== undefined && (obj.systemId = message.systemId);
    message.agencyId !== undefined && (obj.agencyId = message.agencyId);
    return obj;
  },

  create<I extends Exact<DeepPartial<GetAgencyRequest>, I>>(base?: I): GetAgencyRequest {
    return GetAgencyRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<GetAgencyRequest>, I>>(object: I): GetAgencyRequest {
    const message = createBaseGetAgencyRequest();
    message.systemId = object.systemId ?? "";
    message.agencyId = object.agencyId ?? "";
    return message;
  },
};

function createBaseListStopsRequest(): ListStopsRequest {
  return {
    systemId: "",
    searchMode: undefined,
    onlyReturnSpecifiedIds: false,
    id: [],
    firstId: undefined,
    limit: undefined,
    skipStopTimes: false,
    skipServiceMaps: false,
    skipAlerts: false,
    skipTransfers: false,
    maxDistance: undefined,
    latitude: undefined,
    longitude: undefined,
  };
}

export const ListStopsRequest = {
  encode(message: ListStopsRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.systemId !== "") {
      writer.uint32(10).string(message.systemId);
    }
    if (message.searchMode !== undefined) {
      writer.uint32(104).int32(message.searchMode);
    }
    if (message.onlyReturnSpecifiedIds === true) {
      writer.uint32(64).bool(message.onlyReturnSpecifiedIds);
    }
    for (const v of message.id) {
      writer.uint32(74).string(v!);
    }
    if (message.firstId !== undefined) {
      writer.uint32(18).string(message.firstId);
    }
    if (message.limit !== undefined) {
      writer.uint32(24).int32(message.limit);
    }
    if (message.skipStopTimes === true) {
      writer.uint32(32).bool(message.skipStopTimes);
    }
    if (message.skipServiceMaps === true) {
      writer.uint32(40).bool(message.skipServiceMaps);
    }
    if (message.skipAlerts === true) {
      writer.uint32(48).bool(message.skipAlerts);
    }
    if (message.skipTransfers === true) {
      writer.uint32(56).bool(message.skipTransfers);
    }
    if (message.maxDistance !== undefined) {
      writer.uint32(81).double(message.maxDistance);
    }
    if (message.latitude !== undefined) {
      writer.uint32(89).double(message.latitude);
    }
    if (message.longitude !== undefined) {
      writer.uint32(97).double(message.longitude);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListStopsRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListStopsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.systemId = reader.string();
          continue;
        case 13:
          if (tag != 104) {
            break;
          }

          message.searchMode = reader.int32() as any;
          continue;
        case 8:
          if (tag != 64) {
            break;
          }

          message.onlyReturnSpecifiedIds = reader.bool();
          continue;
        case 9:
          if (tag != 74) {
            break;
          }

          message.id.push(reader.string());
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.firstId = reader.string();
          continue;
        case 3:
          if (tag != 24) {
            break;
          }

          message.limit = reader.int32();
          continue;
        case 4:
          if (tag != 32) {
            break;
          }

          message.skipStopTimes = reader.bool();
          continue;
        case 5:
          if (tag != 40) {
            break;
          }

          message.skipServiceMaps = reader.bool();
          continue;
        case 6:
          if (tag != 48) {
            break;
          }

          message.skipAlerts = reader.bool();
          continue;
        case 7:
          if (tag != 56) {
            break;
          }

          message.skipTransfers = reader.bool();
          continue;
        case 10:
          if (tag != 81) {
            break;
          }

          message.maxDistance = reader.double();
          continue;
        case 11:
          if (tag != 89) {
            break;
          }

          message.latitude = reader.double();
          continue;
        case 12:
          if (tag != 97) {
            break;
          }

          message.longitude = reader.double();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ListStopsRequest {
    return {
      systemId: isSet(object.systemId) ? String(object.systemId) : "",
      searchMode: isSet(object.searchMode) ? listStopsRequest_SearchModeFromJSON(object.searchMode) : undefined,
      onlyReturnSpecifiedIds: isSet(object.onlyReturnSpecifiedIds) ? Boolean(object.onlyReturnSpecifiedIds) : false,
      id: Array.isArray(object?.id) ? object.id.map((e: any) => String(e)) : [],
      firstId: isSet(object.firstId) ? String(object.firstId) : undefined,
      limit: isSet(object.limit) ? Number(object.limit) : undefined,
      skipStopTimes: isSet(object.skipStopTimes) ? Boolean(object.skipStopTimes) : false,
      skipServiceMaps: isSet(object.skipServiceMaps) ? Boolean(object.skipServiceMaps) : false,
      skipAlerts: isSet(object.skipAlerts) ? Boolean(object.skipAlerts) : false,
      skipTransfers: isSet(object.skipTransfers) ? Boolean(object.skipTransfers) : false,
      maxDistance: isSet(object.maxDistance) ? Number(object.maxDistance) : undefined,
      latitude: isSet(object.latitude) ? Number(object.latitude) : undefined,
      longitude: isSet(object.longitude) ? Number(object.longitude) : undefined,
    };
  },

  toJSON(message: ListStopsRequest): unknown {
    const obj: any = {};
    message.systemId !== undefined && (obj.systemId = message.systemId);
    message.searchMode !== undefined && (obj.searchMode = message.searchMode !== undefined
      ? listStopsRequest_SearchModeToJSON(message.searchMode)
      : undefined);
    message.onlyReturnSpecifiedIds !== undefined && (obj.onlyReturnSpecifiedIds = message.onlyReturnSpecifiedIds);
    if (message.id) {
      obj.id = message.id.map((e) => e);
    } else {
      obj.id = [];
    }
    message.firstId !== undefined && (obj.firstId = message.firstId);
    message.limit !== undefined && (obj.limit = Math.round(message.limit));
    message.skipStopTimes !== undefined && (obj.skipStopTimes = message.skipStopTimes);
    message.skipServiceMaps !== undefined && (obj.skipServiceMaps = message.skipServiceMaps);
    message.skipAlerts !== undefined && (obj.skipAlerts = message.skipAlerts);
    message.skipTransfers !== undefined && (obj.skipTransfers = message.skipTransfers);
    message.maxDistance !== undefined && (obj.maxDistance = message.maxDistance);
    message.latitude !== undefined && (obj.latitude = message.latitude);
    message.longitude !== undefined && (obj.longitude = message.longitude);
    return obj;
  },

  create<I extends Exact<DeepPartial<ListStopsRequest>, I>>(base?: I): ListStopsRequest {
    return ListStopsRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ListStopsRequest>, I>>(object: I): ListStopsRequest {
    const message = createBaseListStopsRequest();
    message.systemId = object.systemId ?? "";
    message.searchMode = object.searchMode ?? undefined;
    message.onlyReturnSpecifiedIds = object.onlyReturnSpecifiedIds ?? false;
    message.id = object.id?.map((e) => e) || [];
    message.firstId = object.firstId ?? undefined;
    message.limit = object.limit ?? undefined;
    message.skipStopTimes = object.skipStopTimes ?? false;
    message.skipServiceMaps = object.skipServiceMaps ?? false;
    message.skipAlerts = object.skipAlerts ?? false;
    message.skipTransfers = object.skipTransfers ?? false;
    message.maxDistance = object.maxDistance ?? undefined;
    message.latitude = object.latitude ?? undefined;
    message.longitude = object.longitude ?? undefined;
    return message;
  },
};

function createBaseListStopsReply(): ListStopsReply {
  return { stops: [], nextId: undefined };
}

export const ListStopsReply = {
  encode(message: ListStopsReply, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.stops) {
      Stop.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.nextId !== undefined) {
      writer.uint32(18).string(message.nextId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListStopsReply {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListStopsReply();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.stops.push(Stop.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.nextId = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ListStopsReply {
    return {
      stops: Array.isArray(object?.stops) ? object.stops.map((e: any) => Stop.fromJSON(e)) : [],
      nextId: isSet(object.nextId) ? String(object.nextId) : undefined,
    };
  },

  toJSON(message: ListStopsReply): unknown {
    const obj: any = {};
    if (message.stops) {
      obj.stops = message.stops.map((e) => e ? Stop.toJSON(e) : undefined);
    } else {
      obj.stops = [];
    }
    message.nextId !== undefined && (obj.nextId = message.nextId);
    return obj;
  },

  create<I extends Exact<DeepPartial<ListStopsReply>, I>>(base?: I): ListStopsReply {
    return ListStopsReply.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ListStopsReply>, I>>(object: I): ListStopsReply {
    const message = createBaseListStopsReply();
    message.stops = object.stops?.map((e) => Stop.fromPartial(e)) || [];
    message.nextId = object.nextId ?? undefined;
    return message;
  },
};

function createBaseGetStopRequest(): GetStopRequest {
  return {
    systemId: "",
    stopId: "",
    skipStopTimes: false,
    skipServiceMaps: false,
    skipAlerts: false,
    skipTransfers: false,
  };
}

export const GetStopRequest = {
  encode(message: GetStopRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.systemId !== "") {
      writer.uint32(10).string(message.systemId);
    }
    if (message.stopId !== "") {
      writer.uint32(18).string(message.stopId);
    }
    if (message.skipStopTimes === true) {
      writer.uint32(32).bool(message.skipStopTimes);
    }
    if (message.skipServiceMaps === true) {
      writer.uint32(40).bool(message.skipServiceMaps);
    }
    if (message.skipAlerts === true) {
      writer.uint32(48).bool(message.skipAlerts);
    }
    if (message.skipTransfers === true) {
      writer.uint32(56).bool(message.skipTransfers);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetStopRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetStopRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.systemId = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.stopId = reader.string();
          continue;
        case 4:
          if (tag != 32) {
            break;
          }

          message.skipStopTimes = reader.bool();
          continue;
        case 5:
          if (tag != 40) {
            break;
          }

          message.skipServiceMaps = reader.bool();
          continue;
        case 6:
          if (tag != 48) {
            break;
          }

          message.skipAlerts = reader.bool();
          continue;
        case 7:
          if (tag != 56) {
            break;
          }

          message.skipTransfers = reader.bool();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): GetStopRequest {
    return {
      systemId: isSet(object.systemId) ? String(object.systemId) : "",
      stopId: isSet(object.stopId) ? String(object.stopId) : "",
      skipStopTimes: isSet(object.skipStopTimes) ? Boolean(object.skipStopTimes) : false,
      skipServiceMaps: isSet(object.skipServiceMaps) ? Boolean(object.skipServiceMaps) : false,
      skipAlerts: isSet(object.skipAlerts) ? Boolean(object.skipAlerts) : false,
      skipTransfers: isSet(object.skipTransfers) ? Boolean(object.skipTransfers) : false,
    };
  },

  toJSON(message: GetStopRequest): unknown {
    const obj: any = {};
    message.systemId !== undefined && (obj.systemId = message.systemId);
    message.stopId !== undefined && (obj.stopId = message.stopId);
    message.skipStopTimes !== undefined && (obj.skipStopTimes = message.skipStopTimes);
    message.skipServiceMaps !== undefined && (obj.skipServiceMaps = message.skipServiceMaps);
    message.skipAlerts !== undefined && (obj.skipAlerts = message.skipAlerts);
    message.skipTransfers !== undefined && (obj.skipTransfers = message.skipTransfers);
    return obj;
  },

  create<I extends Exact<DeepPartial<GetStopRequest>, I>>(base?: I): GetStopRequest {
    return GetStopRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<GetStopRequest>, I>>(object: I): GetStopRequest {
    const message = createBaseGetStopRequest();
    message.systemId = object.systemId ?? "";
    message.stopId = object.stopId ?? "";
    message.skipStopTimes = object.skipStopTimes ?? false;
    message.skipServiceMaps = object.skipServiceMaps ?? false;
    message.skipAlerts = object.skipAlerts ?? false;
    message.skipTransfers = object.skipTransfers ?? false;
    return message;
  },
};

function createBaseListRoutesRequest(): ListRoutesRequest {
  return { systemId: "", skipEstimatedHeadways: false, skipServiceMaps: false, skipAlerts: false };
}

export const ListRoutesRequest = {
  encode(message: ListRoutesRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.systemId !== "") {
      writer.uint32(10).string(message.systemId);
    }
    if (message.skipEstimatedHeadways === true) {
      writer.uint32(16).bool(message.skipEstimatedHeadways);
    }
    if (message.skipServiceMaps === true) {
      writer.uint32(24).bool(message.skipServiceMaps);
    }
    if (message.skipAlerts === true) {
      writer.uint32(32).bool(message.skipAlerts);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListRoutesRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListRoutesRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.systemId = reader.string();
          continue;
        case 2:
          if (tag != 16) {
            break;
          }

          message.skipEstimatedHeadways = reader.bool();
          continue;
        case 3:
          if (tag != 24) {
            break;
          }

          message.skipServiceMaps = reader.bool();
          continue;
        case 4:
          if (tag != 32) {
            break;
          }

          message.skipAlerts = reader.bool();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ListRoutesRequest {
    return {
      systemId: isSet(object.systemId) ? String(object.systemId) : "",
      skipEstimatedHeadways: isSet(object.skipEstimatedHeadways) ? Boolean(object.skipEstimatedHeadways) : false,
      skipServiceMaps: isSet(object.skipServiceMaps) ? Boolean(object.skipServiceMaps) : false,
      skipAlerts: isSet(object.skipAlerts) ? Boolean(object.skipAlerts) : false,
    };
  },

  toJSON(message: ListRoutesRequest): unknown {
    const obj: any = {};
    message.systemId !== undefined && (obj.systemId = message.systemId);
    message.skipEstimatedHeadways !== undefined && (obj.skipEstimatedHeadways = message.skipEstimatedHeadways);
    message.skipServiceMaps !== undefined && (obj.skipServiceMaps = message.skipServiceMaps);
    message.skipAlerts !== undefined && (obj.skipAlerts = message.skipAlerts);
    return obj;
  },

  create<I extends Exact<DeepPartial<ListRoutesRequest>, I>>(base?: I): ListRoutesRequest {
    return ListRoutesRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ListRoutesRequest>, I>>(object: I): ListRoutesRequest {
    const message = createBaseListRoutesRequest();
    message.systemId = object.systemId ?? "";
    message.skipEstimatedHeadways = object.skipEstimatedHeadways ?? false;
    message.skipServiceMaps = object.skipServiceMaps ?? false;
    message.skipAlerts = object.skipAlerts ?? false;
    return message;
  },
};

function createBaseListRoutesReply(): ListRoutesReply {
  return { routes: [] };
}

export const ListRoutesReply = {
  encode(message: ListRoutesReply, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.routes) {
      Route.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListRoutesReply {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListRoutesReply();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.routes.push(Route.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ListRoutesReply {
    return { routes: Array.isArray(object?.routes) ? object.routes.map((e: any) => Route.fromJSON(e)) : [] };
  },

  toJSON(message: ListRoutesReply): unknown {
    const obj: any = {};
    if (message.routes) {
      obj.routes = message.routes.map((e) => e ? Route.toJSON(e) : undefined);
    } else {
      obj.routes = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<ListRoutesReply>, I>>(base?: I): ListRoutesReply {
    return ListRoutesReply.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ListRoutesReply>, I>>(object: I): ListRoutesReply {
    const message = createBaseListRoutesReply();
    message.routes = object.routes?.map((e) => Route.fromPartial(e)) || [];
    return message;
  },
};

function createBaseGetRouteRequest(): GetRouteRequest {
  return { systemId: "", routeId: "", skipEstimatedHeadways: false, skipServiceMaps: false, skipAlerts: false };
}

export const GetRouteRequest = {
  encode(message: GetRouteRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.systemId !== "") {
      writer.uint32(10).string(message.systemId);
    }
    if (message.routeId !== "") {
      writer.uint32(18).string(message.routeId);
    }
    if (message.skipEstimatedHeadways === true) {
      writer.uint32(24).bool(message.skipEstimatedHeadways);
    }
    if (message.skipServiceMaps === true) {
      writer.uint32(32).bool(message.skipServiceMaps);
    }
    if (message.skipAlerts === true) {
      writer.uint32(40).bool(message.skipAlerts);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetRouteRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetRouteRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.systemId = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.routeId = reader.string();
          continue;
        case 3:
          if (tag != 24) {
            break;
          }

          message.skipEstimatedHeadways = reader.bool();
          continue;
        case 4:
          if (tag != 32) {
            break;
          }

          message.skipServiceMaps = reader.bool();
          continue;
        case 5:
          if (tag != 40) {
            break;
          }

          message.skipAlerts = reader.bool();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): GetRouteRequest {
    return {
      systemId: isSet(object.systemId) ? String(object.systemId) : "",
      routeId: isSet(object.routeId) ? String(object.routeId) : "",
      skipEstimatedHeadways: isSet(object.skipEstimatedHeadways) ? Boolean(object.skipEstimatedHeadways) : false,
      skipServiceMaps: isSet(object.skipServiceMaps) ? Boolean(object.skipServiceMaps) : false,
      skipAlerts: isSet(object.skipAlerts) ? Boolean(object.skipAlerts) : false,
    };
  },

  toJSON(message: GetRouteRequest): unknown {
    const obj: any = {};
    message.systemId !== undefined && (obj.systemId = message.systemId);
    message.routeId !== undefined && (obj.routeId = message.routeId);
    message.skipEstimatedHeadways !== undefined && (obj.skipEstimatedHeadways = message.skipEstimatedHeadways);
    message.skipServiceMaps !== undefined && (obj.skipServiceMaps = message.skipServiceMaps);
    message.skipAlerts !== undefined && (obj.skipAlerts = message.skipAlerts);
    return obj;
  },

  create<I extends Exact<DeepPartial<GetRouteRequest>, I>>(base?: I): GetRouteRequest {
    return GetRouteRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<GetRouteRequest>, I>>(object: I): GetRouteRequest {
    const message = createBaseGetRouteRequest();
    message.systemId = object.systemId ?? "";
    message.routeId = object.routeId ?? "";
    message.skipEstimatedHeadways = object.skipEstimatedHeadways ?? false;
    message.skipServiceMaps = object.skipServiceMaps ?? false;
    message.skipAlerts = object.skipAlerts ?? false;
    return message;
  },
};

function createBaseListTripsRequest(): ListTripsRequest {
  return { systemId: "", routeId: "" };
}

export const ListTripsRequest = {
  encode(message: ListTripsRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.systemId !== "") {
      writer.uint32(10).string(message.systemId);
    }
    if (message.routeId !== "") {
      writer.uint32(18).string(message.routeId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListTripsRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListTripsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.systemId = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.routeId = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ListTripsRequest {
    return {
      systemId: isSet(object.systemId) ? String(object.systemId) : "",
      routeId: isSet(object.routeId) ? String(object.routeId) : "",
    };
  },

  toJSON(message: ListTripsRequest): unknown {
    const obj: any = {};
    message.systemId !== undefined && (obj.systemId = message.systemId);
    message.routeId !== undefined && (obj.routeId = message.routeId);
    return obj;
  },

  create<I extends Exact<DeepPartial<ListTripsRequest>, I>>(base?: I): ListTripsRequest {
    return ListTripsRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ListTripsRequest>, I>>(object: I): ListTripsRequest {
    const message = createBaseListTripsRequest();
    message.systemId = object.systemId ?? "";
    message.routeId = object.routeId ?? "";
    return message;
  },
};

function createBaseListTripsReply(): ListTripsReply {
  return { trips: [] };
}

export const ListTripsReply = {
  encode(message: ListTripsReply, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.trips) {
      Trip.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListTripsReply {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListTripsReply();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.trips.push(Trip.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ListTripsReply {
    return { trips: Array.isArray(object?.trips) ? object.trips.map((e: any) => Trip.fromJSON(e)) : [] };
  },

  toJSON(message: ListTripsReply): unknown {
    const obj: any = {};
    if (message.trips) {
      obj.trips = message.trips.map((e) => e ? Trip.toJSON(e) : undefined);
    } else {
      obj.trips = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<ListTripsReply>, I>>(base?: I): ListTripsReply {
    return ListTripsReply.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ListTripsReply>, I>>(object: I): ListTripsReply {
    const message = createBaseListTripsReply();
    message.trips = object.trips?.map((e) => Trip.fromPartial(e)) || [];
    return message;
  },
};

function createBaseListAlertsRequest(): ListAlertsRequest {
  return { systemId: "", alertId: [] };
}

export const ListAlertsRequest = {
  encode(message: ListAlertsRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.systemId !== "") {
      writer.uint32(10).string(message.systemId);
    }
    for (const v of message.alertId) {
      writer.uint32(18).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListAlertsRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListAlertsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.systemId = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.alertId.push(reader.string());
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ListAlertsRequest {
    return {
      systemId: isSet(object.systemId) ? String(object.systemId) : "",
      alertId: Array.isArray(object?.alertId) ? object.alertId.map((e: any) => String(e)) : [],
    };
  },

  toJSON(message: ListAlertsRequest): unknown {
    const obj: any = {};
    message.systemId !== undefined && (obj.systemId = message.systemId);
    if (message.alertId) {
      obj.alertId = message.alertId.map((e) => e);
    } else {
      obj.alertId = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<ListAlertsRequest>, I>>(base?: I): ListAlertsRequest {
    return ListAlertsRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ListAlertsRequest>, I>>(object: I): ListAlertsRequest {
    const message = createBaseListAlertsRequest();
    message.systemId = object.systemId ?? "";
    message.alertId = object.alertId?.map((e) => e) || [];
    return message;
  },
};

function createBaseListAlertsReply(): ListAlertsReply {
  return { alerts: [] };
}

export const ListAlertsReply = {
  encode(message: ListAlertsReply, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.alerts) {
      Alert.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListAlertsReply {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListAlertsReply();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.alerts.push(Alert.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ListAlertsReply {
    return { alerts: Array.isArray(object?.alerts) ? object.alerts.map((e: any) => Alert.fromJSON(e)) : [] };
  },

  toJSON(message: ListAlertsReply): unknown {
    const obj: any = {};
    if (message.alerts) {
      obj.alerts = message.alerts.map((e) => e ? Alert.toJSON(e) : undefined);
    } else {
      obj.alerts = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<ListAlertsReply>, I>>(base?: I): ListAlertsReply {
    return ListAlertsReply.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ListAlertsReply>, I>>(object: I): ListAlertsReply {
    const message = createBaseListAlertsReply();
    message.alerts = object.alerts?.map((e) => Alert.fromPartial(e)) || [];
    return message;
  },
};

function createBaseGetAlertRequest(): GetAlertRequest {
  return { systemId: "", alertId: "" };
}

export const GetAlertRequest = {
  encode(message: GetAlertRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.systemId !== "") {
      writer.uint32(10).string(message.systemId);
    }
    if (message.alertId !== "") {
      writer.uint32(18).string(message.alertId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetAlertRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetAlertRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.systemId = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.alertId = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): GetAlertRequest {
    return {
      systemId: isSet(object.systemId) ? String(object.systemId) : "",
      alertId: isSet(object.alertId) ? String(object.alertId) : "",
    };
  },

  toJSON(message: GetAlertRequest): unknown {
    const obj: any = {};
    message.systemId !== undefined && (obj.systemId = message.systemId);
    message.alertId !== undefined && (obj.alertId = message.alertId);
    return obj;
  },

  create<I extends Exact<DeepPartial<GetAlertRequest>, I>>(base?: I): GetAlertRequest {
    return GetAlertRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<GetAlertRequest>, I>>(object: I): GetAlertRequest {
    const message = createBaseGetAlertRequest();
    message.systemId = object.systemId ?? "";
    message.alertId = object.alertId ?? "";
    return message;
  },
};

function createBaseGetTripRequest(): GetTripRequest {
  return { systemId: "", routeId: "", tripId: "" };
}

export const GetTripRequest = {
  encode(message: GetTripRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.systemId !== "") {
      writer.uint32(10).string(message.systemId);
    }
    if (message.routeId !== "") {
      writer.uint32(18).string(message.routeId);
    }
    if (message.tripId !== "") {
      writer.uint32(26).string(message.tripId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetTripRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetTripRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.systemId = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.routeId = reader.string();
          continue;
        case 3:
          if (tag != 26) {
            break;
          }

          message.tripId = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): GetTripRequest {
    return {
      systemId: isSet(object.systemId) ? String(object.systemId) : "",
      routeId: isSet(object.routeId) ? String(object.routeId) : "",
      tripId: isSet(object.tripId) ? String(object.tripId) : "",
    };
  },

  toJSON(message: GetTripRequest): unknown {
    const obj: any = {};
    message.systemId !== undefined && (obj.systemId = message.systemId);
    message.routeId !== undefined && (obj.routeId = message.routeId);
    message.tripId !== undefined && (obj.tripId = message.tripId);
    return obj;
  },

  create<I extends Exact<DeepPartial<GetTripRequest>, I>>(base?: I): GetTripRequest {
    return GetTripRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<GetTripRequest>, I>>(object: I): GetTripRequest {
    const message = createBaseGetTripRequest();
    message.systemId = object.systemId ?? "";
    message.routeId = object.routeId ?? "";
    message.tripId = object.tripId ?? "";
    return message;
  },
};

function createBaseListFeedsRequest(): ListFeedsRequest {
  return { systemId: "" };
}

export const ListFeedsRequest = {
  encode(message: ListFeedsRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.systemId !== "") {
      writer.uint32(10).string(message.systemId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListFeedsRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListFeedsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.systemId = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ListFeedsRequest {
    return { systemId: isSet(object.systemId) ? String(object.systemId) : "" };
  },

  toJSON(message: ListFeedsRequest): unknown {
    const obj: any = {};
    message.systemId !== undefined && (obj.systemId = message.systemId);
    return obj;
  },

  create<I extends Exact<DeepPartial<ListFeedsRequest>, I>>(base?: I): ListFeedsRequest {
    return ListFeedsRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ListFeedsRequest>, I>>(object: I): ListFeedsRequest {
    const message = createBaseListFeedsRequest();
    message.systemId = object.systemId ?? "";
    return message;
  },
};

function createBaseListFeedsReply(): ListFeedsReply {
  return { feeds: [] };
}

export const ListFeedsReply = {
  encode(message: ListFeedsReply, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.feeds) {
      Feed.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListFeedsReply {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListFeedsReply();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.feeds.push(Feed.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ListFeedsReply {
    return { feeds: Array.isArray(object?.feeds) ? object.feeds.map((e: any) => Feed.fromJSON(e)) : [] };
  },

  toJSON(message: ListFeedsReply): unknown {
    const obj: any = {};
    if (message.feeds) {
      obj.feeds = message.feeds.map((e) => e ? Feed.toJSON(e) : undefined);
    } else {
      obj.feeds = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<ListFeedsReply>, I>>(base?: I): ListFeedsReply {
    return ListFeedsReply.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ListFeedsReply>, I>>(object: I): ListFeedsReply {
    const message = createBaseListFeedsReply();
    message.feeds = object.feeds?.map((e) => Feed.fromPartial(e)) || [];
    return message;
  },
};

function createBaseListFeedUpdatesRequest(): ListFeedUpdatesRequest {
  return { systemId: "", feedId: "" };
}

export const ListFeedUpdatesRequest = {
  encode(message: ListFeedUpdatesRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.systemId !== "") {
      writer.uint32(10).string(message.systemId);
    }
    if (message.feedId !== "") {
      writer.uint32(18).string(message.feedId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListFeedUpdatesRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListFeedUpdatesRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.systemId = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.feedId = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ListFeedUpdatesRequest {
    return {
      systemId: isSet(object.systemId) ? String(object.systemId) : "",
      feedId: isSet(object.feedId) ? String(object.feedId) : "",
    };
  },

  toJSON(message: ListFeedUpdatesRequest): unknown {
    const obj: any = {};
    message.systemId !== undefined && (obj.systemId = message.systemId);
    message.feedId !== undefined && (obj.feedId = message.feedId);
    return obj;
  },

  create<I extends Exact<DeepPartial<ListFeedUpdatesRequest>, I>>(base?: I): ListFeedUpdatesRequest {
    return ListFeedUpdatesRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ListFeedUpdatesRequest>, I>>(object: I): ListFeedUpdatesRequest {
    const message = createBaseListFeedUpdatesRequest();
    message.systemId = object.systemId ?? "";
    message.feedId = object.feedId ?? "";
    return message;
  },
};

function createBaseListFeedUpdatesReply(): ListFeedUpdatesReply {
  return { updates: [] };
}

export const ListFeedUpdatesReply = {
  encode(message: ListFeedUpdatesReply, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.updates) {
      FeedUpdate.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListFeedUpdatesReply {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListFeedUpdatesReply();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.updates.push(FeedUpdate.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ListFeedUpdatesReply {
    return { updates: Array.isArray(object?.updates) ? object.updates.map((e: any) => FeedUpdate.fromJSON(e)) : [] };
  },

  toJSON(message: ListFeedUpdatesReply): unknown {
    const obj: any = {};
    if (message.updates) {
      obj.updates = message.updates.map((e) => e ? FeedUpdate.toJSON(e) : undefined);
    } else {
      obj.updates = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<ListFeedUpdatesReply>, I>>(base?: I): ListFeedUpdatesReply {
    return ListFeedUpdatesReply.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ListFeedUpdatesReply>, I>>(object: I): ListFeedUpdatesReply {
    const message = createBaseListFeedUpdatesReply();
    message.updates = object.updates?.map((e) => FeedUpdate.fromPartial(e)) || [];
    return message;
  },
};

function createBaseGetFeedRequest(): GetFeedRequest {
  return { systemId: "", feedId: "" };
}

export const GetFeedRequest = {
  encode(message: GetFeedRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.systemId !== "") {
      writer.uint32(10).string(message.systemId);
    }
    if (message.feedId !== "") {
      writer.uint32(18).string(message.feedId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetFeedRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetFeedRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.systemId = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.feedId = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): GetFeedRequest {
    return {
      systemId: isSet(object.systemId) ? String(object.systemId) : "",
      feedId: isSet(object.feedId) ? String(object.feedId) : "",
    };
  },

  toJSON(message: GetFeedRequest): unknown {
    const obj: any = {};
    message.systemId !== undefined && (obj.systemId = message.systemId);
    message.feedId !== undefined && (obj.feedId = message.feedId);
    return obj;
  },

  create<I extends Exact<DeepPartial<GetFeedRequest>, I>>(base?: I): GetFeedRequest {
    return GetFeedRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<GetFeedRequest>, I>>(object: I): GetFeedRequest {
    const message = createBaseGetFeedRequest();
    message.systemId = object.systemId ?? "";
    message.feedId = object.feedId ?? "";
    return message;
  },
};

function createBaseListTransfersRequest(): ListTransfersRequest {
  return { systemId: "" };
}

export const ListTransfersRequest = {
  encode(message: ListTransfersRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.systemId !== "") {
      writer.uint32(10).string(message.systemId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListTransfersRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListTransfersRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.systemId = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ListTransfersRequest {
    return { systemId: isSet(object.systemId) ? String(object.systemId) : "" };
  },

  toJSON(message: ListTransfersRequest): unknown {
    const obj: any = {};
    message.systemId !== undefined && (obj.systemId = message.systemId);
    return obj;
  },

  create<I extends Exact<DeepPartial<ListTransfersRequest>, I>>(base?: I): ListTransfersRequest {
    return ListTransfersRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ListTransfersRequest>, I>>(object: I): ListTransfersRequest {
    const message = createBaseListTransfersRequest();
    message.systemId = object.systemId ?? "";
    return message;
  },
};

function createBaseListTransfersReply(): ListTransfersReply {
  return { transfers: [] };
}

export const ListTransfersReply = {
  encode(message: ListTransfersReply, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.transfers) {
      Transfer.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListTransfersReply {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListTransfersReply();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.transfers.push(Transfer.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ListTransfersReply {
    return {
      transfers: Array.isArray(object?.transfers) ? object.transfers.map((e: any) => Transfer.fromJSON(e)) : [],
    };
  },

  toJSON(message: ListTransfersReply): unknown {
    const obj: any = {};
    if (message.transfers) {
      obj.transfers = message.transfers.map((e) => e ? Transfer.toJSON(e) : undefined);
    } else {
      obj.transfers = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<ListTransfersReply>, I>>(base?: I): ListTransfersReply {
    return ListTransfersReply.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ListTransfersReply>, I>>(object: I): ListTransfersReply {
    const message = createBaseListTransfersReply();
    message.transfers = object.transfers?.map((e) => Transfer.fromPartial(e)) || [];
    return message;
  },
};

function createBaseSystem(): System {
  return {
    id: "",
    resource: undefined,
    name: "",
    status: 0,
    agencies: undefined,
    feeds: undefined,
    routes: undefined,
    stops: undefined,
    transfers: undefined,
  };
}

export const System = {
  encode(message: System, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.resource !== undefined) {
      Resource.encode(message.resource, writer.uint32(18).fork()).ldelim();
    }
    if (message.name !== "") {
      writer.uint32(34).string(message.name);
    }
    if (message.status !== 0) {
      writer.uint32(40).int32(message.status);
    }
    if (message.agencies !== undefined) {
      ChildResources.encode(message.agencies, writer.uint32(50).fork()).ldelim();
    }
    if (message.feeds !== undefined) {
      ChildResources.encode(message.feeds, writer.uint32(58).fork()).ldelim();
    }
    if (message.routes !== undefined) {
      ChildResources.encode(message.routes, writer.uint32(66).fork()).ldelim();
    }
    if (message.stops !== undefined) {
      ChildResources.encode(message.stops, writer.uint32(74).fork()).ldelim();
    }
    if (message.transfers !== undefined) {
      ChildResources.encode(message.transfers, writer.uint32(82).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): System {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSystem();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.resource = Resource.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag != 34) {
            break;
          }

          message.name = reader.string();
          continue;
        case 5:
          if (tag != 40) {
            break;
          }

          message.status = reader.int32() as any;
          continue;
        case 6:
          if (tag != 50) {
            break;
          }

          message.agencies = ChildResources.decode(reader, reader.uint32());
          continue;
        case 7:
          if (tag != 58) {
            break;
          }

          message.feeds = ChildResources.decode(reader, reader.uint32());
          continue;
        case 8:
          if (tag != 66) {
            break;
          }

          message.routes = ChildResources.decode(reader, reader.uint32());
          continue;
        case 9:
          if (tag != 74) {
            break;
          }

          message.stops = ChildResources.decode(reader, reader.uint32());
          continue;
        case 10:
          if (tag != 82) {
            break;
          }

          message.transfers = ChildResources.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): System {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      resource: isSet(object.resource) ? Resource.fromJSON(object.resource) : undefined,
      name: isSet(object.name) ? String(object.name) : "",
      status: isSet(object.status) ? system_StatusFromJSON(object.status) : 0,
      agencies: isSet(object.agencies) ? ChildResources.fromJSON(object.agencies) : undefined,
      feeds: isSet(object.feeds) ? ChildResources.fromJSON(object.feeds) : undefined,
      routes: isSet(object.routes) ? ChildResources.fromJSON(object.routes) : undefined,
      stops: isSet(object.stops) ? ChildResources.fromJSON(object.stops) : undefined,
      transfers: isSet(object.transfers) ? ChildResources.fromJSON(object.transfers) : undefined,
    };
  },

  toJSON(message: System): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.resource !== undefined && (obj.resource = message.resource ? Resource.toJSON(message.resource) : undefined);
    message.name !== undefined && (obj.name = message.name);
    message.status !== undefined && (obj.status = system_StatusToJSON(message.status));
    message.agencies !== undefined &&
      (obj.agencies = message.agencies ? ChildResources.toJSON(message.agencies) : undefined);
    message.feeds !== undefined && (obj.feeds = message.feeds ? ChildResources.toJSON(message.feeds) : undefined);
    message.routes !== undefined && (obj.routes = message.routes ? ChildResources.toJSON(message.routes) : undefined);
    message.stops !== undefined && (obj.stops = message.stops ? ChildResources.toJSON(message.stops) : undefined);
    message.transfers !== undefined &&
      (obj.transfers = message.transfers ? ChildResources.toJSON(message.transfers) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<System>, I>>(base?: I): System {
    return System.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<System>, I>>(object: I): System {
    const message = createBaseSystem();
    message.id = object.id ?? "";
    message.resource = (object.resource !== undefined && object.resource !== null)
      ? Resource.fromPartial(object.resource)
      : undefined;
    message.name = object.name ?? "";
    message.status = object.status ?? 0;
    message.agencies = (object.agencies !== undefined && object.agencies !== null)
      ? ChildResources.fromPartial(object.agencies)
      : undefined;
    message.feeds = (object.feeds !== undefined && object.feeds !== null)
      ? ChildResources.fromPartial(object.feeds)
      : undefined;
    message.routes = (object.routes !== undefined && object.routes !== null)
      ? ChildResources.fromPartial(object.routes)
      : undefined;
    message.stops = (object.stops !== undefined && object.stops !== null)
      ? ChildResources.fromPartial(object.stops)
      : undefined;
    message.transfers = (object.transfers !== undefined && object.transfers !== null)
      ? ChildResources.fromPartial(object.transfers)
      : undefined;
    return message;
  },
};

function createBaseSystem_Reference(): System_Reference {
  return { id: "", resource: undefined };
}

export const System_Reference = {
  encode(message: System_Reference, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.resource !== undefined) {
      Resource.encode(message.resource, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): System_Reference {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSystem_Reference();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.resource = Resource.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): System_Reference {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      resource: isSet(object.resource) ? Resource.fromJSON(object.resource) : undefined,
    };
  },

  toJSON(message: System_Reference): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.resource !== undefined && (obj.resource = message.resource ? Resource.toJSON(message.resource) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<System_Reference>, I>>(base?: I): System_Reference {
    return System_Reference.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<System_Reference>, I>>(object: I): System_Reference {
    const message = createBaseSystem_Reference();
    message.id = object.id ?? "";
    message.resource = (object.resource !== undefined && object.resource !== null)
      ? Resource.fromPartial(object.resource)
      : undefined;
    return message;
  },
};

function createBaseResource(): Resource {
  return { path: "", href: undefined };
}

export const Resource = {
  encode(message: Resource, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.path !== "") {
      writer.uint32(10).string(message.path);
    }
    if (message.href !== undefined) {
      writer.uint32(18).string(message.href);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Resource {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResource();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.path = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.href = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Resource {
    return {
      path: isSet(object.path) ? String(object.path) : "",
      href: isSet(object.href) ? String(object.href) : undefined,
    };
  },

  toJSON(message: Resource): unknown {
    const obj: any = {};
    message.path !== undefined && (obj.path = message.path);
    message.href !== undefined && (obj.href = message.href);
    return obj;
  },

  create<I extends Exact<DeepPartial<Resource>, I>>(base?: I): Resource {
    return Resource.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Resource>, I>>(object: I): Resource {
    const message = createBaseResource();
    message.path = object.path ?? "";
    message.href = object.href ?? undefined;
    return message;
  },
};

function createBaseChildResources(): ChildResources {
  return { count: 0, href: undefined };
}

export const ChildResources = {
  encode(message: ChildResources, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.count !== 0) {
      writer.uint32(8).int64(message.count);
    }
    if (message.href !== undefined) {
      writer.uint32(18).string(message.href);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ChildResources {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseChildResources();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 8) {
            break;
          }

          message.count = longToNumber(reader.int64() as Long);
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.href = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ChildResources {
    return {
      count: isSet(object.count) ? Number(object.count) : 0,
      href: isSet(object.href) ? String(object.href) : undefined,
    };
  },

  toJSON(message: ChildResources): unknown {
    const obj: any = {};
    message.count !== undefined && (obj.count = Math.round(message.count));
    message.href !== undefined && (obj.href = message.href);
    return obj;
  },

  create<I extends Exact<DeepPartial<ChildResources>, I>>(base?: I): ChildResources {
    return ChildResources.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ChildResources>, I>>(object: I): ChildResources {
    const message = createBaseChildResources();
    message.count = object.count ?? 0;
    message.href = object.href ?? undefined;
    return message;
  },
};

function createBaseStop(): Stop {
  return {
    id: "",
    resource: undefined,
    system: undefined,
    code: undefined,
    name: undefined,
    description: undefined,
    zoneId: undefined,
    latitude: undefined,
    longitude: undefined,
    url: undefined,
    type: 0,
    parentStop: undefined,
    childStops: [],
    timezone: undefined,
    wheelchairBoarding: undefined,
    platformCode: undefined,
    serviceMaps: [],
    alerts: [],
    stopTimes: [],
    transfers: [],
    headsignRules: [],
  };
}

export const Stop = {
  encode(message: Stop, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.resource !== undefined) {
      Resource.encode(message.resource, writer.uint32(18).fork()).ldelim();
    }
    if (message.system !== undefined) {
      System_Reference.encode(message.system, writer.uint32(26).fork()).ldelim();
    }
    if (message.code !== undefined) {
      writer.uint32(34).string(message.code);
    }
    if (message.name !== undefined) {
      writer.uint32(42).string(message.name);
    }
    if (message.description !== undefined) {
      writer.uint32(50).string(message.description);
    }
    if (message.zoneId !== undefined) {
      writer.uint32(58).string(message.zoneId);
    }
    if (message.latitude !== undefined) {
      writer.uint32(65).double(message.latitude);
    }
    if (message.longitude !== undefined) {
      writer.uint32(73).double(message.longitude);
    }
    if (message.url !== undefined) {
      writer.uint32(82).string(message.url);
    }
    if (message.type !== 0) {
      writer.uint32(88).int32(message.type);
    }
    if (message.parentStop !== undefined) {
      Stop_Reference.encode(message.parentStop, writer.uint32(98).fork()).ldelim();
    }
    for (const v of message.childStops) {
      Stop_Reference.encode(v!, writer.uint32(106).fork()).ldelim();
    }
    if (message.timezone !== undefined) {
      writer.uint32(114).string(message.timezone);
    }
    if (message.wheelchairBoarding !== undefined) {
      writer.uint32(120).bool(message.wheelchairBoarding);
    }
    if (message.platformCode !== undefined) {
      writer.uint32(130).string(message.platformCode);
    }
    for (const v of message.serviceMaps) {
      Stop_ServiceMap.encode(v!, writer.uint32(138).fork()).ldelim();
    }
    for (const v of message.alerts) {
      Alert_Reference.encode(v!, writer.uint32(146).fork()).ldelim();
    }
    for (const v of message.stopTimes) {
      StopTime.encode(v!, writer.uint32(154).fork()).ldelim();
    }
    for (const v of message.transfers) {
      Transfer.encode(v!, writer.uint32(162).fork()).ldelim();
    }
    for (const v of message.headsignRules) {
      Stop_HeadsignRule.encode(v!, writer.uint32(170).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Stop {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStop();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.resource = Resource.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag != 26) {
            break;
          }

          message.system = System_Reference.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag != 34) {
            break;
          }

          message.code = reader.string();
          continue;
        case 5:
          if (tag != 42) {
            break;
          }

          message.name = reader.string();
          continue;
        case 6:
          if (tag != 50) {
            break;
          }

          message.description = reader.string();
          continue;
        case 7:
          if (tag != 58) {
            break;
          }

          message.zoneId = reader.string();
          continue;
        case 8:
          if (tag != 65) {
            break;
          }

          message.latitude = reader.double();
          continue;
        case 9:
          if (tag != 73) {
            break;
          }

          message.longitude = reader.double();
          continue;
        case 10:
          if (tag != 82) {
            break;
          }

          message.url = reader.string();
          continue;
        case 11:
          if (tag != 88) {
            break;
          }

          message.type = reader.int32() as any;
          continue;
        case 12:
          if (tag != 98) {
            break;
          }

          message.parentStop = Stop_Reference.decode(reader, reader.uint32());
          continue;
        case 13:
          if (tag != 106) {
            break;
          }

          message.childStops.push(Stop_Reference.decode(reader, reader.uint32()));
          continue;
        case 14:
          if (tag != 114) {
            break;
          }

          message.timezone = reader.string();
          continue;
        case 15:
          if (tag != 120) {
            break;
          }

          message.wheelchairBoarding = reader.bool();
          continue;
        case 16:
          if (tag != 130) {
            break;
          }

          message.platformCode = reader.string();
          continue;
        case 17:
          if (tag != 138) {
            break;
          }

          message.serviceMaps.push(Stop_ServiceMap.decode(reader, reader.uint32()));
          continue;
        case 18:
          if (tag != 146) {
            break;
          }

          message.alerts.push(Alert_Reference.decode(reader, reader.uint32()));
          continue;
        case 19:
          if (tag != 154) {
            break;
          }

          message.stopTimes.push(StopTime.decode(reader, reader.uint32()));
          continue;
        case 20:
          if (tag != 162) {
            break;
          }

          message.transfers.push(Transfer.decode(reader, reader.uint32()));
          continue;
        case 21:
          if (tag != 170) {
            break;
          }

          message.headsignRules.push(Stop_HeadsignRule.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Stop {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      resource: isSet(object.resource) ? Resource.fromJSON(object.resource) : undefined,
      system: isSet(object.system) ? System_Reference.fromJSON(object.system) : undefined,
      code: isSet(object.code) ? String(object.code) : undefined,
      name: isSet(object.name) ? String(object.name) : undefined,
      description: isSet(object.description) ? String(object.description) : undefined,
      zoneId: isSet(object.zoneId) ? String(object.zoneId) : undefined,
      latitude: isSet(object.latitude) ? Number(object.latitude) : undefined,
      longitude: isSet(object.longitude) ? Number(object.longitude) : undefined,
      url: isSet(object.url) ? String(object.url) : undefined,
      type: isSet(object.type) ? stop_TypeFromJSON(object.type) : 0,
      parentStop: isSet(object.parentStop) ? Stop_Reference.fromJSON(object.parentStop) : undefined,
      childStops: Array.isArray(object?.childStops)
        ? object.childStops.map((e: any) => Stop_Reference.fromJSON(e))
        : [],
      timezone: isSet(object.timezone) ? String(object.timezone) : undefined,
      wheelchairBoarding: isSet(object.wheelchairBoarding) ? Boolean(object.wheelchairBoarding) : undefined,
      platformCode: isSet(object.platformCode) ? String(object.platformCode) : undefined,
      serviceMaps: Array.isArray(object?.serviceMaps)
        ? object.serviceMaps.map((e: any) => Stop_ServiceMap.fromJSON(e))
        : [],
      alerts: Array.isArray(object?.alerts) ? object.alerts.map((e: any) => Alert_Reference.fromJSON(e)) : [],
      stopTimes: Array.isArray(object?.stopTimes) ? object.stopTimes.map((e: any) => StopTime.fromJSON(e)) : [],
      transfers: Array.isArray(object?.transfers) ? object.transfers.map((e: any) => Transfer.fromJSON(e)) : [],
      headsignRules: Array.isArray(object?.headsignRules)
        ? object.headsignRules.map((e: any) => Stop_HeadsignRule.fromJSON(e))
        : [],
    };
  },

  toJSON(message: Stop): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.resource !== undefined && (obj.resource = message.resource ? Resource.toJSON(message.resource) : undefined);
    message.system !== undefined && (obj.system = message.system ? System_Reference.toJSON(message.system) : undefined);
    message.code !== undefined && (obj.code = message.code);
    message.name !== undefined && (obj.name = message.name);
    message.description !== undefined && (obj.description = message.description);
    message.zoneId !== undefined && (obj.zoneId = message.zoneId);
    message.latitude !== undefined && (obj.latitude = message.latitude);
    message.longitude !== undefined && (obj.longitude = message.longitude);
    message.url !== undefined && (obj.url = message.url);
    message.type !== undefined && (obj.type = stop_TypeToJSON(message.type));
    message.parentStop !== undefined &&
      (obj.parentStop = message.parentStop ? Stop_Reference.toJSON(message.parentStop) : undefined);
    if (message.childStops) {
      obj.childStops = message.childStops.map((e) => e ? Stop_Reference.toJSON(e) : undefined);
    } else {
      obj.childStops = [];
    }
    message.timezone !== undefined && (obj.timezone = message.timezone);
    message.wheelchairBoarding !== undefined && (obj.wheelchairBoarding = message.wheelchairBoarding);
    message.platformCode !== undefined && (obj.platformCode = message.platformCode);
    if (message.serviceMaps) {
      obj.serviceMaps = message.serviceMaps.map((e) => e ? Stop_ServiceMap.toJSON(e) : undefined);
    } else {
      obj.serviceMaps = [];
    }
    if (message.alerts) {
      obj.alerts = message.alerts.map((e) => e ? Alert_Reference.toJSON(e) : undefined);
    } else {
      obj.alerts = [];
    }
    if (message.stopTimes) {
      obj.stopTimes = message.stopTimes.map((e) => e ? StopTime.toJSON(e) : undefined);
    } else {
      obj.stopTimes = [];
    }
    if (message.transfers) {
      obj.transfers = message.transfers.map((e) => e ? Transfer.toJSON(e) : undefined);
    } else {
      obj.transfers = [];
    }
    if (message.headsignRules) {
      obj.headsignRules = message.headsignRules.map((e) => e ? Stop_HeadsignRule.toJSON(e) : undefined);
    } else {
      obj.headsignRules = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Stop>, I>>(base?: I): Stop {
    return Stop.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Stop>, I>>(object: I): Stop {
    const message = createBaseStop();
    message.id = object.id ?? "";
    message.resource = (object.resource !== undefined && object.resource !== null)
      ? Resource.fromPartial(object.resource)
      : undefined;
    message.system = (object.system !== undefined && object.system !== null)
      ? System_Reference.fromPartial(object.system)
      : undefined;
    message.code = object.code ?? undefined;
    message.name = object.name ?? undefined;
    message.description = object.description ?? undefined;
    message.zoneId = object.zoneId ?? undefined;
    message.latitude = object.latitude ?? undefined;
    message.longitude = object.longitude ?? undefined;
    message.url = object.url ?? undefined;
    message.type = object.type ?? 0;
    message.parentStop = (object.parentStop !== undefined && object.parentStop !== null)
      ? Stop_Reference.fromPartial(object.parentStop)
      : undefined;
    message.childStops = object.childStops?.map((e) => Stop_Reference.fromPartial(e)) || [];
    message.timezone = object.timezone ?? undefined;
    message.wheelchairBoarding = object.wheelchairBoarding ?? undefined;
    message.platformCode = object.platformCode ?? undefined;
    message.serviceMaps = object.serviceMaps?.map((e) => Stop_ServiceMap.fromPartial(e)) || [];
    message.alerts = object.alerts?.map((e) => Alert_Reference.fromPartial(e)) || [];
    message.stopTimes = object.stopTimes?.map((e) => StopTime.fromPartial(e)) || [];
    message.transfers = object.transfers?.map((e) => Transfer.fromPartial(e)) || [];
    message.headsignRules = object.headsignRules?.map((e) => Stop_HeadsignRule.fromPartial(e)) || [];
    return message;
  },
};

function createBaseStop_ServiceMap(): Stop_ServiceMap {
  return { configId: "", routes: [] };
}

export const Stop_ServiceMap = {
  encode(message: Stop_ServiceMap, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.configId !== "") {
      writer.uint32(10).string(message.configId);
    }
    for (const v of message.routes) {
      Route_Reference.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Stop_ServiceMap {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStop_ServiceMap();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.configId = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.routes.push(Route_Reference.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Stop_ServiceMap {
    return {
      configId: isSet(object.configId) ? String(object.configId) : "",
      routes: Array.isArray(object?.routes) ? object.routes.map((e: any) => Route_Reference.fromJSON(e)) : [],
    };
  },

  toJSON(message: Stop_ServiceMap): unknown {
    const obj: any = {};
    message.configId !== undefined && (obj.configId = message.configId);
    if (message.routes) {
      obj.routes = message.routes.map((e) => e ? Route_Reference.toJSON(e) : undefined);
    } else {
      obj.routes = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Stop_ServiceMap>, I>>(base?: I): Stop_ServiceMap {
    return Stop_ServiceMap.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Stop_ServiceMap>, I>>(object: I): Stop_ServiceMap {
    const message = createBaseStop_ServiceMap();
    message.configId = object.configId ?? "";
    message.routes = object.routes?.map((e) => Route_Reference.fromPartial(e)) || [];
    return message;
  },
};

function createBaseStop_HeadsignRule(): Stop_HeadsignRule {
  return { stop: undefined, priority: 0, track: undefined, headsign: "" };
}

export const Stop_HeadsignRule = {
  encode(message: Stop_HeadsignRule, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.stop !== undefined) {
      Stop_Reference.encode(message.stop, writer.uint32(10).fork()).ldelim();
    }
    if (message.priority !== 0) {
      writer.uint32(16).int32(message.priority);
    }
    if (message.track !== undefined) {
      writer.uint32(26).string(message.track);
    }
    if (message.headsign !== "") {
      writer.uint32(34).string(message.headsign);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Stop_HeadsignRule {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStop_HeadsignRule();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.stop = Stop_Reference.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag != 16) {
            break;
          }

          message.priority = reader.int32();
          continue;
        case 3:
          if (tag != 26) {
            break;
          }

          message.track = reader.string();
          continue;
        case 4:
          if (tag != 34) {
            break;
          }

          message.headsign = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Stop_HeadsignRule {
    return {
      stop: isSet(object.stop) ? Stop_Reference.fromJSON(object.stop) : undefined,
      priority: isSet(object.priority) ? Number(object.priority) : 0,
      track: isSet(object.track) ? String(object.track) : undefined,
      headsign: isSet(object.headsign) ? String(object.headsign) : "",
    };
  },

  toJSON(message: Stop_HeadsignRule): unknown {
    const obj: any = {};
    message.stop !== undefined && (obj.stop = message.stop ? Stop_Reference.toJSON(message.stop) : undefined);
    message.priority !== undefined && (obj.priority = Math.round(message.priority));
    message.track !== undefined && (obj.track = message.track);
    message.headsign !== undefined && (obj.headsign = message.headsign);
    return obj;
  },

  create<I extends Exact<DeepPartial<Stop_HeadsignRule>, I>>(base?: I): Stop_HeadsignRule {
    return Stop_HeadsignRule.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Stop_HeadsignRule>, I>>(object: I): Stop_HeadsignRule {
    const message = createBaseStop_HeadsignRule();
    message.stop = (object.stop !== undefined && object.stop !== null)
      ? Stop_Reference.fromPartial(object.stop)
      : undefined;
    message.priority = object.priority ?? 0;
    message.track = object.track ?? undefined;
    message.headsign = object.headsign ?? "";
    return message;
  },
};

function createBaseStop_Reference(): Stop_Reference {
  return { id: "", resource: undefined, system: undefined, name: undefined };
}

export const Stop_Reference = {
  encode(message: Stop_Reference, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.resource !== undefined) {
      Resource.encode(message.resource, writer.uint32(18).fork()).ldelim();
    }
    if (message.system !== undefined) {
      System_Reference.encode(message.system, writer.uint32(26).fork()).ldelim();
    }
    if (message.name !== undefined) {
      writer.uint32(34).string(message.name);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Stop_Reference {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStop_Reference();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.resource = Resource.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag != 26) {
            break;
          }

          message.system = System_Reference.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag != 34) {
            break;
          }

          message.name = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Stop_Reference {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      resource: isSet(object.resource) ? Resource.fromJSON(object.resource) : undefined,
      system: isSet(object.system) ? System_Reference.fromJSON(object.system) : undefined,
      name: isSet(object.name) ? String(object.name) : undefined,
    };
  },

  toJSON(message: Stop_Reference): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.resource !== undefined && (obj.resource = message.resource ? Resource.toJSON(message.resource) : undefined);
    message.system !== undefined && (obj.system = message.system ? System_Reference.toJSON(message.system) : undefined);
    message.name !== undefined && (obj.name = message.name);
    return obj;
  },

  create<I extends Exact<DeepPartial<Stop_Reference>, I>>(base?: I): Stop_Reference {
    return Stop_Reference.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Stop_Reference>, I>>(object: I): Stop_Reference {
    const message = createBaseStop_Reference();
    message.id = object.id ?? "";
    message.resource = (object.resource !== undefined && object.resource !== null)
      ? Resource.fromPartial(object.resource)
      : undefined;
    message.system = (object.system !== undefined && object.system !== null)
      ? System_Reference.fromPartial(object.system)
      : undefined;
    message.name = object.name ?? undefined;
    return message;
  },
};

function createBaseStopTime(): StopTime {
  return {
    stop: undefined,
    trip: undefined,
    arrival: undefined,
    departure: undefined,
    future: false,
    stopSequence: 0,
    headsign: undefined,
    track: undefined,
  };
}

export const StopTime = {
  encode(message: StopTime, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.stop !== undefined) {
      Stop_Reference.encode(message.stop, writer.uint32(10).fork()).ldelim();
    }
    if (message.trip !== undefined) {
      Trip_Reference.encode(message.trip, writer.uint32(18).fork()).ldelim();
    }
    if (message.arrival !== undefined) {
      StopTime_EstimatedTime.encode(message.arrival, writer.uint32(26).fork()).ldelim();
    }
    if (message.departure !== undefined) {
      StopTime_EstimatedTime.encode(message.departure, writer.uint32(34).fork()).ldelim();
    }
    if (message.future === true) {
      writer.uint32(40).bool(message.future);
    }
    if (message.stopSequence !== 0) {
      writer.uint32(48).int32(message.stopSequence);
    }
    if (message.headsign !== undefined) {
      writer.uint32(58).string(message.headsign);
    }
    if (message.track !== undefined) {
      writer.uint32(66).string(message.track);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StopTime {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStopTime();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.stop = Stop_Reference.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.trip = Trip_Reference.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag != 26) {
            break;
          }

          message.arrival = StopTime_EstimatedTime.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag != 34) {
            break;
          }

          message.departure = StopTime_EstimatedTime.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag != 40) {
            break;
          }

          message.future = reader.bool();
          continue;
        case 6:
          if (tag != 48) {
            break;
          }

          message.stopSequence = reader.int32();
          continue;
        case 7:
          if (tag != 58) {
            break;
          }

          message.headsign = reader.string();
          continue;
        case 8:
          if (tag != 66) {
            break;
          }

          message.track = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): StopTime {
    return {
      stop: isSet(object.stop) ? Stop_Reference.fromJSON(object.stop) : undefined,
      trip: isSet(object.trip) ? Trip_Reference.fromJSON(object.trip) : undefined,
      arrival: isSet(object.arrival) ? StopTime_EstimatedTime.fromJSON(object.arrival) : undefined,
      departure: isSet(object.departure) ? StopTime_EstimatedTime.fromJSON(object.departure) : undefined,
      future: isSet(object.future) ? Boolean(object.future) : false,
      stopSequence: isSet(object.stopSequence) ? Number(object.stopSequence) : 0,
      headsign: isSet(object.headsign) ? String(object.headsign) : undefined,
      track: isSet(object.track) ? String(object.track) : undefined,
    };
  },

  toJSON(message: StopTime): unknown {
    const obj: any = {};
    message.stop !== undefined && (obj.stop = message.stop ? Stop_Reference.toJSON(message.stop) : undefined);
    message.trip !== undefined && (obj.trip = message.trip ? Trip_Reference.toJSON(message.trip) : undefined);
    message.arrival !== undefined &&
      (obj.arrival = message.arrival ? StopTime_EstimatedTime.toJSON(message.arrival) : undefined);
    message.departure !== undefined &&
      (obj.departure = message.departure ? StopTime_EstimatedTime.toJSON(message.departure) : undefined);
    message.future !== undefined && (obj.future = message.future);
    message.stopSequence !== undefined && (obj.stopSequence = Math.round(message.stopSequence));
    message.headsign !== undefined && (obj.headsign = message.headsign);
    message.track !== undefined && (obj.track = message.track);
    return obj;
  },

  create<I extends Exact<DeepPartial<StopTime>, I>>(base?: I): StopTime {
    return StopTime.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<StopTime>, I>>(object: I): StopTime {
    const message = createBaseStopTime();
    message.stop = (object.stop !== undefined && object.stop !== null)
      ? Stop_Reference.fromPartial(object.stop)
      : undefined;
    message.trip = (object.trip !== undefined && object.trip !== null)
      ? Trip_Reference.fromPartial(object.trip)
      : undefined;
    message.arrival = (object.arrival !== undefined && object.arrival !== null)
      ? StopTime_EstimatedTime.fromPartial(object.arrival)
      : undefined;
    message.departure = (object.departure !== undefined && object.departure !== null)
      ? StopTime_EstimatedTime.fromPartial(object.departure)
      : undefined;
    message.future = object.future ?? false;
    message.stopSequence = object.stopSequence ?? 0;
    message.headsign = object.headsign ?? undefined;
    message.track = object.track ?? undefined;
    return message;
  },
};

function createBaseStopTime_EstimatedTime(): StopTime_EstimatedTime {
  return { time: undefined, delay: undefined, uncertainty: undefined };
}

export const StopTime_EstimatedTime = {
  encode(message: StopTime_EstimatedTime, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.time !== undefined) {
      writer.uint32(8).int64(message.time);
    }
    if (message.delay !== undefined) {
      writer.uint32(16).int32(message.delay);
    }
    if (message.uncertainty !== undefined) {
      writer.uint32(24).int32(message.uncertainty);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StopTime_EstimatedTime {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStopTime_EstimatedTime();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 8) {
            break;
          }

          message.time = longToNumber(reader.int64() as Long);
          continue;
        case 2:
          if (tag != 16) {
            break;
          }

          message.delay = reader.int32();
          continue;
        case 3:
          if (tag != 24) {
            break;
          }

          message.uncertainty = reader.int32();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): StopTime_EstimatedTime {
    return {
      time: isSet(object.time) ? Number(object.time) : undefined,
      delay: isSet(object.delay) ? Number(object.delay) : undefined,
      uncertainty: isSet(object.uncertainty) ? Number(object.uncertainty) : undefined,
    };
  },

  toJSON(message: StopTime_EstimatedTime): unknown {
    const obj: any = {};
    message.time !== undefined && (obj.time = Math.round(message.time));
    message.delay !== undefined && (obj.delay = Math.round(message.delay));
    message.uncertainty !== undefined && (obj.uncertainty = Math.round(message.uncertainty));
    return obj;
  },

  create<I extends Exact<DeepPartial<StopTime_EstimatedTime>, I>>(base?: I): StopTime_EstimatedTime {
    return StopTime_EstimatedTime.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<StopTime_EstimatedTime>, I>>(object: I): StopTime_EstimatedTime {
    const message = createBaseStopTime_EstimatedTime();
    message.time = object.time ?? undefined;
    message.delay = object.delay ?? undefined;
    message.uncertainty = object.uncertainty ?? undefined;
    return message;
  },
};

function createBaseTrip(): Trip {
  return {
    id: "",
    resource: undefined,
    route: undefined,
    startedAt: undefined,
    vehicle: undefined,
    directionId: false,
    stopTimes: [],
  };
}

export const Trip = {
  encode(message: Trip, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.resource !== undefined) {
      Resource.encode(message.resource, writer.uint32(18).fork()).ldelim();
    }
    if (message.route !== undefined) {
      Route_Reference.encode(message.route, writer.uint32(26).fork()).ldelim();
    }
    if (message.startedAt !== undefined) {
      writer.uint32(32).int64(message.startedAt);
    }
    if (message.vehicle !== undefined) {
      Vehicle_Reference.encode(message.vehicle, writer.uint32(42).fork()).ldelim();
    }
    if (message.directionId === true) {
      writer.uint32(48).bool(message.directionId);
    }
    for (const v of message.stopTimes) {
      StopTime.encode(v!, writer.uint32(58).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Trip {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTrip();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.resource = Resource.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag != 26) {
            break;
          }

          message.route = Route_Reference.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag != 32) {
            break;
          }

          message.startedAt = longToNumber(reader.int64() as Long);
          continue;
        case 5:
          if (tag != 42) {
            break;
          }

          message.vehicle = Vehicle_Reference.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag != 48) {
            break;
          }

          message.directionId = reader.bool();
          continue;
        case 7:
          if (tag != 58) {
            break;
          }

          message.stopTimes.push(StopTime.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Trip {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      resource: isSet(object.resource) ? Resource.fromJSON(object.resource) : undefined,
      route: isSet(object.route) ? Route_Reference.fromJSON(object.route) : undefined,
      startedAt: isSet(object.startedAt) ? Number(object.startedAt) : undefined,
      vehicle: isSet(object.vehicle) ? Vehicle_Reference.fromJSON(object.vehicle) : undefined,
      directionId: isSet(object.directionId) ? Boolean(object.directionId) : false,
      stopTimes: Array.isArray(object?.stopTimes) ? object.stopTimes.map((e: any) => StopTime.fromJSON(e)) : [],
    };
  },

  toJSON(message: Trip): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.resource !== undefined && (obj.resource = message.resource ? Resource.toJSON(message.resource) : undefined);
    message.route !== undefined && (obj.route = message.route ? Route_Reference.toJSON(message.route) : undefined);
    message.startedAt !== undefined && (obj.startedAt = Math.round(message.startedAt));
    message.vehicle !== undefined &&
      (obj.vehicle = message.vehicle ? Vehicle_Reference.toJSON(message.vehicle) : undefined);
    message.directionId !== undefined && (obj.directionId = message.directionId);
    if (message.stopTimes) {
      obj.stopTimes = message.stopTimes.map((e) => e ? StopTime.toJSON(e) : undefined);
    } else {
      obj.stopTimes = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Trip>, I>>(base?: I): Trip {
    return Trip.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Trip>, I>>(object: I): Trip {
    const message = createBaseTrip();
    message.id = object.id ?? "";
    message.resource = (object.resource !== undefined && object.resource !== null)
      ? Resource.fromPartial(object.resource)
      : undefined;
    message.route = (object.route !== undefined && object.route !== null)
      ? Route_Reference.fromPartial(object.route)
      : undefined;
    message.startedAt = object.startedAt ?? undefined;
    message.vehicle = (object.vehicle !== undefined && object.vehicle !== null)
      ? Vehicle_Reference.fromPartial(object.vehicle)
      : undefined;
    message.directionId = object.directionId ?? false;
    message.stopTimes = object.stopTimes?.map((e) => StopTime.fromPartial(e)) || [];
    return message;
  },
};

function createBaseTrip_Reference(): Trip_Reference {
  return {
    id: "",
    resource: undefined,
    route: undefined,
    destination: undefined,
    vehicle: undefined,
    directionId: false,
  };
}

export const Trip_Reference = {
  encode(message: Trip_Reference, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.resource !== undefined) {
      Resource.encode(message.resource, writer.uint32(18).fork()).ldelim();
    }
    if (message.route !== undefined) {
      Route_Reference.encode(message.route, writer.uint32(26).fork()).ldelim();
    }
    if (message.destination !== undefined) {
      Stop_Reference.encode(message.destination, writer.uint32(34).fork()).ldelim();
    }
    if (message.vehicle !== undefined) {
      Vehicle_Reference.encode(message.vehicle, writer.uint32(42).fork()).ldelim();
    }
    if (message.directionId === true) {
      writer.uint32(48).bool(message.directionId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Trip_Reference {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTrip_Reference();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.resource = Resource.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag != 26) {
            break;
          }

          message.route = Route_Reference.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag != 34) {
            break;
          }

          message.destination = Stop_Reference.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag != 42) {
            break;
          }

          message.vehicle = Vehicle_Reference.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag != 48) {
            break;
          }

          message.directionId = reader.bool();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Trip_Reference {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      resource: isSet(object.resource) ? Resource.fromJSON(object.resource) : undefined,
      route: isSet(object.route) ? Route_Reference.fromJSON(object.route) : undefined,
      destination: isSet(object.destination) ? Stop_Reference.fromJSON(object.destination) : undefined,
      vehicle: isSet(object.vehicle) ? Vehicle_Reference.fromJSON(object.vehicle) : undefined,
      directionId: isSet(object.directionId) ? Boolean(object.directionId) : false,
    };
  },

  toJSON(message: Trip_Reference): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.resource !== undefined && (obj.resource = message.resource ? Resource.toJSON(message.resource) : undefined);
    message.route !== undefined && (obj.route = message.route ? Route_Reference.toJSON(message.route) : undefined);
    message.destination !== undefined &&
      (obj.destination = message.destination ? Stop_Reference.toJSON(message.destination) : undefined);
    message.vehicle !== undefined &&
      (obj.vehicle = message.vehicle ? Vehicle_Reference.toJSON(message.vehicle) : undefined);
    message.directionId !== undefined && (obj.directionId = message.directionId);
    return obj;
  },

  create<I extends Exact<DeepPartial<Trip_Reference>, I>>(base?: I): Trip_Reference {
    return Trip_Reference.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Trip_Reference>, I>>(object: I): Trip_Reference {
    const message = createBaseTrip_Reference();
    message.id = object.id ?? "";
    message.resource = (object.resource !== undefined && object.resource !== null)
      ? Resource.fromPartial(object.resource)
      : undefined;
    message.route = (object.route !== undefined && object.route !== null)
      ? Route_Reference.fromPartial(object.route)
      : undefined;
    message.destination = (object.destination !== undefined && object.destination !== null)
      ? Stop_Reference.fromPartial(object.destination)
      : undefined;
    message.vehicle = (object.vehicle !== undefined && object.vehicle !== null)
      ? Vehicle_Reference.fromPartial(object.vehicle)
      : undefined;
    message.directionId = object.directionId ?? false;
    return message;
  },
};

function createBaseVehicle(): Vehicle {
  return {};
}

export const Vehicle = {
  encode(_: Vehicle, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Vehicle {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseVehicle();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): Vehicle {
    return {};
  },

  toJSON(_: Vehicle): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Vehicle>, I>>(base?: I): Vehicle {
    return Vehicle.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Vehicle>, I>>(_: I): Vehicle {
    const message = createBaseVehicle();
    return message;
  },
};

function createBaseVehicle_Reference(): Vehicle_Reference {
  return { id: "" };
}

export const Vehicle_Reference = {
  encode(message: Vehicle_Reference, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Vehicle_Reference {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseVehicle_Reference();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.id = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Vehicle_Reference {
    return { id: isSet(object.id) ? String(object.id) : "" };
  },

  toJSON(message: Vehicle_Reference): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    return obj;
  },

  create<I extends Exact<DeepPartial<Vehicle_Reference>, I>>(base?: I): Vehicle_Reference {
    return Vehicle_Reference.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Vehicle_Reference>, I>>(object: I): Vehicle_Reference {
    const message = createBaseVehicle_Reference();
    message.id = object.id ?? "";
    return message;
  },
};

function createBaseRoute(): Route {
  return {
    id: "",
    resource: undefined,
    system: undefined,
    shortName: undefined,
    longName: undefined,
    color: "",
    textColor: "",
    description: undefined,
    url: undefined,
    sortOrder: undefined,
    continuousPickup: 0,
    continuousDropOff: 0,
    type: 0,
    agency: undefined,
    alerts: [],
    estimatedHeadway: undefined,
    serviceMaps: [],
  };
}

export const Route = {
  encode(message: Route, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.resource !== undefined) {
      Resource.encode(message.resource, writer.uint32(18).fork()).ldelim();
    }
    if (message.system !== undefined) {
      System_Reference.encode(message.system, writer.uint32(26).fork()).ldelim();
    }
    if (message.shortName !== undefined) {
      writer.uint32(34).string(message.shortName);
    }
    if (message.longName !== undefined) {
      writer.uint32(42).string(message.longName);
    }
    if (message.color !== "") {
      writer.uint32(50).string(message.color);
    }
    if (message.textColor !== "") {
      writer.uint32(58).string(message.textColor);
    }
    if (message.description !== undefined) {
      writer.uint32(66).string(message.description);
    }
    if (message.url !== undefined) {
      writer.uint32(74).string(message.url);
    }
    if (message.sortOrder !== undefined) {
      writer.uint32(80).int32(message.sortOrder);
    }
    if (message.continuousPickup !== 0) {
      writer.uint32(88).int32(message.continuousPickup);
    }
    if (message.continuousDropOff !== 0) {
      writer.uint32(96).int32(message.continuousDropOff);
    }
    if (message.type !== 0) {
      writer.uint32(104).int32(message.type);
    }
    if (message.agency !== undefined) {
      Agency_Reference.encode(message.agency, writer.uint32(114).fork()).ldelim();
    }
    for (const v of message.alerts) {
      Alert_Reference.encode(v!, writer.uint32(122).fork()).ldelim();
    }
    if (message.estimatedHeadway !== undefined) {
      writer.uint32(128).int32(message.estimatedHeadway);
    }
    for (const v of message.serviceMaps) {
      Route_ServiceMap.encode(v!, writer.uint32(138).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Route {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRoute();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.resource = Resource.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag != 26) {
            break;
          }

          message.system = System_Reference.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag != 34) {
            break;
          }

          message.shortName = reader.string();
          continue;
        case 5:
          if (tag != 42) {
            break;
          }

          message.longName = reader.string();
          continue;
        case 6:
          if (tag != 50) {
            break;
          }

          message.color = reader.string();
          continue;
        case 7:
          if (tag != 58) {
            break;
          }

          message.textColor = reader.string();
          continue;
        case 8:
          if (tag != 66) {
            break;
          }

          message.description = reader.string();
          continue;
        case 9:
          if (tag != 74) {
            break;
          }

          message.url = reader.string();
          continue;
        case 10:
          if (tag != 80) {
            break;
          }

          message.sortOrder = reader.int32();
          continue;
        case 11:
          if (tag != 88) {
            break;
          }

          message.continuousPickup = reader.int32() as any;
          continue;
        case 12:
          if (tag != 96) {
            break;
          }

          message.continuousDropOff = reader.int32() as any;
          continue;
        case 13:
          if (tag != 104) {
            break;
          }

          message.type = reader.int32() as any;
          continue;
        case 14:
          if (tag != 114) {
            break;
          }

          message.agency = Agency_Reference.decode(reader, reader.uint32());
          continue;
        case 15:
          if (tag != 122) {
            break;
          }

          message.alerts.push(Alert_Reference.decode(reader, reader.uint32()));
          continue;
        case 16:
          if (tag != 128) {
            break;
          }

          message.estimatedHeadway = reader.int32();
          continue;
        case 17:
          if (tag != 138) {
            break;
          }

          message.serviceMaps.push(Route_ServiceMap.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Route {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      resource: isSet(object.resource) ? Resource.fromJSON(object.resource) : undefined,
      system: isSet(object.system) ? System_Reference.fromJSON(object.system) : undefined,
      shortName: isSet(object.shortName) ? String(object.shortName) : undefined,
      longName: isSet(object.longName) ? String(object.longName) : undefined,
      color: isSet(object.color) ? String(object.color) : "",
      textColor: isSet(object.textColor) ? String(object.textColor) : "",
      description: isSet(object.description) ? String(object.description) : undefined,
      url: isSet(object.url) ? String(object.url) : undefined,
      sortOrder: isSet(object.sortOrder) ? Number(object.sortOrder) : undefined,
      continuousPickup: isSet(object.continuousPickup) ? route_ContinuousPolicyFromJSON(object.continuousPickup) : 0,
      continuousDropOff: isSet(object.continuousDropOff) ? route_ContinuousPolicyFromJSON(object.continuousDropOff) : 0,
      type: isSet(object.type) ? route_TypeFromJSON(object.type) : 0,
      agency: isSet(object.agency) ? Agency_Reference.fromJSON(object.agency) : undefined,
      alerts: Array.isArray(object?.alerts) ? object.alerts.map((e: any) => Alert_Reference.fromJSON(e)) : [],
      estimatedHeadway: isSet(object.estimatedHeadway) ? Number(object.estimatedHeadway) : undefined,
      serviceMaps: Array.isArray(object?.serviceMaps)
        ? object.serviceMaps.map((e: any) => Route_ServiceMap.fromJSON(e))
        : [],
    };
  },

  toJSON(message: Route): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.resource !== undefined && (obj.resource = message.resource ? Resource.toJSON(message.resource) : undefined);
    message.system !== undefined && (obj.system = message.system ? System_Reference.toJSON(message.system) : undefined);
    message.shortName !== undefined && (obj.shortName = message.shortName);
    message.longName !== undefined && (obj.longName = message.longName);
    message.color !== undefined && (obj.color = message.color);
    message.textColor !== undefined && (obj.textColor = message.textColor);
    message.description !== undefined && (obj.description = message.description);
    message.url !== undefined && (obj.url = message.url);
    message.sortOrder !== undefined && (obj.sortOrder = Math.round(message.sortOrder));
    message.continuousPickup !== undefined &&
      (obj.continuousPickup = route_ContinuousPolicyToJSON(message.continuousPickup));
    message.continuousDropOff !== undefined &&
      (obj.continuousDropOff = route_ContinuousPolicyToJSON(message.continuousDropOff));
    message.type !== undefined && (obj.type = route_TypeToJSON(message.type));
    message.agency !== undefined && (obj.agency = message.agency ? Agency_Reference.toJSON(message.agency) : undefined);
    if (message.alerts) {
      obj.alerts = message.alerts.map((e) => e ? Alert_Reference.toJSON(e) : undefined);
    } else {
      obj.alerts = [];
    }
    message.estimatedHeadway !== undefined && (obj.estimatedHeadway = Math.round(message.estimatedHeadway));
    if (message.serviceMaps) {
      obj.serviceMaps = message.serviceMaps.map((e) => e ? Route_ServiceMap.toJSON(e) : undefined);
    } else {
      obj.serviceMaps = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Route>, I>>(base?: I): Route {
    return Route.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Route>, I>>(object: I): Route {
    const message = createBaseRoute();
    message.id = object.id ?? "";
    message.resource = (object.resource !== undefined && object.resource !== null)
      ? Resource.fromPartial(object.resource)
      : undefined;
    message.system = (object.system !== undefined && object.system !== null)
      ? System_Reference.fromPartial(object.system)
      : undefined;
    message.shortName = object.shortName ?? undefined;
    message.longName = object.longName ?? undefined;
    message.color = object.color ?? "";
    message.textColor = object.textColor ?? "";
    message.description = object.description ?? undefined;
    message.url = object.url ?? undefined;
    message.sortOrder = object.sortOrder ?? undefined;
    message.continuousPickup = object.continuousPickup ?? 0;
    message.continuousDropOff = object.continuousDropOff ?? 0;
    message.type = object.type ?? 0;
    message.agency = (object.agency !== undefined && object.agency !== null)
      ? Agency_Reference.fromPartial(object.agency)
      : undefined;
    message.alerts = object.alerts?.map((e) => Alert_Reference.fromPartial(e)) || [];
    message.estimatedHeadway = object.estimatedHeadway ?? undefined;
    message.serviceMaps = object.serviceMaps?.map((e) => Route_ServiceMap.fromPartial(e)) || [];
    return message;
  },
};

function createBaseRoute_ServiceMap(): Route_ServiceMap {
  return { configId: "", stops: [] };
}

export const Route_ServiceMap = {
  encode(message: Route_ServiceMap, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.configId !== "") {
      writer.uint32(10).string(message.configId);
    }
    for (const v of message.stops) {
      Stop_Reference.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Route_ServiceMap {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRoute_ServiceMap();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.configId = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.stops.push(Stop_Reference.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Route_ServiceMap {
    return {
      configId: isSet(object.configId) ? String(object.configId) : "",
      stops: Array.isArray(object?.stops) ? object.stops.map((e: any) => Stop_Reference.fromJSON(e)) : [],
    };
  },

  toJSON(message: Route_ServiceMap): unknown {
    const obj: any = {};
    message.configId !== undefined && (obj.configId = message.configId);
    if (message.stops) {
      obj.stops = message.stops.map((e) => e ? Stop_Reference.toJSON(e) : undefined);
    } else {
      obj.stops = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Route_ServiceMap>, I>>(base?: I): Route_ServiceMap {
    return Route_ServiceMap.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Route_ServiceMap>, I>>(object: I): Route_ServiceMap {
    const message = createBaseRoute_ServiceMap();
    message.configId = object.configId ?? "";
    message.stops = object.stops?.map((e) => Stop_Reference.fromPartial(e)) || [];
    return message;
  },
};

function createBaseRoute_Reference(): Route_Reference {
  return { id: "", resource: undefined, system: undefined, color: "" };
}

export const Route_Reference = {
  encode(message: Route_Reference, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.resource !== undefined) {
      Resource.encode(message.resource, writer.uint32(18).fork()).ldelim();
    }
    if (message.system !== undefined) {
      System_Reference.encode(message.system, writer.uint32(26).fork()).ldelim();
    }
    if (message.color !== "") {
      writer.uint32(34).string(message.color);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Route_Reference {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRoute_Reference();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.resource = Resource.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag != 26) {
            break;
          }

          message.system = System_Reference.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag != 34) {
            break;
          }

          message.color = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Route_Reference {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      resource: isSet(object.resource) ? Resource.fromJSON(object.resource) : undefined,
      system: isSet(object.system) ? System_Reference.fromJSON(object.system) : undefined,
      color: isSet(object.color) ? String(object.color) : "",
    };
  },

  toJSON(message: Route_Reference): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.resource !== undefined && (obj.resource = message.resource ? Resource.toJSON(message.resource) : undefined);
    message.system !== undefined && (obj.system = message.system ? System_Reference.toJSON(message.system) : undefined);
    message.color !== undefined && (obj.color = message.color);
    return obj;
  },

  create<I extends Exact<DeepPartial<Route_Reference>, I>>(base?: I): Route_Reference {
    return Route_Reference.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Route_Reference>, I>>(object: I): Route_Reference {
    const message = createBaseRoute_Reference();
    message.id = object.id ?? "";
    message.resource = (object.resource !== undefined && object.resource !== null)
      ? Resource.fromPartial(object.resource)
      : undefined;
    message.system = (object.system !== undefined && object.system !== null)
      ? System_Reference.fromPartial(object.system)
      : undefined;
    message.color = object.color ?? "";
    return message;
  },
};

function createBaseFeed(): Feed {
  return { id: "", resource: undefined, system: undefined, updates: undefined };
}

export const Feed = {
  encode(message: Feed, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.resource !== undefined) {
      Resource.encode(message.resource, writer.uint32(18).fork()).ldelim();
    }
    if (message.system !== undefined) {
      System_Reference.encode(message.system, writer.uint32(26).fork()).ldelim();
    }
    if (message.updates !== undefined) {
      ChildResources.encode(message.updates, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Feed {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFeed();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.resource = Resource.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag != 26) {
            break;
          }

          message.system = System_Reference.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag != 34) {
            break;
          }

          message.updates = ChildResources.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Feed {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      resource: isSet(object.resource) ? Resource.fromJSON(object.resource) : undefined,
      system: isSet(object.system) ? System_Reference.fromJSON(object.system) : undefined,
      updates: isSet(object.updates) ? ChildResources.fromJSON(object.updates) : undefined,
    };
  },

  toJSON(message: Feed): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.resource !== undefined && (obj.resource = message.resource ? Resource.toJSON(message.resource) : undefined);
    message.system !== undefined && (obj.system = message.system ? System_Reference.toJSON(message.system) : undefined);
    message.updates !== undefined &&
      (obj.updates = message.updates ? ChildResources.toJSON(message.updates) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<Feed>, I>>(base?: I): Feed {
    return Feed.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Feed>, I>>(object: I): Feed {
    const message = createBaseFeed();
    message.id = object.id ?? "";
    message.resource = (object.resource !== undefined && object.resource !== null)
      ? Resource.fromPartial(object.resource)
      : undefined;
    message.system = (object.system !== undefined && object.system !== null)
      ? System_Reference.fromPartial(object.system)
      : undefined;
    message.updates = (object.updates !== undefined && object.updates !== null)
      ? ChildResources.fromPartial(object.updates)
      : undefined;
    return message;
  },
};

function createBaseFeed_Reference(): Feed_Reference {
  return { id: "", resource: undefined, system: undefined };
}

export const Feed_Reference = {
  encode(message: Feed_Reference, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.resource !== undefined) {
      Resource.encode(message.resource, writer.uint32(18).fork()).ldelim();
    }
    if (message.system !== undefined) {
      System_Reference.encode(message.system, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Feed_Reference {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFeed_Reference();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.resource = Resource.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag != 26) {
            break;
          }

          message.system = System_Reference.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Feed_Reference {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      resource: isSet(object.resource) ? Resource.fromJSON(object.resource) : undefined,
      system: isSet(object.system) ? System_Reference.fromJSON(object.system) : undefined,
    };
  },

  toJSON(message: Feed_Reference): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.resource !== undefined && (obj.resource = message.resource ? Resource.toJSON(message.resource) : undefined);
    message.system !== undefined && (obj.system = message.system ? System_Reference.toJSON(message.system) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<Feed_Reference>, I>>(base?: I): Feed_Reference {
    return Feed_Reference.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Feed_Reference>, I>>(object: I): Feed_Reference {
    const message = createBaseFeed_Reference();
    message.id = object.id ?? "";
    message.resource = (object.resource !== undefined && object.resource !== null)
      ? Resource.fromPartial(object.resource)
      : undefined;
    message.system = (object.system !== undefined && object.system !== null)
      ? System_Reference.fromPartial(object.system)
      : undefined;
    return message;
  },
};

function createBaseAgency(): Agency {
  return {
    id: "",
    resource: undefined,
    system: undefined,
    name: "",
    url: "",
    timezone: "",
    language: undefined,
    phone: undefined,
    fareUrl: undefined,
    email: undefined,
    routes: [],
    alerts: [],
  };
}

export const Agency = {
  encode(message: Agency, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.resource !== undefined) {
      Resource.encode(message.resource, writer.uint32(18).fork()).ldelim();
    }
    if (message.system !== undefined) {
      System_Reference.encode(message.system, writer.uint32(26).fork()).ldelim();
    }
    if (message.name !== "") {
      writer.uint32(34).string(message.name);
    }
    if (message.url !== "") {
      writer.uint32(42).string(message.url);
    }
    if (message.timezone !== "") {
      writer.uint32(50).string(message.timezone);
    }
    if (message.language !== undefined) {
      writer.uint32(58).string(message.language);
    }
    if (message.phone !== undefined) {
      writer.uint32(66).string(message.phone);
    }
    if (message.fareUrl !== undefined) {
      writer.uint32(74).string(message.fareUrl);
    }
    if (message.email !== undefined) {
      writer.uint32(82).string(message.email);
    }
    for (const v of message.routes) {
      Route_Reference.encode(v!, writer.uint32(90).fork()).ldelim();
    }
    for (const v of message.alerts) {
      Alert_Reference.encode(v!, writer.uint32(98).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Agency {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAgency();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.resource = Resource.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag != 26) {
            break;
          }

          message.system = System_Reference.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag != 34) {
            break;
          }

          message.name = reader.string();
          continue;
        case 5:
          if (tag != 42) {
            break;
          }

          message.url = reader.string();
          continue;
        case 6:
          if (tag != 50) {
            break;
          }

          message.timezone = reader.string();
          continue;
        case 7:
          if (tag != 58) {
            break;
          }

          message.language = reader.string();
          continue;
        case 8:
          if (tag != 66) {
            break;
          }

          message.phone = reader.string();
          continue;
        case 9:
          if (tag != 74) {
            break;
          }

          message.fareUrl = reader.string();
          continue;
        case 10:
          if (tag != 82) {
            break;
          }

          message.email = reader.string();
          continue;
        case 11:
          if (tag != 90) {
            break;
          }

          message.routes.push(Route_Reference.decode(reader, reader.uint32()));
          continue;
        case 12:
          if (tag != 98) {
            break;
          }

          message.alerts.push(Alert_Reference.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Agency {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      resource: isSet(object.resource) ? Resource.fromJSON(object.resource) : undefined,
      system: isSet(object.system) ? System_Reference.fromJSON(object.system) : undefined,
      name: isSet(object.name) ? String(object.name) : "",
      url: isSet(object.url) ? String(object.url) : "",
      timezone: isSet(object.timezone) ? String(object.timezone) : "",
      language: isSet(object.language) ? String(object.language) : undefined,
      phone: isSet(object.phone) ? String(object.phone) : undefined,
      fareUrl: isSet(object.fareUrl) ? String(object.fareUrl) : undefined,
      email: isSet(object.email) ? String(object.email) : undefined,
      routes: Array.isArray(object?.routes) ? object.routes.map((e: any) => Route_Reference.fromJSON(e)) : [],
      alerts: Array.isArray(object?.alerts) ? object.alerts.map((e: any) => Alert_Reference.fromJSON(e)) : [],
    };
  },

  toJSON(message: Agency): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.resource !== undefined && (obj.resource = message.resource ? Resource.toJSON(message.resource) : undefined);
    message.system !== undefined && (obj.system = message.system ? System_Reference.toJSON(message.system) : undefined);
    message.name !== undefined && (obj.name = message.name);
    message.url !== undefined && (obj.url = message.url);
    message.timezone !== undefined && (obj.timezone = message.timezone);
    message.language !== undefined && (obj.language = message.language);
    message.phone !== undefined && (obj.phone = message.phone);
    message.fareUrl !== undefined && (obj.fareUrl = message.fareUrl);
    message.email !== undefined && (obj.email = message.email);
    if (message.routes) {
      obj.routes = message.routes.map((e) => e ? Route_Reference.toJSON(e) : undefined);
    } else {
      obj.routes = [];
    }
    if (message.alerts) {
      obj.alerts = message.alerts.map((e) => e ? Alert_Reference.toJSON(e) : undefined);
    } else {
      obj.alerts = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Agency>, I>>(base?: I): Agency {
    return Agency.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Agency>, I>>(object: I): Agency {
    const message = createBaseAgency();
    message.id = object.id ?? "";
    message.resource = (object.resource !== undefined && object.resource !== null)
      ? Resource.fromPartial(object.resource)
      : undefined;
    message.system = (object.system !== undefined && object.system !== null)
      ? System_Reference.fromPartial(object.system)
      : undefined;
    message.name = object.name ?? "";
    message.url = object.url ?? "";
    message.timezone = object.timezone ?? "";
    message.language = object.language ?? undefined;
    message.phone = object.phone ?? undefined;
    message.fareUrl = object.fareUrl ?? undefined;
    message.email = object.email ?? undefined;
    message.routes = object.routes?.map((e) => Route_Reference.fromPartial(e)) || [];
    message.alerts = object.alerts?.map((e) => Alert_Reference.fromPartial(e)) || [];
    return message;
  },
};

function createBaseAgency_Reference(): Agency_Reference {
  return { id: "", resource: undefined, system: undefined, name: "" };
}

export const Agency_Reference = {
  encode(message: Agency_Reference, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.resource !== undefined) {
      Resource.encode(message.resource, writer.uint32(18).fork()).ldelim();
    }
    if (message.system !== undefined) {
      System_Reference.encode(message.system, writer.uint32(26).fork()).ldelim();
    }
    if (message.name !== "") {
      writer.uint32(34).string(message.name);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Agency_Reference {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAgency_Reference();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.resource = Resource.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag != 26) {
            break;
          }

          message.system = System_Reference.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag != 34) {
            break;
          }

          message.name = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Agency_Reference {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      resource: isSet(object.resource) ? Resource.fromJSON(object.resource) : undefined,
      system: isSet(object.system) ? System_Reference.fromJSON(object.system) : undefined,
      name: isSet(object.name) ? String(object.name) : "",
    };
  },

  toJSON(message: Agency_Reference): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.resource !== undefined && (obj.resource = message.resource ? Resource.toJSON(message.resource) : undefined);
    message.system !== undefined && (obj.system = message.system ? System_Reference.toJSON(message.system) : undefined);
    message.name !== undefined && (obj.name = message.name);
    return obj;
  },

  create<I extends Exact<DeepPartial<Agency_Reference>, I>>(base?: I): Agency_Reference {
    return Agency_Reference.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Agency_Reference>, I>>(object: I): Agency_Reference {
    const message = createBaseAgency_Reference();
    message.id = object.id ?? "";
    message.resource = (object.resource !== undefined && object.resource !== null)
      ? Resource.fromPartial(object.resource)
      : undefined;
    message.system = (object.system !== undefined && object.system !== null)
      ? System_Reference.fromPartial(object.system)
      : undefined;
    message.name = object.name ?? "";
    return message;
  },
};

function createBaseAlert(): Alert {
  return {
    id: "",
    resource: undefined,
    system: undefined,
    cause: 0,
    effect: 0,
    currentActivePeriod: undefined,
    allActivePeriods: [],
    header: [],
    description: [],
    url: [],
  };
}

export const Alert = {
  encode(message: Alert, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.resource !== undefined) {
      Resource.encode(message.resource, writer.uint32(18).fork()).ldelim();
    }
    if (message.system !== undefined) {
      System_Reference.encode(message.system, writer.uint32(26).fork()).ldelim();
    }
    if (message.cause !== 0) {
      writer.uint32(32).int32(message.cause);
    }
    if (message.effect !== 0) {
      writer.uint32(40).int32(message.effect);
    }
    if (message.currentActivePeriod !== undefined) {
      Alert_ActivePeriod.encode(message.currentActivePeriod, writer.uint32(50).fork()).ldelim();
    }
    for (const v of message.allActivePeriods) {
      Alert_ActivePeriod.encode(v!, writer.uint32(58).fork()).ldelim();
    }
    for (const v of message.header) {
      Alert_Text.encode(v!, writer.uint32(66).fork()).ldelim();
    }
    for (const v of message.description) {
      Alert_Text.encode(v!, writer.uint32(74).fork()).ldelim();
    }
    for (const v of message.url) {
      Alert_Text.encode(v!, writer.uint32(82).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Alert {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAlert();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.resource = Resource.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag != 26) {
            break;
          }

          message.system = System_Reference.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag != 32) {
            break;
          }

          message.cause = reader.int32() as any;
          continue;
        case 5:
          if (tag != 40) {
            break;
          }

          message.effect = reader.int32() as any;
          continue;
        case 6:
          if (tag != 50) {
            break;
          }

          message.currentActivePeriod = Alert_ActivePeriod.decode(reader, reader.uint32());
          continue;
        case 7:
          if (tag != 58) {
            break;
          }

          message.allActivePeriods.push(Alert_ActivePeriod.decode(reader, reader.uint32()));
          continue;
        case 8:
          if (tag != 66) {
            break;
          }

          message.header.push(Alert_Text.decode(reader, reader.uint32()));
          continue;
        case 9:
          if (tag != 74) {
            break;
          }

          message.description.push(Alert_Text.decode(reader, reader.uint32()));
          continue;
        case 10:
          if (tag != 82) {
            break;
          }

          message.url.push(Alert_Text.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Alert {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      resource: isSet(object.resource) ? Resource.fromJSON(object.resource) : undefined,
      system: isSet(object.system) ? System_Reference.fromJSON(object.system) : undefined,
      cause: isSet(object.cause) ? alert_CauseFromJSON(object.cause) : 0,
      effect: isSet(object.effect) ? alert_EffectFromJSON(object.effect) : 0,
      currentActivePeriod: isSet(object.currentActivePeriod)
        ? Alert_ActivePeriod.fromJSON(object.currentActivePeriod)
        : undefined,
      allActivePeriods: Array.isArray(object?.allActivePeriods)
        ? object.allActivePeriods.map((e: any) => Alert_ActivePeriod.fromJSON(e))
        : [],
      header: Array.isArray(object?.header) ? object.header.map((e: any) => Alert_Text.fromJSON(e)) : [],
      description: Array.isArray(object?.description) ? object.description.map((e: any) => Alert_Text.fromJSON(e)) : [],
      url: Array.isArray(object?.url) ? object.url.map((e: any) => Alert_Text.fromJSON(e)) : [],
    };
  },

  toJSON(message: Alert): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.resource !== undefined && (obj.resource = message.resource ? Resource.toJSON(message.resource) : undefined);
    message.system !== undefined && (obj.system = message.system ? System_Reference.toJSON(message.system) : undefined);
    message.cause !== undefined && (obj.cause = alert_CauseToJSON(message.cause));
    message.effect !== undefined && (obj.effect = alert_EffectToJSON(message.effect));
    message.currentActivePeriod !== undefined && (obj.currentActivePeriod = message.currentActivePeriod
      ? Alert_ActivePeriod.toJSON(message.currentActivePeriod)
      : undefined);
    if (message.allActivePeriods) {
      obj.allActivePeriods = message.allActivePeriods.map((e) => e ? Alert_ActivePeriod.toJSON(e) : undefined);
    } else {
      obj.allActivePeriods = [];
    }
    if (message.header) {
      obj.header = message.header.map((e) => e ? Alert_Text.toJSON(e) : undefined);
    } else {
      obj.header = [];
    }
    if (message.description) {
      obj.description = message.description.map((e) => e ? Alert_Text.toJSON(e) : undefined);
    } else {
      obj.description = [];
    }
    if (message.url) {
      obj.url = message.url.map((e) => e ? Alert_Text.toJSON(e) : undefined);
    } else {
      obj.url = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Alert>, I>>(base?: I): Alert {
    return Alert.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Alert>, I>>(object: I): Alert {
    const message = createBaseAlert();
    message.id = object.id ?? "";
    message.resource = (object.resource !== undefined && object.resource !== null)
      ? Resource.fromPartial(object.resource)
      : undefined;
    message.system = (object.system !== undefined && object.system !== null)
      ? System_Reference.fromPartial(object.system)
      : undefined;
    message.cause = object.cause ?? 0;
    message.effect = object.effect ?? 0;
    message.currentActivePeriod = (object.currentActivePeriod !== undefined && object.currentActivePeriod !== null)
      ? Alert_ActivePeriod.fromPartial(object.currentActivePeriod)
      : undefined;
    message.allActivePeriods = object.allActivePeriods?.map((e) => Alert_ActivePeriod.fromPartial(e)) || [];
    message.header = object.header?.map((e) => Alert_Text.fromPartial(e)) || [];
    message.description = object.description?.map((e) => Alert_Text.fromPartial(e)) || [];
    message.url = object.url?.map((e) => Alert_Text.fromPartial(e)) || [];
    return message;
  },
};

function createBaseAlert_ActivePeriod(): Alert_ActivePeriod {
  return { startsAt: undefined, endsAt: undefined };
}

export const Alert_ActivePeriod = {
  encode(message: Alert_ActivePeriod, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.startsAt !== undefined) {
      writer.uint32(8).int64(message.startsAt);
    }
    if (message.endsAt !== undefined) {
      writer.uint32(16).int64(message.endsAt);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Alert_ActivePeriod {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAlert_ActivePeriod();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 8) {
            break;
          }

          message.startsAt = longToNumber(reader.int64() as Long);
          continue;
        case 2:
          if (tag != 16) {
            break;
          }

          message.endsAt = longToNumber(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Alert_ActivePeriod {
    return {
      startsAt: isSet(object.startsAt) ? Number(object.startsAt) : undefined,
      endsAt: isSet(object.endsAt) ? Number(object.endsAt) : undefined,
    };
  },

  toJSON(message: Alert_ActivePeriod): unknown {
    const obj: any = {};
    message.startsAt !== undefined && (obj.startsAt = Math.round(message.startsAt));
    message.endsAt !== undefined && (obj.endsAt = Math.round(message.endsAt));
    return obj;
  },

  create<I extends Exact<DeepPartial<Alert_ActivePeriod>, I>>(base?: I): Alert_ActivePeriod {
    return Alert_ActivePeriod.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Alert_ActivePeriod>, I>>(object: I): Alert_ActivePeriod {
    const message = createBaseAlert_ActivePeriod();
    message.startsAt = object.startsAt ?? undefined;
    message.endsAt = object.endsAt ?? undefined;
    return message;
  },
};

function createBaseAlert_Text(): Alert_Text {
  return { text: "", language: "" };
}

export const Alert_Text = {
  encode(message: Alert_Text, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.text !== "") {
      writer.uint32(10).string(message.text);
    }
    if (message.language !== "") {
      writer.uint32(18).string(message.language);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Alert_Text {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAlert_Text();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.text = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.language = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Alert_Text {
    return {
      text: isSet(object.text) ? String(object.text) : "",
      language: isSet(object.language) ? String(object.language) : "",
    };
  },

  toJSON(message: Alert_Text): unknown {
    const obj: any = {};
    message.text !== undefined && (obj.text = message.text);
    message.language !== undefined && (obj.language = message.language);
    return obj;
  },

  create<I extends Exact<DeepPartial<Alert_Text>, I>>(base?: I): Alert_Text {
    return Alert_Text.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Alert_Text>, I>>(object: I): Alert_Text {
    const message = createBaseAlert_Text();
    message.text = object.text ?? "";
    message.language = object.language ?? "";
    return message;
  },
};

function createBaseAlert_Reference(): Alert_Reference {
  return { id: "", resource: undefined, system: undefined, cause: 0, effect: 0 };
}

export const Alert_Reference = {
  encode(message: Alert_Reference, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.resource !== undefined) {
      Resource.encode(message.resource, writer.uint32(18).fork()).ldelim();
    }
    if (message.system !== undefined) {
      System_Reference.encode(message.system, writer.uint32(26).fork()).ldelim();
    }
    if (message.cause !== 0) {
      writer.uint32(32).int32(message.cause);
    }
    if (message.effect !== 0) {
      writer.uint32(40).int32(message.effect);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Alert_Reference {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAlert_Reference();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.resource = Resource.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag != 26) {
            break;
          }

          message.system = System_Reference.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag != 32) {
            break;
          }

          message.cause = reader.int32() as any;
          continue;
        case 5:
          if (tag != 40) {
            break;
          }

          message.effect = reader.int32() as any;
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Alert_Reference {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      resource: isSet(object.resource) ? Resource.fromJSON(object.resource) : undefined,
      system: isSet(object.system) ? System_Reference.fromJSON(object.system) : undefined,
      cause: isSet(object.cause) ? alert_CauseFromJSON(object.cause) : 0,
      effect: isSet(object.effect) ? alert_EffectFromJSON(object.effect) : 0,
    };
  },

  toJSON(message: Alert_Reference): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.resource !== undefined && (obj.resource = message.resource ? Resource.toJSON(message.resource) : undefined);
    message.system !== undefined && (obj.system = message.system ? System_Reference.toJSON(message.system) : undefined);
    message.cause !== undefined && (obj.cause = alert_CauseToJSON(message.cause));
    message.effect !== undefined && (obj.effect = alert_EffectToJSON(message.effect));
    return obj;
  },

  create<I extends Exact<DeepPartial<Alert_Reference>, I>>(base?: I): Alert_Reference {
    return Alert_Reference.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Alert_Reference>, I>>(object: I): Alert_Reference {
    const message = createBaseAlert_Reference();
    message.id = object.id ?? "";
    message.resource = (object.resource !== undefined && object.resource !== null)
      ? Resource.fromPartial(object.resource)
      : undefined;
    message.system = (object.system !== undefined && object.system !== null)
      ? System_Reference.fromPartial(object.system)
      : undefined;
    message.cause = object.cause ?? 0;
    message.effect = object.effect ?? 0;
    return message;
  },
};

function createBaseTransfer(): Transfer {
  return { fromStop: undefined, toStop: undefined, type: 0, minTransferTime: undefined, distance: undefined };
}

export const Transfer = {
  encode(message: Transfer, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.fromStop !== undefined) {
      Stop_Reference.encode(message.fromStop, writer.uint32(34).fork()).ldelim();
    }
    if (message.toStop !== undefined) {
      Stop_Reference.encode(message.toStop, writer.uint32(42).fork()).ldelim();
    }
    if (message.type !== 0) {
      writer.uint32(48).int32(message.type);
    }
    if (message.minTransferTime !== undefined) {
      writer.uint32(56).int32(message.minTransferTime);
    }
    if (message.distance !== undefined) {
      writer.uint32(64).int32(message.distance);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Transfer {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTransfer();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 4:
          if (tag != 34) {
            break;
          }

          message.fromStop = Stop_Reference.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag != 42) {
            break;
          }

          message.toStop = Stop_Reference.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag != 48) {
            break;
          }

          message.type = reader.int32() as any;
          continue;
        case 7:
          if (tag != 56) {
            break;
          }

          message.minTransferTime = reader.int32();
          continue;
        case 8:
          if (tag != 64) {
            break;
          }

          message.distance = reader.int32();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Transfer {
    return {
      fromStop: isSet(object.fromStop) ? Stop_Reference.fromJSON(object.fromStop) : undefined,
      toStop: isSet(object.toStop) ? Stop_Reference.fromJSON(object.toStop) : undefined,
      type: isSet(object.type) ? transfer_TypeFromJSON(object.type) : 0,
      minTransferTime: isSet(object.minTransferTime) ? Number(object.minTransferTime) : undefined,
      distance: isSet(object.distance) ? Number(object.distance) : undefined,
    };
  },

  toJSON(message: Transfer): unknown {
    const obj: any = {};
    message.fromStop !== undefined &&
      (obj.fromStop = message.fromStop ? Stop_Reference.toJSON(message.fromStop) : undefined);
    message.toStop !== undefined && (obj.toStop = message.toStop ? Stop_Reference.toJSON(message.toStop) : undefined);
    message.type !== undefined && (obj.type = transfer_TypeToJSON(message.type));
    message.minTransferTime !== undefined && (obj.minTransferTime = Math.round(message.minTransferTime));
    message.distance !== undefined && (obj.distance = Math.round(message.distance));
    return obj;
  },

  create<I extends Exact<DeepPartial<Transfer>, I>>(base?: I): Transfer {
    return Transfer.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Transfer>, I>>(object: I): Transfer {
    const message = createBaseTransfer();
    message.fromStop = (object.fromStop !== undefined && object.fromStop !== null)
      ? Stop_Reference.fromPartial(object.fromStop)
      : undefined;
    message.toStop = (object.toStop !== undefined && object.toStop !== null)
      ? Stop_Reference.fromPartial(object.toStop)
      : undefined;
    message.type = object.type ?? 0;
    message.minTransferTime = object.minTransferTime ?? undefined;
    message.distance = object.distance ?? undefined;
    return message;
  },
};

function createBaseFeedUpdate(): FeedUpdate {
  return {
    id: "",
    resource: undefined,
    feed: undefined,
    startedAt: 0,
    finished: false,
    finishedAt: undefined,
    result: undefined,
    contentLength: undefined,
    contentHash: undefined,
    errorMessage: undefined,
  };
}

export const FeedUpdate = {
  encode(message: FeedUpdate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.resource !== undefined) {
      Resource.encode(message.resource, writer.uint32(18).fork()).ldelim();
    }
    if (message.feed !== undefined) {
      Feed_Reference.encode(message.feed, writer.uint32(26).fork()).ldelim();
    }
    if (message.startedAt !== 0) {
      writer.uint32(32).int64(message.startedAt);
    }
    if (message.finished === true) {
      writer.uint32(40).bool(message.finished);
    }
    if (message.finishedAt !== undefined) {
      writer.uint32(48).int64(message.finishedAt);
    }
    if (message.result !== undefined) {
      writer.uint32(56).int32(message.result);
    }
    if (message.contentLength !== undefined) {
      writer.uint32(64).int32(message.contentLength);
    }
    if (message.contentHash !== undefined) {
      writer.uint32(74).string(message.contentHash);
    }
    if (message.errorMessage !== undefined) {
      writer.uint32(82).string(message.errorMessage);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FeedUpdate {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFeedUpdate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.resource = Resource.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag != 26) {
            break;
          }

          message.feed = Feed_Reference.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag != 32) {
            break;
          }

          message.startedAt = longToNumber(reader.int64() as Long);
          continue;
        case 5:
          if (tag != 40) {
            break;
          }

          message.finished = reader.bool();
          continue;
        case 6:
          if (tag != 48) {
            break;
          }

          message.finishedAt = longToNumber(reader.int64() as Long);
          continue;
        case 7:
          if (tag != 56) {
            break;
          }

          message.result = reader.int32() as any;
          continue;
        case 8:
          if (tag != 64) {
            break;
          }

          message.contentLength = reader.int32();
          continue;
        case 9:
          if (tag != 74) {
            break;
          }

          message.contentHash = reader.string();
          continue;
        case 10:
          if (tag != 82) {
            break;
          }

          message.errorMessage = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): FeedUpdate {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      resource: isSet(object.resource) ? Resource.fromJSON(object.resource) : undefined,
      feed: isSet(object.feed) ? Feed_Reference.fromJSON(object.feed) : undefined,
      startedAt: isSet(object.startedAt) ? Number(object.startedAt) : 0,
      finished: isSet(object.finished) ? Boolean(object.finished) : false,
      finishedAt: isSet(object.finishedAt) ? Number(object.finishedAt) : undefined,
      result: isSet(object.result) ? feedUpdate_ResultFromJSON(object.result) : undefined,
      contentLength: isSet(object.contentLength) ? Number(object.contentLength) : undefined,
      contentHash: isSet(object.contentHash) ? String(object.contentHash) : undefined,
      errorMessage: isSet(object.errorMessage) ? String(object.errorMessage) : undefined,
    };
  },

  toJSON(message: FeedUpdate): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.resource !== undefined && (obj.resource = message.resource ? Resource.toJSON(message.resource) : undefined);
    message.feed !== undefined && (obj.feed = message.feed ? Feed_Reference.toJSON(message.feed) : undefined);
    message.startedAt !== undefined && (obj.startedAt = Math.round(message.startedAt));
    message.finished !== undefined && (obj.finished = message.finished);
    message.finishedAt !== undefined && (obj.finishedAt = Math.round(message.finishedAt));
    message.result !== undefined &&
      (obj.result = message.result !== undefined ? feedUpdate_ResultToJSON(message.result) : undefined);
    message.contentLength !== undefined && (obj.contentLength = Math.round(message.contentLength));
    message.contentHash !== undefined && (obj.contentHash = message.contentHash);
    message.errorMessage !== undefined && (obj.errorMessage = message.errorMessage);
    return obj;
  },

  create<I extends Exact<DeepPartial<FeedUpdate>, I>>(base?: I): FeedUpdate {
    return FeedUpdate.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<FeedUpdate>, I>>(object: I): FeedUpdate {
    const message = createBaseFeedUpdate();
    message.id = object.id ?? "";
    message.resource = (object.resource !== undefined && object.resource !== null)
      ? Resource.fromPartial(object.resource)
      : undefined;
    message.feed = (object.feed !== undefined && object.feed !== null)
      ? Feed_Reference.fromPartial(object.feed)
      : undefined;
    message.startedAt = object.startedAt ?? 0;
    message.finished = object.finished ?? false;
    message.finishedAt = object.finishedAt ?? undefined;
    message.result = object.result ?? undefined;
    message.contentLength = object.contentLength ?? undefined;
    message.contentHash = object.contentHash ?? undefined;
    message.errorMessage = object.errorMessage ?? undefined;
    return message;
  },
};

export interface Public {
  /**
   * API entrypoint
   *
   * `GET /`
   *
   * Provides basic information about this Transiter instance and the Transit systems it contains.
   */
  Entrypoint(request: EntrypointRequest): Promise<EntrypointReply>;
  /**
   * List systems
   *
   * `GET /systems`
   *
   * List all transit systems that are installed in this Transiter instance.
   */
  ListSystems(request: ListSystemsRequest): Promise<ListSystemsReply>;
  /**
   * Get system
   *
   * `GET /systems/<system_id>`
   *
   * Get a system by its ID.
   */
  GetSystem(request: GetSystemRequest): Promise<System>;
  /**
   * List agencies
   *
   * `GET /systems/<system_id>/agencies`
   *
   * List all agencies in a system.
   */
  ListAgencies(request: ListAgenciesRequest): Promise<ListAgenciesReply>;
  /**
   * Get agency
   *
   * `GET /systems/<system_id>/agencies/<agency_id>`
   *
   * Get an agency in a system by its ID.
   */
  GetAgency(request: GetAgencyRequest): Promise<Agency>;
  /**
   * List stops
   *
   * `GET /systems/<system_id>/stops`
   *
   * List all stops in a system.
   *
   * This endpoint is paginated.
   * If there are more results, the `next_id` field of the response will be populated.
   * To get more results, make the same request with the `first_id` field set to the value of `next_id` in the response.
   */
  ListStops(request: ListStopsRequest): Promise<ListStopsReply>;
  /**
   * Get stop
   *
   * `GET /systems/<system_id>/stops/<stop_id>`
   *
   * Get a stop in a system by its ID.
   */
  GetStop(request: GetStopRequest): Promise<Stop>;
  /**
   * List routes
   *
   * `GET /systems/<system_id>/routes`
   *
   * List all routes in a system.
   */
  ListRoutes(request: ListRoutesRequest): Promise<ListRoutesReply>;
  /**
   * Get route
   *
   * `GET /systems/<system_id>/routes/<route_id>`
   *
   * Get a route in a system by its ID.
   */
  GetRoute(request: GetRouteRequest): Promise<Route>;
  /**
   * List trips
   *
   * `GET /systems/<system_id>/routes/<route_id>/trips`
   *
   * List all trips in a route.
   */
  ListTrips(request: ListTripsRequest): Promise<ListTripsReply>;
  /**
   * Get trip
   *
   * `GET /systems/<system_id>/routes/<route_id>/trips/<trip_id>`
   *
   * Get a trip by its ID.
   */
  GetTrip(request: GetTripRequest): Promise<Trip>;
  /**
   * List alerts
   *
   * `GET /systems/<system_id>/alerts`
   *
   * List all alerts in a system.
   * By default this endpoint returns both active alerts
   *   (alerts which have an active period containing the current time) and non-active alerts.
   */
  ListAlerts(request: ListAlertsRequest): Promise<ListAlertsReply>;
  /**
   * Get alert
   *
   * `GET /systems/<system_id>/alerts/<alert_id>`
   *
   * Get an alert by its ID.
   */
  GetAlert(request: GetAlertRequest): Promise<Alert>;
  /**
   * List transfers
   *
   * `GET /systems/<system_id>/transfers`
   *
   * List all transfers in a system.
   */
  ListTransfers(request: ListTransfersRequest): Promise<ListTransfersReply>;
  /**
   * List feeds
   *
   * `GET /systems/<system_id>/feeds`
   *
   * List all feeds for a system.
   */
  ListFeeds(request: ListFeedsRequest): Promise<ListFeedsReply>;
  /**
   * Get feed
   *
   * `GET /systems/<system_id>/feeds/<feed_id>`
   *
   * Get a feed in a system by its ID.
   */
  GetFeed(request: GetFeedRequest): Promise<Feed>;
  /**
   * List feed updates
   *
   * `GET /systems/<system_id>/feeds/<feed_id>/updates`
   *
   * List feeds updates for a feed.
   */
  ListFeedUpdates(request: ListFeedUpdatesRequest): Promise<ListFeedUpdatesReply>;
}

export class PublicClientImpl implements Public {
  private readonly rpc: Rpc;
  private readonly service: string;
  constructor(rpc: Rpc, opts?: { service?: string }) {
    this.service = opts?.service || "Public";
    this.rpc = rpc;
    this.Entrypoint = this.Entrypoint.bind(this);
    this.ListSystems = this.ListSystems.bind(this);
    this.GetSystem = this.GetSystem.bind(this);
    this.ListAgencies = this.ListAgencies.bind(this);
    this.GetAgency = this.GetAgency.bind(this);
    this.ListStops = this.ListStops.bind(this);
    this.GetStop = this.GetStop.bind(this);
    this.ListRoutes = this.ListRoutes.bind(this);
    this.GetRoute = this.GetRoute.bind(this);
    this.ListTrips = this.ListTrips.bind(this);
    this.GetTrip = this.GetTrip.bind(this);
    this.ListAlerts = this.ListAlerts.bind(this);
    this.GetAlert = this.GetAlert.bind(this);
    this.ListTransfers = this.ListTransfers.bind(this);
    this.ListFeeds = this.ListFeeds.bind(this);
    this.GetFeed = this.GetFeed.bind(this);
    this.ListFeedUpdates = this.ListFeedUpdates.bind(this);
  }
  Entrypoint(request: EntrypointRequest): Promise<EntrypointReply> {
    const data = EntrypointRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "Entrypoint", data);
    return promise.then((data) => EntrypointReply.decode(_m0.Reader.create(data)));
  }

  ListSystems(request: ListSystemsRequest): Promise<ListSystemsReply> {
    const data = ListSystemsRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "ListSystems", data);
    return promise.then((data) => ListSystemsReply.decode(_m0.Reader.create(data)));
  }

  GetSystem(request: GetSystemRequest): Promise<System> {
    const data = GetSystemRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "GetSystem", data);
    return promise.then((data) => System.decode(_m0.Reader.create(data)));
  }

  ListAgencies(request: ListAgenciesRequest): Promise<ListAgenciesReply> {
    const data = ListAgenciesRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "ListAgencies", data);
    return promise.then((data) => ListAgenciesReply.decode(_m0.Reader.create(data)));
  }

  GetAgency(request: GetAgencyRequest): Promise<Agency> {
    const data = GetAgencyRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "GetAgency", data);
    return promise.then((data) => Agency.decode(_m0.Reader.create(data)));
  }

  ListStops(request: ListStopsRequest): Promise<ListStopsReply> {
    const data = ListStopsRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "ListStops", data);
    return promise.then((data) => ListStopsReply.decode(_m0.Reader.create(data)));
  }

  GetStop(request: GetStopRequest): Promise<Stop> {
    const data = GetStopRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "GetStop", data);
    return promise.then((data) => Stop.decode(_m0.Reader.create(data)));
  }

  ListRoutes(request: ListRoutesRequest): Promise<ListRoutesReply> {
    const data = ListRoutesRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "ListRoutes", data);
    return promise.then((data) => ListRoutesReply.decode(_m0.Reader.create(data)));
  }

  GetRoute(request: GetRouteRequest): Promise<Route> {
    const data = GetRouteRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "GetRoute", data);
    return promise.then((data) => Route.decode(_m0.Reader.create(data)));
  }

  ListTrips(request: ListTripsRequest): Promise<ListTripsReply> {
    const data = ListTripsRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "ListTrips", data);
    return promise.then((data) => ListTripsReply.decode(_m0.Reader.create(data)));
  }

  GetTrip(request: GetTripRequest): Promise<Trip> {
    const data = GetTripRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "GetTrip", data);
    return promise.then((data) => Trip.decode(_m0.Reader.create(data)));
  }

  ListAlerts(request: ListAlertsRequest): Promise<ListAlertsReply> {
    const data = ListAlertsRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "ListAlerts", data);
    return promise.then((data) => ListAlertsReply.decode(_m0.Reader.create(data)));
  }

  GetAlert(request: GetAlertRequest): Promise<Alert> {
    const data = GetAlertRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "GetAlert", data);
    return promise.then((data) => Alert.decode(_m0.Reader.create(data)));
  }

  ListTransfers(request: ListTransfersRequest): Promise<ListTransfersReply> {
    const data = ListTransfersRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "ListTransfers", data);
    return promise.then((data) => ListTransfersReply.decode(_m0.Reader.create(data)));
  }

  ListFeeds(request: ListFeedsRequest): Promise<ListFeedsReply> {
    const data = ListFeedsRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "ListFeeds", data);
    return promise.then((data) => ListFeedsReply.decode(_m0.Reader.create(data)));
  }

  GetFeed(request: GetFeedRequest): Promise<Feed> {
    const data = GetFeedRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "GetFeed", data);
    return promise.then((data) => Feed.decode(_m0.Reader.create(data)));
  }

  ListFeedUpdates(request: ListFeedUpdatesRequest): Promise<ListFeedUpdatesReply> {
    const data = ListFeedUpdatesRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "ListFeedUpdates", data);
    return promise.then((data) => ListFeedUpdatesReply.decode(_m0.Reader.create(data)));
  }
}

interface Rpc {
  request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>;
}

declare var self: any | undefined;
declare var window: any | undefined;
declare var global: any | undefined;
var tsProtoGlobalThis: any = (() => {
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
  if (typeof self !== "undefined") {
    return self;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  throw "Unable to locate global object";
})();

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function longToNumber(long: Long): number {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new tsProtoGlobalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  return long.toNumber();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}

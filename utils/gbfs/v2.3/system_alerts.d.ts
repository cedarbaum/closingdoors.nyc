// Copyright 2024 MobilityData
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Describes ad-hoc changes to the system.
 */
export interface SystemAlerts {
    /**
     * Array that contains ad-hoc alerts for the system.
     */
    data: Data;
    /**
     * Last time the data in the feed was updated in POSIX time.
     */
    last_updated: number;
    /**
     * Number of seconds before the data in the feed will be updated again (0 if the data should
     * always be refreshed).
     */
    ttl: number;
    /**
     * GBFS version number to which the feed conforms, according to the versioning framework
     * (added in v1.1).
     */
    version: Version;
    [property: string]: any;
}

/**
 * Array that contains ad-hoc alerts for the system.
 */
export interface Data {
    alerts: Alert[];
    [property: string]: any;
}

export interface Alert {
    /**
     * Identifier for this alert.
     */
    alert_id: string;
    /**
     * Detailed description of the alert.
     */
    description?: string;
    /**
     * Indicates the last time the info for the alert was updated.
     */
    last_updated?: number;
    /**
     * Array of identifiers of the regions for which this alert applies.
     */
    region_ids?: string[];
    /**
     * Array of identifiers of the stations for which this alert applies.
     */
    station_ids?: string[];
    /**
     * A short summary of this alert to be displayed to the customer.
     */
    summary: string;
    /**
     * Array of objects indicating when the alert is in effect.
     */
    times?: Time[];
    /**
     * Type of alert.
     */
    type: Type;
    /**
     * URL where the customer can learn more information about this alert.
     */
    url?: string;
    [property: string]: any;
}

export interface Time {
    /**
     * End time of the alert.
     */
    end?: number;
    /**
     * Start time of the alert.
     */
    start?: number;
    [property: string]: any;
}

/**
 * Type of alert.
 */
export type Type = "system_closure" | "station_closure" | "station_move" | "other";

export type Version = "2.3";

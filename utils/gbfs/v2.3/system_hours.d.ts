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
 * Describes the system hours of operation.
 */
export interface SystemHours {
    /**
     * Array that contains system hours of operations.
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
 * Array that contains system hours of operations.
 */
export interface Data {
    rental_hours: RentalHour[];
    [property: string]: any;
}

export interface RentalHour {
    /**
     * An array of abbreviations (first 3 letters) of English names of the days of the week for
     * which this object applies.
     */
    days: Day[];
    /**
     * End time for the hours of operation of the system.
     */
    end_time: string;
    /**
     * Start time for the hours of operation of the system.
     */
    start_time: string;
    /**
     * Array of member and nonmember value(s) indicating that this set of rental hours applies
     * to either members or non-members only.
     */
    user_types: UserType[];
    [property: string]: any;
}

export type Day = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export type UserType = "member" | "nonmember";

export type Version = "2.3";

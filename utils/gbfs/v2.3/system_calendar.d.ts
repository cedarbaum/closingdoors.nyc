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
 * Describes the operating calendar for a system.
 */
export interface SystemCalendar {
    /**
     * Array that contains opertions calendar for the system.
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
 * Array that contains opertions calendar for the system.
 */
export interface Data {
    calendars: Calendar[];
    [property: string]: any;
}

export interface Calendar {
    /**
     * End day for the system operations.
     */
    end_day: number;
    /**
     * End month for the system operations.
     */
    end_month: number;
    /**
     * End year for the system operations.
     */
    end_year?: number;
    /**
     * Starting day for the system operations.
     */
    start_day: number;
    /**
     * Starting month for the system operations.
     */
    start_month: number;
    /**
     * Starting year for the system operations.
     */
    start_year?: number;
    [property: string]: any;
}

export type Version = "2.3";

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
 * List of all stations, their capacities and locations. REQUIRED of systems utilizing docks.
 */
export interface StationInformation {
    /**
     * Array that contains one object per station as defined below.
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
 * Array that contains one object per station as defined below.
 */
export interface Data {
    stations: Station[];
    [property: string]: any;
}

export interface Station {
    /**
     * Address where station is located.
     */
    address?: string;
    /**
     * Number of total docking points installed at this station, both available and unavailable.
     */
    capacity?: number;
    /**
     * Contact phone of the station. Added in v2.3
     */
    contact_phone?: string;
    /**
     * Cross street or landmark where the station is located.
     */
    cross_street?: string;
    /**
     * Does the station support charging of electric vehicles? (added in v2.3-RC)
     */
    is_charging_station?: boolean;
    /**
     * Are valet services provided at this station? (added in v2.1-RC)
     */
    is_valet_station?: boolean;
    /**
     * Is this station a location with or without physical infrastructure? (added in v2.1-RC)
     */
    is_virtual_station?: boolean;
    /**
     * The latitude of the station.
     */
    lat: number;
    /**
     * The longitude fo the station.
     */
    lon: number;
    /**
     * Public name of the station.
     */
    name: string;
    /**
     * Are parking hoops present at this station? Added in v2.3
     */
    parking_hoop?: boolean;
    /**
     * Type of parking station. Added in v2.3
     */
    parking_type?: ParkingType;
    /**
     * Postal code where station is located.
     */
    post_code?: string;
    /**
     * Identifier of the region where the station is located.
     */
    region_id?: string;
    /**
     * Payment methods accepted at this station.
     */
    rental_methods?: RentalMethod[];
    /**
     * Contains rental uris for Android, iOS, and web in the android, ios, and web fields (added
     * in v1.1).
     */
    rental_uris?: RentalUris;
    /**
     * Short name or other type of identifier.
     */
    short_name?: string;
    /**
     * A multipolygon that describes the area of a virtual station (added in v2.1-RC).
     */
    station_area?: StationArea;
    /**
     * Identifier of a station.
     */
    station_id: string;
    /**
     * An object where each key is a vehicle_type_id and the value is a number presenting the
     * total number of vehicles of this type that can park within the station_area (added in
     * v2.1-RC).
     */
    vehicle_capacity?: { [key: string]: number };
    /**
     * An object where each key is a vehicle_type_id and the value is a number representing the
     * total docking points installed at this station for each vehicle type (added in v2.1-RC).
     */
    vehicle_type_capacity?: { [key: string]: number };
    [property: string]: any;
}

/**
 * Type of parking station. Added in v2.3
 */
export type ParkingType = "parking_lot" | "street_parking" | "underground_parking" | "sidewalk_parking" | "other";

export type RentalMethod = "key" | "creditcard" | "paypass" | "applepay" | "androidpay" | "transitcard" | "accountnumber" | "phone";

/**
 * Contains rental uris for Android, iOS, and web in the android, ios, and web fields (added
 * in v1.1).
 */
export interface RentalUris {
    /**
     * URI that can be passed to an Android app with an intent (added in v1.1).
     */
    android?: string;
    /**
     * URI that can be used on iOS to launch the rental app for this station (added in v1.1).
     */
    ios?: string;
    /**
     * URL that can be used by a web browser to show more information about renting a vehicle at
     * this station (added in v1.1).
     */
    web?: string;
    [property: string]: any;
}

/**
 * A multipolygon that describes the area of a virtual station (added in v2.1-RC).
 */
export interface StationArea {
    coordinates: Array<Array<Array<number[]>>>;
    type:        Type;
    [property: string]: any;
}

export type Type = "MultiPolygon";

export type Version = "2.3";

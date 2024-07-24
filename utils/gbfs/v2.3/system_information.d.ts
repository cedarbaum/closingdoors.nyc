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
 * Details including system operator, system location, year implemented, URL, contact info,
 * time zone.
 */
export interface SystemInformation {
    /**
     * Response data in the form of name:value pairs.
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
 * Response data in the form of name:value pairs.
 */
export interface Data {
    /**
     * An object where each key defines one of the items listed below (added in v2.3-RC).
     */
    brand_assets?: BrandAssets;
    /**
     * Email address actively monitored by the operator's customer service department.
     */
    email?: string;
    /**
     * A single contact email address for consumers of this feed to report technical issues
     * (added in v1.1).
     */
    feed_contact_email?: string;
    /**
     * The language that will be used throughout the rest of the files. It must match the value
     * in the gbfs.json file.
     */
    language: string;
    /**
     * A fully qualified URL of a page that defines the license terms for the GBFS data for this
     * system.
     */
    license_url?: string;
    /**
     * Name of the system to be displayed to customers.
     */
    name: string;
    /**
     * Name of the operator
     */
    operator?: string;
    /**
     * A single voice telephone number for the specified system that presents the telephone
     * number as typical for the system's service area.
     */
    phone_number?: string;
    /**
     * The date that the privacy policy provided at privacy_url was last updated (added in
     * v2.3-RC).
     */
    privacy_last_updated?: string;
    /**
     * A fully qualified URL pointing to the privacy policy for the service (added in v2.3-RC).
     */
    privacy_url?: string;
    /**
     * URL where a customer can purchase a membership.
     */
    purchase_url?: string;
    /**
     * Contains rental app information in the android and ios JSON objects (added in v1.1).
     */
    rental_apps?: RentalApps;
    /**
     * Optional abbreviation for a system.
     */
    short_name?: string;
    /**
     * Date that the system began operations.
     */
    start_date?: string;
    /**
     * Identifier for this vehicle share system. This should be globally unique (even between
     * different systems).
     */
    system_id: string;
    /**
     * The date that the terms of service provided at terms_url were last updated (added in
     * v2.3-RC)
     */
    terms_last_updated?: string;
    /**
     * A fully qualified URL pointing to the terms of service (added in v2.3-RC)
     */
    terms_url?: string;
    /**
     * The time zone where the system is located.
     */
    timezone: Timezone;
    /**
     * The URL of the vehicle share system.
     */
    url?: string;
    [property: string]: any;
}

/**
 * An object where each key defines one of the items listed below (added in v2.3-RC).
 */
export interface BrandAssets {
    /**
     * A fully qualified URL pointing to the location of a graphic file representing the brand
     * for the service (added in v2.3-RC).
     */
    brand_image_url: string;
    /**
     * A fully qualified URL pointing to the location of a graphic file representing the brand
     * for the service for use in dark mode (added in v2.3-RC).
     */
    brand_image_url_dark?: string;
    /**
     * Date that indicates the last time any included brand assets were updated (added in
     * v2.3-RC).
     */
    brand_last_modified: string;
    /**
     * A fully qualified URL pointing to the location of a page that defines the license terms
     * of brand icons, colors or other trademark information (added in v2.3-RC).
     */
    brand_terms_url?: string;
    /**
     * Color used to represent the brand for the service (added in v2.3-RC)
     */
    color?: string;
    [property: string]: any;
}

/**
 * Contains rental app information in the android and ios JSON objects (added in v1.1).
 */
export interface RentalApps {
    /**
     * Contains rental app download and app discovery information for the Android platform.
     * (added in v1.1)
     */
    android?: Android;
    /**
     * Contains rental information for the iOS platform (added in v1.1).
     */
    ios?: Ios;
    [property: string]: any;
}

/**
 * Contains rental app download and app discovery information for the Android platform.
 * (added in v1.1)
 */
export interface Android {
    /**
     * URI that can be used to discover if the rental Android app is installed on the device
     * (added in v1.1).
     */
    discovery_uri: string;
    /**
     * URI where the rental Android app can be downloaded from (added in v1.1).
     */
    store_uri: string;
    [property: string]: any;
}

/**
 * Contains rental information for the iOS platform (added in v1.1).
 */
export interface Ios {
    /**
     * URI that can be used to discover if the rental iOS app is installed on the device (added
     * in v1.1).
     */
    discovery_uri: string;
    /**
     * URI where the rental iOS app can be downloaded from (added in v1.1).
     */
    store_uri: string;
    [property: string]: any;
}

/**
 * The time zone where the system is located.
 */
export type Timezone = "Africa/Abidjan" | "Africa/Algiers" | "Africa/Bissau" | "Africa/Cairo" | "Africa/Casablanca" | "Africa/Ceuta" | "Africa/El_Aaiun" | "Africa/Johannesburg" | "Africa/Juba" | "Africa/Khartoum" | "Africa/Lagos" | "Africa/Maputo" | "Africa/Monrovia" | "Africa/Nairobi" | "Africa/Ndjamena" | "Africa/Sao_Tome" | "Africa/Tripoli" | "Africa/Tunis" | "Africa/Windhoek" | "America/Adak" | "America/Anchorage" | "America/Araguaina" | "America/Argentina/Buenos_Aires" | "America/Argentina/Catamarca" | "America/Argentina/Cordoba" | "America/Argentina/Jujuy" | "America/Argentina/La_Rioja" | "America/Argentina/Mendoza" | "America/Argentina/Rio_Gallegos" | "America/Argentina/Salta" | "America/Argentina/San_Juan" | "America/Argentina/San_Luis" | "America/Argentina/Tucuman" | "America/Argentina/Ushuaia" | "America/Asuncion" | "America/Bahia" | "America/Bahia_Banderas" | "America/Barbados" | "America/Belem" | "America/Belize" | "America/Boa_Vista" | "America/Bogota" | "America/Boise" | "America/Cambridge_Bay" | "America/Campo_Grande" | "America/Cancun" | "America/Caracas" | "America/Cayenne" | "America/Chicago" | "America/Chihuahua" | "America/Costa_Rica" | "America/Cuiaba" | "America/Danmarkshavn" | "America/Dawson" | "America/Dawson_Creek" | "America/Denver" | "America/Detroit" | "America/Edmonton" | "America/Eirunepe" | "America/El_Salvador" | "America/Fort_Nelson" | "America/Fortaleza" | "America/Glace_Bay" | "America/Goose_Bay" | "America/Grand_Turk" | "America/Guatemala" | "America/Guayaquil" | "America/Guyana" | "America/Halifax" | "America/Havana" | "America/Hermosillo" | "America/Indiana/Indianapolis" | "America/Indiana/Knox" | "America/Indiana/Marengo" | "America/Indiana/Petersburg" | "America/Indiana/Tell_City" | "America/Indiana/Vevay" | "America/Indiana/Vincennes" | "America/Indiana/Winamac" | "America/Inuvik" | "America/Iqaluit" | "America/Jamaica" | "America/Juneau" | "America/Kentucky/Louisville" | "America/Kentucky/Monticello" | "America/La_Paz" | "America/Lima" | "America/Los_Angeles" | "America/Maceio" | "America/Managua" | "America/Manaus" | "America/Martinique" | "America/Matamoros" | "America/Mazatlan" | "America/Menominee" | "America/Merida" | "America/Metlakatla" | "America/Mexico_City" | "America/Miquelon" | "America/Moncton" | "America/Monterrey" | "America/Montevideo" | "America/New_York" | "America/Nipigon" | "America/Nome" | "America/Noronha" | "America/North_Dakota/Beulah" | "America/North_Dakota/Center" | "America/North_Dakota/New_Salem" | "America/Nuuk" | "America/Ojinaga" | "America/Panama" | "America/Pangnirtung" | "America/Paramaribo" | "America/Phoenix" | "America/Port-au-Prince" | "America/Porto_Velho" | "America/Puerto_Rico" | "America/Punta_Arenas" | "America/Rainy_River" | "America/Rankin_Inlet" | "America/Recife" | "America/Regina" | "America/Resolute" | "America/Rio_Branco" | "America/Santarem" | "America/Santiago" | "America/Santo_Domingo" | "America/Sao_Paulo" | "America/Scoresbysund" | "America/Sitka" | "America/St_Johns" | "America/Swift_Current" | "America/Tegucigalpa" | "America/Thule" | "America/Thunder_Bay" | "America/Tijuana" | "America/Toronto" | "America/Vancouver" | "America/Whitehorse" | "America/Winnipeg" | "America/Yakutat" | "America/Yellowknife" | "Antarctica/Casey" | "Antarctica/Davis" | "Antarctica/Macquarie" | "Antarctica/Mawson" | "Antarctica/Palmer" | "Antarctica/Rothera" | "Antarctica/Troll" | "Antarctica/Vostok" | "Asia/Almaty" | "Asia/Amman" | "Asia/Anadyr" | "Asia/Aqtau" | "Asia/Aqtobe" | "Asia/Ashgabat" | "Asia/Atyrau" | "Asia/Baghdad" | "Asia/Baku" | "Asia/Bangkok" | "Asia/Barnaul" | "Asia/Beirut" | "Asia/Bishkek" | "Asia/Brunei" | "Asia/Chita" | "Asia/Choibalsan" | "Asia/Colombo" | "Asia/Damascus" | "Asia/Dhaka" | "Asia/Dili" | "Asia/Dubai" | "Asia/Dushanbe" | "Asia/Famagusta" | "Asia/Gaza" | "Asia/Hebron" | "Asia/Ho_Chi_Minh" | "Asia/Hong_Kong" | "Asia/Hovd" | "Asia/Irkutsk" | "Asia/Jakarta" | "Asia/Jayapura" | "Asia/Jerusalem" | "Asia/Kabul" | "Asia/Kamchatka" | "Asia/Karachi" | "Asia/Kathmandu" | "Asia/Khandyga" | "Asia/Kolkata" | "Asia/Krasnoyarsk" | "Asia/Kuala_Lumpur" | "Asia/Kuching" | "Asia/Macau" | "Asia/Magadan" | "Asia/Makassar" | "Asia/Manila" | "Asia/Nicosia" | "Asia/Novokuznetsk" | "Asia/Novosibirsk" | "Asia/Omsk" | "Asia/Oral" | "Asia/Pontianak" | "Asia/Pyongyang" | "Asia/Qatar" | "Asia/Qostanay" | "Asia/Qyzylorda" | "Asia/Riyadh" | "Asia/Sakhalin" | "Asia/Samarkand" | "Asia/Seoul" | "Asia/Shanghai" | "Asia/Singapore" | "Asia/Srednekolymsk" | "Asia/Taipei" | "Asia/Tashkent" | "Asia/Tbilisi" | "Asia/Tehran" | "Asia/Thimphu" | "Asia/Tokyo" | "Asia/Tomsk" | "Asia/Ulaanbaatar" | "Asia/Urumqi" | "Asia/Ust-Nera" | "Asia/Vladivostok" | "Asia/Yakutsk" | "Asia/Yangon" | "Asia/Yekaterinburg" | "Asia/Yerevan" | "Atlantic/Azores" | "Atlantic/Bermuda" | "Atlantic/Canary" | "Atlantic/Cape_Verde" | "Atlantic/Faroe" | "Atlantic/Madeira" | "Atlantic/Reykjavik" | "Atlantic/South_Georgia" | "Atlantic/Stanley" | "Australia/Adelaide" | "Australia/Brisbane" | "Australia/Broken_Hill" | "Australia/Darwin" | "Australia/Eucla" | "Australia/Hobart" | "Australia/Lindeman" | "Australia/Lord_Howe" | "Australia/Melbourne" | "Australia/Perth" | "Australia/Sydney" | "CET" | "CST6CDT" | "EET" | "EST" | "EST5EDT" | "Etc/GMT" | "Etc/GMT-1" | "Etc/GMT-10" | "Etc/GMT-11" | "Etc/GMT-12" | "Etc/GMT-13" | "Etc/GMT-14" | "Etc/GMT-2" | "Etc/GMT-3" | "Etc/GMT-4" | "Etc/GMT-5" | "Etc/GMT-6" | "Etc/GMT-7" | "Etc/GMT-8" | "Etc/GMT-9" | "Etc/GMT+1" | "Etc/GMT+10" | "Etc/GMT+11" | "Etc/GMT+12" | "Etc/GMT+2" | "Etc/GMT+3" | "Etc/GMT+4" | "Etc/GMT+5" | "Etc/GMT+6" | "Etc/GMT+7" | "Etc/GMT+8" | "Etc/GMT+9" | "Etc/UTC" | "Europe/Amsterdam" | "Europe/Andorra" | "Europe/Astrakhan" | "Europe/Athens" | "Europe/Belgrade" | "Europe/Berlin" | "Europe/Brussels" | "Europe/Bucharest" | "Europe/Budapest" | "Europe/Chisinau" | "Europe/Copenhagen" | "Europe/Dublin" | "Europe/Gibraltar" | "Europe/Helsinki" | "Europe/Istanbul" | "Europe/Kaliningrad" | "Europe/Kiev" | "Europe/Kirov" | "Europe/Lisbon" | "Europe/London" | "Europe/Luxembourg" | "Europe/Madrid" | "Europe/Malta" | "Europe/Minsk" | "Europe/Monaco" | "Europe/Moscow" | "Europe/Oslo" | "Europe/Paris" | "Europe/Prague" | "Europe/Riga" | "Europe/Rome" | "Europe/Samara" | "Europe/Saratov" | "Europe/Simferopol" | "Europe/Sofia" | "Europe/Stockholm" | "Europe/Tallinn" | "Europe/Tirane" | "Europe/Ulyanovsk" | "Europe/Uzhgorod" | "Europe/Vienna" | "Europe/Vilnius" | "Europe/Volgograd" | "Europe/Warsaw" | "Europe/Zaporozhye" | "Europe/Zurich" | "HST" | "Indian/Chagos" | "Indian/Christmas" | "Indian/Cocos" | "Indian/Kerguelen" | "Indian/Mahe" | "Indian/Maldives" | "Indian/Mauritius" | "Indian/Reunion" | "MET" | "MST" | "MST7MDT" | "Pacific/Apia" | "Pacific/Auckland" | "Pacific/Bougainville" | "Pacific/Chatham" | "Pacific/Chuuk" | "Pacific/Easter" | "Pacific/Efate" | "Pacific/Fakaofo" | "Pacific/Fiji" | "Pacific/Funafuti" | "Pacific/Galapagos" | "Pacific/Gambier" | "Pacific/Guadalcanal" | "Pacific/Guam" | "Pacific/Honolulu" | "Pacific/Kanton" | "Pacific/Kiritimati" | "Pacific/Kosrae" | "Pacific/Kwajalein" | "Pacific/Majuro" | "Pacific/Marquesas" | "Pacific/Nauru" | "Pacific/Niue" | "Pacific/Norfolk" | "Pacific/Noumea" | "Pacific/Pago_Pago" | "Pacific/Palau" | "Pacific/Pitcairn" | "Pacific/Pohnpei" | "Pacific/Port_Moresby" | "Pacific/Rarotonga" | "Pacific/Tahiti" | "Pacific/Tarawa" | "Pacific/Tongatapu" | "Pacific/Wake" | "Pacific/Wallis" | "PST8PDT" | "WET";

export type Version = "2.3";

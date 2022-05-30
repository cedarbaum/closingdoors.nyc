import React, { useEffect, useState } from 'react'
import { gql, useQuery } from '@apollo/client'
import { nearestStations, trainTimes } from '../graphql/queries'
import { QueryNearestStationsArgs, QueryTrainTimesArgs, TrainTimesQuery, NearestStationsQuery, Direction } from '../graphql/types'
import { usePosition } from 'use-position'
import { StationHeader } from '../StationHeader/StationHeader'
import { DURATION_FORMAT, TripView } from '../TripView/TripView'
import { DateTime } from 'luxon'
import { DIRECTION } from '../utils/SubwayLines'
import { ErrorPage } from '../ErrorPage/ErrorPage'
import haversineDistance from 'haversine-distance'
import * as S from './ScheduleView.styles'
import { LoadingView } from '../LoadingView/LoadingView'

export interface ScheduleViewProps {
    stations?: Set<string>
    services: Set<string>
    direction: DIRECTION
}

interface LatLonPair {
    lat: number
    lon: number
}

export const ScheduleView: React.FC<ScheduleViewProps> = (props) => {
    let { latitude, longitude, errorMessage: locationErrorMessage } = usePosition(true, { maximumAge: 60 * 1000, timeout: 30 * 1000, enableHighAccuracy: false })
    const [lastNearestStationData, setLastNearestStationData] = useState<NearestStationsQuery | undefined>(undefined)
    const [lastLocation, setLastLocation] = useState<LatLonPair | undefined>(undefined)
    const [, setTime] = useState(Date.now());
    const [durationFormat, setDurationFormat] = useState(DURATION_FORMAT.MinuteCeiling);

    if (latitude !== undefined && longitude !== undefined && lastLocation !== undefined) {
        if (haversineDistance(lastLocation, { lat: latitude, lon: longitude }) < 50) {
            latitude = lastLocation.lat
            longitude = lastLocation.lon
        }
    }

    let { loading: loadingNearestStations, error: errorNearestStations, data: nearestStationsData } = useQuery<NearestStationsQuery, QueryNearestStationsArgs>(gql(nearestStations), {
        variables: { lat: latitude, lon: longitude },
        skip: latitude === undefined || longitude === undefined
    });

    const { loading: loadingTimes, error: errorTimes, data: dataTimes } = useQuery<TrainTimesQuery, QueryTrainTimesArgs>(gql(trainTimes), {
        variables: {
            services: Array.from(props.services.values()),
            directions: props.direction === DIRECTION.DOWNTOWN ? [Direction.South] : [Direction.North]
        },
        pollInterval: 15000,
    });

    useEffect(() => {
        setLastNearestStationData(nearestStationsData)
        if (latitude !== undefined && longitude !== undefined) {
            setLastLocation({ lat: latitude, lon: longitude })
        }
    }, [nearestStationsData, latitude, longitude])

    useEffect(() => {
        const interval = setInterval(() => setTime(Date.now()), 1000);
        return () => {
            clearInterval(interval);
        };
    }, []);

    if (locationErrorMessage) {
        return <ErrorPage errorCode='LOCATION_FAILURE' error={<>Failed to get current location. Please ensure location access is enabled.</>} />
    }

    if (errorNearestStations || errorTimes) {
        return <ErrorPage errorCode='API_FAILURE' error={<>An error occurred while fetching schedules. Will retry shortly.</>} />
    }

    if (dataTimes?.trainTimes?.stationServiceTrips?.length === 0) {
        return <ErrorPage errorCode='NO_SERVICES' error={<>Selected services don't appear to be running.</>} />
    }

    if (loadingTimes || (loadingNearestStations && lastNearestStationData === undefined) || latitude === undefined || longitude === undefined) {
        return <LoadingView />
    }

    const now = DateTime.now()
    if (dataTimes?.trainTimes?.updatedAt) {
        const updateDelta = now.diff(DateTime.fromSeconds(dataTimes.trainTimes.updatedAt))
        if (updateDelta.toMillis() >= 2 * 60 * 1000) {
            return <ErrorPage errorCode='STALE_DATA' error={<>Data retrieved from server is out of date. Will retry to fetch new data shortly.</>} />
        }
    }

    if (nearestStationsData === undefined) {
        nearestStationsData = lastNearestStationData
    }

    const stationToServiceTripsMap = new Map(dataTimes!.trainTimes!.stationServiceTrips!.map(
        stationAndTrips => [stationAndTrips?.stationId, stationAndTrips?.serviceTrips]));

    return <S.Container>
        <S.Table>
            {nearestStationsData!.nearestStations!.map(station => {
                const stationWithDirection = `${station?.id}${props.direction}`
                if (!stationToServiceTripsMap.has(stationWithDirection)) {
                    return <></>
                }
                const header = <S.StickyThead>
                    <tr key={stationWithDirection}>
                        <S.Th key={`${stationWithDirection}header`}>
                            <StationHeader stationName={station!.name}></StationHeader>
                        </S.Th>
                    </tr>
                </S.StickyThead>

                const stationRows = stationToServiceTripsMap.get(stationWithDirection)!.flatMap(routeAndTimes => {
                    return routeAndTimes!.trips!.slice(0, 2).map((trip, idx) => {
                        const estimatedArrival = DateTime.fromSeconds(trip!.arrival)
                        const delta = estimatedArrival.diff(now)

                        return [trip!.arrival, <tr key={`${stationWithDirection}${routeAndTimes!.service}${idx}`}>
                            <S.Td>
                                <TripView
                                    onClickTimeText={() => {
                                        setDurationFormat(durationFormat === DURATION_FORMAT.Exact
                                            ? DURATION_FORMAT.MinuteCeiling
                                            : DURATION_FORMAT.Exact)
                                    }}
                                    service={routeAndTimes!.service}
                                    timeUntilArrival={delta}
                                    durationFormat={durationFormat}
                                    direction={props.direction} />
                            </S.Td>
                        </tr>] as [number, JSX.Element]
                    })
                }).sort((t1, t2) => t1[0] - t2[0]).map(t => t[1])

                const tbody = <tbody>
                    {stationRows}
                </tbody>

                return [header, tbody]
            })}
        </S.Table>
    </S.Container>
}

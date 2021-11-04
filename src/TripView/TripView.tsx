import React from 'react'
import { SubwayIcon } from '../SubwayIcon/SubwayIcon'
import { DIRECTION, serviceToLineMetadataMap, TEXT_COLORS } from '../utils/SubwayLines'
import * as S from './TripView.styles'

import { faArrowUp, faArrowDown } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Duration } from 'luxon'
import humanizeDuration from "humanize-duration"

export enum DURATION_FORMAT {
    MinuteCeiling,
    Exact
}

export interface TripViewProps {
    service: string
    direction: DIRECTION,
    timeUntilArrival: Duration
    durationFormat?: DURATION_FORMAT
    onClickTimeText?(): void
}

export const TripView: React.FC<TripViewProps> = (props) => {
    const isExpress = props.service.endsWith('X')
    const normalizedServiceName = isExpress ? props.service.substring(0, props.service.length - 1) : props.service
    const line = serviceToLineMetadataMap.get(normalizedServiceName)!

    const durationAbsValue = props.timeUntilArrival.toMillis() < 0 ? props.timeUntilArrival.negate() : props.timeUntilArrival;
    const displayArrivingNow = props.timeUntilArrival.toMillis() < 15 * 1000 && props.durationFormat === DURATION_FORMAT.MinuteCeiling
    const lessThanAMin = durationAbsValue.toMillis() < 60 * 1000
    const staleTrip = props.timeUntilArrival.toMillis() < -1 * 30 * 1000 || (props.durationFormat === DURATION_FORMAT.Exact && props.timeUntilArrival.toMillis() < 0)
    const shortEnglishHumanizer = humanizeDuration.humanizer({
        language: "shortEn",
        languages: {
            shortEn: {
                h: (units: any) => units && units > 1 ? 'hrs' : 'hr',
                m: (units: any) => units && units > 1 ? 'mins' : 'min',
                s: (units: any) => units && units > 1 ? 'secs' : 'sec',
            },
        },
    });

    let durationStr: string
    if (props.durationFormat === DURATION_FORMAT.Exact) {
        const formatStr = durationAbsValue.milliseconds >= 3600 * 1000 ? 'h:mm:ss' : 'm:ss'
        durationStr = durationAbsValue.toFormat(formatStr)
    }
    else {
        if (lessThanAMin) {
            durationStr = shortEnglishHumanizer(durationAbsValue.milliseconds, {
                units: ['m', 's'],
                round: true
            })
        }
        else {
            const ceilingMinutesMilliseconds = Math.ceil(durationAbsValue.milliseconds / (60 * 1000)) * (60 * 1000)
            durationStr = shortEnglishHumanizer(ceilingMinutesMilliseconds, {
                units: ['h', 'm'],
                round: true
            })
        }
    }

    return <S.Container>
        <S.LeftContainer>
            <SubwayIcon color={line.color} name={normalizedServiceName} isExpress={isExpress} textColor={line.textColor ?? TEXT_COLORS.WHITE} />
            <S.MarginLeft>
                <FontAwesomeIcon icon={props.direction === DIRECTION.UPTOWN ? faArrowUp : faArrowDown} color={'white'} size={'2x'} />
            </S.MarginLeft>
        </S.LeftContainer>
        <S.RightContainer>
            {
                !staleTrip ?
                    <S.TimeText onClick={() => props.onClickTimeText && props.onClickTimeText()}
                        animate={displayArrivingNow}>{displayArrivingNow ? 'Now' : durationStr}</S.TimeText> :
                    <S.TimeText onClick={() => props.onClickTimeText && props.onClickTimeText()}
                        animate={false}
                        textColor='#FCCC0A'>{`${durationStr} ago`}</S.TimeText>
            }
        </S.RightContainer>
    </S.Container>
}
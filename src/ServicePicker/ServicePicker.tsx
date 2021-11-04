import React, { useCallback, useState } from 'react'

import { SubwayIcon } from "../SubwayIcon/SubwayIcon"
import { allLines, DIRECTION } from "../utils/SubwayLines"
import { faArrowUp, faArrowDown } from '@fortawesome/pro-light-svg-icons'
import { faArrowUp as boldFaArrowUp, faArrowDown as boldFaArrowDown } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useNavigate } from 'react-router-dom';
import * as S from './ServicePicker.styles'
import { gql, useQuery } from '@apollo/client'
import { SystemMetadataQuery } from '../graphql/types'
import { systemMetadata } from '../graphql/queries'
import { LoadingView } from '../LoadingView/LoadingView'

interface RoutePickerProps {
    onError?(error: JSX.Element): void
}

export const ServicePicker: React.FC<RoutePickerProps> = (props) => {
    const [selectedServices, setSelectedServices] = useState(new Set<string>())
    const [direction, setDirection] = useState<DIRECTION | null>(null)
    const navigate = useNavigate();
    const { loading: loadingMetadata, error: errorMetadata, data: metadata } = useQuery<SystemMetadataQuery>(gql(systemMetadata), {
        pollInterval: 30000,
    });

    const directionNotSetError = <>Select <FontAwesomeIcon icon={boldFaArrowUp} color={'black'} /> or <FontAwesomeIcon icon={boldFaArrowDown} color={'black'} />.</>
    const noRoutesSelected = <>Select at least 1 route.</>

    const handleOnClick = useCallback(() => {
        if (direction == null) {
            props.onError && props.onError(directionNotSetError)
        }
        else if (selectedServices.size === 0) {
            props.onError && props.onError(noRoutesSelected)
        }
        else {
            navigate(`/schedule?services=${Array.from(selectedServices)}&direction=${direction}`)
        }
    }, [navigate, selectedServices, direction])

    const uptownArrowColor = direction === DIRECTION.UPTOWN ? 'white' : '#ffffffab'
    const uptownArrowIcon = direction === DIRECTION.UPTOWN ? boldFaArrowUp : faArrowUp
    const downtownArrowColor = direction === DIRECTION.DOWNTOWN ? 'white' : '#ffffffab'
    const downtownArrowIcon = direction === DIRECTION.DOWNTOWN ? boldFaArrowDown : faArrowDown

    const formIsValid = selectedServices.size > 0 && direction !== null
    const submitButtonTextColor = formIsValid ? 'white' : '#ffffffab'

    let runningServices: Set<string> | undefined = undefined
    if (loadingMetadata) {
        return <LoadingView />
    }

    if (metadata && !errorMetadata) {
        runningServices = new Set(metadata!.systemMetadata!.runningServices!.services!)
    }

    return <S.Container>
        <S.ArrowsContainer>
            <S.ArrowContainer onClick={() => setDirection(DIRECTION.UPTOWN)}>
                <FontAwesomeIcon size={'lg'} icon={uptownArrowIcon} color={uptownArrowColor} />
            </S.ArrowContainer>
            <S.ArrowContainer onClick={() => setDirection(DIRECTION.DOWNTOWN)}>
                <FontAwesomeIcon size={'lg'} icon={downtownArrowIcon} color={downtownArrowColor} />
            </S.ArrowContainer>
        </S.ArrowsContainer>
        <S.ServicesContainer>
            {allLines.map(line => {
                return <S.IconContainer key={line.name}>
                    {line.services.map(service => {
                        const serviceKey = service.isExpress ? `${service.name}X` : service.name
                        if (runningServices !== undefined && !runningServices.has(serviceKey)) {
                            return <></>
                        }

                        const color = selectedServices.has(serviceKey) || !line.unselectedColor ? line.color : line.unselectedColor

                        return <SubwayIcon key={serviceKey} {...service} color={color} textColor={line.textColor} onClick={() => {
                            // BUG: Below case shouldn't ne needed, but for some reason adding an element
                            // to the initial empty set doesn't correctly update state on next render.
                            // Creating a new set without relying on prevState fixes this.
                            if (selectedServices.size === 0) {
                                setSelectedServices(new Set([serviceKey]))
                            }
                            if (!selectedServices.has(serviceKey)) {
                                setSelectedServices(prevState => new Set(prevState.add(serviceKey)))
                            }
                            else {
                                setSelectedServices(prevState => {
                                    prevState.delete(serviceKey)
                                    return new Set(prevState)
                                })
                            }
                        }}>{service.name}</SubwayIcon>
                    })}
                </S.IconContainer>
            })}
        </S.ServicesContainer>
        <S.SubmitButton textColor={submitButtonTextColor} onClick={handleOnClick}>Get schedule</S.SubmitButton>
    </S.Container>
}

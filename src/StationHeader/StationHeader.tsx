import React from 'react'

import * as S from './StationHeader.styles'


export interface StationHeaderProps {
    stationName: string
}

export const StationHeader: React.FC<StationHeaderProps> = (props) => {
    return <S.Container>
        <S.StationText>{props.stationName}</S.StationText>
    </S.Container>
}

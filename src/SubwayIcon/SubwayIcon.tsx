import * as S from './SubwayIcon.styles'

export interface SubwayIconProps extends S.SubwayIconColorProps {
    name: string
    isExpress?: boolean
    onClick?(): void
}

export const SubwayIcon: React.FC<SubwayIconProps> = (props) => {
    return <S.SubwayIconContainer clickable={props.onClick !== undefined} onClick={() => props.onClick && props.onClick()}>
        {
            props.isExpress ?
                <S.ExpressSubwayIcon {...props}>{props.name}</S.ExpressSubwayIcon>
                : <S.LocalSubwayIcon {...props}>{props.name}</S.LocalSubwayIcon>}
    </S.SubwayIconContainer>
}

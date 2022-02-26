import styled from '@emotion/styled';

/*
    Styling based on https://github.com/CityOfNewYork/nyc-core-framework
*/

const ICON_PADDING_EM = 0.4

export interface SubwayIconContainerProps {
    clickable?: boolean
}
export interface SubwayIconColorProps {
    color: string
    textColor?: string
}

export const SubwayIconContainer = styled.div<SubwayIconContainerProps>(props => ({
    minWidth: '3.1em',
    minHeight: '3.1em',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    ...props.clickable && { cursor: 'pointer' }
}))

export const BaseSubwayIcon = styled.span<SubwayIconColorProps>(props => ({
    position: 'relative',
    fontSize: '32px',
    zIndex: 5,
    height: '1em',
    width: '1em',
    lineHeight: '1em',
    marginLeft: `${ICON_PADDING_EM / 2}em`,
    marginRight: `${ICON_PADDING_EM / 2}em`,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'inline-flex',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif',
    textAlign: 'center',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: `${props.textColor ?? '#fff'}`,
    '&::before': {
        content: "''",
        position: 'absolute',
        zIndex: -1,
        width: `calc(100% + ${ICON_PADDING_EM}em)`,
        height: `calc(100% + ${ICON_PADDING_EM}em)`,
        left: `-${ICON_PADDING_EM / 2}em`,
        top: `-${ICON_PADDING_EM / 2}em`,
        borderRadius: '50%',
        backgroundColor: `${props.color}`,
    }   
}))

export const LocalSubwayIcon = styled(BaseSubwayIcon)({})

export const ExpressSubwayIcon = styled(BaseSubwayIcon)({
    marginLeft: `{${ICON_PADDING_EM}/1.5}em`,
    marginRight: `${ICON_PADDING_EM}/1.5}em`,
    '&::before': {
        transform: 'rotate(45deg)',
        borderRadius: 0,
        width: `calc(100% + ${ICON_PADDING_EM / 4}em)`,
        height: `calc(100% + ${ICON_PADDING_EM / 4}em)`,
        left: `-${ICON_PADDING_EM / 8}em`,
        top: `-${ICON_PADDING_EM / 8}em`,
    }
})
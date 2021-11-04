import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'

export interface TimeTextProps {
    textColor?: string
    animate?: boolean
}

export const Container = styled.div({
    width: '100%',
    height: '4em',
    backgroundColor: 'black',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif',
})

export const flickerKeyFrames = keyframes`
  0%   { opacity:1; }
  100%  { opacity:0.5; }
`

export const TimeText = styled.span<TimeTextProps>(props => ({
    color: props.textColor ?? 'white',
    fontSize: '2em',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    /*
    maxWidth: 'calc((100vw - 2em) / 2)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'inline-block',
    whiteSpace: 'nowrap',
    */
    ...props.animate && {
        animation: `${flickerKeyFrames} 1s infinite alternate`,
        animationTimingFunction: 'ease-in-out'
    }
}))

export const MarginLeft = styled.div({
    marginLeft: '1em',
})

export const LeftContainer = styled(MarginLeft)({
    display: 'flex',
    backgroundColor: 'black',
    alignItems: 'center',
})

export const RightContainer = styled.div({
    marginRight: '1em',
    backgroundColor: 'black',
})
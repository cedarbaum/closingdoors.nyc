import styled from '@emotion/styled'
import { keyframes } from '@emotion/react';

export interface ErrorDisplayProps {
    ty?: number
    animate?: boolean
}

export const FullscreenBackground = styled.div({
    width: '100%',
    height: '100%',
    backgroundColor: 'black'
})

export const Container = styled.div({
    maxWidth: '480px',
    marginLeft: 'auto',
    marginRight: 'auto',
    height: '100%',
})

export const slideErrorDisplay = (ty: number | undefined) => keyframes`
    0%, 100% { top: -${ty}px; }
    10%, 90% { top: 0; }
`

export const RouteOutletContainer = styled.div({
    height: '100%',
})

export const ErrorDisplay = styled.div<ErrorDisplayProps>(props => ({
    zIndex: 101,
    position: 'fixed',
    top: `-${props.ty ?? 0}px`,
    left: 0,
    right: 0,
    background: '#FCCC0A',
    width: '100%',
    boxSizing: 'border-box',
    padding: '1em',
    overflow: 'hidden;',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif',
    fontSize: '1.2em',
    fontWeight: 'bold',
    ...props.animate && { 'animation': `${slideErrorDisplay(props.ty)} 1.5s 0.0s 1 ease forwards` }
}))
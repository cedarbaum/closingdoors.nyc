import styled from '@emotion/styled'

export interface SubmitButtonProps {
    textColor: string
}

export const Container = styled.div({
    overflow: 'scroll',
    height: '100%',
    scrollbarWidth: 'none',
    backgroundColor: 'black',
    '::webkit-scrollbar': {
        display: 'none'
    }
})

export const CenterContainer = styled.div({
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
})

export const ArrowsContainer = styled.div({
    width: '100%',
    display: 'flex',
    position: 'sticky',
    top: '0',
    zIndex: 100,
})

export const ArrowContainer = styled.div({
    fontSize: '30px',
    height: '2.5em',
    width: '50%',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    backgroundColor: 'black'
})

export const SubmitButton = styled.button<SubmitButtonProps>(props => ({
    backgroundColor: 'black',
    color: props.textColor,
    bottom: '0',
    position: 'sticky',
    margin: 'auto',
    width: '100%',
    height: '50px',
    zIndex: 100,
    fontFamily: '"Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif',
    textAlign: 'center',
    fontSize: '1.5em',
    fontWeight: 'bold',
    border: '0',
}))

export const ServicesContainer = styled.div({
    margin: '0.5em'
})

export const IconContainer = styled.div({
    marginLeft: '15px',
    display: 'flex',
    '*:not(:first-child)': {
        marginLeft: '15px'
    },
    paddingTop: '0.5em'
})
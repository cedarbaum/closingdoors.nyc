import styled from '@emotion/styled'

export const Container = styled.div({
    width: '100%',
    height: '2em',
    backgroundColor: 'black',
    display: 'flex',
    alignItems: 'center',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif',
    fontSize: '1.2em',
})

export const StationText = styled.span({
    marginLeft: '1em',
    marginRight: '1em',
    color: 'white',
    textAlign: 'left',
    overflow: 'hidden',
    maxWidth: 'calc(100vw - 2em)',
    whiteSpace:'nowrap',
    textOverflow: 'ellipsis'
})
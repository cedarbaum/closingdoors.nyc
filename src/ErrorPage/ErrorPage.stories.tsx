import React from 'react'
import { Meta } from '@storybook/react';
import styled from '@emotion/styled'
import { ErrorPage } from './ErrorPage';

export default {
    component: ErrorPage,
    title: 'ErrorPage',
} as Meta;

const Container = styled.div({
    minHeight: '720px',
    display: 'flex',
})

export const Default: React.VFC<{}> = () => <Container>
    <ErrorPage error={<>Something bad happened...</>} errorCode='42' />
</Container>

export const StaleData: React.VFC<{}> = () => <Container>
    <ErrorPage errorCode='STALE_DATA' error={<>Data retrieved from server is out of date. Will retry to fetch new data shortly.</>} />
</Container>

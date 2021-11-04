import React from 'react'
import { Meta } from '@storybook/react';
import styled from '@emotion/styled'
import { ErrorPage } from './ErrorPage';

export default {
    component: ErrorPage,
    title: 'ErrorPage',
} as Meta;

const Container = styled.div({
    minWidth: '480px',
    minHeight: '720px',
    display: 'flex',
})

export const Default: React.VFC<{}> = () => <Container>
    <ErrorPage error={<>Something bad happened...</>} errorCode='42' />
</Container>

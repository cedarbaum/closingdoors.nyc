import React from 'react'
import { Meta } from '@storybook/react';
import { ServicePicker } from './ServicePicker';
import { MemoryRouter } from 'react-router-dom';

export default {
    component: ServicePicker,
    title: 'ServicePicker',
} as Meta;

export const Default: React.VFC<{}> = () => <MemoryRouter>
    <ServicePicker />
</MemoryRouter> 

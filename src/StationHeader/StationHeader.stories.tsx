import React from 'react'
import { Meta } from '@storybook/react';
import { StationHeader } from './StationHeader';

export default {
  component: StationHeader,
  title: 'StationHeader',
} as Meta;

export const Default: React.VFC<{}> = () => <StationHeader stationName='50 St' />
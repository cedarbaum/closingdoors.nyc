import React from 'react'
import styled from '@emotion/styled'

import { Meta } from '@storybook/react';

import { SubwayIcon } from './SubwayIcon';
import { allLines } from '../utils/SubwayLines';

export default {
  component: SubwayIcon,
  title: 'SubwayIcon',
} as Meta;

const IconContainer = styled.div({
    display: 'flex',
    '*:not(:first-child)': {
        marginLeft: '15px'
    },
    marginBottom: '15px',
})

export const AllIcons: React.VFC<{}> = () => {
    return <>
        {allLines.map(line => {
            return <IconContainer>
                {line.services.map(service => {
                    return <SubwayIcon {...service} color={line.color} textColor={line.textColor}>{service.name}</SubwayIcon>
                })}
            </IconContainer>
        })}
    </>
}
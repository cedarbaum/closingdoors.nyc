import React from "react";
import { Meta } from "@storybook/react";
import { StopHeader } from "./StopHeader";

export default {
  component: StopHeader,
  title: "StopHeader",
} as Meta;

export const Default: React.VFC<{}> = () => <StopHeader stopName="50 St" />;

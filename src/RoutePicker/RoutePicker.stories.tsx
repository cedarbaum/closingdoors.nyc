import React from "react";
import { Meta } from "@storybook/react";
import { RoutePicker } from "./RoutePicker";
import { MemoryRouter } from "react-router-dom";

export default {
  component: RoutePicker,
  title: "RoutePicker",
} as Meta;

export const Default: React.VFC<{}> = () => (
  <MemoryRouter>
    <RoutePicker />
  </MemoryRouter>
);

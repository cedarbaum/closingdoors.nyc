import React from "react";
import { Meta } from "@storybook/react";
import { Alert } from "./Alert";
import { alertARouteHTML } from "../mock/mockData";

export default {
  component: Alert,
  title: "Alert",
} as Meta;

export const Default: React.VFC<{}> = () => <Alert {...alertARouteHTML} />;

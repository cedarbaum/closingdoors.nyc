import React from "react";
import { Meta } from "@storybook/react";
import { AlertsHeader, Behavior } from "./AlertsHeader";
import { alertARouteHTML } from "../mock/mockData";

export default {
  component: AlertsHeader,
  title: "AlertsHeader",
} as Meta;

export const Default: React.VFC<{}> = () => (
  <AlertsHeader alerts={[alertARouteHTML]} behavior={Behavior.Collapsable} />
);

export const Closable: React.VFC<{}> = () => (
  <AlertsHeader alerts={[alertARouteHTML]} behavior={Behavior.Closable} />
);

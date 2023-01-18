import React from "react";
import { Meta } from "@storybook/react";
import { LoadingView } from "./LoadingView";

export default {
  component: LoadingView,
  title: "LoadingView",
} as Meta;

export const Default: React.VFC<{}> = () => <LoadingView />;

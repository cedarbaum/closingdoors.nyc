import type { Meta, StoryObj } from "@storybook/react";

import { NycBusLoadingView } from "@/components/NycBusLoadingView";

const meta: Meta<typeof NycBusLoadingView> = {
  title: "CLOSINGDOORS.NYC/LOADING/US-NY-NYCBUS",
  component: NycBusLoadingView,
  decorators: [
    (Story) => (
      <div className="w-full h-full">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof NycBusLoadingView>;

export const LoadingDots: Story = {};

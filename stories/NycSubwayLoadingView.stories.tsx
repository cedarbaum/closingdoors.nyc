import type { Meta, StoryObj } from "@storybook/react";

import { NycSubwayLoadingView } from "@/components/NycSubwayLoadingView";

const meta: Meta<typeof NycSubwayLoadingView> = {
  title: "CLOSINGDOORS.NYC/LOADING/US-NY-SUBWAY",
  component: NycSubwayLoadingView,
  decorators: [
    (Story) => (
      <div className="w-full h-full">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof NycSubwayLoadingView>;

export const LoadingDots: Story = {};

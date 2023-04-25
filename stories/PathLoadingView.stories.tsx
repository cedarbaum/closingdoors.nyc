import type { Meta, StoryObj } from "@storybook/react";

import { PathLoadingView } from "@/components/PathLoadingView";

const meta: Meta<typeof PathLoadingView> = {
  title: "CLOSINGDOORS.NYC/LOADING/US-NY-PATH",
  component: PathLoadingView,
  decorators: [
    (Story) => (
      <div className="w-full h-full">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof PathLoadingView>;

export const LoadingDots: Story = {};

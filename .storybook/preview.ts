import type { Preview } from "@storybook/react";
import "tailwindcss/tailwind.css";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: "black",
      values: [
        {
          name: "black",
          value: "#000000",
        },
      ],
    },
  },
};

export default preview;

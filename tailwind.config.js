import { MtaColors } from "./utils/SubwayLines";

const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mtaRed: MtaColors.Red,
        mtaGreen: MtaColors.Green,
        mtaBlue: MtaColors.Blue,
        mtaOrange: MtaColors.Orange,
        mtaPurple: MtaColors.Purple,
        mtaGreen2: MtaColors.Green2,
        mtaYellow: MtaColors.Yellow,
        mtaGray: MtaColors.Gray,
        mtaBrown: MtaColors.Brown,
      },
      keyframes: {
        alertIconFlickerKeyframes: {
          "0%": { opacity: 1 },
          "100%": { opacity: 0.6 },
        },
        arrivalTimeFadeInOutKeyframes: {
          "0%": { opacity: 1 },
          "100%": { opacity: 0.5 },
        },
      },
      animation: {
        alertIconAnimation:
          "alertIconFlickerKeyframes 1.5s ease-in-out infinite alternate",
        arrivalTimeFadeInOutAnimation:
          "arrivalTimeFadeInOutKeyframes 1s infinite alternate",
      },
    },
  },
  plugins: [
    require("tailwind-scrollbar-hide"),
    plugin(function ({ addVariant }) {
      addVariant("not-last", "&:not(:last-child)");
    }),
  ],
};

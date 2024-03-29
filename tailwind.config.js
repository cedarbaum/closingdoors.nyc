import { MtaColors } from "./utils/subwayLines";

const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            color: "white",
            h1: {
              color: "white",
            },
            h2: {
              color: "white",
            },
            h3: {
              color: "white",
            },
            a: {
              color: "white",
            },
          },
        },
      },
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
        nycSubwayLoadingKeyframes: {
          "0%,100%": { opacity: 1 },
          "50%": { opacity: 0.5 },
        },
        pathLoadingKeyframes: {
          "0%,100%": { opacity: 1 },
          "50%": { opacity: 0.5 },
        },
      },
      animation: {
        alertIconAnimation:
          "alertIconFlickerKeyframes 1.5s ease-in-out infinite alternate",
        arrivalTimeFadeInOutAnimation:
          "arrivalTimeFadeInOutKeyframes 1s infinite alternate",
        nycSubwayLoadingKeyframesAnimation:
          "nycSubwayLoadingKeyframes 1.2s linear infinite",
        pathLoadingKeyframesAnimation:
          "pathLoadingKeyframes 1.2s linear infinite",
        pulseKeyFramesAnimation:
          "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [
    require("tailwind-scrollbar-hide"),
    require("@tailwindcss/typography"),
    plugin(function ({ addVariant }) {
      addVariant("not-last", "&:not(:last-child)");
    }),
  ],
};

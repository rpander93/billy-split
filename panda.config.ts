import { defineConfig, defineGlobalStyles } from "@pandacss/dev";

export default defineConfig({
  globalCss: defineGlobalStyles({
    html: {
      '--global-font-body': 'PT Serif, sans-serif',
    },
    body: {
      backgroundColor: 'background',
    }
  }),
  jsxFramework: "react",
  preflight: true,
  include: ["./app/**/*.{js,jsx,ts,tsx}"],
  exclude: [],
  theme: {
    extend: {
      keyframes: {
        ["progress-indicator"]: {
          "0%": {
            transform: "translateX(-10%)",
          }, 
          "50%": {
            transform: "translateX(210%)",
          },
          "100%": {
            transform: "translateX(-10%)",
          }
        }
      },
      tokens: {
        colors: {
          background: {
            value: "#f4ebd9",
          },
          primary: {
            value: "#252525",
          },
          text: {
            value: "#000",
          },
          ["text-inverse"]: {
            value: "#fff",
          },
          ["text-header"]: {
            value: "#000",
          },
          ["text-subtle"]: {
            value: "#000",
          },
        },
      },
    },
  },
  outdir: "styled-system",
});

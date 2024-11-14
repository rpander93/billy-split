import { defineConfig, defineGlobalStyles } from "@pandacss/dev";

export default defineConfig({
  globalCss: defineGlobalStyles({
    'body': {
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
            value: "#006D77",
          },
          card: {
            value: "#fff",
          },
          primary: {
            value: "#000",
          },
          text: {
            value: "#fff",
          },
          ["text-inverse"]: {
            value: "#000",
          },
          ["text-header"]: {
            value: "#fff",
          },
          ["text-subtle"]: {
            value: "#fff",
          },
        },
      },
    },
  },
  outdir: "styled-system",
});

import { cva } from "~/styled-system/css";
import { styled } from "~/styled-system/jsx";

export const inputCss = cva({
  base: {
    backgroundColor: "white",
    borderColor: "gray.300",
    borderRadius: "md",
    borderStyle: "solid",
    borderWidth: 1,
    paddingX: 2,
    paddingY: 1,
    "_disabled": {
      opacity: 0.5,
    },
    "_focus": {
      boxShadow: "0 0 #0000",
      outlineWidth: "1.5px",
      outlineStyle: "solid",
      outlineColor: "gray.500",
    },
    "_readOnly": {
      cursor: "not-allowed",
    },
  },
  variants: {
    space: {
      small: {
        paddingY: 1 / 2,
      },
    },
  },
});

export const TextInput = styled("input", inputCss);

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
    "_readOnly": {
      color: "gray.500",
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

import { cva } from "~/styled-system/css";
import { styled } from "~/styled-system/jsx";

const lineItemSeparatorCss = cva({
  base: {
    borderTopColor: "gray.300",
  },
});

export const Divider = styled("hr", lineItemSeparatorCss);

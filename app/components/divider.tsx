import { cva } from "~/styled-system/css";
import { styled } from "~/styled-system/jsx";

const lineItemSeparatorCss = cva({
  base: {
    borderTopColor: "gray.200"
  }
});

export const Divider = styled("hr", lineItemSeparatorCss);

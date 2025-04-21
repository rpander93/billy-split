import { cva } from "~/styled-system/css";
import { styled } from "~/styled-system/jsx";

import { Box } from "./box";

const receiptBoxCss = cva({
  base: {
    backgroundColor: "white",
    borderColor: "gray.100",
    borderStyle: "solid",
    borderWidth: 1,
    flexDirection: "column",
    justifyContent: "center",
    marginX: -4,
    rowGap: 3,
    paddingX: 4,
    paddingY: 8,
    mask: `
      radial-gradient(8.16px at 50% 11.2px,#000 99%,#0000 101%) calc(50% - 14px) 0/28px 51% repeat-x,
      radial-gradient(8.16px at 50% -4.2px,#0000 99%,#000 101%) 50% 7px/28px calc(51% - 7px) repeat-x,
      radial-gradient(8.16px at 50% calc(100% - 11.2px),#000 99%,#0000 101%) 50% 100%/28px 51% repeat-x,
      radial-gradient(8.16px at 50% calc(100% + 4.2px),#0000 99%,#000 101%) calc(50% - 14px) calc(100% - 7px)/28px calc(51% - 7px) repeat-x;
    `,
    "& input": {
      fontFamily: "Inconsolata"
    },
    "& span": {
      fontFamily: "Inconsolata"
    }
  }
});

export const ReceiptBox = styled(Box, receiptBoxCss);

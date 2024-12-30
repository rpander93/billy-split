import { css } from "~/styled-system/css";
import { Box } from "./box";
import { Typography } from "./typography";

export function Logo() {
  return (
    <Box alignItems="center" flexDirection="row" columnGap={2}>
      <img alt="billy logo" className={css({ h: 6, w: 6 })} src="/billy-logo.webp" />
      <Typography variant="logo">Billy Split</Typography>
    </Box>
  );
}
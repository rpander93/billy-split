import { css } from "~/styled-system/css";
import { Box } from "./box";
import { Typography } from "./typography";

interface AvatarProps {
  name: string;
  zIndex?: number;
}

export function Avatar({ name, zIndex }: AvatarProps) {
  return (
    <Box className={avatarCss} style={{ zIndex, backgroundColor: stringToColor(name) }}>
      <Typography color="white" fontSize="sm" fontWeight="bold">{name.split(" ").map(x => x.substring(0, 1)).join("")}</Typography>
    </Box>
  );
}

const avatarCss = css({
  alignItems: "center",
  borderColor: "white",
  borderRadius: "full",
  borderStyle: "solid",
  borderWidth: 0.5,
  justifyContent: "center",
  height: 8,
  width: 8,
});

function stringToColor(string: string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

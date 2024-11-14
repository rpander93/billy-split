import { Box as Box_, BoxProps } from "~/styled-system/jsx";

export function Box(props: BoxProps) {
  return <Box_ display="flex" {...props} />;
}
import { type BoxProps, Box as Box_ } from "~/styled-system/jsx";

export function Box(props: BoxProps) {
  return <Box_ display="flex" {...props} />;
}

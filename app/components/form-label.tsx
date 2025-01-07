import { css } from "~/styled-system/css";

export function FormLabel(props: React.ComponentProps<"label">) {
  return <label {...props} className={css({ fontSize: "1rem", fontWeight: "600" })} />;
}

import { css } from "~/styled-system/css";

export function ProgressIndicator() {
  return (
    <div className={css({ bg: "white", rounded: "lg", overflow: "hidden", width: "full" })}>
      <div
        className={css({
          bg: "gold",
          width: '33.3%',
          height: 4,
          rounded: "lg",
          animation: "progress-indicator 2s infinite ease-in-out",
        })}
      />
    </div>
  );
}
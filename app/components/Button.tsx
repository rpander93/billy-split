import { cva } from "~/styled-system/css";
import { Typography } from "./typography";

interface ButtonProps {
  children: React.ReactNode;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  startDecorator?: React.ReactNode;
}

export function Button({ children, startDecorator, onClick }: ButtonProps) {
  return (
    <button className={buttonStyle()} onClick={onClick}>
      {startDecorator}
      <Typography color="text">{children}</Typography>
    </button>
  );
}

const buttonStyle = cva({
  base: {
    alignSelf: "flex-start",
    backgroundColor: "primary",
    borderRadius: "md",
    columnGap: 2,
    cursor: "pointer",
    display: "flex",
    paddingX: 4,
    paddingY: 2,
  },
});

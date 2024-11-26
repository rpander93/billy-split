import { cva } from "~/styled-system/css";
import { Typography } from "./typography";
import { Box } from "./box";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  position?: "start" | "middle" | "end" | "standalone";
  size?: "sm" | "md" | "none";
  startDecorator?: React.ReactNode;
  type?: "submit" | "button" | "reset";
  variant?: "primary" | "secondary" | "tertiary";
}

export function Button({ children, startDecorator, onClick, position = "standalone", size = "md", type = "button", variant = "primary" }: ButtonProps) {
  return (
    <button className={buttonStyle({ position, size, variant })} onClick={onClick} type={type}>
      {startDecorator}
      <Typography color={variant === "primary" ? "text-inverse" : "text"} variant={size === "md" ? "body" : "small"}>{children}</Typography>
    </button>
  );
}

// alias
export const ButtonGroup = Box;

const buttonStyle = cva({
  base: {
    alignItems: "center",
    alignSelf: "flex-start",
    columnGap: 2,
    cursor: "pointer",
    display: "flex",
  },
  variants: {
    variant: {
      primary: {
        backgroundColor: "primary",
        borderWidth: 1,
      },
      secondary: {
        borderColor: "gray.300",
        borderStyle: "solid",
        borderWidth: 1,
      },
      tertiary: {
        // ..
      },
    },
    position: {
      start: {
        borderTopLeftRadius: "md",
        borderBottomLeftRadius: "md",
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
      },
      middle: {
        borderRadius: 0,
      },
      end: {
        borderTopRightRadius: "md",
        borderBottomRightRadius: "md",
      },
      standalone: {
        borderRadius: "md",
      },
    },
    size: {
      none: {
        // ..
      },
      sm: {
        paddingX: 2,
        paddingY: 1,
      },
      md: {
        paddingX: 4,
        paddingY: 2,
      },
    },
  },
});

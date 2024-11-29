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
  variant?: "primary" | "secondary" | "ghost";
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
    borderRadius: "md",
    columnGap: 2,
    cursor: "pointer",
    display: "inline-flex",
    justifyContent: "center",
    "_disabled": {
      opacity: 0.5,
      pointerEvents: "none",
    },
  },
  variants: {
    variant: {
      primary: {
        backgroundColor: "black",
        "_hover": {
          backgroundColor: "gray.900",
        },
      },
      secondary: {
        borderColor: "gray.300",
        borderStyle: "solid",
        borderWidth: 1,
        "_hover": {
          backgroundColor: "gray.50",
        },
      },
      ghost: {
        borderWidth: 0,
        "_hover": {
          backgroundColor: "gray.50",
        },
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
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        borderTopRightRadius: "md",
        borderBottomRightRadius: "md",
      },
      standalone: {
        borderRadius: "md",
        borderWidth: 1,
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

import { cva } from "~/styled-system/css";
import { Typography } from "./typography";
import { Box } from "./box";
import { BoxProps } from "~/styled-system/jsx";
import { Children, cloneElement } from "react";

export interface ButtonProps {
  children: React.ReactNode;
  flex?: number;
  loading?: boolean;
  hover?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  position?: "start" | "middle" | "end" | "standalone";
  size?: "sm" | "md" | "none";
  startDecorator?: React.ReactNode;
  type?: "submit" | "button" | "reset";
  variant?: "primary" | "secondary" | "ghost";
}

export function Button({ children, flex, loading, hover, startDecorator, onClick, position = "standalone", size = "md", type = "button", variant = "primary" }: ButtonProps) {  
  const className = buttonStyle({
    position,
    size,
    variant,
    status: loading ? "loading" : undefined
  });

  return (
    <button className={className} data-hover={hover === true ? true : undefined} onClick={onClick} type={type} style={{ flex }}>
      {loading ? "⏳" : startDecorator}
      <Typography color="text" fontWeight="400" variant={size === "md" ? "body" : "small"}>
        {children}
      </Typography>
    </button>
  );
}

interface LinkButtonProps extends Pick<ButtonProps, "children" | "startDecorator" | "size" | "variant"> {
  href: string;
  target?: React.ComponentProps<"a">["target"];
}

export function LinkButton({ children, href, startDecorator, size = "md", target, variant = "primary" }: LinkButtonProps) {
  return (
    <a className={buttonStyle({ size, variant })} href={href} target={target} rel="noopener noreferer">
      {startDecorator}
      <Typography color="text" fontWeight="700" variant={size === "md" ? "body" : "small"}>{children}</Typography>
    </a>
  );
}

interface ButtonGroupProps extends Omit<BoxProps, "children"> {
  children: React.ReactElement<ButtonProps>[];
  size: ButtonProps["size"];
}

export function ButtonGroup({ children, size, ...restProps }: ButtonGroupProps) {
  const length = Children.count(children);
  const flex = 1 / length;

  return (
    <Box {...restProps}>
      {Children.map(children, (element, index) => {
        const position = length === 1
          ? "standalone"
          : index === 0
            ? "start"
            : index === length - 1
              ? "end"
              : "middle";

        return cloneElement(element, { flex, position, size, variant: "secondary" });
      })}
    </Box>
  );
}

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
        backgroundColor: "gold",
        "_hover": {
          backgroundColor: "#FBC901",
        },
      },
      secondary: {
        backgroundColor: "white",
        borderColor: "gray.300",
        borderStyle: "solid",
        borderWidth: 1.5,
        "_hover": {
          backgroundColor: "gray.100",
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
        borderStartWidth: 0,
        borderRadius: 0,
      },
      end: {
        borderStartWidth: 0,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        borderTopRightRadius: "md",
        borderBottomRightRadius: "md",
      },
      standalone: {
        borderColor: "transparent",
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
    status: {
      loading: {
        opacity: 0.5,
      },
    },
  },
});

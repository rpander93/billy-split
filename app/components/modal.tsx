import { createCallable } from "react-call";
import { ElementRef, MouseEventHandler, useEffect, useRef } from "react";

import { Typography } from "./typography";
import { Button, ButtonProps } from "./button";
import { css } from "~/styled-system/css";
import { Box } from "./box";

interface ModalProps {
  buttons: Array<Omit<ButtonProps, "onClick" | "variant" | "type"> & { value: Response }>;
  message: string;
}

type Response = string;

export const Modal = createCallable<ModalProps, Response | undefined>(({ call, buttons, message }) => {
  const dialogRef = useRef<ElementRef<"dialog">>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const handleOutsideClick: MouseEventHandler<HTMLDialogElement> = (event) => {
    if (event.target === event.currentTarget) {
      call.end(undefined);
    }
  };

  return (
    <dialog ref={dialogRef} className={dialogCss} onMouseDown={handleOutsideClick}>
      <Box alignItems="center" flexDirection="column" padding={6} rowGap={4}>
        <Typography variant="body">{message}</Typography>

        <Box flexDirection="row" gap={2}>
          {buttons.map(button => (
            <Button key={button.value} onClick={() => call.end(button.value)} variant="secondary" type="button" {...button} />
          ))}
        </Box>
      </Box>
    </dialog>
  );
});

const dialogCss = css({
  alignItems: "center",
  borderColor: "salmon",
  borderRadius: "md",
  borderStyle: "solid",
  borderWidth: 4,
  boxShadow: "0 0 #000, 0 0 #000, 0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  margin: "auto auto",
  padding: 0,
  "_backdrop": {
    backgroundColor: "black",
    opacity: 0.75,
  },
});

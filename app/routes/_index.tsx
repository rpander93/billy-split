import {
  type ActionFunctionArgs,
  type MetaFunction,
  redirect,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData
} from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import { AnimatePresence, motion } from "motion/react";
import { useRef } from "react";
import { z } from "zod";

import { Box } from "~/components/box";
import { Button } from "~/components/button";
import { Logo } from "~/components/logo";
import { ProgressIndicator } from "~/components/progress-indicator";
import { Typography } from "~/components/typography";
import { UploadTextMarquee } from "~/components/upload-text-marquee";
import { addScannedBill } from "~/services/bills";
import { extractor } from "~/services/extractor";
import { css } from "~/styled-system/css";

const MAX_FILE_SIZE_MB = process.env.VITE_MAX_FILE_SIZE_MB as unknown as number;

const MEMORY_UPLOAD_HANDLER = unstable_createMemoryUploadHandler({
  maxPartSize: MAX_FILE_SIZE_MB * 1024 * 1024
});

const REQUEST_SCHEME = z.object({
  file: z.instanceof(File).and(
    z.object({
      size: z.number().max(MAX_FILE_SIZE_MB * 1024 * 1024),
      type: z.literal("image/jpeg").or(z.literal("image/png"))
    })
  )
});

export const meta: MetaFunction = () => {
  return [{ title: "Billy Split" }, { name: "description", content: "Welcome to Remix!" }];
};

export function loader() {
  return { maxFileSizeMb: MAX_FILE_SIZE_MB };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await unstable_parseMultipartFormData(request, MEMORY_UPLOAD_HANDLER);
  const { success } = REQUEST_SCHEME.safeParse(Object.fromEntries(formData));
  if (!success) throw new Response("Bad Request", { status: 400 });

  try {
    const image = formData.get("file") as File;
    const result = await extractor(image);
    const queued = await addScannedBill(result, image);

    return redirect(`/create/${queued.id}`);
  } catch (error) {
    throw new Response((error as Error).message ?? "Woops. Something went wrong. Please try again.", { status: 502 });
  }
}

export default function LandingPage() {
  const { maxFileSizeMb } = useLoaderData<typeof loader>();
  const { state } = useNavigation();

  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    inputRef.current?.click();
  };

  const handleFileSelected: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const file_ = event.currentTarget?.files?.[0];
    if (undefined === file_) return;
    const isFileTooLarge = file_.size > 1024 * 1024 * maxFileSizeMb;

    if (isFileTooLarge) {
      alert("Woops! That file is too large. Please try again with a smaller file.");
    } else {
      buttonRef.current?.click();
    }
  };

  return (
    <Box flexDirection="column" justifyContent="center" rowGap={4}>
      <Logo />

      <Box flexDirection="column">
        <Typography variant="h1">Want to split a bill?</Typography>
        <Typography variant="body">
          Billy helps you keep track of who paid you back per line item. Select an image showing the bill to get
          started! 💰💸
        </Typography>
      </Box>

      <Form encType="multipart/form-data" method="POST">
        <AnimatePresence mode="popLayout">
          {state === "submitting" ? (
            <motion.div
              key="file-upload-pending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 / 10 }}
            >
              <Box flexDirection="column" marginY={2} rowGap={2}>
                <ProgressIndicator />
                <UploadTextMarquee />
              </Box>
            </motion.div>
          ) : (
            <motion.div key="file-input" className={mainDivCss} exit={{ opacity: 0 }} transition={{ duration: 1 / 10 }}>
              <Box flexDirection="column" rowGap={0.25}>
                <Button onClick={handleClick} startDecorator="📷">
                  Pick image
                </Button>
                <input
                  ref={inputRef}
                  className={css({ display: "none" })}
                  name="file"
                  onChange={handleFileSelected}
                  type="file"
                  accept="image/*"
                />
                <button ref={buttonRef} className={css({ display: "none" })} type="submit" />
                <Typography variant="small">Take a picture or select it from your photo library</Typography>
              </Box>

              <Box flexDirection="column">
                <Typography variant="h2">How it works</Typography>
                <Typography variant="body">
                  <ol className={css({ listStyle: "number", marginLeft: 4 })}>
                    <li>Pick an image showing the bill</li>
                    <li>Add a way to get paid</li>
                    <li>Share the link</li>
                    <li>Wait for the money to roll in</li>
                  </ol>
                </Typography>
              </Box>

              <img alt="example screenshot of scanned bill" src="/screenshot.webp" />
            </motion.div>
          )}
        </AnimatePresence>
      </Form>
    </Box>
  );
}

const mainDivCss = css({
  display: "flex",
  flexDirection: "column",
  rowGap: 2
});

import { type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";

import { Box } from "~/components/box";
import { Button, LinkButton } from "~/components/button";
import { Typography } from "~/components/typography";
import { findSubmittedBill } from "~/services/bills";

export async function loader({ params }: LoaderFunctionArgs) {
  const shareCode = params.entryId;
  if (shareCode === undefined) return redirect("/");

  const item = await findSubmittedBill(shareCode);
  if (item === null) return redirect("/");

  const link = `${import.meta.env.VITE_HTTP_HOST}/entries/${shareCode}`;

  return { link, name: item.name };
}

export default function CreatedPage() {
  const { name, link } = useLoaderData<typeof loader>();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isShareAvailable, setIsShareAvailable] = useState(false);
  const [isCopiedToClipboard, setIsCopiedToClipboard] = useState(false);

  useEffect(() => {
    setIsShareAvailable(navigator.share !== undefined);
  }, []);

  useEffect(() => {
    if (canvasRef.current === null) {
      return;
    }

    QRCode.toCanvas(canvasRef.current, link, { width: 250 });
  }, []);

  const handleClickCopy = () => {
    navigator.clipboard.writeText(link);
    setIsCopiedToClipboard(true);
    setTimeout(() => setIsCopiedToClipboard(false), 750);
  };

  const handleShareClick = async () => {
    await navigator?.share?.({
      title: "Billy Split",
      text: `Hey! I'm using Billy to track the bill for "${name}" I paid recently. Can you pay me back?`,
      url: link
    });
  };

  return (
    <Box flexDirection="column" justifyContent="center" rowGap={4}>
      <Typography variant="h2">{`👏 Great! We saved your bill for “${name}”`}</Typography>

      <Box flexDirection="column" rowGap={2}>
        {isShareAvailable && (
          <Button onClick={handleShareClick} startDecorator="📢" variant="secondary">
            Share
          </Button>
        )}
        {isCopiedToClipboard ? (
          <Button variant="secondary">✅</Button>
        ) : (
          <Button onClick={handleClickCopy} startDecorator="📋" variant="secondary">
            Copy link
          </Button>
        )}
        <LinkButton href={link} startDecorator="🖱️" variant="secondary" target="_self">
          Open
        </LinkButton>
      </Box>

      <Box flexDirection="column" justifyContent="center">
        <Box
          justifyContent="center"
          backgroundColor="white"
          borderColor="gray.300"
          borderRadius="md"
          borderStyle="solid"
          borderWidth={1.5}
          padding={1}
        >
          <canvas ref={canvasRef} style={{ height: QRCODE_SIZE, width: QRCODE_SIZE }} />
        </Box>

        <Typography marginY={1} variant="small">
          You can let people scan this QR-code to directly open your Billy
        </Typography>
      </Box>
    </Box>
  );
}

const QRCODE_SIZE = 250;

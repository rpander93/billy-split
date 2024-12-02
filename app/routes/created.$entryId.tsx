import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Box } from "~/components/box";
import { Button, LinkButton } from "~/components/button";
import { Typography } from "~/components/typography";
import { findSubmittedBill } from "~/services/bills";

export async function loader({ params }: LoaderFunctionArgs) {
  const shareCode = params.entryId;
  if (shareCode === undefined) return redirect("/");

  const item = await findSubmittedBill(shareCode);
  if (item === null) return redirect("/");

  return { shareCode, name: item.name };
}

export default function CreatedPage() {
  const { name, shareCode } = useLoaderData<typeof loader>();
  const [isShareAvailable, setIsShareAvailable] = useState(false);
  const [isCopiedToClipboard, setIsCopiedToClipboard] = useState(false);

  useEffect(() => {
    setIsShareAvailable(navigator.share !== undefined);
  }, []);

  const handleClickCopy = () => {
    navigator.clipboard.writeText(`https://billy-split.it/entries/${shareCode}`);
    setIsCopiedToClipboard(true);
    setTimeout(() => setIsCopiedToClipboard(false), 750);
  };
  
  return (
    <Box flexDirection="column" justifyContent="center" rowGap={4}>
      <Typography variant="h2">
        {`👏 Great! We saved your bill for “${name}”`}
      </Typography>

      <Box flexDirection="column" rowGap={2}>
        {isShareAvailable && (
          <Button startDecorator="📢" variant="secondary">
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
        <LinkButton href={`/entries/${shareCode}`} startDecorator="🖱️" variant="secondary">
          Open
        </LinkButton>
      </Box>
    </Box>
  );
}

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { Typography } from "./typography";

export function UploadTextMarquee() {
  const [index, setIndex] = useState(1);

  useEffect(() => {
    const intervalId = setInterval(
      () => setIndex((current) => Math.min(current + 1, TEASER_TEXTS.length)),
      ANIMATION_DURATION
    );

    return () => clearInterval(intervalId);
  }, []);

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={index}
        initial="enter"
        animate="center"
        exit="exit"
        variants={{
          enter: {
            y: 20,
            opacity: 0
          },
          center: {
            y: 0,
            opacity: 1
          },
          exit: {
            y: -20,
            opacity: 0
          }
        }}
        transition={{
          y: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.4 }
        }}
      >
        <Typography variant="small">{TEASER_TEXTS[index - 1]}</Typography>
      </motion.div>
    </AnimatePresence>
  );
}

const TEASER_TEXTS = [
  "Uploading image...",
  "Extracting text from image...",
  "Finding venue name...",
  "Finding line items..."
];

const ANIMATION_DURATION = 4000;

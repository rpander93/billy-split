import { css } from "~/styled-system/css";
import { Box } from "./box";
import { Typography } from "./typography";

interface AvatarProps {
  name: string;
  zIndex?: number;
}

export function Avatar({ name, zIndex }: AvatarProps) {
  return (
    <Box className={avatarCss} style={{ zIndex, backgroundColor: stringToColor(name) }}>
      <Typography color="white" fontSize="sm" fontWeight="bold">
        {name
          .split(" ")
          .map((x) => x.substring(0, 1))
          .join("")}
      </Typography>
    </Box>
  );
}

const avatarCss = css({
  alignItems: "center",
  borderColor: "white",
  borderRadius: "full",
  borderStyle: "solid",
  borderWidth: "0.1em",
  justifyContent: "center",
  height: 8,
  width: 8
});

// Hash function to convert string to number
function hashString(input: string) {
  let hash = 0;

  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash);
}

// Convert a number to a darker pastel hex color
function numberToPastelColor(input: number) {
  // Use the number to generate 3 values between 0 and 255
  const r = input % 256;
  const g = (input >> 8) % 256;
  const b = (input >> 16) % 256;

  // Convert to hex and ensure two digits
  const toHex = (n: number) => n.toString(16).padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Main function to convert string to pastel color
function stringToColor(input: string) {
  const hash = hashString(input);

  return numberToPastelColor(hash);
}

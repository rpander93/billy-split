import { css } from "~/styled-system/css";

import { Box } from "./box";
import { Typography } from "./typography";

interface AmountSelectorProps {
  minusDisabled?: boolean;
  plusDisabled?: boolean;
  label: string;
  onMinusClick: () => void;
  onPlusClick: () => void;
}

export function AmountSelector({ minusDisabled, plusDisabled, label, onMinusClick, onPlusClick }: AmountSelectorProps) {
  return (
    <Box alignItems="center">
      <button
        className={css(quantityButtonCss, minusButtonCss)}
        disabled={minusDisabled}
        onClick={() => onMinusClick()}
        type="button"
      >
        <Typography fontSize="md" fontWeight="bold">
          -
        </Typography>
      </button>

      <div className={currentAmountBlob}>
        <Typography color="black" fontWeight="bold" fontSize="small">
          {label}
        </Typography>
      </div>

      <button
        className={css(quantityButtonCss, plusButtonCss)}
        disabled={plusDisabled}
        onClick={() => onPlusClick()}
        type="button"
      >
        <Typography fontSize="md" fontWeight="bold">
          +
        </Typography>
      </button>
    </Box>
  );
}

const currentAmountBlob = css({
  alignItems: "center",
  backgroundColor: "gold",
  borderRadius: "full",
  display: "inline-flex",
  justifyContent: "center",
  height: 8,
  padding: 3.5,
  zIndex: 2
});

const quantityButtonCss = css.raw({
  backgroundColor: "white",
  borderColor: "gray.300",
  borderStyle: "solid",
  borderWidth: 1.5,
  position: "relative",
  height: 7,
  width: 12,
  zIndex: 1,
  _hover: {
    "&:not(:disabled)": {
      backgroundColor: "gray.100"
    }
  }
});

const minusButtonCss = css.raw({
  borderTopLeftRadius: "md",
  borderBottomLeftRadius: "md",
  marginRight: -3,
  paddingInline: 4,
  textAlign: "start"
});

const plusButtonCss = css.raw({
  borderTopRightRadius: "md",
  borderBottomRightRadius: "md",
  marginLeft: -3,
  paddingInline: 4,
  textAlign: "end"
});

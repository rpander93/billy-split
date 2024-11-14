import { useState } from "react";

import { formatCurrencyWithoutSymbol } from "~/functions";
import { OnlineScannedBill, StateLineItem } from "~/types";

export function useEditState(initialValue: OnlineScannedBill["line_items"]) {
  const [inputState, setInputState] = useState<StateLineItem[]>(() => parseScannedItemsToState(initialValue));

  return [inputState, setInputState] as const;
}

function parseScannedItemsToState(input: OnlineScannedBill["line_items"]): StateLineItem[] {
  return input.map(element => {
    const { amount, total_price } = element;
    const unit_price = total_price / amount;

    return {
      description: element.description,
      unit_price: formatCurrencyWithoutSymbol(unit_price),
      total_price: formatCurrencyWithoutSymbol(total_price),
      amount: String(amount),
      is_deleted: false,
    };
  });
}
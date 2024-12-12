import { OnlineSubmittedBill } from "./types";

export function isNumber(value: number | string): value is number {
  return typeof value === "number" && !Number.isNaN(value) && Number.isFinite(value);
}

export function tryParseFloat(value: string) {
  const normalizedVal = value.replaceAll(",", ".");
  const retVal = parseFloat(normalizedVal);

  return isNumber(retVal) ? retVal : value;
}

export function removeCurrencySymbol(value: string) {
  return value.replace(/[^0-9.,]/g, "");
}

export function formatCurrency(value: string | number, currencyCode: string) {
  const currencyFormatter = new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: currencyCode,
  });
  const parsedValue = typeof value === "string" ? tryParseFloat(value) : value;

  return typeof parsedValue !== "string" ? currencyFormatter.format(parsedValue) : parsedValue;
}

export function formatCurrencyWithoutSymbol(value: string | number) {
  const parsedValue = typeof value === "string" ? tryParseFloat(value) : value;

  return typeof parsedValue !== "string"
    ? parsedValue.toLocaleString("nl-NL", { minimumFractionDigits: 2 })
    : parsedValue;
}

export function extractFirstUrl(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/;
  const match = text.match(urlRegex);

  // Return the matched URL or null if no URL is found
  return match ? match[0] : null;
}


export function sum(value: number[]) {
  return value.reduce((accumulator, current) => accumulator + current, 0);
}

export function round(value: number, fractions = 1) {
  return Math.round(value * (fractions * 10)) / (fractions * 10);
}

export function parseServerToSelectionState(bill: OnlineSubmittedBill) {
  const stateItems = bill.line_items.map(element => {
    const payment_items = bill.payment_items
      .map(payment_item => {
        const line_items = payment_item.line_items.filter(payment => payment.line_item_index === element.index);

        return {
          creator: payment_item.creator,
          amount: sum(line_items.map(item => item.amount)),
        };
      })
      .filter(payment_item => payment_item.amount > 0);

    const current_amount = 0;
    const prior_amount = sum(payment_items.map(payment_item => payment_item.amount));
    const remaining_amount = Math.round((element.amount - current_amount - prior_amount) * 10) / 10;

    return {
      ...element,
      current_amount,
      prior_amount,
      remaining_amount,
      payment_items,
    };
  });

  return [...stateItems].sort((a, b) => {
    if (b.remaining_amount === 0 && a.remaining_amount !== 0) {
      return -1;
    }

    if (a.remaining_amount === 0 && b.remaining_amount !== 0) {
      return 1;
    }

    return a.index - b.index > 0 ? 1 : -1;
  });
}

import type { OnlineSubmittedBill, SubmittedBill } from "./types";

export function isNumber(value: number | string): value is number {
  return typeof value === "number" && !Number.isNaN(value) && Number.isFinite(value);
}

export function tryParseFloat(value: string) {
  const normalizedVal = value.replaceAll(",", ".");
  const retVal = Number.parseFloat(normalizedVal);

  return isNumber(retVal) ? retVal : value;
}

export function removeCurrencySymbol(value: string) {
  return value.replace(/[^0-9.,]/g, "");
}

export function formatCurrency(value: string | number, currencyCode: string) {
  const currencyFormatter = new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: currencyCode
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

export function formatDecimal(decimal: number) {
  if (decimal === 0) return "0";
  if (Number.isInteger(decimal)) return decimal.toString();

  // Handle negative numbers
  const sign = decimal < 0 ? "-" : "";
  const absDecimal = Math.abs(decimal);

  // Maximum denominator to consider for approximation
  const precision = 1.0e-10;
  const maxDenominator = 1000;

  let bestNumerator = 1;
  let bestDenominator = 1;
  let bestError = Math.abs(absDecimal - bestNumerator / bestDenominator);

  for (let denominator = 1; denominator <= maxDenominator; denominator++) {
    // Calculate the closest numerator for this denominator
    const numerator = Math.round(absDecimal * denominator);
    const error = Math.abs(absDecimal - numerator / denominator);

    if (error < bestError) {
      bestError = error;
      bestNumerator = numerator;
      bestDenominator = denominator;
    }

    // If we've found a sufficiently good approximation, stop
    if (error < precision) break;
  }

  // Simplify the fraction by finding GCD
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(bestNumerator, bestDenominator);

  bestNumerator /= divisor;
  bestDenominator /= divisor;

  // Convert to mixed fraction if numerator is greater than denominator
  if (bestNumerator >= bestDenominator) {
    const wholeNumber = Math.floor(bestNumerator / bestDenominator);
    const remainder = bestNumerator % bestDenominator;

    return remainder === 0 ? `${sign}${wholeNumber}` : `${sign}${wholeNumber} ${remainder}/${bestDenominator}`;
  }

  return `${sign}${bestNumerator}/${bestDenominator}`;
}

export function parseServerToSelectionState(bill: OnlineSubmittedBill) {
  const stateItems = bill.line_items.map((element) => {
    const payment_items = bill.payment_items
      .map((payment_item) => {
        const line_items = payment_item.line_items.filter((payment) => payment.line_item_id === element.id);

        return {
          creator: payment_item.creator,
          amount: sum(line_items.map((item) => item.amount))
        };
      })
      .filter((payment_item) => payment_item.amount > 0);

    const current_amount = 0;
    const prior_amount = sum(payment_items.map((payment_item) => payment_item.amount));
    const remaining_amount = Math.round((element.amount - current_amount - prior_amount) * 10) / 10;

    return {
      ...element,
      current_amount,
      prior_amount,
      remaining_amount,
      payment_items,
      mode: "undecided",
      splitting_denumerator: undefined as number | undefined
    };
  });

  return [...stateItems].sort((a, b) => {
    if (b.remaining_amount <= 0 && a.remaining_amount > 0) {
      return -1;
    }

    if (a.remaining_amount <= 0 && b.remaining_amount > 0) {
      return 1;
    }

    return a.id - b.id > 0 ? 1 : -1;
  });
}

export const calculate = {
  total: (items: ReturnType<typeof parseServerToSelectionState>) =>
    items.reduce((accumulator, current) => accumulator + current.amount * current.unit_price, 0),
  current: (bill: OnlineSubmittedBill, items: ReturnType<typeof parseServerToSelectionState>) =>
    items.reduce((accumulator, current) => {
      const lineItem = bill.line_items.find((l) => l.id === current.id);

      if (lineItem === undefined) {
        return accumulator;
      }

      return accumulator + current.current_amount * lineItem.unit_price;
    }, 0),
  remaining: (bill: OnlineSubmittedBill, totalSum: number, currentSum: number) => {
    const paidPreviously = bill.payment_items.reduce((accumulator, current) => {
      return (
        accumulator +
        sum(
          current.line_items.map((line_item) => {
            const item = bill.line_items.find((x_item) => x_item.id === line_item.line_item_id);
            if (!item) return 0;

            return item.unit_price * line_item.amount;
          })
        )
      );
    }, 0);

    return totalSum - paidPreviously - currentSum;
  }
};

export function parsePaymentMethod(paymentMethod: SubmittedBill["payment_method"]) {
  return paymentMethod.startsWith("https://") || paymentMethod.startsWith("http://")
    ? { url: true, value: paymentMethod }
    : { url: false, value: paymentMethod };
}

export function randomString(length: number): string {
  let result = "";

  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;

  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }

  return result;
}

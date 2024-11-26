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
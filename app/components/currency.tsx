import currencies from "./currency-input/currencies";

export function currency(value: string) {
  const item = currencies.find((x) => x.code === value);
  if (item === undefined) throw new Error(`Could not find currency "${value}"`);

  return `${item.emoji} ${item.code}`;
}

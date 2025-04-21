import { inputCss } from "../text-input";
import currencies from "./currencies";

export function CurrencyInput(props: React.ComponentProps<"select">) {
  return (
    <select className={inputCss()} {...props}>
      {currencies.map((item) => (
        <option key={item.code} value={item.code}>
          {item.emoji} {item.code}
        </option>
      ))}
    </select>
  );
}

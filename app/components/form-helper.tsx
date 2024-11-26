import { typography } from "./typography";

interface FormHelperProps {
  children: string;
}

export function FormHelper({ children }: FormHelperProps) {
  return <span className={typography({ variant: "small" })}>{children}</span>;
}

import { useFormControl } from "./form-control";
import { typography } from "./typography";

interface FormLabelProps {
  children: string;
}

export function FormLabel({ children }: FormLabelProps) {
  const { name } = useFormControl();

  return <label className={typography()} htmlFor={name}>{children}</label>;
}

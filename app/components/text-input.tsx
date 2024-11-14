import { useFormControl } from "./form-control";

export function TextInput() {
  const { name } = useFormControl();

  return <input name={name} />;
}

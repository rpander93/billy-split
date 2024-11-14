import { createContext, useContext } from "react";

interface FormControlProps {
  children: React.ReactNode;
  name: string;
}

export function FormControl({ children, name }: FormControlProps) {
  return (
    <FormControlContext.Provider value={{ name }}>
      {children}
    </FormControlContext.Provider>
  );
}

interface FormControlContext_ {
  name: string;
}

const FormControlContext = createContext<FormControlContext_>({
  name: "",
});

export function useFormControl() {
  return useContext(FormControlContext);
}

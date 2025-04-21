import { type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { findSubmittedBill } from "~/services/bills";
import { link } from "~/services/files";

export async function loader({ params }: LoaderFunctionArgs) {
  const bill = await findSubmittedBill(params.entryId as string);
  if (null === bill) return redirect("/");
  const imageUri = await link(bill.file_name);

  return redirect(imageUri);
}

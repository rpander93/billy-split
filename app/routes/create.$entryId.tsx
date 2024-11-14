import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { Box } from "~/components/box";
import { FormControl } from "~/components/form-control";
import { FormLabel } from "~/components/form-label";
import { TextInput } from "~/components/text-input";
import { Typography } from "~/components/typography";
import { formatCurrency, formatCurrencyWithoutSymbol, removeCurrencySymbol, tryParseFloat } from "~/functions";
import { useEditState } from "~/hooks/use-edit-state";
import { findScannedBill } from "~/services/bills";

export async function loader({ params }: LoaderFunctionArgs) {
  const element = await findScannedBill(params.entryId as string);
  if (element === null) return redirect("/");

  return { element };
}

export default function CreatePage() {
  const { element } = useLoaderData<typeof loader>();
  const [editState, setEditState] = useEditState(element.line_items);

  const handleKeyUp = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    if (event.key !== "Enter") return;
    (event.target as HTMLInputElement)?.blur();
  };

  const handleSyncElement = (index: number, field: "amount" | "unit_price" | "total_price", nextValue: string) => {
    const item = editState[index];

    const amount = tryParseFloat(field === "amount" ? nextValue : item.amount);
    let unit_price = tryParseFloat(field === "unit_price" ? nextValue : item.unit_price);
    let total_price = tryParseFloat(field === "total_price" ? nextValue : item.total_price);

    const hasAmount = typeof amount === "number";
    const hasUnitPrice = typeof unit_price === "number";
    const hasTotalPrice = typeof total_price === "number";

    if (field === "amount" && hasAmount && hasUnitPrice) {
      total_price = amount * (unit_price as number);
    } else if (field === "unit_price" && hasUnitPrice && hasAmount) {
      total_price = amount * (unit_price as number);
    } else if (field === "total_price" && hasTotalPrice && hasAmount) {
      unit_price = (total_price as number) / amount;
    }

    const nextItem = {
      ...item,
      amount: String(amount),
      unit_price: formatCurrencyWithoutSymbol(unit_price),
      total_price: formatCurrencyWithoutSymbol(total_price),
    };

    setEditState(editState.with(index, nextItem));

    return nextItem[field]
  };

  const totalSum = editState
    .filter(element => !element.is_deleted)
    .reduce((accumulator, current) => accumulator + (tryParseFloat(current.total_price) as number), 0);

  return (
    <Box flexDirection="column" justifyContent="center" rowGap={4}>
      <Box flexDirection="column">
        <Typography variant="h2">👌 Here’s the items we found</Typography>
        <Typography>You can correct any mistakes by tapping the item. Or add and remove items.</Typography>
      </Box>

      <Box flexDirection="column" rowGap={2}>
        {editState.map((item, index) => {
          const handleChangeDescription: React.FocusEventHandler<HTMLSpanElement> = event => {
            setEditState(currentState => {
              const nextState = currentState.with(index, {
                ...item,
                description: event.target.innerText,
              });

              return nextState;
            });
          };

          const handleChangeNumerical = (event: React.FocusEvent<HTMLSpanElement>, field: Parameters<typeof handleSyncElement>[1]) => {
            const nextText = handleSyncElement(index, field, removeCurrencySymbol(event.target.innerText));
            event.target.innerText = field === "amount" ? `${nextText}x` : formatCurrency(nextText, "EUR");
          };

          return (
            <Box key={item.description} alignItems="center" bg="card" flexDirection="row" justifyContent="space-between" rounded="md" paddingX={4} paddingY={2.5}>
              <Box flexDirection="column">
                <Typography color="text-inverse" contentEditable={!item.is_deleted} onBlur={handleChangeDescription} onKeyUp={handleKeyUp} fontWeight="bold" variant="body">
                  {item.description}
                </Typography>
                <Box flexDirection="row" columnGap={2}>
                  <Typography color="text-inverse" contentEditable={!item.is_deleted} onBlur={e => handleChangeNumerical(e, "amount")} onKeyUp={handleKeyUp} inputMode="decimal" variant="body">
                    {item.amount}x
                  </Typography>
                  <Typography color="text-inverse" contentEditable={!item.is_deleted} onBlur={e => handleChangeNumerical(e, "unit_price")} onKeyUp={handleKeyUp} inputMode="decimal" variant="body">
                    {formatCurrency(item.unit_price, "EUR")}
                  </Typography>
                </Box>
              </Box>

              <Typography color="text-inverse" contentEditable={!item.is_deleted} onBlur={e => handleChangeNumerical(e, "total_price")} onKeyUp={handleKeyUp} inputMode="decimal" fontWeight="bold">
                {formatCurrency(item.total_price, "EUR")}
              </Typography>
            </Box>
          );
        })}

        <Box justifyContent="space-between" paddingX={2}>
          <Typography fontWeight="bold" variant="body">Total</Typography>
          <Typography fontWeight="bold" variant="body">{formatCurrency(totalSum, "EUR")}</Typography>
        </Box>
      </Box>

      <Box flexDirection="column" rowGap={2}>
        <FormControl name="tip">
          <FormLabel>Did you also add a tip?</FormLabel>
          
          <Box flexDirection="row" columnGap={2} />
        </FormControl>

        <FormControl name="name">
          <FormLabel>What is this bill for?</FormLabel>
          <TextInput />
        </FormControl>

        <FormControl name="name">
          <FormLabel>How do you want to get paid?</FormLabel>
          <TextInput />
        </FormControl>
      </Box>
    </Box>
  );
}

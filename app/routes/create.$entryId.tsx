import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { Fragment, useRef, useState } from "react";
import { z } from "zod";

import { Box } from "~/components/box";
import { Button, ButtonGroup } from "~/components/button";
import { CurrencyInput } from "~/components/currency-input";
import { Divider } from "~/components/divider";
import { FormHelper } from "~/components/form-helper";
import { FormLabel } from "~/components/form-label";
import { ReceiptBox } from "~/components/receipt-box";
import { TextInput } from "~/components/text-input";
import { Typography } from "~/components/typography";
import { extractFirstUrl, formatCurrencyWithoutSymbol, tryParseFloat } from "~/functions";
import { findScannedBill } from "~/services/bills";

export async function loader({ params }: LoaderFunctionArgs) {
  const element = await findScannedBill(params.entryId as string);
  if (element === null) return redirect("/");

  return {
    ...element,
    service_fee: 0,
    payment_method: "",
    currency: element.currency ?? "EUR",
    line_items: element.line_items.map(item => ({
      ...item,
      is_deleted: false,
    })),
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const input_ = parseFormData(await request.formData());
  const result = submitShape.safeParse(input_);
  if (false === result.success) throw new Response("Invalid form data received", { status: 400 });

  const input = result.data;
  // TODO: save data

  return null;
}

export default function CreatePage() {
  const element = useLoaderData<typeof loader>();

  const serviceFeeRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<ItemState[]>(element.line_items);
  const [serviceFee, setServiceFee] = useState(element.service_fee);

  const handleClickCreate = () => {
    setItems(current => ([
      ...current, {
        amount: undefined,
        description: undefined,
        total_price: undefined,
        is_deleted: false,
      }
    ]));
  };

  const handlePaste: React.ClipboardEventHandler<HTMLInputElement> = event => {
    const value = event.clipboardData.getData("text");
    const urlFoundInText = extractFirstUrl(value);
    const inputElement$ = event.target as HTMLInputElement;

    requestAnimationFrame(() => {
      const nextValue = urlFoundInText !== null && urlFoundInText.length > 0 ? urlFoundInText : value;
      inputElement$.value = nextValue;
    });
  }

  const updateServiceFee = (nextAmount: number) => {
    setServiceFee(nextAmount);

    if (serviceFeeRef.current !== null) {
      serviceFeeRef.current.value = formatCurrencyWithoutSymbol(nextAmount);
    }
  };

  const subTotalPrice = calculateSubTotal(items);
  const totalPrice = subTotalPrice + serviceFee;

  return (
    <Form autoComplete="off" method="POST">
      <Box flexDirection="column" justifyContent="center" rowGap={4}>
        <Box flexDirection="column">
          <Typography variant="h2">👌 Here’s the items we found</Typography>
          <Typography>You can correct any mistakes by tapping the item. Or add and remove items.</Typography>
        </Box>

        <ReceiptBox>
          <Box alignSelf="center" flexDirection="column" rowGap={2}>
            <TextInput
              defaultValue={element.name ?? ""}
              alignSelf="center"
              fontSize="md"
              fontWeight="600"
              name="name"
              placeholder="Name for this bill"
              required
              textAlign="center"
            />
            <Box columnGap={2}>
              <TextInput
                defaultValue={element.date}
                alignSelf="center"
                fontSize="md"
                fontWeight="400"
                name="date"
                type="date"
                textAlign="center"
              />
              <CurrencyInput
                defaultValue={element.currency}
                name="currency"
                required
              />
            </Box>
          </Box>

          <Box flexDirection="column" marginY={6} rowGap={2}>
            {items.map((item, index) => {
              const handleChangeAmount = (event: React.FocusEvent<HTMLInputElement>) => {
                const amount = updateAmount(item.amount ?? 0, event.target.value);
                event.target.value = String(amount);
                setItems(current => current.with(index, { ...item, amount: amount }));
              }

              const handleChangeTotalPrice = (event: React.FocusEvent<HTMLInputElement>) => {
                const total_price = updateTotalPrice(item.total_price ?? 0, event.target.value);
                event.target.value = formatCurrencyWithoutSymbol(total_price);
                setItems(current => current.with(index, { ...item, total_price }));
              };

              const handleChangeDescription = (event: React.ChangeEvent<HTMLInputElement>) => {
                event.target.size = Math.max(event.target.value.length + 4, 4);
                setItems(current => current.with(index, { ...item, description: event.target.value }));
              };

              const handleClickDelete = () => {
                const isDeleted = !item.is_deleted;
                document.querySelector(`input[name="line_items[${index}][is_deleted]"]`)!.value = isDeleted;
                setItems(current => current.with(index, { ...item, is_deleted: isDeleted }));
              };

              return (
                <Fragment key={index}>
                  <Box alignItems="center" flexDirection="row" columnGap={2}>
                    <TextInput
                      defaultValue={String(item.amount)}
                      disabled={item.is_deleted}
                      inputMode="numeric"
                      name={`line_items[${index}][amount]`}
                      onBlur={handleChangeAmount}
                      placeholder="-x"
                      required
                      size={2}
                      space="small"
                      textAlign="center"
                      type="number"
                    />
                    <TextInput
                      defaultValue={item.description}
                      disabled={item.is_deleted}
                      name={`line_items[${index}][description]`}
                      onBlur={handleChangeDescription}
                      placeholder="Item"
                      required
                      space="small"
                      size={Math.min((item.description?.length ?? 0) + 4, 20)}
                    />
                    <TextInput
                      defaultValue={item.total_price !== undefined ? formatCurrencyWithoutSymbol(item.total_price) : item.total_price}
                      disabled={item.is_deleted}
                      marginLeft="auto"
                      name={`line_items[${index}][total_price]`}
                      onBlur={handleChangeTotalPrice}
                      inputMode="decimal"
                      placeholder={formatCurrencyWithoutSymbol(0)}
                      required
                      size={8}
                      space="small"
                      textAlign="right"
                    />

                    <input
                      defaultValue={item.is_deleted ? "1" : "0"}
                      name={`line_items[${index}][is_deleted]`}
                      type="hidden"
                    />

                    <Button onClick={handleClickDelete} size="none" variant="ghost">
                      {item.is_deleted ? "♻️" : "🗑️"}
                    </Button>
                  </Box>

                  <Divider />
                </Fragment>
              );
            })}

            <Box>
              <Button onClick={handleClickCreate} startDecorator="🆕" size="sm" variant="ghost">
                Add item
              </Button>
            </Box>
          </Box>

          <Box flexDirection="column" rowGap={1}>
            <Box flexDirection="row" justifyContent="space-between">
              <Typography>Subtotal</Typography>
              <TextInput name="subtotal_price" readOnly space="small" size={8} textAlign="right" value={formatCurrencyWithoutSymbol(subTotalPrice)} />
            </Box>
            <Box alignItems="center" flexDirection="row" justifyContent="space-between">
              <Typography>Service</Typography>
              <Box alignItems="center" columnGap={2}>
                <ButtonGroup>
                  {AVAILABLE_TIPS.map((element, index) => {
                    const position = index === 0 ? "start" : index === AVAILABLE_TIPS.length - 1 ? "end" : "middle";
                    
                    const handleClick = () => {
                      const nextTipAmount = element * subTotalPrice;
                      updateServiceFee(nextTipAmount);
                    };

                    return (
                      <Button key={element} onClick={handleClick} position={position} size="sm" variant="secondary" >
                        {formatPercentage(element)}
                      </Button>
                    );
                  })}
                </ButtonGroup>

                <TextInput
                  ref={serviceFeeRef}
                  defaultValue={serviceFee}
                  name="service_fee"
                  inputMode="decimal"
                  space="small"
                  size={8}
                  textAlign="right"
                />
              </Box>
            </Box>
            <Box flexDirection="row" justifyContent="space-between">
              <Typography>Total</Typography>
              <TextInput color="black" fontWeight="bold" readOnly size={8} space="small" textAlign="right" value={formatCurrencyWithoutSymbol(totalPrice)} />
            </Box>
          </Box>
        </ReceiptBox>

        <Box flexDirection="column" rowGap={1}>
          <FormLabel htmlFor="payment_method">How do you want to get paid?</FormLabel>
          <TextInput name="payment_method" onPaste={handlePaste} required type="text" />
          <FormHelper>Tip: use a payment request from your bank</FormHelper>
        </Box>

        <Button startDecorator="🧾" type="submit">Create bill</Button>
      </Box>
    </Form>
  );
}

const submitShape = z.object({
  name: z.string(),
  date: z.string(),
  currency: z.string(),
  service_fee: z.string()
    .nullable()
    .transform(v => v !== null ? tryParseFloat(v) : null)
    .pipe(z.number().nullable()),
  payment_method: z.string(),
  line_items: z.array(z.object({
    is_deleted: z.coerce.boolean(),
    description: z.string(),
    amount: z.string()
      .transform(v => tryParseFloat(v))
      .pipe(z.number()),
    total_price: z.string()
      .transform(v => tryParseFloat(v))
      .pipe(z.number()),
  })),
});

interface ItemState {
  amount: number | undefined;
  description: string | undefined;
  total_price: number | undefined;
  is_deleted: boolean;
}

function calculateSubTotal(items: ItemState[]) {
  return items
    .filter(element => (element.amount ?? 0) > 0)
    .filter(element => !element.is_deleted)
    .reduce((sum, element) => sum + (element.total_price ?? 0), 0);
}

function updateAmount(current: number, input: string) {
  const nextValue = tryParseFloat(input);
  
  return typeof nextValue === "number" ? nextValue : current;
}

function updateTotalPrice(current: number, input: string) {
  const nextValue = tryParseFloat(input);

  return typeof nextValue === "number" ? nextValue : current;
}

function formatPercentage(input: number) {
  return `${input * 100} %`;
}

function parseFormData(input: FormData) {
  const rawInput = [...input];
  const lineItems: Array<Record<string, FormDataEntryValue>> = [];

  for (const [key, value] of rawInput) {
    if (key.startsWith("line_items[")) {
      const matches = key.match(LINE_ITEM_REGEX);

      if (matches !== null && matches.length === 3) {
        const [, index_, prop] = matches;
        const index = Number(index_);

        lineItems[index] = lineItems[index] ?? {};
        lineItems[index][prop] = value;
      }
    }
  }

  return {
    ...Object.fromEntries(rawInput.filter(withoutLineItems)),
    line_items: lineItems,
  };
}

function withoutLineItems([key, _]: [string, unknown]) {
  return !key.startsWith("line_items");
}

const LINE_ITEM_REGEX = /line_items\[(\d+)\]\[(\w+)\]/;
const AVAILABLE_TIPS = [0.05, 0.1, 0.15, 0.2];

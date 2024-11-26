import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import React, { useRef, useState } from "react";

import { Box } from "~/components/box";
import { Button, ButtonGroup } from "~/components/button";
import { Divider } from "~/components/divider";
import { FormHelper } from "~/components/form-helper";
import { FormLabel } from "~/components/form-label";
import { ReceiptBox } from "~/components/receipt-box";
import { TextInput } from "~/components/text-input";
import { Typography } from "~/components/typography";
import { extractFirstUrl, formatCurrency, removeCurrencySymbol, tryParseFloat } from "~/functions";
import { findScannedBill } from "~/services/bills";

export async function loader({ params }: LoaderFunctionArgs) {
  const element = await findScannedBill(params.entryId as string);

  return element !== null ? { element } : redirect("/");
}

export async function action({ request }: ActionFunctionArgs) {
  console.log(await request.formData());

  return null;
}

export default function CreatePage() {
  const { element } = useLoaderData<typeof loader>();

  const tipAmountRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<ItemState[]>(element.line_items);
  const [feeAmount, setFeeAmount] = useState(0);

  const handleClickCreate = () => {
    setItems([
      ...items,
      { amount: undefined, description: undefined, total_price: undefined, is_deleted: false }
    ]);
  };

  const handlePaste: React.ClipboardEventHandler<HTMLInputElement> = event => {
    const value = event.clipboardData.getData("text");
    const urlFoundInText = extractFirstUrl(value);
    const $inputElement = event.currentTarget.firstChild;

    if ($inputElement === null) {
      return;
    }

    requestAnimationFrame(() => {
      const nextValue = urlFoundInText !== null && urlFoundInText.length > 0 ? urlFoundInText : value;
      ($inputElement as HTMLInputElement).value = nextValue;
    });
  }

  const subTotalPrice = calculateSubTotal(items);
  const totalPrice = subTotalPrice + feeAmount;

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
              alignSelf="center"
              defaultValue={element.name ?? ""}
              fontSize="md"
              fontWeight="600"
              name="name"
              placeholder="Name for this bill"
              required
              textAlign="center"
            />

            <TextInput
              alignSelf="center"
              defaultValue={element.created_on}
              fontSize="md"
              fontWeight="400"
              name="datetime"
              type="datetime-local"
              textAlign="center"
            />
          </Box>

          <Box flexDirection="column" marginY={6} rowGap={2}>
            {items.map((item, index) => {
              const handleChangeAmount = (event: React.FocusEvent<HTMLInputElement>) => {
                const amount = updateAmount(item.amount ?? 0, event.target.value);
                setItems(items.with(index, { ...item, amount }));
                event.target.value = String(amount) + "x";
              }

              const handleChangeTotalPrice = (event: React.FocusEvent<HTMLInputElement>) => {
                const total_price = updateTotalPrice(item.total_price ?? 0, event.target.value);
                setItems(items.with(index, { ...item, total_price }));
                event.target.value = formatCurrency(total_price, "EUR");
              };

              const handleChangeDescription = (event: React.ChangeEvent<HTMLInputElement>) => {
                event.target.size = Math.max(event.target.value.length + 4, 4);
              };

              const handleClickDelete = () => {
                setItems(items.with(index, { ...item, is_deleted: true }));
              };

              return (
                <React.Fragment key={index}>
                  <Box alignItems="center" flexDirection="row" columnGap={2}>
                    <TextInput
                      defaultValue={item.amount !== undefined ? String(item.amount) + "x" : undefined}
                      name={`line_items[${index}][amount]`}
                      onBlur={handleChangeAmount}
                      placeholder="-x"
                      required
                      size={2}
                      space="small"
                      textAlign="center"
                    />
                    <TextInput
                      defaultValue={item.description}
                      name={`line_items[${index}][description]`}
                      onChange={handleChangeDescription}
                      placeholder="Item"
                      required
                      space="small"
                      size={(item.description?.length ?? 0) + 4}
                    />
                    <TextInput
                      defaultValue={item.total_price !== undefined ? formatCurrency(item.total_price, "EUR") : item.total_price}
                      marginLeft="auto"
                      name={`line_items[${index}][total_price]`}
                      onBlur={handleChangeTotalPrice}
                      placeholder={formatCurrency(0, "EUR")}
                      required
                      size={8}
                      space="small"
                      textAlign="right"
                    />

                    <Button onClick={handleClickDelete} size="none" variant="tertiary">
                      🗑️
                    </Button>
                  </Box>

                  <Divider />
                </React.Fragment>
              );
            })}

            <Button onClick={handleClickCreate} startDecorator="🆕" size="sm" variant="tertiary">
              Add item
            </Button>
          </Box>

          <Box flexDirection="column" rowGap={1}>
            <Box flexDirection="row" justifyContent="space-between">
              <Typography>Subtotal</Typography>
              <TextInput disabled name="subtotal_price" space="small" size={8} textAlign="right" value={formatCurrency(subTotalPrice, "EUR")} />
            </Box>
            <Box alignItems="center" flexDirection="row" justifyContent="space-between">
              <Typography>Service fee</Typography>
              <Box alignItems="center" columnGap={2}>
                <ButtonGroup>
                  {AVAILABLE_TIPS.map((element, index) => {
                    const position = index === 0 ? "start" : index === AVAILABLE_TIPS.length - 1 ? "end" : "middle";
                    
                    const handleClick = () => {
                      const nextTipAmount = element * subTotalPrice;

                      if (tipAmountRef.current !== null) {
                        setFeeAmount(nextTipAmount);
                        tipAmountRef.current.value = formatCurrency(nextTipAmount, "EUR");
                      }
                    };

                    return (
                      <Button key={element} onClick={handleClick} position={position} size="sm" variant="secondary" >
                        {formatPercentage(element)}
                      </Button>
                    );
                  })}
                </ButtonGroup>

                <TextInput ref={tipAmountRef} name="service_fee" defaultValue={formatCurrency(feeAmount, "EUR")} space="small" size={8} textAlign="right" />
              </Box>
            </Box>
            <Box flexDirection="row" justifyContent="space-between">
              <Typography>Total</Typography>
              <TextInput color="black" disabled fontWeight="bold" size={8} space="small" textAlign="right" value={formatCurrency(totalPrice, "EUR")} />
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
  const nextValue = tryParseFloat(input.replaceAll("x", ""));
  
  return typeof nextValue === "number" ? nextValue : current;
}

function updateTotalPrice(current: number, input: string) {
  const nextValue = tryParseFloat(removeCurrencySymbol(input))

  return typeof nextValue === "number" ? nextValue : current;
}

function formatPercentage(input: number) {
  return `${input * 100} %`;
}

const AVAILABLE_TIPS = [0.05, 0.1, 0.15, 0.2];

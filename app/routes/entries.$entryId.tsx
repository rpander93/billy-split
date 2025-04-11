import { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import { formatDate, parse } from "date-fns";
import { FormEventHandler, useMemo, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { z } from "zod";
import { AmountSelector } from "~/components/amount-selector";

import { Avatar } from "~/components/avatar";
import { Box } from "~/components/box";
import { Button, ButtonGroup, LinkButton } from "~/components/button";
import { currency } from "~/components/currency";
import { Divider } from "~/components/divider";
import { FormLabel } from "~/components/form-label";
import { Logo } from "~/components/logo";
import { Modal } from "~/components/modal";
import { ReceiptBox } from "~/components/receipt-box";
import { TextInput } from "~/components/text-input";
import { Typography } from "~/components/typography";
import { calculate, formatCurrency, formatDecimal, parseServerToSelectionState, round, sum } from "~/functions";
import { addPaymentToBill, findSubmittedBill } from "~/services/bills";
import { css } from "~/styled-system/css";
import { OnlineSubmittedBill } from "~/types";

export function meta({ data }: Parameters<MetaFunction<typeof loader>>[0]) {
  return [{ title: `${data?.bill.name} - Billy` }];
}

export async function loader({ params }: LoaderFunctionArgs) {
  const entryId = params.entryId as string;

  const bill = await findSubmittedBill(entryId);
  if (bill === null) return redirect("/");

  return { entryId, bill };
}

export async function action({ params, request }: ActionFunctionArgs) {
  const entryId = params.entryId as string;

  const input_ = await request.json();
  const result = submitShape.safeParse(input_);
  if (false === result.success) throw new Response("Invalid form data received", { status: 400 });

  try {
    const paymentId = await addPaymentToBill(entryId, {
      creator: result.data.name,
      created_on: Date.now() / 1000,
      line_items: result.data.items.map(x => ({
        line_item_index: x.index,
        amount: x.amount,
      })),
    });

    return redirect(`/payment-recorded/${entryId}/${paymentId}`);
  } catch (error) {
    throw new Response(`Could not record your payment. Reason: ${(error as Error).message}`, { status: 500 });
  }
}

export default function EntryPage() {
  const { bill } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();

  const [items, { amountChange, splitChange, click }] = useItems(bill);
  const [view, setView] = useState<"items" | "payments">("items");

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const entries = Object.fromEntries(formData);

    const selection = items.filter(x => x.mode !== "undecided").map(x => ({
      index: x.index,
      amount: x.current_amount,
    }));

    submit(
      { ...entries, items: selection },
      { method: "post", encType: "application/json" },
    );
  };

  const totalAmount = useMemo(() => calculate.total(items), [items]);
  const selectionAmount = useMemo(() => calculate.current(bill, items), [bill, items]);
  const remainingAmount = useMemo(() => calculate.remaining(bill, totalAmount, selectionAmount), [bill, totalAmount, selectionAmount]);
  const date = bill.date ? parse(bill.date, "yyyy-MM-dd", new Date()) : new Date(bill.created_on * 1000);

  return (
    <Form autoComplete="off" method="POST" onSubmit={handleSubmit}>
      <Box flexDirection="column" justifyContent="center" rowGap={2}>
        <Box flexDirection="column" rowGap={1}>
          <Logo />
          <Typography>Select the items that belong to you. Record your payment using the provided payment method.</Typography>
        </Box>

        <ReceiptBox>
          <Box alignSelf="center" flexDirection="column" rowGap={1}>
            <Typography textAlign="center">
              {bill.name}
              <a href={`/entries/${bill.share_code}/open`} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 4 }}>🔗</a>
            </Typography>
            <Typography>
              {formatDate(date, "d MMMM, yyyy")} | {currency(bill.currency)}
            </Typography>
          </Box>

          <ButtonGroup size="sm">
            <Button hover={view === "items"} onClick={() => setView("items")}>View bill items</Button>
            <Button hover={view === "payments"} onClick={() => setView("payments")}>View payments</Button>
          </ButtonGroup>

          {view === "items" ? (
            <LineItemList
              bill={bill}
              items={items}
              onAmountChange={amountChange}
              onItemClick={click}
              onSplitChange={splitChange}
              totalAmount={totalAmount}
              remainingAmount={remainingAmount}
              selectionAmount={selectionAmount}
            />
          ) : (
            <PaymentList
              bill={bill}
              totalAmount={totalAmount}
              remainingAmount={remainingAmount}
              selectionAmount={selectionAmount}
            />
          )}
        </ReceiptBox>

        {selectionAmount > 0 && (
          <>
            <Box flexDirection="column" rowGap={1}>
              <FormLabel htmlFor="name">What is your name?</FormLabel>
              <TextInput name="name" required type="text" />
            </Box>
          
            <Button loading={navigation.state === "submitting"} startDecorator="💸" type="submit">
              Pay back your share of {formatCurrency(selectionAmount, bill.currency)}
            </Button>
          </>
        )}
      </Box>
    </Form>
  );
}

interface LineItemListProps {
  bill: OnlineSubmittedBill;
  items: ReturnType<typeof parseServerToSelectionState>;
  onAmountChange: (index: number, change: number) => void;
  onItemClick: (index: number) => void;
  onSplitChange: (index: number, change: number) => void;
  totalAmount: number;
  remainingAmount: number;
  selectionAmount: number;
}

function LineItemList({ bill, items, onAmountChange, onItemClick, onSplitChange, totalAmount, remainingAmount, selectionAmount }: LineItemListProps) {
  return (
    <Fragment>
      <Box flexDirection="column" rowGap={3} marginY={4}>
        {items.map(element => (
          <Fragment key={element.index}>
            <Box flexDirection="column" rowGap={1}>
              <Box flexDirection="row">
                <Typography color="gray.600" flex={1 / 20}>
                  {element.amount}
                </Typography>
                <Typography color="black" flex={18 / 20}>
                  {element.description}
                </Typography>
                <Typography color="black" flex={1 / 20}>
                  {formatCurrency(element.amount * element.unit_price, bill.currency)}
                </Typography>
              </Box>

              <Box alignItems="center" flexDirection="row" justifyContent={element.payment_items.length > 0 ? "space-between" : "flex-end"}>
                {element.payment_items.length > 0 && (
                  <Box alignItems="center" flexDirection="row" columnGap={1}>
                    {element.payment_items.map((payment, index) => (
                      <Box key={payment.creator + payment.amount} marginInlineStart={index > 0 ? -5 : undefined}>
                        <Avatar name={payment.creator} />
                      </Box>
                    ))}
                  </Box>
                )}

                {element.mode === "itemize" ? (
                  <Box alignItems="center" columnGap={2} flexDirection="row">
                    <Typography>{element.remaining_amount} remaining</Typography>

                    <AmountSelector
                      label={`I had ${element.current_amount}`}
                      plusDisabled={element.remaining_amount <= 0}
                      onMinusClick={() => onAmountChange(element.index, -1)}
                      onPlusClick={() => onAmountChange(element.index, +1)}
                    />
                  </Box>
                ) : element.mode === "splitting" ? (
                  <Box alignItems="center" columnGap={2} flexDirection="row">
                    <Typography>{formatDecimal(element.remaining_amount)} remaining</Typography>

                    <AmountSelector
                      label={`Split by ${element.splitting_denumerator}`}
                      onMinusClick={() => onSplitChange(element.index, -1)}
                      onPlusClick={() => onSplitChange(element.index, +1)}
                    />
                  </Box>
                ) : element.remaining_amount > 0 ? (
                  <button className={addMeButtonCss} onClick={() => onItemClick(element.index)} type="button">
                    <Typography fontSize="md">I had this ✋</Typography>
                  </button>
                ) : (
                  <span className={checkIconCss}>Fully paid ✅</span>
                )}
              </Box>
            </Box>

            <Divider />
          </Fragment>
        ))}
      </Box>

      <Box flexDirection="column">
        <Box flexDirection="row" justifyContent="space-between">
          <Typography>Total</Typography>
          <Typography>{formatCurrency(totalAmount, bill.currency)}</Typography>
        </Box>

        {selectionAmount > 0 && (
          <Box flexDirection="row" justifyContent="space-between">
            <Typography>Your share</Typography>
            <Typography>{formatCurrency(selectionAmount, bill.currency)}</Typography>
          </Box>
        )}

        <Box flexDirection="row" justifyContent="space-between">
          <Typography>Remaining</Typography>
          <Typography>{formatCurrency(remainingAmount, bill.currency)}</Typography>
        </Box>
      </Box>
    </Fragment>
  );
}

interface PaymentListProps {
  bill: OnlineSubmittedBill;
  totalAmount: number;
  selectionAmount: number;
  remainingAmount: number;
}

function PaymentList({ bill, totalAmount, selectionAmount, remainingAmount }: PaymentListProps) {
  return (
    <Fragment>
      <Box flexDirection="column" marginY={2} rowGap={3}>
        {bill.payment_items.length > 0 ?
          bill.payment_items.map((item, index) => {
          const totalAmount = sum(item.line_items.map(x => {
            const y = bill.line_items.find(z => z.index === x.line_item_index);

            return x.amount * (y?.unit_price ?? 0);
          }));

          return (
            <Fragment key={item.index ?? index}>
              <Box flexDirection="column">
                <Box alignItems="center" flexDirection="row" columnGap={4}>
                  <Avatar name={item.creator} />
                  <Typography>{item.creator}</Typography>

                  <Typography marginInlineStart="auto">
                    {formatCurrency(totalAmount, bill.currency)}
                  </Typography>
                </Box>

                <Box flexDirection="column" marginStart={4} marginTop={2}>
                  {item.line_items.map(element => {
                    const y = bill.line_items.find(z => z.index === element.line_item_index);

                    return (
                      <Box key={element.line_item_index}>
                        <Typography color="gray.600" flex={1 / 10} fontSize="sm">{formatDecimal(element.amount)}</Typography>
                        <Typography flex={9 / 10} fontSize="sm">{y!.description}</Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
              <Divider />
            </Fragment>
          );
        }) : (
          <Typography textAlign="center">No payments yet. Be the first!</Typography>
        )}
      </Box>

      <Box flexDirection="column">
        <Box flexDirection="row" justifyContent="space-between">
          <Typography>Paid</Typography>
          <Typography>{formatCurrency(totalAmount - remainingAmount - selectionAmount, bill.currency)}</Typography>
        </Box>

        {selectionAmount > 0 && (
          <Box flexDirection="row" justifyContent="space-between">
            <Typography>Your share</Typography>
            <Typography>{formatCurrency(selectionAmount, bill.currency)}</Typography>
          </Box>
        )}
      </Box>
    </Fragment>
  );
}

function useItems(bill: OnlineSubmittedBill) {
  const [items, setItems] = useState(() => parseServerToSelectionState(bill));

  const amountChange = (index: number, change: number) => {
    const itemIndex = items.findIndex(element => element.index === index);
    const item = items[itemIndex];

    const amount_change = round(item.current_amount + change);
    const amount_remaining = round(item.remaining_amount - change);
    const current_amount = Math.max(Math.min(amount_change, round(item.amount - item.prior_amount)), 0);

    setItems(current =>
      current.with(itemIndex, {
        ...item,
        current_amount,
        remaining_amount: Math.min(Math.max(amount_remaining, 0), round(item.amount - item.prior_amount)),
        mode: current_amount === 0 ? "undecided" : "itemize",
      }),
    );
  }

  const split = (index: number) => {
    const itemIndex = items.findIndex(element => element.index === index);
    const item = items[itemIndex];

    const remaining_amount = item.amount - item.prior_amount;
    const next_denumerator = Math.max(item.payment_items.length, 2);
    const current_amount = Math.min((1 / next_denumerator) * item.amount, remaining_amount);

    setItems(current =>
      current.with(itemIndex, {
        ...item,
        current_amount,
        splitting_denumerator: next_denumerator,
        remaining_amount: remaining_amount - current_amount,
        mode: "splitting",
      }),
    );
  };

  const splitChange = (index: number, change: number) => {
    const itemIndex = items.findIndex(element => element.index === index);
    const item = items[itemIndex];

    const remaining_amount = item.amount - item.prior_amount;
    const next_denumerator = (item.splitting_denumerator as unknown as number) + change;
    const current_amount = Math.min((1 / next_denumerator) * item.amount, remaining_amount);

    setItems(current =>
      current.with(itemIndex, {
        ...item,
        current_amount: next_denumerator !== 1 ? current_amount : 0,
        splitting_denumerator: next_denumerator !== 1 ? next_denumerator : undefined,
        remaining_amount: next_denumerator !== 1 ? remaining_amount - current_amount : item.amount - item.prior_amount,
        mode: next_denumerator !== 1 ? "splitting" : "undecided",
      }),
    );
  };

  const click = async (index: number) => {
    const result = await Modal.call({
      buttons: [
        { children: "Choose quantity", value: "item", startDecorator: "➕" },
        { children: "Split total", value: "split", startDecorator: "➗" },
      ],
      message: "How do you want to split this item?",
    });

    if (result === "split") {
      split(index);
    } else if (result === "item") {
      amountChange(index, +1);
    }
  };

  return [items, { amountChange, click, splitChange }] as const;
}

const submitShape = z.object({
  name: z.string(),
  items: z.array(z.object({
    index: z.number(),
    amount: z.number(),
  })),
});

const addMeButtonCss = css({
  borderColor: "gray.300",
  borderRadius: "full",
  borderStyle: "dashed",
  borderWidth: 1.5,
  paddingX: 4,
  height: 8,
  _hover: {
    backgroundColor: "gray.100",
    cursor: "pointer",
  },
});

const checkIconCss = css({
  borderColor: "transparent",
  borderRadius: "full",
  borderStyle: "solid",
  borderWidth: 1.5,
  height: 8,
});

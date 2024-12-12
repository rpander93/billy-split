import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { formatDate, parse } from "date-fns";
import { useMemo, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { Avatar } from "~/components/avatar";

import { Box } from "~/components/box";
import { currency } from "~/components/currency";
import { Divider } from "~/components/divider";
import { ReceiptBox } from "~/components/receipt-box";
import { Typography } from "~/components/typography";
import { formatCurrency, parseServerToSelectionState, round, sum } from "~/functions";
import { findSubmittedBill } from "~/services/bills";
import { css } from "~/styled-system/css";

export async function loader({ params }: LoaderFunctionArgs) {
  const entryId = params.entryId as string;

  const bill = await findSubmittedBill(entryId);
  if (bill === null) return redirect("/");

  return { entryId, bill };
}

export default function EntryPage() {
  const { bill } = useLoaderData<typeof loader>();
  const [items, setItems] = useState(() => parseServerToSelectionState(bill));

  const handleOnChange = (index: number, change: number) => {
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
      }),
    );
  }

  const totalSum = useMemo(
    () => items.reduce((accumulator, current) => accumulator + (current.amount * current.unit_price), 0),
    [items],
  );
  const currentSum = useMemo(
    () =>
      items.reduce((accumulator, current) => {
        const lineItem = bill.line_items.find(l => l.index === current.index);

        if (lineItem === undefined) {
          return accumulator;
        }

        return accumulator + current.current_amount * lineItem.unit_price;
      }, 0),
    [bill, items],
  );

  const pendingSum = useMemo(() => {
    const paidAmount = bill.payment_items.reduce((accumulator, current) => {
      const paidUser = sum(
        current.line_items.map(line_item => {
          const item = bill.line_items.find(x_item => x_item.index === line_item.line_item_index)!;

          return item.unit_price * line_item.amount;
        }),
      );

      return accumulator + paidUser;
    }, 0);

    return totalSum - paidAmount - currentSum;
  }, [bill.payment_items, bill.line_items, totalSum, currentSum]);

  return (
    <Box flexDirection="column" justifyContent="center">
      <ReceiptBox>
        <Box alignSelf="center" flexDirection="column" rowGap={1}>
          <Typography textAlign="center">
            {bill.name}
          </Typography>
          <Typography>
            {formatDate(parse(bill.date, "yyyy-mm-dd", new Date()), "d MMMM, yyyy")} | {currency(bill.currency)}
          </Typography>
        </Box>

        <Box flexDirection="column" marginY={6} rowGap={2}>
          {items.map(element => {
            // ..

            return (
              <Fragment key={element.index}>
                <Box flexDirection="column" rowGap={1}>
                  <Box flexDirection="row">
                    <Typography color="gray.600" flex={1 / 20}>
                      {element.amount}
                    </Typography>
                    <Typography color="black" flex={18 / 20} fontWeight="medium">
                      {element.description}
                    </Typography>
                    <Typography color="black" flex={1 / 20} fontWeight="medium">
                      {formatCurrency(element.amount * element.unit_price, bill.currency)}
                    </Typography>
                  </Box>

                  <Box alignItems="center" flexDirection="row" justifyContent="space-between">
                    {element.payment_items.length > 0 && (
                      <Box alignItems="center" flexDirection="row">
                        {element.payment_items.map(payment => (
                          <Avatar key={payment.creator + payment.amount} name={payment.creator} />
                        ))}
                      </Box>
                    )}

                    {element.current_amount > 0 ? (
                      <Box alignItems="center">
                        <button className={css(quantityButtonCss, minusButtonCss)} onClick={() => handleOnChange(element.index, -1)}>
                          <Typography fontSize="md" fontWeight="bold">-</Typography>
                        </button>
                        <Avatar name={element.current_amount.toString()} zIndex={2} />
                        <button className={css(quantityButtonCss, plusButtonCss)} disabled={element.remaining_amount <= 0} onClick={() => handleOnChange(element.index, +1)}>
                          <Typography fontSize="md" fontWeight="bold">+</Typography>
                        </button>
                      </Box>
                    ) : element.remaining_amount > 0 ? (
                      <button className={addMeButtonCss} onClick={() => handleOnChange(element.index, +1)} type="button">
                        ✋
                      </button>
                    ) : (
                      <span className={checkIconCss}>✅</span>
                    )}
                  </Box>
                </Box>

                <Divider />
              </Fragment>
            );
          })}
        </Box>
      </ReceiptBox>
    </Box>
  );
}

const quantityButtonCss = css.raw({
  backgroundColor: "white",
  borderColor: "gray.300",
  borderStyle: "solid",
  borderWidth: 0.5,
  position: "relative",
  height: 6,
  width: 8,
  zIndex: 1,
  _hover: {
    "&:not(:disabled)": {
      backgroundColor: "gray.100",
    }
  },
});

const minusButtonCss = css.raw({
  borderTopLeftRadius: "md",
  borderBottomLeftRadius: "md",
  marginRight: -2,
});

const plusButtonCss = css.raw({
  borderTopRightRadius: "md",
  borderBottomRightRadius: "md",
  marginLeft: -2,
});

const addMeButtonCss = css({
  borderColor: "gray.300",
  borderRadius: "full",
  borderStyle: "dashed",
  borderWidth: 1.5,
  height: 8,
  width: 8,
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
  width: 8,
});

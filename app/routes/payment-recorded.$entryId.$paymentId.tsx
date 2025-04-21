import { type ActionFunctionArgs, type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { Box } from "~/components/box";
import { Button, LinkButton } from "~/components/button";
import { Logo } from "~/components/logo";
import { Typography } from "~/components/typography";
import { formatCurrency, parsePaymentMethod, sum } from "~/functions";
import { findSubmittedBill, removePaymentFromBill } from "~/services/bills";

export async function loader({ params }: LoaderFunctionArgs) {
  const [bill, payment] = await load(params.entryId as string, params.paymentId as string);

  const paidAmount = sum(
    payment.line_items.map((x) => {
      const item = bill.line_items.find((y) => x.line_item_index === y.index);
      return x.amount * (item?.unit_price ?? 0);
    })
  );

  return {
    paidAmount,
    currency: bill.currency,
    paymentMethod: parsePaymentMethod(bill.payment_method)
  };
}

export async function action({ params }: ActionFunctionArgs) {
  const [bill, _] = await load(params.entryId as string, params.paymentId as string);

  // intentionally using `==` here to allow for both string and number types
  // eslint-disable-next-line eqeqeq
  const index = bill.payment_items.findIndex((x) => x.index == params.paymentId);
  await removePaymentFromBill(bill.id, index);

  return redirect(`/entries/${params.entryId}`);
}

export default function PaymentRecordedPage() {
  const { currency, paidAmount, paymentMethod } = useLoaderData<typeof loader>();

  return (
    <Box alignItems="center" flexDirection="column" justifyContent="center" rowGap={4}>
      <Logo />

      <Box alignItems="center" flexDirection="column">
        <Typography variant="h3">We recorded your payment of</Typography>
        <Typography variant="h1">🤑💸 {formatCurrency(paidAmount, currency)} 💸🤑</Typography>
      </Box>

      {paymentMethod.url ? (
        <Box alignItems="center" flexDirection="column" paddingX={2} rowGap={8} textAlign="center">
          <Box alignItems="center" flexDirection="column" rowGap={1.5}>
            <Typography fontSize="small">
              Click below button to open the payment method. Fill in the amount you owe.
            </Typography>

            <LinkButton href={paymentMethod.value} startDecorator="🔗" target="_blank" variant="secondary">
              Open payment method
            </LinkButton>
          </Box>

          <Box alignItems="center" flexDirection="column" rowGap={1.5}>
            <Typography fontSize="small">
              Did something go wrong while paying? You can remove your payment by clicking below button.
            </Typography>

            <Form method="POST">
              <Button startDecorator="😱" variant="secondary" type="submit">
                I could not complete the payment
              </Button>
            </Form>
          </Box>
        </Box>
      ) : (
        <Box alignItems="center" flexDirection="column" rowGap={1}>
          <Typography>Please pay the creator back using</Typography>
          <Typography variant="h2">{paymentMethod.value}</Typography>
        </Box>
      )}
    </Box>
  );
}

async function load(billId: string, paymentId: string) {
  const bill = await findSubmittedBill(billId);
  if (null === bill) throw redirect("/");

  // intentionally using `==` here to allow for both string and number types
  // eslint-disable-next-line eqeqeq
  const payment = bill.payment_items.find((x) => x.index == paymentId);
  if (undefined === payment) throw redirect("/");

  return [bill, payment] as const;
}

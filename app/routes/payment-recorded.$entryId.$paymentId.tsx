import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Box } from "~/components/box";
import { LinkButton } from "~/components/button";
import { Logo } from "~/components/logo";
import { Typography } from "~/components/typography";
import { formatCurrency, parsePaymentMethod, sum } from "~/functions";
import { findSubmittedBill } from "~/services/bills";

export async function loader({ params }: LoaderFunctionArgs) {
  const bill = await findSubmittedBill(params.entryId as string);
  if (null === bill) return redirect("/");

  const paymentId = Number.parseInt(params.paymentId as string);
  const payment = bill.payment_items.find(x => x.index === paymentId);
  if (undefined === payment) return redirect("/");

  const paidAmount = sum(payment.line_items.map(x => {
    const item = bill.line_items.find(y => x.line_item_index === y.index);
    return x.amount * (item?.unit_price ?? 0);
  }));

  return {
    paidAmount,
    currency: bill.currency,
    paymentMethod: parsePaymentMethod(bill.payment_method),
  };
}

export default function PaymentRecordedPage() {
  const { currency, paidAmount, paymentMethod } = useLoaderData<typeof loader>();

  return (
    <Box alignItems="center" flexDirection="column" justifyContent="center" rowGap={4}>
      <Logo />

      <Box alignItems="center" flexDirection="column">
        <Typography variant="h2">We recorded your payment of</Typography>
        <Typography variant="h1">💸 {formatCurrency(paidAmount, currency)} 💸</Typography>
      </Box>

      {paymentMethod.url ? (
        <Box alignItems="center" flexDirection="column" rowGap={1}>
          <Typography>Please complete the payment by clicking below button</Typography>
          
          <LinkButton href={paymentMethod.value} startDecorator="🔗" target="_blank" variant="secondary">
            Click here
          </LinkButton>
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

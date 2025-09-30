import { format } from "date-fns";
import { randomString } from "~/functions";
import type { OnlineScannedBill, OnlineSubmittedBill, ScannedBill, SubmittedBill } from "~/types";
import { database } from "./database";
import { upload } from "./files";

interface PaymentProps {
  id: number;
  creator: string;
  line_items: Array<{
    line_item_id: number;
    amount: number;
  }>;
}

export async function addSubmittedBill(scannedBillShareCode: string, submitted: SubmittedBill) {
  const scanned = await findScannedBill(scannedBillShareCode);

  if (scanned === null) {
    throw new Error(`Cannot find scanned item with share code "${scannedBillShareCode}"`);
  }

  const connection = database();

  // Use transaction for multiple table operations
  await connection.transaction().execute(async (scope) => {
    // Insert root entity
    const [bill] = await scope
      .insertInto("submitted_bill")
      .values({
        name: submitted.name,
        date: submitted.date,
        currency: submitted.currency,
        service_fee: submitted.service_fee,
        payment_method: submitted.payment_method,
        file_name: scanned.file_name,
        share_code: scanned.share_code,
        created_on: scanned.created_on,
        number_of_payments: 0
      })
      .returningAll()
      .execute();

    // Insert line items
    const values = submitted.line_items
      .filter((x) => !x.is_deleted)
      .map(x => ({
        bill_id: bill.id as number,
        description: x.description,
        amount: x.amount,
        unit_price: x.total_price / x.amount,
      }));

    await scope
      .insertInto("submitted_bill_line_item")
      .values(values)
      .execute();

    // Add service fee if present
    if (submitted.service_fee !== null && submitted.service_fee > 0) {
      await scope
        .insertInto("submitted_bill_line_item")
        .values({
          bill_id: bill.id as number,
          description: "Service fee",
          amount: 1,
          unit_price: submitted.service_fee
        })
        .execute();
    }

    // Remove from scanned_bills
    await scope
      .deleteFrom("scanned_bill")
      .where("id", "=", scanned.id)
      .execute();
  });

  return scanned.share_code;
}

export async function findSubmittedBill(shareCode: string): Promise<OnlineSubmittedBill | null> {
  const connection = database();

  // Get main bill data
  const bill = await connection
    .selectFrom("submitted_bill")
    .selectAll()
    .where("share_code", "=", shareCode)
    .executeTakeFirst();

  if (!bill) {
    return null;
  }

  // Get line items
  const lineItems = await connection
    .selectFrom("submitted_bill_line_item")
    .select(["id", "description", "amount", "unit_price"])
    .where("bill_id", "=", bill.id)
    .orderBy("id")
    .execute();

  // Get payment line items
  const paymentLineItems = await connection
    .selectFrom("payment_line_item as li")
    .innerJoin("payment as pi", "li.payment_id", "pi.id")
    .select(["pi.id as payment_id", "pi.bill_id", "pi.created_on", "pi.creator", "pi.share_code"])
    .select(["li.line_item_id", "li.amount"])
    .where("pi.bill_id", "=", bill.id)
    .execute();

  // Map data
  const groupedOnPaymentId = Object.groupBy(paymentLineItems, (item) => item.payment_id as number);
  const mappedPaymentItems = Object.entries(groupedOnPaymentId).map(([_, payments]) => {
    if (payments === undefined) throw new Error("Cannot proceed without `payments`");
    const payment0 = payments[0];

    return {
      id: payment0.payment_id as number,
      creator: payment0.creator,
      created_on: payment0.created_on,
      share_code: payment0.share_code,
      line_items: (payments ?? []).map(payment => ({
        line_item_id: payment.line_item_id,
        amount: payment.amount
      })),
    };
  });

  return {
    id: bill.id as number,
    name: bill.name,
    date: bill.date,
    currency: bill.currency,
    service_fee: bill.service_fee,
    payment_method: bill.payment_method,
    file_name: bill.file_name,
    share_code: bill.share_code,
    created_on: bill.created_on,
    number_of_payments: bill.number_of_payments,
    line_items: lineItems.map((item) => ({
      id: item.id as number,
      description: item.description,
      amount: item.amount,
      unit_price: item.unit_price
    })),
    payment_items: mappedPaymentItems
  };
}

export async function addScannedBill(element: ScannedBill, file: File): Promise<OnlineScannedBill> {
  const shareCode = randomString(6);
  const fileName = `${shareCode}.jpg`;

  await database().transaction().execute(async scope => {
    const [output] = await scope
      .insertInto("scanned_bill")
      .values({
        name: element.name,
        date: element.date ?? format(new Date(), "yyyy-MM-dd"),
        currency: element.currency,
        share_code: shareCode,
        file_name: fileName,
        created_on: Date.now(),
      })
      .returningAll()
      .execute();

    const items = element.line_items.map(line_item => ({
      bill_id: output.id as number,
      description: line_item.description,
      amount: line_item.amount,
      total_price: line_item.total_price
    }));

    await scope
      .insertInto("scanned_bill_line_item")
      .values(items)
      .execute();

    await upload(file, fileName);
  });

  return findScannedBill(shareCode) as Promise<OnlineScannedBill>;
}

export async function findScannedBill(shareCode: string): Promise<OnlineScannedBill | null> {
  const connection = database();

  // Get main bill data
  const bill = await connection
    .selectFrom("scanned_bill")
    .selectAll()
    .where("share_code", "=", shareCode)
    .executeTakeFirst();

  if (!bill) {
    return null;
  }

  // Get line items
  const lineItems = await connection
    .selectFrom("scanned_bill_line_item")
    .select(["description", "amount", "total_price"])
    .where("bill_id", "=", bill.id)
    .orderBy("id")
    .execute();

  return {
    id: bill.id as number,
    name: bill.name,
    date: bill.date ?? format(new Date(), "yyyy-MM-dd"),
    currency: bill.currency,
    share_code: bill.share_code,
    file_name: bill.file_name,
    created_on: bill.created_on,
    line_items: lineItems
  };
}

export async function addPaymentToBill(shareCode: string, payment: Omit<PaymentProps, "id">) {
  const entry = await findSubmittedBill(shareCode);
  if (entry === null) throw new Error(`Bill with share code "${shareCode}" does not exist`);

  const paymentId = randomString(16);
  const connection = database();

  await connection.transaction().execute(async scope => {
    const [result] = await scope
      .insertInto("payment")
      .values({
        bill_id: entry.id as number,
        share_code: paymentId,
        creator: payment.creator,
        created_on: Date.now()
      })
      .returningAll()
      .execute();

    // Insert payment line items
    const lineItems = payment.line_items.map(item => ({
      payment_id: result.id as number,
      line_item_id: item.line_item_id,
      amount: item.amount
    }));

    await scope
      .insertInto("payment_line_item")
      .values(lineItems)
      .execute();
  });

  return paymentId;
}

export async function removePaymentFromBill(billShareCode: string, paymentShareCode: string) {
  const bill = await findSubmittedBill(billShareCode);
  if (bill === null) throw new Error(`Bill with share code "${billShareCode}" does not exist`);

  await database().transaction().execute(async scope => {
    const payment = await scope
      .selectFrom("payment")
      .select("id")
      .where("bill_id", "=", bill.id)
      .where("share_code", "=", paymentShareCode)
      .executeTakeFirstOrThrow();

    await scope
      .deleteFrom("payment")
      .where("id", "=", payment.id)
      .execute();
  });
}

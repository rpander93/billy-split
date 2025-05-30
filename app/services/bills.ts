import type { OnlineScannedBill, OnlineSubmittedBill, ScannedBill, SubmittedBill } from "~/types";
import { database } from "./database";
import { upload } from "./files";

const CONTAINER_SCANS = process.env.VITE_AZURE_COSMOS_CONTAINER_SCANS as string;
const CONTAINER_ENTRIES = process.env.VITE_AZURE_COSMOS_CONTAINER_ENTRIES as string;

export async function addSubmittedBill(scannedBillId: string, submitted: SubmittedBill) {
  const scanned = await findScannedBill(scannedBillId);
  if (scanned === null) throw new Error(`Cannot find scanned item with id "${scannedBillId}"`);

  const submittedLineItems = submitted.line_items
    .filter((x) => x.is_deleted === false)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(({ is_deleted, ...item }, index) => ({
      ...item,
      index,
      unit_price: item.total_price / item.amount
    }));

  if (submitted.service_fee !== null && submitted.service_fee > 0) {
    submittedLineItems.push({
      index: submittedLineItems.length,
      unit_price: submitted.service_fee,
      amount: 1,
      total_price: submitted.service_fee,
      description: "Service fee"
    });
  }

  await Promise.all([
    database.container(CONTAINER_ENTRIES).items.upsert<OnlineSubmittedBill>({
      ...scanned,
      ...submitted,
      line_items: submittedLineItems,
      number_of_payments: 0,
      payment_items: []
    }),
    database.container(CONTAINER_SCANS).deleteAllItemsForPartitionKey(scannedBillId)
  ]);

  return scanned.share_code;
}

export async function findSubmittedBill(elementId: string) {
  const { resource } = await database
    .container(CONTAINER_ENTRIES)
    .item(elementId, elementId)
    .read<OnlineSubmittedBill>();

  return resource ?? null;
}

export async function addScannedBill(element: ScannedBill, file: File): Promise<OnlineScannedBill> {
  const shareCode = randomString(16);
  const fileExtension = file.name.substring(file.name.lastIndexOf("."));
  const fileName = shareCode + fileExtension;

  const retVal: OnlineScannedBill = {
    ...element,
    id: shareCode,
    file_name: shareCode + fileExtension,
    created_on: Date.now() / 1000,
    date: element.date !== null ? ensureYMD(element.date) : formatYMD(),
    share_code: shareCode
  };

  await Promise.all([
    upload(file, fileName),
    database.container(CONTAINER_SCANS).items.upsert<OnlineScannedBill>(retVal)
  ]);

  return retVal;
}

export async function findScannedBill(elementId: string): Promise<OnlineScannedBill | null> {
  const { resource } = await database.container(CONTAINER_SCANS).item(elementId, elementId).read<OnlineScannedBill>();

  return resource ?? null;
}

interface PaymentProps {
  index: number;
  creator: string;
  created_on: number;
  line_items: Array<{ line_item_index: number; amount: number }>;
}

export async function addPaymentToBill(elementId: string, payment: Omit<PaymentProps, "index">) {
  const entry = await findSubmittedBill(elementId);
  if (entry === null) throw new Error(`Bill with id "${elementId}" does not exist`);
  const paymentId = randomString(16);

  await database
    .container(CONTAINER_ENTRIES)
    .item(elementId, elementId)
    .patch([
      { op: "incr", path: "/number_of_payments", value: 1 },
      {
        op: "add",
        path: "/payment_items/-",
        value: { ...payment, index: paymentId }
      }
    ]);

  return paymentId;
}

export async function removePaymentFromBill(elementId: string, index: number) {
  await database
    .container(CONTAINER_ENTRIES)
    .item(elementId, elementId)
    .patch([
      { op: "incr", path: "/number_of_payments", value: -1 },
      { op: "remove", path: `/payment_items/${index}` }
    ]);
}

function randomString(length: number): string {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }

  return result;
}

function ensureYMD(input: string) {
  if (input.length === 10) {
    // "XXXX-XX-XX"
    return input;
  }

  const splitted = input.split("-");
  return `${splitted[0]}-${splitted[1].padStart(2, "0")}-${splitted[2].padStart(2, "0")}`;
}

function formatYMD() {
  const currentDate = new Date();
  const localYear = currentDate.getFullYear();
  const localMonth = currentDate.getMonth() + 1; // Note: months are 0-indexed
  const localDay = currentDate.getDate();

  return `${localYear}-${localMonth.toString().padStart(2, "0")}-${localDay.toString().padStart(2, "0")}`;
}

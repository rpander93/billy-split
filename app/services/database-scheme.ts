import type { Generated, Insertable, Selectable, Updateable } from "kysely";

// Database types for Kysely schema
export interface Database {
  scanned_bills: ScannedBillsTable;
  scanned_bill_line_items: ScannedBillLineItemsTable;
  submitted_bills: SubmittedBillsTable;
  submitted_bill_line_items: SubmittedBillLineItemsTable;
  payment_items: PaymentItemsTable;
  payment_item_line_items: PaymentItemLineItemsTable;
}

export interface ScannedBillsTable {
  id: Generated<number>;
  name: string | null;
  date: string | null;
  currency: string | null;
  share_code: string;
  file_name: string;
  created_on: number;
}

export interface ScannedBillLineItemsTable {
  id: Generated<number>;
  bill_id: Generated<number>;
  description: string;
  amount: number;
  total_price: number;
}

export interface SubmittedBillsTable {
  id: Generated<number>;
  name: string;
  date: string;
  currency: string;
  service_fee: number | null;
  payment_method: string;
  file_name: string;
  share_code: string;
  created_on: number;
  number_of_payments: number;
}

export interface SubmittedBillLineItemsTable {
  id: Generated<number>;
  bill_id: number;
  item_index: number;
  description: string;
  amount: number;
  unit_price: number;
}

export interface PaymentItemsTable {
  id: Generated<number>;
  bill_id: number;
  payment_index: string;
  creator: string;
  created_on: number;
}

export interface PaymentItemLineItemsTable {
  id: Generated<number>;
  payment_item_id: number;
  line_item_index: number;
  amount: number;
}

// Convenience types using Kysely helpers
export type ScannedBills = Selectable<ScannedBillsTable>;
export type ScannedBillsInsert = Insertable<ScannedBillsTable>;
export type ScannedBillsUpdate = Updateable<ScannedBillsTable>;

export type ScannedBillLineItems = Selectable<ScannedBillLineItemsTable>;
export type ScannedBillLineItemsInsert = Insertable<ScannedBillLineItemsTable>;
export type ScannedBillLineItemsUpdate = Updateable<ScannedBillLineItemsTable>;

export type SubmittedBills = Selectable<SubmittedBillsTable>;
export type SubmittedBillsInsert = Insertable<SubmittedBillsTable>;
export type SubmittedBillsUpdate = Updateable<SubmittedBillsTable>;

export type SubmittedBillLineItems = Selectable<SubmittedBillLineItemsTable>;
export type SubmittedBillLineItemsInsert = Insertable<SubmittedBillLineItemsTable>;
export type SubmittedBillLineItemsUpdate = Updateable<SubmittedBillLineItemsTable>;

export type PaymentItems = Selectable<PaymentItemsTable>;
export type PaymentItemsInsert = Insertable<PaymentItemsTable>;
export type PaymentItemsUpdate = Updateable<PaymentItemsTable>;

export type PaymentItemLineItems = Selectable<PaymentItemLineItemsTable>;
export type PaymentItemLineItemsInsert = Insertable<PaymentItemLineItemsTable>;
export type PaymentItemLineItemsUpdate = Updateable<PaymentItemLineItemsTable>;

export interface ScannedBill {
  name: string | null;
  date: string | null;
  currency: string | null;
  line_items: Array<{
    description: string;
    amount: number;
    total_price: number;
  }>;
}

export interface OnlineScannedBill extends ScannedBill {
  id: number;
  created_on: number;
  date: string;
  share_code: string;
  file_name: string;
}

export interface SubmittedBill {
  name: string;
  date: string;
  currency: string;
  service_fee: number | null;
  payment_method: string;
  line_items: Array<{
    is_deleted: boolean;
    amount: number;
    description: string;
    total_price: number;
  }>;
}

export interface OnlineSubmittedBill extends Omit<SubmittedBill, "line_items"> {
  id: number;
  file_name: string;
  created_on: number;
  share_code: string;
  number_of_payments: number;
  line_items: Array<{
    index: number;
    description: string;
    amount: number;
    unit_price: number;
  }>;
  payment_items: Array<{
    index: number | string;
    creator: string;
    created_on: number;
    line_items: Array<{
      line_item_index: number;
      amount: number;
    }>;
  }>;
}

export interface ServerSubmitResponse {
  share_code: string;
}

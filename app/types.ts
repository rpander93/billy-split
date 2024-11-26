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
  id: string;
  created_on: number;
  share_code: string;
  file_name: string;
}

export interface StateLineItem {
  description: string;
  amount: string;
  total_price: string;
}

export interface ServerSubmitResponse {
  share_code: string;
}

export interface OnlineBill {
  id: string;
  name: string;
  image: string;
  created_on: number;
  share_code: string;
  currency?: string;
  payment_method: string;
  number_of_payments: number;
  line_items: Array<{
    index: number;
    description: string;
    amount: number;
    unit_price: number;
    total_price: number;
    is_tip: boolean;
  }>;
  payment_items: Array<{
    creator: string;
    created_on: number;
    line_items: Array<{
      line_item_index: number;
      amount: number;
    }>;
  }>;
}

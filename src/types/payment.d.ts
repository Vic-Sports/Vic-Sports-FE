export interface IBookingData {
  courtIds: string[];
  courtNames: string;
  venue: string;
  date: string;
  timeSlots: {
    start: string;
    end: string;
    price: number;
  }[];
  courtQuantity: number;
  totalPrice: number;
  customerInfo?: {
    fullName: string;
    phone: string;
    email: string;
  };
  paymentMethod?: string;
  notes?: string;
}

export interface ICreateBookingRequest {
  courtIds: string[];
  venue: string;
  date: string;
  timeSlots: {
    start: string;
    end: string;
    price: number;
  }[];
  totalPrice: number;
  customerInfo: {
    fullName: string;
    phone: string;
    email: string;
  };
  paymentMethod: string;
  notes?: string;
}

export interface IBookingResponse {
  _id?: string;
  bookingId?: string;
  courtIds: string[];
  venue: string;
  date: string;
  timeSlots: {
    start: string;
    end: string;
    price: number;
  }[];
  totalPrice: number;
  customerInfo: {
    fullName: string;
    phone: string;
    email: string;
  };
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | "cancelled";
  paymentRef?: string;
  notes?: string;
  bookingRef: string;
  status: "confirmed" | "pending" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface IVNPayCreateRequest {
  amount: number;
  bookingId: string;
  returnUrl: string;
  locale?: "vn" | "en";
  orderInfo?: string;
}

export interface IVNPayCreateResponse {
  paymentUrl: string;
  paymentRef: string;
}

export interface IVNPayReturnParams {
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_BankTranNo?: string;
  vnp_CardType?: string;
  vnp_OrderInfo: string;
  vnp_PayDate: string;
  vnp_ResponseCode: string;
  vnp_TmnCode: string;
  vnp_TransactionNo: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
}

export interface IPaymentTransaction {
  _id: string;
  paymentRef: string;
  bookingId: string;
  amount: number;
  paymentMethod: "vnpay";
  status: "pending" | "success" | "failed";
  vnpayData?: IVNPayReturnParams;
  createdAt: string;
  updatedAt: string;
}

declare global {
  interface IBackendRes<T> {
    error?: string | string[];
    message: string;
    statusCode: number | string;
    data?: T;
    success?: boolean;
    booking?: IBookingResponse; // Add this field for booking responses
  }
}

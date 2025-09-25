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
  venueId: string;
  courtIds: string[];
  date: string;
  timeSlots: {
    startTime: string; // BE expect startTime, not start
    endTime: string; // BE expect endTime, not end
    price: number;
  }[];
  paymentMethod: "payos" | "momo" | "zalopay" | "banking";
  paymentInfo?: {
    returnUrl?: string;
    cancelUrl?: string;
  };
  customerInfo: {
    fullName: string;
    email: string;
    phoneNumber: string; // BE expect phoneNumber, not phone
  };
  notes?: string;
}

export interface IBookingResponse {
  _id?: string;
  bookingId?: string;
  bookingCode?: string;
  user?: string;
  venue?: {
    _id: string;
    name: string;
    address: string;
  };
  court?: {
    _id: string;
    name: string;
    type: string;
  };
  courtIds?: string[]; // For multiple courts
  date: string;
  timeSlots: {
    start: string;
    end: string;
    price: number;
  }[];
  courtQuantity?: number;
  totalPrice: number;
  customerInfo?: {
    fullName: string;
    phone: string;
    email: string;
    notes?: string;
  };
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | "cancelled";
  bookingRef?: string;
  notes?: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
  updatedAt?: string;
}

// New interface for multiple bookings response
export interface IMultipleBookingsResponse {
  bookings: IBookingResponse[];
  totalAmount: number;
  groupBookingCode: string;
  bookingCount: number;
}

// PayOS Payment interfaces
export interface IPayOSCreateRequest {
  amount: number;
  bookingId: string;
  description?: string; // Đổi từ orderInfo sang description theo PayOS docs
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
}

export interface IPayOSCreateResponse {
  paymentUrl: string;
  paymentRef: string;
  qrCode?: string;
}

export interface IPayOSReturnParams {
  code: string;
  id: string;
  cancel: boolean;
  status: string;
  orderCode: string;
}

// ZaloPay interfaces
export interface IZaloPayCreateRequest {
  amount: number;
  bookingId: string;
  description?: string;
  customerInfo?: {
    fullName: string;
    phone: string;
    email: string;
  };
}

export interface IZaloPayCreateResponse {
  return_code: number;
  return_message: string;
  sub_return_code: number;
  sub_return_message: string;
  zp_trans_token: string;
  order_url: string;
  order_token: string;
}

export interface IZaloPayCallbackData {
  data: string;
  mac: string;
  type: number;
}

export interface IZaloPayReturnParams {
  status: string;
  amount: string;
  appTransId: string;
  bankCode?: string;
  checksum: string;
}

export interface IPaymentTransaction {
  _id: string;
  paymentRef: string;
  bookingId: string;
  amount: number;
  paymentMethod: "payos" | "zalopay" | "momo" | "banking";
  status: "pending" | "success" | "failed";
  payosData?: IPayOSReturnParams;
  zalopayData?: {
    app_trans_id: string;
    zp_trans_token: string;
    order_token: string;
  };
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
    // For booking responses - can contain either single or multiple bookings
    booking?: IBookingResponse; // Single booking response
    bookings?: IBookingResponse[]; // Multiple bookings response
    totalAmount?: number; // Total for multiple bookings
    groupBookingCode?: string; // Group code for multiple bookings
    bookingCount?: number; // Count of bookings created
  }
}

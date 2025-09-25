// FE chỉ gửi dữ liệu lên BE, không tạo chữ ký, không gọi trực tiếp PayOS API

// PayOS FE config: chỉ cần returnUrl/cancelUrl để gửi lên BE
export const PAYOS_FE_CONFIG = {
  returnUrl: `${window.location.origin}/booking/payos-return`,
  cancelUrl: `${window.location.origin}/booking/payos-return`,
};

// PayOS interfaces theo docs
export interface IPayOSCreateRequest {
  amount: number;
  bookingId: string;
  description?: string;
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

// PayOS Item interface (required theo docs)
interface IPayOSItem {
  name: string;
  quantity: number;
  price: number;
  unit?: string;
  taxPercentage?: number;
}

// Generate PayOS payment URL theo docs chính thức
// FE chỉ gửi dữ liệu booking/payment lên BE, nhận về paymentUrl, qrCode...
export const createPayOSPayment = async (
  paymentData: IPayOSCreateRequest
): Promise<IPayOSCreateResponse> => {
  // Validate required parameters
  if (!paymentData.amount || paymentData.amount <= 0) {
    throw new Error("PayOS: Invalid amount");
  }
  if (!paymentData.bookingId) {
    throw new Error("PayOS: Missing booking ID");
  }

  // Gửi request lên BE
  const response = await fetch("/api/v1/payments/payos/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...paymentData,
      returnUrl: PAYOS_FE_CONFIG.returnUrl,
      cancelUrl: PAYOS_FE_CONFIG.cancelUrl,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "PayOS BE error");
  }
  const responseData = await response.json();
  return responseData;
};

// Verify PayOS webhook/return theo docs
export const verifyPayOSReturn = (params: IPayOSReturnParams): boolean => {
  try {
    console.log("🔍 PayOS - Verifying return params:", params);

    // PayOS verification logic theo docs
    // Success: code = "00" và status = "PAID" (không bị cancel)
    if (params.code === "00" && params.status === "PAID" && !params.cancel) {
      console.log("✅ PayOS payment verified successfully");
      return true;
    } else {
      console.log("❌ PayOS payment verification failed:", {
        code: params.code,
        status: params.status,
        cancel: params.cancel,
      });
      return false;
    }
  } catch (error) {
    console.error("PayOS verification error:", error);
    return false;
  }
};

// Get PayOS error message by code theo docs
export const getPayOSErrorMessage = (code: string): string => {
  const errorMessages: { [key: string]: string } = {
    "00": "Giao dịch thành công",
    "01": "Giao dịch thất bại",
    "02": "Giao dịch bị hủy",
    "03": "Giao dịch bị từ chối",
    "04": "Giao dịch hết hạn",
    "05": "Số dư không đủ",
    "06": "Thông tin không hợp lệ",
    "07": "Hệ thống bảo trì",
    "99": "Lỗi khác",
  };

  return errorMessages[code] || `Lỗi không xác định (Mã: ${code})`;
};

// FE gọi BE để lấy thông tin thanh toán PayOS
export const getPayOSPaymentInfo = async (orderCode: string) => {
  const response = await fetch(`/api/v1/payments/payos/info/${orderCode}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "PayOS BE error");
  }
  return await response.json();
};

// FE gọi BE để hủy thanh toán PayOS
export const cancelPayOSPayment = async (
  orderCode: string,
  reason?: string
) => {
  const response = await fetch(`/api/v1/payments/payos/cancel/${orderCode}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reason }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "PayOS BE error");
  }
  return await response.json();
};

// Test PayOS payment creation (FE gọi BE, dùng data thật)
export const testPayOSPayment = (data: IPayOSCreateRequest) => {
  return createPayOSPayment(data);
};

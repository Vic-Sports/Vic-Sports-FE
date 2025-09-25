import createInstanceAxios from "services/axios.customize";

const axios = createInstanceAxios(import.meta.env.VITE_BACKEND_URL);

const axiosPayment = createInstanceAxios(
  import.meta.env.VITE_BACKEND_PAYMENT_URL
);

// =================== VNPay Payment APIs ===================
export const getVNPayUrlAPI = (
  amount: number,
  locale: string,
  paymentRef: string
) => {
  const urlBackend = "/vnpay/payment-url";
  return axiosPayment.post<IBackendRes<{ url: string }>>(urlBackend, {
    amount,
    locale,
    paymentRef,
  });
};

export const createVNPayPaymentSandboxAPI = (
  amount: number,
  bookingId: string,
  returnUrl: string,
  locale: string = "vn",
  orderInfo?: string
) => {
  const urlBackend = "/api/v1/payment/vnpay/create-url";
  return axios.post<IBackendRes<{ paymentUrl: string; paymentRef: string }>>(
    urlBackend,
    {
      amount,
      bookingId,
      returnUrl,
      locale,
      orderInfo: orderInfo || `Thanh toán đặt sân - Booking ID: ${bookingId}`,
    }
  );
};

export const verifyVNPayPaymentSandboxAPI = (vnpayParams: any) => {
  const urlBackend = "/api/v1/payment/vnpay/verify";
  return axios.post<IBackendRes<{ isValid: boolean; message: string }>>(
    urlBackend,
    vnpayParams
  );
};

export const testVNPaySandboxAPI = (amount: number) => {
  const urlBackend = "/api/v1/payment/test-vnpay";
  return axios.post<IBackendRes<{ paymentUrl: string; paymentRef: string }>>(
    urlBackend,
    { amount }
  );
};

export const updatePaymentOrderAPI = (
  paymentStatus: string,
  paymentRef: string
) => {
  const urlBackend = "/api/v1/order/update-payment-status";
  return axios.post<IBackendRes<any>>(urlBackend, {
    paymentStatus,
    paymentRef,
  });
};

export const loginAPI = (email: string, password: string) => {
  const urlBackend = "/api/v1/auth/login";
  return axios.post<IBackendRes<ILogin>>(urlBackend, { email, password });
};

export const registerAPI = (
  fullName: string,
  email: string,
  password: string,
  phone: string
) => {
  const urlBackend = "/api/v1/auth/register";
  return axios.post<IBackendRes<IRegister>>(urlBackend, {
    fullName,
    email,
    password,
    phone,
  });
};

export const fetchAccountAPI = () => {
  const urlBackend = "/api/v1/auth/account";
  return axios.get<IBackendRes<IFetchAccount>>(urlBackend);
};

export const logoutAPI = () => {
  const urlBackend = "/api/v1/auth/logout";
  return axios.post<IBackendRes<IRegister>>(urlBackend);
};

export const verifyEmailAPI = (token: string) => {
  const urlBackend = `/api/v1/auth/verify-email?token=${token}`;
  return axios.get<IBackendRes<IVerifyEmail>>(urlBackend);
};

export const resendVerificationAPI = (email: string) => {
  const urlBackend = "/api/v1/auth/resend-verification";
  return axios.post<IBackendRes<any>>(urlBackend, { email });
};

export const forgotPasswordAPI = (email: string) => {
  const urlBackend = "/api/v1/auth/forgot-password";
  return axios.post<IBackendRes<any>>(urlBackend, { email });
};

export const resetPasswordAPI = (token: string, newPassword: string) => {
  const urlBackend = "/api/v1/auth/reset-password";
  return axios.post<IBackendRes<any>>(urlBackend, { token, newPassword });
};

export const getUsersAPI = (query: string) => {
  const urlBackend = `/api/v1/user?${query}`;
  return axios.get<IBackendRes<IModelPaginate<IUserTable>>>(urlBackend);
};

export const createUserAPI = (
  fullName: string,
  email: string,
  password: string,
  phone: string
) => {
  const urlBackend = "/api/v1/user";
  return axios.post<IBackendRes<IRegister>>(urlBackend, {
    fullName,
    email,
    password,
    phone,
  });
};

export const bulkCreateUserAPI = (
  hoidanit: {
    fullName: string;
    password: string;
    email: string;
    phone: string;
  }[]
) => {
  const urlBackend = "/api/v1/user/bulk-create";
  return axios.post<IBackendRes<IResponseImport>>(urlBackend, hoidanit);
};

export const updateUserAPI = (_id: string, fullName: string, phone: string) => {
  const urlBackend = "/api/v1/user";
  return axios.put<IBackendRes<IRegister>>(urlBackend, {
    _id,
    fullName,
    phone,
  });
};

export const deleteUserAPI = (_id: string) => {
  const urlBackend = `/api/v1/user/${_id}`;
  return axios.delete<IBackendRes<IRegister>>(urlBackend);
};

export const getBooksAPI = (query: string) => {
  const urlBackend = `/api/v1/book?${query}`;
  return axios.get<IBackendRes<IModelPaginate<IBookTable>>>(urlBackend);
};

export const getCategoryAPI = () => {
  const urlBackend = `/api/v1/database/category`;
  return axios.get<IBackendRes<string[]>>(urlBackend);
};

export const uploadFileAPI = (fileImg: any, folder: string) => {
  const bodyFormData = new FormData();
  bodyFormData.append("fileImg", fileImg);
  return axios<
    IBackendRes<{
      fileUploaded: string;
    }>
  >({
    method: "post",
    url: "/api/v1/file/upload",
    data: bodyFormData,
    headers: {
      "Content-Type": "multipart/form-data",
      "upload-type": folder,
    },
  });
};

export const createBookAPI = (
  mainText: string,
  author: string,
  price: number,
  quantity: number,
  category: string,
  thumbnail: string,
  slider: string[]
) => {
  const urlBackend = "/api/v1/book";
  return axios.post<IBackendRes<IRegister>>(urlBackend, {
    mainText,
    author,
    price,
    quantity,
    category,
    thumbnail,
    slider,
  });
};

export const updateBookAPI = (
  _id: string,
  mainText: string,
  author: string,
  price: number,
  quantity: number,
  category: string,
  thumbnail: string,
  slider: string[]
) => {
  const urlBackend = `/api/v1/book/${_id}`;
  return axios.put<IBackendRes<IRegister>>(urlBackend, {
    mainText,
    author,
    price,
    quantity,
    category,
    thumbnail,
    slider,
  });
};

export const deleteBookAPI = (_id: string) => {
  const urlBackend = `/api/v1/book/${_id}`;
  return axios.delete<IBackendRes<IRegister>>(urlBackend);
};

export const getBookByIdAPI = (id: string) => {
  const urlBackend = `/api/v1/book/${id}`;
  return axios.get<IBackendRes<IBookTable>>(urlBackend);
};

export const createOrderAPI = (
  name: string,
  address: string,
  phone: string,
  totalPrice: number,
  type: string,
  detail: any,
  paymentRef?: string
) => {
  const urlBackend = "/api/v1/order";
  return axios.post<IBackendRes<IRegister>>(urlBackend, {
    name,
    address,
    phone,
    totalPrice,
    type,
    detail,
    paymentRef,
  });
};

export const getHistoryAPI = () => {
  const urlBackend = `/api/v1/history`;
  return axios.get<IBackendRes<IHistory[]>>(urlBackend);
};

export const updateUserInfoAPI = (
  _id: string,
  avatar: string,
  userData: {
    fullName: string;
    phone: string;
    dateOfBirth?: string;
    gender?: string;
    address?: {
      province: string;
      district: string;
      ward: string;
      street: string;
    };
  }
) => {
  const urlBackend = "/api/v1/user";
  return axios.put<IBackendRes<IRegister>>(urlBackend, {
    ...userData,
    avatar,
    _id,
  });
};

export const updateUserPasswordAPI = (
  email: string,
  oldpass: string,
  newpass: string
) => {
  const urlBackend = "/api/v1/user/change-password";
  return axios.post<IBackendRes<IRegister>>(urlBackend, {
    email,
    oldpass,
    newpass,
  });
};

export const updateUserPreferencesAPI = (
  _id: string,
  preferences: {
    favoriteSports?: string[];
    preferredDays?: string[];
    preferredTimeRange?: {
      from: string;
      to: string;
    };
    bio?: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
    notificationSettings?: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  }
) => {
  const urlBackend = "/api/v1/user/preferences";
  return axios.put<IBackendRes<IRegister>>(urlBackend, {
    _id,
    ...preferences,
  });
};

export const getOrdersAPI = (query: string) => {
  const urlBackend = `/api/v1/order?${query}`;
  return axios.get<IBackendRes<IModelPaginate<IOrderTable>>>(urlBackend);
};

export const getDashboardAPI = () => {
  const urlBackend = `/api/v1/database/dashboard`;
  return axios.get<
    IBackendRes<{
      countOrder: number;
      countUser: number;
      countBook: number;
    }>
  >(urlBackend);
};

export const loginWithGoogleAPI = (type: string, email: string) => {
  const urlBackend = "/api/v1/auth/social-login";
  return axios.post<IBackendRes<ILogin>>(urlBackend, { type, email });
};

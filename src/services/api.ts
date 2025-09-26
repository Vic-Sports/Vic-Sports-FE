import createInstanceAxios from "services/axios.customize";

const axios = createInstanceAxios(import.meta.env.VITE_BACKEND_URL);

// =================== PAYMENT APIs ===================
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
  phone: string,
  role: string
) => {
  const urlBackend = "/api/v1/auth/register";
  return axios.post<IBackendRes<IRegister>>(urlBackend, {
    fullName,
    email,
    password,
    phone,
    role,
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

// Đổi mật khẩu (PUT /api/v1/auth/change-password)
export const changePasswordAPI = (
  currentPassword: string,
  newPassword: string,
  token: string
) => {
  const urlBackend = "/api/v1/auth/change-password";
  return axios.put<IBackendRes<any>>(
    urlBackend,
    { currentPassword, newPassword },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
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

// ...existing code...

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
  const urlBackend = "/api/v1/users/profile";
  return axios.put<IBackendRes<IRegister>>(urlBackend, {
    ...userData,
    avatar,
    _id,
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

export const loginWithGoogleAPI = (
  type: string,
  payload: { email: string; name: string; picture: string }
) => {
  const urlBackend = "/api/v1/auth/social-login";
  return axios.post<IBackendRes<ILogin>>(urlBackend, { type, ...payload });
};

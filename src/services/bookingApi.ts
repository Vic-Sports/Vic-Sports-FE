import createInstanceAxios from "./axios.customize";
import type {
  ICreateBookingRequest,
  IBookingResponse,
  IPaymentTransaction,
} from "@/types/payment";

const axios = createInstanceAxios(import.meta.env.VITE_BACKEND_URL);

// =================== BOOKING APIS ===================
export const createBookingAPI = (bookingData: ICreateBookingRequest) => {
  const urlBackend = "/api/v1/bookings";
  return axios.post<IBackendRes<IBookingResponse>>(urlBackend, bookingData);
};

// Create a short-term hold for given booking data (backend should set holdUntil)
export const holdBookingAPI = (holdData: {
  venueId: string;
  courtIds: string[];
  date: string;
  timeSlots: { startTime: string; endTime: string; price: number }[];
}) => {
  const urlBackend = "/api/v1/bookings/hold"; // backend should implement this route
  return axios.post<IBackendRes<{ bookingId?: string }>>(urlBackend, holdData);
};

// Release a held booking
export const releaseBookingAPI = (bookingId: string) => {
  const urlBackend = `/api/v1/bookings/${bookingId}/release`;
  return axios.post<IBackendRes<any>>(urlBackend);
};

export const getBookingByIdAPI = (bookingId: string) => {
  const urlBackend = `/api/v1/bookings/${bookingId}`;
  return axios.get<IBackendRes<IBookingResponse>>(urlBackend);
};

// Nếu user thường, không truyền userId, sẽ gọi /me
export const getUserBookingsAPI = (userId?: string) => {
  const urlBackend = userId
    ? `/api/v1/bookings/user/${userId}` // admin
    : "/api/v1/bookings/user/me"; // user thường
  return axios.get<IBackendRes<IBookingResponse[]>>(urlBackend);
};

export const updateBookingStatusAPI = (bookingId: string, status: string) => {
  const urlBackend = `/api/v1/bookings/${bookingId}/status`;
  return axios.put<IBackendRes<IBookingResponse>>(urlBackend, { status });
};

// =================== PAYMENT APIS ===================
export const getPaymentTransactionAPI = (paymentRef: string) => {
  const urlBackend = `/api/v1/payment/${paymentRef}`;
  return axios.get<IBackendRes<IPaymentTransaction>>(urlBackend);
};

// =================== VENUE & COURT APIS ===================
export const getVenuesAPI = () => {
  const urlBackend = "/api/v1/venues";
  return axios.get<IBackendRes<any[]>>(urlBackend);
};

export const getVenueByIdAPI = (venueId: string) => {
  const urlBackend = `/api/v1/venues/${venueId}`;
  return axios.get<IBackendRes<any>>(urlBackend);
};

export const getCourtsByVenueAPI = (venueId: string, sportType?: string) => {
  const urlBackend = `/api/v1/venues/${venueId}/courts${
    sportType ? `?sportType=${sportType}` : ""
  }`;
  return axios.get<IBackendRes<{ courts: any[] }>>(urlBackend);
};

export const getCourtsAPI = () => {
  const urlBackend = "/api/v1/courts";
  return axios.get<IBackendRes<any[]>>(urlBackend);
};

export const getCourtsBySportAPI = (sportType: string) => {
  const urlBackend = `/api/v1/courts/sport/${sportType}`;
  return axios.get<IBackendRes<any[]>>(urlBackend);
};

export const getCourtAvailabilityAPI = (courtId: string, date: string) => {
  const urlBackend = `/api/v1/courts/${courtId}/availability?date=${date}`;
  return axios.get<
    IBackendRes<{
      courtId: string;
      date: string;
      timeSlots: {
        start: string;
        end: string;
        isAvailable: boolean;
      }[];
    }>
  >(urlBackend);
};

import type {
  ICourt,
  ICourtFilterParams,
  ICourtSearchResponse,
  ICourtAvailability,
} from "@/types/court";
import createInstanceAxios from "@/services/axios.customize";

// Create axios instance for backend API
const axios = createInstanceAxios(
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"
);

// 🚀 Real API calls - Backend is ready!

/**
 * Get all courts with filters
 */
export const getAllCourtsAPI = (params?: ICourtFilterParams) => {
  const urlBackend = "/api/v1/courts";
  return axios.get<IBackendRes<ICourtSearchResponse>>(urlBackend, { params });
};

/**
 * Get court by ID
 */
export const getCourtByIdAPI = (courtId: string) => {
  const urlBackend = `/api/v1/courts/${courtId}`;
  return axios.get<IBackendRes<ICourt>>(urlBackend);
};

/**
 * 🆕 Check court availability for specific date
 */
export const getCourtAvailabilityAPI = (courtId: string, date: string) => {
  const urlBackend = `/api/v1/courts/${courtId}/availability`;
  return axios.get<IBackendRes<ICourtAvailability>>(urlBackend, {
    params: { date },
  });
};

/**
 * Get court pricing for specific date and time slot
 */
export const getCourtPricingAPI = (
  courtId: string,
  date: string,
  timeSlot: string
) => {
  const urlBackend = `/api/v1/courts/${courtId}/pricing`;
  return axios.get<IBackendRes<{ price: number }>>(urlBackend, {
    params: { date, timeSlot },
  });
};

/**
 * Get courts by venue ID
 */
export const getCourtsByVenueAPI = (
  venueId: string,
  params?: ICourtFilterParams
) => {
  const urlBackend = `/api/v1/courts/venue/${venueId}`;
  return axios.get<IBackendRes<ICourtSearchResponse>>(urlBackend, { params });
};

/**
 * Get courts by sport type
 */
export const getCourtsBySportAPI = (sportType: string, params?: any) => {
  const urlBackend = `/api/v1/courts/sport/${encodeURIComponent(sportType)}`;
  return axios.get<IBackendRes<ICourtSearchResponse>>(urlBackend, { params });
};

/**
 * Get available sports
 */
export const getAvailableSportsAPI = () => {
  const urlBackend = "/api/v1/courts/sports";
  return axios.get<IBackendRes<string[]>>(urlBackend);
};

// 🔒 Owner/Admin only APIs (require authentication)

/**
 * Create court (Owner only)
 */
export const createCourtAPI = (
  courtData: Omit<ICourt, "_id" | "createdAt" | "updatedAt">
) => {
  const urlBackend = "/api/v1/courts";
  return axios.post<IBackendRes<ICourt>>(urlBackend, courtData);
};

/**
 * Update court (Owner only)
 */
export const updateCourtAPI = (courtId: string, courtData: Partial<ICourt>) => {
  const urlBackend = `/api/v1/courts/${courtId}`;
  return axios.put<IBackendRes<ICourt>>(urlBackend, courtData);
};

/**
 * Delete court (Owner only)
 */
export const deleteCourtAPI = (courtId: string) => {
  const urlBackend = `/api/v1/courts/${courtId}`;
  return axios.delete<IBackendRes<{ message: string }>>(urlBackend);
};

/**
 * Upload court images (Owner only)
 */
export const uploadCourtImagesAPI = (courtId: string, images: FormData) => {
  const urlBackend = `/api/v1/courts/${courtId}/images`;
  return axios.post<IBackendRes<{ images: string[] }>>(urlBackend, images, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/**
 * Get court stats (Owner only)
 */
export const getCourtStatsAPI = (courtId: string) => {
  const urlBackend = `/api/v1/courts/${courtId}/stats`;
  return axios.get<
    IBackendRes<{
      totalBookings: number;
      totalRevenue: number;
      averageRating: number;
      bookingsThisMonth: number;
      revenueThisMonth: number;
    }>
  >(urlBackend);
};

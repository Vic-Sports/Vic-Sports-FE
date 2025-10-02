import type {
  IVenue,
  IVenueFilterParams,
  IVenueSearchResponse,
  ICourtFilters,
  ICourtsData
} from "@/types/venue";
import createInstanceAxios from "@/services/axios.customize";

// Create axios instance for backend API
const axios = createInstanceAxios(
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"
);

// Venue APIs
export const searchVenuesAPI = (params: IVenueFilterParams) => {
  const urlBackend = "/api/v1/venues/search";
  return axios.post<IBackendRes<IVenueSearchResponse>>(urlBackend, params);
};

export const getVenueByIdAPI = (venueId: string) => {
  const urlBackend = `/api/v1/venues/${venueId}`;
  return axios.get<IBackendRes<IVenue>>(urlBackend);
};

export const getAllVenuesAPI = (params?: any) => {
  const urlBackend = "/api/v1/venues";
  return axios.get<IBackendRes<IVenueSearchResponse>>(urlBackend, { params });
};

export const getVenuesByLocationAPI = (
  lat: number,
  lng: number,
  radius?: number,
  sportType?: string
) => {
  const urlBackend = `/api/v1/venues/search/location`;
  const params = { lat, lng, radius, sportType };
  return axios.get<IBackendRes<IVenue[]>>(urlBackend, { params });
};

// 🆕 NEW: Get Venue Courts API (Main Feature!)
export const getVenueCourtsAPI = (venueId: string, filters?: ICourtFilters) => {
  const urlBackend = `/api/v1/venues/${venueId}/courts`;
  return axios.get<IBackendRes<ICourtsData>>(urlBackend, { params: filters });
};

// Location APIs
export const getAvailableCitiesAPI = () => {
  const urlBackend = "/api/v1/venues/cities";
  return axios.get<IBackendRes<string[]>>(urlBackend);
};

export const getDistrictsByCityAPI = (city: string) => {
  const urlBackend = `/api/v1/venues/districts/${encodeURIComponent(city)}`;
  return axios.get<IBackendRes<string[]>>(urlBackend);
};

// Admin Venue APIs
export const getPendingVenuesAdminAPI = (query: string) => {
  const urlBackend = `/api/v1/admin/venues/pending?${query}`;
  return axios.get<IBackendRes<IModelPaginate<any>>>(urlBackend);
};

export const approveVenueAdminAPI = (venueId: string) => {
  const urlBackend = `/api/v1/admin/venues/${venueId}/approve`;
  return axios.put<IBackendRes<any>>(urlBackend, {});
};

export const rejectVenueAdminAPI = (venueId: string) => {
  const urlBackend = `/api/v1/admin/venues/${venueId}/reject`;
  return axios.put<IBackendRes<any>>(urlBackend, {});
};

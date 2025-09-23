import type {
  IVenue,
  IVenueFilterParams,
  IVenueSearchResponse,
} from "@/types/venue";
import createInstanceAxios from "@/services/axios.customize";

// Create axios instance for backend API
const axios = createInstanceAxios(
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"
);

// Real API calls - Backend is ready!
export const searchVenuesAPI = (params: IVenueFilterParams) => {
  const urlBackend = "/api/v1/venues/search";
  return axios.post<IBackendRes<IVenueSearchResponse>>(urlBackend, params);
};

export const getVenueByIdAPI = (venueId: string) => {
  const urlBackend = `/api/v1/venues/${venueId}`;
  return axios.get<IBackendRes<IVenue>>(urlBackend);
};

export const getAllVenuesAPI = () => {
  const urlBackend = "/api/v1/venues";
  return axios.get<IBackendRes<IVenue[]>>(urlBackend);
};

export const getVenuesByLocationAPI = (location: string) => {
  const urlBackend = `/api/v1/venues/location?location=${encodeURIComponent(
    location
  )}`;
  return axios.get<IBackendRes<IVenue[]>>(urlBackend);
};

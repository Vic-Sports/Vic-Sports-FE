import createInstanceAxios from "./axios.customize";
import {
  uploadMultipleVenueImages,
  uploadMultipleCourtImages,
} from "./uploadHelpers";

// Base path for owner APIs
const OWNER_API_BASE = "/api/v1/owner";

// Types
export interface DashboardStats {
  totalVenues: number;
  totalCourts: number;
  totalBookings: number;
  totalRevenue: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
}

export interface RevenueChartData {
  _id: { month: number; year: number };
  revenue: number;
}

export interface BookingStatsData {
  _id: { status: string; sportType: string };
  count: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
// Create axios instance for backend API
const axios = createInstanceAxios(
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"
);
// Dashboard APIs
export const ownerDashboardApi = {
  // Get dashboard stats
  getStats: (): Promise<ApiResponse<DashboardStats>> => {
    return axios.get(`${OWNER_API_BASE}/dashboard/stats`);
  },

  // Get revenue chart data
  getRevenueChart: (): Promise<ApiResponse<RevenueChartData[]>> => {
    return axios.get(`${OWNER_API_BASE}/dashboard/revenue-chart`);
  },

  // Get booking stats
  getBookingStats: (): Promise<ApiResponse<BookingStatsData[]>> => {
    return axios.get(`${OWNER_API_BASE}/dashboard/booking-stats`);
  },

  // Get recent activities
  getRecentActivities: (): Promise<ApiResponse<any[]>> => {
    return axios.get(`${OWNER_API_BASE}/dashboard/recent-activities`);
  },
};

// Venue APIs
export const ownerVenueApi = {
  // Get venues with filtering
  getVenues: (params?: {
    search?: string;
    isActive?: boolean;
    isVerified?: boolean;
    city?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ venues: any[] }>> => {
    return axios.get(`${OWNER_API_BASE}/venues`, { params });
  },

  // Get venue by ID
  getVenue: (venueId: string): Promise<ApiResponse<any>> => {
    return axios.get(`${OWNER_API_BASE}/venues/${venueId}`);
  },

  // Create new venue
  createVenue: (data: {
    name: string;
    description?: string;
    address: {
      street: string;
      district: string;
      city: string;
    };
    contactInfo: {
      phone: string;
      email: string;
    };
    isActive?: boolean;
  }): Promise<ApiResponse<any>> => {
    return axios.post(`${OWNER_API_BASE}/venues`, data);
  },

  // Update venue
  updateVenue: (venueId: string, data: any): Promise<ApiResponse<any>> => {
    return axios.put(`${OWNER_API_BASE}/venues/${venueId}`, data);
  },

  // Delete venue
  deleteVenue: (venueId: string): Promise<ApiResponse<any>> => {
    return axios.delete(`${OWNER_API_BASE}/venues/${venueId}`);
  },

  // Upload venue images - NEW METHOD using unified API
  uploadVenueImages: async (
    venueId: string,
    files: File[]
  ): Promise<ApiResponse<string[]>> => {
    const uploadResults = await uploadMultipleVenueImages(files, venueId);
    const imageUrls = uploadResults
      .filter((res) => res && res.data)
      .map((res) => res.data!.fileUploaded);
    return {
      success: true,
      data: imageUrls,
    };
  },

  // Upload venue images - LEGACY METHOD (for backward compatibility)
  uploadImages: (venueId: string, files: File[]): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    return axios.post(
      `${OWNER_API_BASE}/venues/${venueId}/upload-images`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
  },
};

// Court APIs
export const ownerCourtApi = {
  // Get courts with filtering
  getCourts: (params?: {
    search?: string;
    sportType?: string;
    status?: "active" | "inactive" | "maintenance";
    venueId?: string;
    courtType?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ courts: any[] }>> => {
    return axios.get(`${OWNER_API_BASE}/courts`, { params });
  },

  // Get court by ID
  getCourt: (courtId: string): Promise<ApiResponse<any>> => {
    return axios.get(`${OWNER_API_BASE}/courts/${courtId}`);
  },

  // Create new court
  createCourt: (data: {
    name: string;
    venueId: string;
    sportType: string;
    courtType: string;
    capacity: number;
    surface: string;
    basePrice?: number;
    dimensions?: {
      length: number;
      width: number;
      unit: string;
    };
    isActive?: boolean;
    equipment?: string[];
    description?: string;
  }): Promise<ApiResponse<any>> => {
    return axios.post(`${OWNER_API_BASE}/courts`, data);
  },

  // Update court
  updateCourt: (
    courtId: string,
    data: {
      name?: string;
      venueId?: string;
      sportType?: string;
      courtType?: string;
      capacity?: number;
      surface?: string;
      basePrice?: number;
      dimensions?: {
        length: number;
        width: number;
        unit: string;
      };
      isActive?: boolean;
      equipment?: string[];
      description?: string;
    }
  ): Promise<ApiResponse<any>> => {
    return axios.put(`${OWNER_API_BASE}/courts/${courtId}`, data);
  },

  // Delete court
  deleteCourt: (courtId: string): Promise<ApiResponse<any>> => {
    return axios.delete(`${OWNER_API_BASE}/courts/${courtId}`);
  },

  // Upload court images - NEW METHOD using unified API
  uploadCourtImages: async (
    venueId: string,
    courtId: string,
    files: File[]
  ): Promise<ApiResponse<string[]>> => {
    const uploadResults = await uploadMultipleCourtImages(
      files,
      venueId,
      courtId
    );
    const imageUrls = uploadResults
      .filter((res) => res && res.data)
      .map((res) => res.data!.fileUploaded);
    return {
      success: true,
      data: imageUrls,
    };
  },

  // Upload court images - LEGACY METHOD (for backward compatibility)
  uploadImages: (courtId: string, files: File[]): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    return axios.post(
      `${OWNER_API_BASE}/courts/${courtId}/upload-images`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
  },
};

// Booking APIs
export const ownerBookingApi = {
  // Get bookings with filtering
  getBookings: (params?: {
    search?: string;
    status?: "pending" | "confirmed" | "cancelled" | "completed" | "no-show";
    date?: string;
    dateFrom?: string;
    dateTo?: string;
    courtId?: string;
    venueId?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ bookings: any[] }>> => {
    return axios.get(`${OWNER_API_BASE}/bookings`, { params });
  },

  // Get booking by ID
  getBooking: (bookingId: string): Promise<ApiResponse<any>> => {
    return axios.get(`${OWNER_API_BASE}/bookings/${bookingId}`);
  },

  // Approve booking
  approveBooking: (bookingId: string): Promise<ApiResponse<any>> => {
    return axios.put(`${OWNER_API_BASE}/bookings/${bookingId}/approve`);
  },

  // Reject booking
  rejectBooking: (
    bookingId: string,
    reason?: string
  ): Promise<ApiResponse<any>> => {
    return axios.put(`${OWNER_API_BASE}/bookings/${bookingId}/reject`, {
      reason,
    });
  },

  // Check-in customer
  checkInBooking: (bookingId: string): Promise<ApiResponse<any>> => {
    return axios.put(`${OWNER_API_BASE}/bookings/${bookingId}/checkin`);
  },
};

// Analytics APIs
export const ownerAnalyticsApi = {
  // Get revenue analytics
  getRevenueAnalytics: (params?: {
    period?: "day" | "week" | "month" | "quarter" | "year";
    venueId?: string;
  }): Promise<ApiResponse<any>> => {
    return axios.get(`${OWNER_API_BASE}/analytics/revenue`, { params });
  },

  // Get booking insights
  getBookingInsights: (): Promise<ApiResponse<any>> => {
    return axios.get(`${OWNER_API_BASE}/analytics/booking-insights`);
  },

  // Get popular courts
  getPopularCourts: (): Promise<ApiResponse<any>> => {
    return axios.get(`${OWNER_API_BASE}/analytics/popular-courts`);
  },

  // Get customer behavior
  getCustomerBehavior: (): Promise<ApiResponse<any>> => {
    return axios.get(`${OWNER_API_BASE}/analytics/customer-behavior`);
  },
};

// Utility function to handle API errors
export const handleApiError = (error: any) => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  return {
    code: "NETWORK_ERROR",
    message: "Something went wrong. Please try again.",
    details: {},
  };
};

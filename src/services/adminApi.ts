/**
 * Admin API Service for Vic-Sports
 * Handles all admin-related API calls
 */

import createInstanceAxios from "./axios.customize";

const axios = createInstanceAxios(import.meta.env.VITE_BACKEND_URL);

// ==================== DASHBOARD & STATISTICS ====================

export const getAdminStats = async () => {
  const response = await axios.get("/api/v1/admin/stats");
  return response;
};

export const getDashboardAnalytics = async () => {
  const response = await axios.get("/api/v1/admin/analytics");
  return response;
};

// ==================== USER MANAGEMENT ====================

export const getAllUsers = async (params?: {
  current?: number;
  pageSize?: number;
  email?: string;
  fullName?: string;
  role?: string;
  status?: string;
  sort?: string;
}) => {
  const response = await axios.get("/api/v1/admin/users", { params });
  return response;
};

export const getUserDetails = async (userId: string) => {
  const response = await axios.get(`/api/v1/admin/users/${userId}`);
  return response;
};

export const updateUserByAdmin = async (userId: string, data: any) => {
  const response = await axios.put(`/api/v1/admin/users/${userId}`, data);
  return response;
};

export const banUser = async (userId: string, banReason?: string) => {
  const response = await axios.put(`/api/v1/admin/users/${userId}/ban`, { banReason });
  return response;
};

export const unbanUser = async (userId: string) => {
  const response = await axios.put(`/api/v1/admin/users/${userId}/unban`);
  return response;
};

// ==================== VENUE MANAGEMENT ====================

export const getAllVenues = async (params?: {
  page?: number;
  limit?: number;
  name?: string;
  isVerified?: boolean | string;
  isActive?: boolean | string;
  moderationStatus?: string;
  sort?: string;
}) => {
  const response = await axios.get("/api/v1/admin/venues", { params });
  return response;
};

export const getPendingVenues = async (params?: {
  page?: number;
  limit?: number;
}) => {
  const response = await axios.get("/api/v1/admin/venues/pending", { params });
  return response;
};

export const approveVenue = async (
  venueId: string,
  verificationNotes?: string
) => {
  const response = await axios.put(`/api/v1/admin/venues/${venueId}/approve`, {
    verificationNotes
  });
  return response;
};

export const rejectVenue = async (
  venueId: string,
  verificationNotes?: string
) => {
  const response = await axios.put(`/api/v1/admin/venues/${venueId}/reject`, {
    verificationNotes
  });
  return response;
};

// ==================== BOOKING MANAGEMENT ====================

export const getAllBookings = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
}) => {
  const response = await axios.get("/api/v1/admin/bookings", { params });
  return response;
};

export const updateBookingStatus = async (
  bookingId: string,
  status: string,
  cancellationReason?: string
) => {
  const response = await axios.put(`/api/v1/admin/bookings/${bookingId}/status`, {
    status,
    cancellationReason
  });
  return response;
};

// ==================== REVIEW MANAGEMENT ====================

export const getAllReviews = async (params?: {
  page?: number;
  limit?: number;
  isApproved?: boolean | string;
}) => {
  const response = await axios.get("/api/v1/admin/reviews", { params });
  return response;
};

export const getPendingReviews = async () => {
  const response = await axios.get("/api/v1/admin/reviews/pending");
  return response;
};

export const approveReview = async (reviewId: string) => {
  const response = await axios.put(`/api/v1/admin/reviews/${reviewId}/approve`);
  return response;
};

export const rejectReview = async (reviewId: string) => {
  const response = await axios.put(`/api/v1/admin/reviews/${reviewId}/reject`);
  return response;
};

export const deleteReview = async (reviewId: string) => {
  const response = await axios.delete(`/api/v1/admin/reviews/${reviewId}`);
  return response;
};

// ==================== COACH & OWNER VERIFICATION ====================

export const getPendingCoaches = async () => {
  const response = await axios.get("/api/v1/admin/coaches/pending");
  return response;
};

export const verifyCoach = async (coachId: string) => {
  const response = await axios.put(`/api/v1/admin/coaches/${coachId}/verify`);
  return response;
};

export const getPendingOwners = async () => {
  const response = await axios.get("/api/v1/admin/owners/pending");
  return response;
};

export const verifyOwner = async (ownerId: string) => {
  const response = await axios.put(`/api/v1/admin/owners/${ownerId}/verify`);
  return response;
};

// ==================== FINANCIAL REPORTS & ANALYTICS ====================

export const getRevenueData = async (
  period: "daily" | "weekly" | "monthly" = "monthly"
) => {
  const response = await axios.get("/api/v1/admin/revenue", { params: { period } });
  return response;
};

export const getUserGrowthData = async (
  period: "daily" | "weekly" | "monthly" = "monthly"
) => {
  const response = await axios.get("/api/v1/admin/user-growth", {
    params: { period }
  });
  return response;
};

export const getBookingTrends = async (
  period: "daily" | "weekly" | "monthly" = "monthly"
) => {
  const response = await axios.get("/api/v1/admin/booking-trends", {
    params: { period }
  });
  return response;
};

export const getTopVenues = async (limit: number = 5) => {
  const response = await axios.get("/api/v1/admin/top-venues", { params: { limit } });
  return response;
};

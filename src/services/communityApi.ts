import createInstanceAxios from "./axios.customize";

const instance = createInstanceAxios(
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"
);

export interface ICreatePostRequest {
  title: string;
  description: string;
  sport?: string; // Optional - backend may not require
  court: string; // Court ID (ObjectId)
  location?: string; // Optional - backend may not require
  date: string; // YYYY-MM-DD
  timeSlot: {
    start: string; // HH:mm
    end: string; // HH:mm
  };
  maxParticipants: number;
  currentParticipants?: number;
  images?: string[];
  media?: {
    videos?: string[];
  };
}

export interface IPost {
  _id: string;
  title: string;
  description: string;
  sport: string;
  court: string | { _id: string; name: string }; // Can be ObjectId or populated object
  location: string;
  date: string;
  timeSlot: {
    start: string;
    end: string;
  };
  maxParticipants: number;
  currentParticipants: number; // Manual count (including friends outside system)
  status: "open" | "closed" | "cancelled";
  participants: string[]; // Array of registered user IDs
  images?: string[];
  media?: {
    images?: string[];
    videos?: string[];
  };
  user: {
    _id?: string;
    fullName: string; // Updated from 'name' to 'fullName' to match actual data
    avatar?: string;
  };
  createdAt: string;
  updatedAt?: string;
  likes: number | string[] | any; // Can be number or array of user IDs
  comments: number;
  pendingRequests?: Array<{
    userId: string;
    status: "pending" | "accepted" | "rejected";
  }>;
}

export interface IGetPostsResponse {
  success: boolean;
  message?: string;
  data: IPost[];
}

export interface ICreatePostResponse {
  success: boolean;
  message?: string;
  data: IPost;
}

export interface ICommunityStats {
  totalPlayers: number;
  onlinePlayers: number;
  activeTournaments: number;
  totalMatches: number;
  totalPrizePool: number;
  tierDistribution: Array<{ _id: string; count: number }>;
}

export interface IBadge {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  requirements: {
    type: string;
    value: number;
  };
}

// ==================== COMMUNITY POST APIs ====================

/**
 * Get All Community Posts
 * GET /api/v1/community
 */
export const getPostsAPI = async (params?: {
  status?: string; // open, closed, cancelled
  date?: string; // YYYY-MM-DD
}) => {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append("status", params.status);
  if (params?.date) queryParams.append("date", params.date);

  const url = `/api/v1/community${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  return instance.get<IGetPostsResponse>(url);
};

/**
 * Get a Single Community Post
 * GET /api/v1/community/:id
 */
export const getPostByIdAPI = async (postId: string) => {
  return instance.get<{ success: boolean; data: IPost }>(
    `/api/v1/community/${postId}`
  );
};

/**
 * Create a Community Post
 * POST /api/v1/community/posts
 */
export const createPostAPI = async (postData: ICreatePostRequest) => {
  return instance.post<ICreatePostResponse>(
    "/api/v1/community/posts",
    postData
  );
};

/**
 * Update a Community Post
 * PUT /api/v1/community/:id (not in docs, may need adjustment)
 */
export const updatePostAPI = async (
  postId: string,
  postData: Partial<ICreatePostRequest>
) => {
  return instance.put<ICreatePostResponse>(
    `/api/v1/community/${postId}`,
    postData
  );
};

/**
 * Delete a Community Post
 * DELETE /api/v1/community/:id (not in docs, may need adjustment)
 */
export const deletePostAPI = async (postId: string) => {
  return instance.delete<{ success: boolean; message: string }>(
    `/api/v1/community/${postId}`
  );
};

/**
 * Join a Community Post
 * POST /api/v1/community/:id/join
 */
export const joinActivityAPI = async (postId: string, userId: string) => {
  return instance.post<{ success: boolean; message: string; data: IPost }>(
    `/api/v1/community/${postId}/join`,
    { userId } // Include userId in the request body
  );
};

/**
 * Cancel a Community Post
 * PATCH /api/v1/community/:id/cancel
 */
export const cancelPostAPI = async (postId: string) => {
  return instance.patch<{ success: boolean; message: string; data: IPost }>(
    `/api/v1/community/${postId}/cancel`
  );
};

/**
 * Close a Community Post
 * PATCH /api/community/:id/close
 */
export const closePostAPI = async (postId: string) => {
  return instance.patch<{ success: boolean; message: string; data: IPost }>(
    `/api/v1/community/${postId}/close`
  );
};

// ==================== COMMUNITY STATS & DATA APIs ====================

/**
 * Get Community Statistics
 * GET /api/v1/community/stats
 */
export const getCommunityStatsAPI = async () => {
  return instance.get<{ success: boolean; data: ICommunityStats }>(
    "/api/v1/community/stats"
  );
};

/**
 * Get Available Badges
 * GET /api/v1/community/badges
 */
export const getBadgesAPI = async () => {
  return instance.get<{ success: boolean; data: { badges: IBadge[] } }>(
    "/api/v1/community/badges"
  );
};

/**
 * Get Popular Sports
 * GET /api/v1/community/popular-sports
 */
export const getPopularSportsAPI = async (limit: number = 10) => {
  return instance.get<{ success: boolean; data: { sports: any[] } }>(
    `/api/v1/community/popular-sports?limit=${limit}`
  );
};

/**
 * Get Recent Community Activity
 * GET /api/v1/community/recent-activity
 */
export const getRecentActivityAPI = async (limit: number = 20) => {
  return instance.get<{ success: boolean; data: { activities: any[] } }>(
    `/api/v1/community/recent-activity?limit=${limit}`
  );
};

// ==================== DEPRECATED / NOT IN API DOCS ====================
// These may need to be removed or adjusted based on actual backend implementation

/**
 * Like/Unlike post (NOT IN API DOCS - may need backend implementation)
 */
export const likePostAPI = async (postId: string) => {
  return instance.post<{ success: boolean; data: IPost }>(
    `/api/v1/community/${postId}/like`
  );
};

/**
 * Leave activity (NOT IN API DOCS - may need backend implementation)
 */
export const leaveActivityAPI = async (postId: string) => {
  return instance.post<{ success: boolean; data: IPost }>(
    `/api/v1/community/${postId}/leave`
  );
};

/**
 * Accept join request
 * POST /api/v1/community/:id/accept
 */
export const acceptJoinRequestAPI = async (postId: string, userId: string) => {
  if (!postId) {
    throw new Error("postId is undefined. Cannot proceed with the request.");
  }

  try {
    const response = await instance.patch(
      `/api/v1/community/${postId}/accept`,
      {
        userId,
      }
    );
    // Note: axios interceptor already unwraps response.data
    return response;
  } catch (error) {
    console.error("Error in acceptJoinRequestAPI:", error);
    throw error;
  }
};

/**
 * Check rejection status
 * GET /api/v1/community/:postId/request-status/:userId
 */
export const checkRejectionStatusAPI = async (
  postId: string,
  userId: string
) => {
  try {
    const response = await instance.get(
      `/api/v1/community/${postId}/request-status/${userId}`
    );
    return response; // { success: true, data: { isParticipant, isRejected } }
  } catch (error: any) {
    console.error("❌ Error in checkRejectionStatusAPI:", error);
    throw error;
  }
};

/**
 * Reject join request
 * PATCH /api/v1/community/:id/reject (based on backend code you showed)
 */
export const rejectJoinRequestAPI = async (postId: string, userId: string) => {
  try {
    console.log("📡 Calling rejectJoinRequestAPI:", { postId, userId });
    const response = await instance.patch(
      `/api/v1/community/${postId}/reject`,
      {
        userId,
      }
    );
    console.log("📡 rejectJoinRequestAPI raw response:", response);
    // Note: axios interceptor already unwraps response.data, so response IS the data
    return response; // ← Return response directly, not response.data
  } catch (error: any) {
    console.error("❌ Error in rejectJoinRequestAPI:", error);
    console.error("❌ Error response:", error?.response);
    console.error("❌ Error data:", error?.response?.data);
    throw error;
  }
};

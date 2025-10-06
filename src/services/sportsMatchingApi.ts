import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

// Types
export interface ISportsPlayer {
  _id: string;
  fullName: string;
  avatar?: string;
  favoriteSports: string[];
  level?: number;
  tier?: string;
  rewardPoints?: number;
  lastSeen?: string;
  commonSportsCount: number;
  commonSports: string[];
  matchPercentage: number;
}

export interface ISportsInvitation {
  id: string;
  senderId: string;
  senderName: string;
  targetUserId: string;
  sport: string;
  message: string;
  proposedDate?: string;
  proposedTime?: string;
  location?: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
  expiresAt: string;
  type?: "received" | "sent";
}

export interface IPopularSport {
  _id: string;
  count: number;
  players: string[];
}

export interface ICurrentUser {
  _id: string;
  fullName: string;
  avatar?: string;
  favoriteSports: string[];
  role: string;
}

export interface IFindPlayersResponse {
  players: ISportsPlayer[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  isRandom: boolean;
  currentUserSports?: string[];
  message?: string;
}

// API Functions
export const findPlayersBySportsAPI = async (
  sports?: string | string[],
  limit: number = 10,
  page: number = 1
) => {
  try {
    const token = localStorage.getItem("access_token");
    const sportsParam = sports ? (Array.isArray(sports) ? sports.join(',') : sports) : '';
    
    const response = await axios.get(
      `${API_BASE_URL}/sports-matching/find-players`,
      {
        params: { sports: sportsParam, limit, page },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error("Error finding players by sports:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to find players",
    };
  }
};

export const getPopularSportsAPI = async () => {
  try {
    const token = localStorage.getItem("access_token");
    
    const response = await axios.get(
      `${API_BASE_URL}/sports-matching/popular-sports`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error("Error getting popular sports:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to get popular sports",
    };
  }
};

// Lấy danh sách môn thể thao cố định
export const getSportsOptionsAPI = async () => {
  try {
    const token = localStorage.getItem("access_token");
    
    const response = await axios.get(
      `${API_BASE_URL}/sports-matching/sports-options`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error("Error getting sports options:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to get sports options",
    };
  }
};

export const sendSportsInvitationAPI = async (invitationData: {
  targetUserId: string;
  sport: string;
  message?: string;
  proposedDate?: string;
  proposedTime?: string;
  location?: string;
}) => {
  try {
    const token = localStorage.getItem("access_token");
    
    const response = await axios.post(
      `${API_BASE_URL}/sports-matching/send-invitation`,
      invitationData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error("Error sending sports invitation:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to send invitation",
    };
  }
};

export const getSportsInvitationsAPI = async (type: "received" | "sent" | "all" = "received") => {
  try {
    const token = localStorage.getItem("access_token");
    
    const response = await axios.get(
      `${API_BASE_URL}/sports-matching/invitations`,
      {
        params: { type },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error("Error getting sports invitations:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to get invitations",
    };
  }
};

export const respondToInvitationAPI = async (
  invitationId: string,
  response: "accept" | "decline"
) => {
  try {
    const token = localStorage.getItem("access_token");
    
    const apiResponse = await axios.put(
      `${API_BASE_URL}/sports-matching/invitations/${invitationId}/respond`,
      { response },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: true,
      data: apiResponse.data.data,
    };
  } catch (error: any) {
    console.error("Error responding to invitation:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to respond to invitation",
    };
  }
};

export const getMatchingStatsAPI = async () => {
  try {
    const token = localStorage.getItem("access_token");
    
    const response = await axios.get(
      `${API_BASE_URL}/sports-matching/stats`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error("Error getting matching stats:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to get matching stats",
    };
  }
};

export const getCurrentUserInfoAPI = async () => {
  try {
    const token = localStorage.getItem("access_token");
    
    const response = await axios.get(
      `${API_BASE_URL}/sports-matching/current-user`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error("Error getting current user info:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to get current user info",
    };
  }
};

import {
    findPlayersBySportsAPI,
    getCurrentUserInfoAPI,
    getMatchingStatsAPI,
    getPopularSportsAPI,
    getSportsInvitationsAPI,
    getSportsOptionsAPI,
    respondToInvitationAPI,
    sendSportsInvitationAPI,
    type ICurrentUser,
    type IMatchingStats,
    type IPopularSport,
    type ISportsInvitation,
    type ISportsPlayer
} from "@/services/sportsMatchingApi";
import { useCallback, useState } from "react";

export interface ISportsMatchingData {
  // Players matching by sports
  matchedPlayers: ISportsPlayer[];
  popularSports: IPopularSport[];
  matchingStats: IMatchingStats | null;
  currentUser: ICurrentUser | null;
  isRandom: boolean;
  
  // Invitations
  invitations: ISportsInvitation[];
  
  // Loading states
  loading: {
    players: boolean;
    sports: boolean;
    stats: boolean;
    invitations: boolean;
    currentUser: boolean;
  };
  
  // Error states
  errors: {
    players: string | null;
    sports: string | null;
    stats: string | null;
    invitations: string | null;
    currentUser: string | null;
  };
}

export const useSportsMatching = () => {
  const [data, setData] = useState<ISportsMatchingData>({
    matchedPlayers: [],
    popularSports: [],
    matchingStats: null,
    currentUser: null,
    isRandom: false,
    invitations: [],
    loading: {
      players: false,
      sports: false,
      stats: false,
      invitations: false,
      currentUser: false,
    },
    errors: {
      players: null,
      sports: null,
      stats: null,
      invitations: null,
      currentUser: null,
    },
  });

  // Find players by sports
  const findPlayersBySports = useCallback(async (sports?: string | string[]) => {
    setData(prev => ({ 
      ...prev, 
      loading: { ...prev.loading, players: true },
      errors: { ...prev.errors, players: null }
    }));
    
    try {
      const response = await findPlayersBySportsAPI(sports);
      
      if (response.success) {
        setData(prev => ({
          ...prev,
          matchedPlayers: response.data.players,
          isRandom: response.data.isRandom,
          loading: { ...prev.loading, players: false },
          errors: { ...prev.errors, players: null },
        }));
      } else {
        setData(prev => ({
          ...prev,
          loading: { ...prev.loading, players: false },
          errors: { ...prev.errors, players: response.error },
        }));
      }
    } catch (error) {
      setData(prev => ({
        ...prev,
        loading: { ...prev.loading, players: false },
        errors: { ...prev.errors, players: "Failed to find players" },
      }));
    }
  }, []);

  // Get popular sports
  const getPopularSports = useCallback(async () => {
    setData(prev => ({ 
      ...prev, 
      loading: { ...prev.loading, sports: true },
      errors: { ...prev.errors, sports: null }
    }));
    
    try {
      const response = await getPopularSportsAPI();
      
      if (response.success) {
        setData(prev => ({
          ...prev,
          popularSports: response.data.sports,
          loading: { ...prev.loading, sports: false },
          errors: { ...prev.errors, sports: null },
        }));
      } else {
        setData(prev => ({
          ...prev,
          loading: { ...prev.loading, sports: false },
          errors: { ...prev.errors, sports: response.error },
        }));
      }
    } catch (error) {
      setData(prev => ({
        ...prev,
        loading: { ...prev.loading, sports: false },
        errors: { ...prev.errors, sports: "Failed to get popular sports" },
      }));
    }
  }, []);

  // Get matching stats
  const getMatchingStats = useCallback(async () => {
    setData(prev => ({ 
      ...prev, 
      loading: { ...prev.loading, stats: true },
      errors: { ...prev.errors, stats: null }
    }));
    
    try {
      const response = await getMatchingStatsAPI();
      
      if (response.success) {
        setData(prev => ({
          ...prev,
          matchingStats: response.data,
          loading: { ...prev.loading, stats: false },
          errors: { ...prev.errors, stats: null },
        }));
      } else {
        setData(prev => ({
          ...prev,
          loading: { ...prev.loading, stats: false },
          errors: { ...prev.errors, stats: response.error },
        }));
      }
    } catch (error) {
      setData(prev => ({
        ...prev,
        loading: { ...prev.loading, stats: false },
        errors: { ...prev.errors, stats: "Failed to get matching stats" },
      }));
    }
  }, []);

  // Get invitations
  const getInvitations = useCallback(async (type: "received" | "sent" | "all" = "received") => {
    setData(prev => ({ 
      ...prev, 
      loading: { ...prev.loading, invitations: true },
      errors: { ...prev.errors, invitations: null }
    }));
    
    try {
      const response = await getSportsInvitationsAPI(type);
      
      if (response.success) {
        setData(prev => ({
          ...prev,
          invitations: response.data.invitations,
          loading: { ...prev.loading, invitations: false },
          errors: { ...prev.errors, invitations: null },
        }));
      } else {
        setData(prev => ({
          ...prev,
          loading: { ...prev.loading, invitations: false },
          errors: { ...prev.errors, invitations: response.error },
        }));
      }
    } catch (error) {
      setData(prev => ({
        ...prev,
        loading: { ...prev.loading, invitations: false },
        errors: { ...prev.errors, invitations: "Failed to get invitations" },
      }));
    }
  }, []);

  // Send invitation
  const sendInvitation = useCallback(async (invitationData: {
    targetUserId: string;
    sport: string;
    message?: string;
    proposedDate?: string;
    proposedTime?: string;
    location?: string;
  }) => {
    try {
      const response = await sendSportsInvitationAPI(invitationData);
      
      if (response.success) {
        // Refresh invitations after sending
        await getInvitations("sent");
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      return { success: false, error: "Failed to send invitation" };
    }
  }, [getInvitations]);

  // Respond to invitation
  const respondToInvitation = useCallback(async (invitationId: string, response: "accept" | "decline") => {
    try {
      const apiResponse = await respondToInvitationAPI(invitationId, response);
      
      if (apiResponse.success) {
        // Refresh invitations after responding
        await getInvitations("received");
        return { success: true, data: apiResponse.data };
      } else {
        return { success: false, error: apiResponse.error };
      }
    } catch (error) {
      return { success: false, error: "Failed to respond to invitation" };
    }
  }, [getInvitations]);

  // Get current user info
  const getCurrentUserInfo = useCallback(async () => {
    setData(prev => ({ 
      ...prev, 
      loading: { ...prev.loading, currentUser: true },
      errors: { ...prev.errors, currentUser: null }
    }));
    
    try {
      const response = await getCurrentUserInfoAPI();
      
      if (response.success) {
        setData(prev => ({
          ...prev,
          currentUser: response.data.user,
          loading: { ...prev.loading, currentUser: false },
          errors: { ...prev.errors, currentUser: null },
        }));
      } else {
        setData(prev => ({
          ...prev,
          loading: { ...prev.loading, currentUser: false },
          errors: { ...prev.errors, currentUser: response.error },
        }));
      }
    } catch (error) {
      setData(prev => ({
        ...prev,
        loading: { ...prev.loading, currentUser: false },
        errors: { ...prev.errors, currentUser: "Failed to get current user info" },
      }));
    }
  }, []);

  // Get sports options
  const getSportsOptions = useCallback(async () => {
    try {
      const response = await getSportsOptionsAPI();
      
      if (response.success) {
        return { success: true, data: response.data.sports };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      return { success: false, error: "Failed to get sports options" };
    }
  }, []);

  // Initialize data
  const initializeData = useCallback(async () => {
    try {
      await Promise.all([
        getCurrentUserInfo(),
        getPopularSports(),
        getMatchingStats(),
        getInvitations("received"),
      ]);
    } catch (error) {
      console.error("Error initializing sports matching data:", error);
      
      // Fallback data for testing
      setData(prev => ({
        ...prev,
        popularSports: [
          { _id: "football", count: 15, players: ["user1", "user2", "user3"] },
          { _id: "basketball", count: 12, players: ["user4", "user5", "user6"] },
          { _id: "tennis", count: 8, players: ["user7", "user8"] },
          { _id: "badminton", count: 6, players: ["user9", "user10"] },
          { _id: "swimming", count: 4, players: ["user11", "user12"] },
        ],
        currentUser: {
          _id: "current_user",
          fullName: "Current User",
          avatar: "CU",
          favoriteSports: ["football", "basketball"],
          role: "customer"
        }
      }));
    }
  }, [getCurrentUserInfo, getPopularSports, getMatchingStats, getInvitations]);

  return {
    data,
    findPlayersBySports,
    getPopularSports,
    getSportsOptions,
    getMatchingStats,
    getInvitations,
    sendInvitation,
    respondToInvitation,
    getCurrentUserInfo,
    initializeData,
  };
};

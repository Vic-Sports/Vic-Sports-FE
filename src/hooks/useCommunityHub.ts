import {
    getBadgesAPI,
    getCommunityStatsAPI,
    type IBadge,
    type ICommunityStats
} from "@/services/communityApi";
import {
    findPlayersBySportsAPI,
    type ISportsPlayer
} from "@/services/sportsMatchingApi";
import {
    getFeaturedTournamentsAPI,
    getTournamentStatsAPI,
    type ITournament
} from "@/services/tournamentApi";
import { useCallback, useRef, useState } from "react";

export interface ICommunityHubData {
  // Tournaments
  tournaments: ITournament[];
  tournamentStats: {
    totalTournaments: number;
    activeTournaments: number;
    totalParticipants: number;
    totalPrizePool: number;
  };
  
  // Sports Matching Players
  matchedPlayers: ISportsPlayer[];
  popularSports: { _id: string; count: number; players: string[] }[];
  onlineCount: number;
  playerStats: {
    totalPlayers: number;
    onlinePlayers: number;
    tierDistribution: Array<{ _id: string; count: number }>;
    popularSports: Array<{ _id: string; count: number }>;
  };
  
  // Community
  communityStats: ICommunityStats;
  badges: IBadge[];
  
  // Loading states
  loading: {
    tournaments: boolean;
    players: boolean;
    community: boolean;
  };
  
  // Error states
  errors: {
    tournaments: string | null;
    players: string | null;
    community: string | null;
  };
}

export const useCommunityHub = () => {
  const [data, setData] = useState<ICommunityHubData>({
    tournaments: [],
    tournamentStats: {
      totalTournaments: 0,
      activeTournaments: 0,
      totalParticipants: 0,
      totalPrizePool: 0,
    },
    matchedPlayers: [],
    popularSports: [],
    onlineCount: 0,
    playerStats: {
      totalPlayers: 0,
      onlinePlayers: 0,
      tierDistribution: [],
      popularSports: [],
    },
    communityStats: {
      totalPlayers: 0,
      onlinePlayers: 0,
      activeTournaments: 0,
      totalMatches: 0,
      totalPrizePool: 0,
      tierDistribution: [],
    },
    badges: [],
    loading: {
      tournaments: false,
      players: false,
      community: false,
    },
    errors: {
      tournaments: null,
      players: null,
      community: null,
    },
  });

  // Use ref to track if data has been fetched
  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false);

  // Fetch tournaments data
  const fetchTournaments = async () => {
    setData(prev => ({ ...prev, loading: { ...prev.loading, tournaments: true } }));
    
    try {
      const [featuredResponse, statsResponse] = await Promise.all([
        getFeaturedTournamentsAPI(5),
        getTournamentStatsAPI(),
      ]);

      if (featuredResponse.success) {
        setData(prev => ({
          ...prev,
          tournaments: featuredResponse.data.tournaments,
          loading: { ...prev.loading, tournaments: false },
          errors: { ...prev.errors, tournaments: null },
        }));
      }

      if (statsResponse.success) {
        setData(prev => ({
          ...prev,
          tournamentStats: statsResponse.data,
          loading: { ...prev.loading, tournaments: false },
          errors: { ...prev.errors, tournaments: null },
        }));
      }
    } catch (error) {
      setData(prev => ({
        ...prev,
        loading: { ...prev.loading, tournaments: false },
        errors: { ...prev.errors, tournaments: "Failed to fetch tournaments" },
      }));
    }
  };

  // Fetch players data (sports matching)
  const fetchPlayers = async () => {
    setData(prev => ({ ...prev, loading: { ...prev.loading, players: true } }));
    
    try {
      // Find players based on user's favorite sports (or random if none)
      const playersResponse = await findPlayersBySportsAPI();
      
      if (playersResponse.success) {
        setData(prev => ({
          ...prev,
          matchedPlayers: playersResponse.data.players,
          onlineCount: playersResponse.data.players.length,
          loading: { ...prev.loading, players: false },
          errors: { ...prev.errors, players: null },
        }));
      } else {
        setData(prev => ({
          ...prev,
          loading: { ...prev.loading, players: false },
          errors: { ...prev.errors, players: playersResponse.error },
        }));
      }
    } catch (error) {
      setData(prev => ({
        ...prev,
        loading: { ...prev.loading, players: false },
        errors: { ...prev.errors, players: "Failed to fetch players" },
      }));
    }
  };

  // Fetch community data
  const fetchCommunity = async () => {
    setData(prev => ({ ...prev, loading: { ...prev.loading, community: true } }));
    
    try {
      const [statsResponse, badgesResponse] = await Promise.all([
        getCommunityStatsAPI(),
        getBadgesAPI(),
      ]);

      if (statsResponse.success) {
        setData(prev => ({
          ...prev,
          communityStats: statsResponse.data,
          loading: { ...prev.loading, community: false },
          errors: { ...prev.errors, community: null },
        }));
      }

      if (badgesResponse.success) {
        setData(prev => ({
          ...prev,
          badges: badgesResponse.data.badges,
          loading: { ...prev.loading, community: false },
          errors: { ...prev.errors, community: null },
        }));
      }
    } catch (error) {
      setData(prev => ({
        ...prev,
        loading: { ...prev.loading, community: false },
        errors: { ...prev.errors, community: "Failed to fetch community data" },
      }));
    }
  };

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isFetchingRef.current) {
      return;
    }
    
    isFetchingRef.current = true;
    hasFetchedRef.current = true;
    
    // Only fetch tournaments and community data, skip players
    await Promise.all([
      fetchTournaments(),
      fetchCommunity(),
    ]);
    
    isFetchingRef.current = false;
  }, []);

  // Refresh specific data
  const refreshTournaments = useCallback(() => fetchTournaments(), []);
  const refreshPlayers = useCallback(() => fetchPlayers(), []);
  const refreshCommunity = useCallback(() => fetchCommunity(), []);

  // Remove static data initialization - use real API data instead

  // Remove auto-refresh for local development
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     getOnlinePlayersCountAPI()
  //       .then(response => {
  //         if (response.success) {
  //           setData(prev => ({
  //             ...prev,
  //             onlineCount: response.data.onlineCount,
  //           }));
  //         }
  //       })
  //       .catch(() => {
  //         // Silently fail for auto-refresh
  //       });
  //   }, 30000);

  //   return () => clearInterval(interval);
  // }, []);

  return {
    data,
    fetchAllData,
    refreshTournaments,
    refreshPlayers,
    refreshCommunity,
  };
};

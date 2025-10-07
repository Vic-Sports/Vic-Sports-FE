import createInstanceAxios from "services/axios.customize";

const axios = createInstanceAxios(import.meta.env.VITE_BACKEND_URL);

// =================== COMMUNITY APIs ===================

// Community interfaces
export interface ICommunityStats {
  totalPlayers: number;
  onlinePlayers: number;
  activeTournaments: number;
  totalMatches: number;
  totalPrizePool: number;
  tierDistribution: Array<{
    _id: string;
    count: number;
  }>;
}

export interface IBadge {
  id: string;
  name: string;
  description: string;
  color: string;
  requirements: string;
  icon: string;
}

export interface IPopularSport {
  name: string;
  playerCount: number;
  tournamentCount: number;
  popularity: number;
}

export interface ICommunityActivity {
  type: "registration" | "tournament_created";
  user: {
    _id: string;
    fullName: string;
    avatar: string;
  };
  tournament?: {
    _id: string;
    name: string;
    sportType: string;
  };
  venue?: {
    _id: string;
    name: string;
  };
  timestamp: string;
  message: string;
}

// Get community statistics
export const getCommunityStatsAPI = () => {
  const urlBackend = "/api/v1/community/stats";
  return axios.get<IBackendRes<ICommunityStats>>(urlBackend);
};

// Get available badges
export const getBadgesAPI = () => {
  const urlBackend = "/api/v1/community/badges";
  return axios.get<IBackendRes<{
    badges: IBadge[];
  }>>(urlBackend);
};

// Get popular sports
export const getPopularSportsAPI = (limit: number = 10) => {
  const urlBackend = `/api/v1/community/popular-sports?limit=${limit}`;
  return axios.get<IBackendRes<{
    sports: IPopularSport[];
  }>>(urlBackend);
};

// Get recent activity
export const getRecentActivityAPI = (limit: number = 20) => {
  const urlBackend = `/api/v1/community/recent-activity?limit=${limit}`;
  return axios.get<IBackendRes<{
    activities: ICommunityActivity[];
  }>>(urlBackend);
};

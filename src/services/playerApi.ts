import createInstanceAxios from "services/axios.customize";

const axios = createInstanceAxios(import.meta.env.VITE_BACKEND_URL);

// =================== PLAYER APIs ===================

// Player interfaces
export interface IPlayer {
  id: string;
  name: string;
  avatar: string;
  avatarGradient: string;
  status: string;
  level: number;
  badges: string[];
  isOnline: boolean;
  lastActive: string;
}

export interface IPlayerProfile {
  id: string;
  name: string;
  avatar: string;
  level: number;
  badges: string;
  stats: {
    matchesPlayed: number;
    winRate: number;
    favoriteSport: string;
    totalSpent: number;
    loyaltyTier: string;
  };
  isOnline: boolean;
  lastSeen: string;
  favoriteVenues: Array<{
    _id: string;
    name: string;
    address: {
      city: string;
      district: string;
      ward: string;
      street: string;
    };
  }>;
}

export interface IPlayerStats {
  totalPlayers: number;
  onlinePlayers: number;
  tierDistribution: Array<{
    _id: string;
    count: number;
  }>;
  popularSports: Array<{
    _id: string;
    count: number;
  }>;
}

export interface IPlayerQuery {
  limit?: number;
  offset?: number;
  sport?: string;
}

export interface IPlayerSearchQuery {
  q?: string;
  sport?: string;
  level?: number;
  tier?: string;
  limit?: number;
  offset?: number;
}

export interface IMessageData {
  message: string;
  type?: "text" | "image" | "file" | "system";
}

export interface IPlayerStatusUpdate {
  isOnline: boolean;
}

// Get online players count
export const getOnlinePlayersCountAPI = () => {
  const urlBackend = "/api/v1/players/online-count";
  return axios.get<IBackendRes<{
    onlineCount: number;
    timestamp: string;
  }>>(urlBackend);
};

// Get live players
export const getLivePlayersAPI = (query: IPlayerQuery = {}) => {
  const params = new URLSearchParams();
  
  if (query.limit) params.append("limit", query.limit.toString());
  if (query.offset) params.append("offset", query.offset.toString());
  if (query.sport) params.append("sport", query.sport);

  const urlBackend = `/api/v1/players/live?${params.toString()}`;
  return axios.get<IBackendRes<{
    players: IPlayer[];
    total: number;
    hasMore: boolean;
  }>>(urlBackend);
};

// Get player profile
export const getPlayerProfileAPI = (playerId: string) => {
  const urlBackend = `/api/v1/players/${playerId}/profile`;
  return axios.get<IBackendRes<{
    player: IPlayerProfile;
  }>>(urlBackend);
};

// Send message to player
export const sendMessageToPlayerAPI = (playerId: string, data: IMessageData) => {
  const urlBackend = `/api/v1/players/${playerId}/message`;
  return axios.post<IBackendRes<{
    messageId: string;
    status: string;
    timestamp: string;
  }>>(urlBackend, data);
};

// Search players
export const searchPlayersAPI = (query: IPlayerSearchQuery = {}) => {
  const params = new URLSearchParams();
  
  if (query.q) params.append("q", query.q);
  if (query.sport) params.append("sport", query.sport);
  if (query.level) params.append("level", query.level.toString());
  if (query.tier) params.append("tier", query.tier);
  if (query.limit) params.append("limit", query.limit.toString());
  if (query.offset) params.append("offset", query.offset.toString());

  const urlBackend = `/api/v1/players/search?${params.toString()}`;
  return axios.get<IBackendRes<{
    players: IPlayer[];
    total: number;
    hasMore: boolean;
  }>>(urlBackend);
};

// Get player statistics
export const getPlayerStatsAPI = () => {
  const urlBackend = "/api/v1/players/stats";
  return axios.get<IBackendRes<IPlayerStats>>(urlBackend);
};

// Update player status
export const updatePlayerStatusAPI = (data: IPlayerStatusUpdate) => {
  const urlBackend = "/api/v1/players/status";
  return axios.put<IBackendRes<{
    isOnline: boolean;
    lastSeen: string;
  }>>(urlBackend, data);
};

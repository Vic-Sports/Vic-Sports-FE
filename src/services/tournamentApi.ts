import createInstanceAxios from "services/axios.customize";

const axios = createInstanceAxios(import.meta.env.VITE_BACKEND_URL);

// =================== TOURNAMENT APIs ===================

// Tournament List Response Interface
export interface ITournamentListResponse {
  tournaments: ITournament[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    sportTypes: string[];
    statuses: string[];
  };
}

// Tournament interfaces
export interface ITournament {
  _id: string;
  organizerId: {
    _id: string;
    fullName: string;
    avatar: string;
  };
  venueId: {
    _id: string;
    name: string;
    address: {
      city: string;
      district: string;
      ward: string;
      street: string;
    };
  };
  name: string;
  description: string;
  sportType: string;
  tournamentType: "single_elimination" | "double_elimination" | "round_robin" | "swiss";
  maxParticipants: number;
  minParticipants: number;
  teamSize: number;
  currentParticipants: number;
  registrationStartDate: string;
  registrationEndDate: string;
  registrationFee: number;
  startDate: string;
  endDate: string;
  estimatedDuration?: number;
  prizePool: number;
  prizeDistribution?: Array<{
    position: string;
    amount: number;
    percentage: number;
    description: string;
  }>;
  rules?: string[];
  ageRestrictions?: {
    minAge: number;
    maxAge: number;
  };
  skillLevel: "beginner" | "intermediate" | "advanced" | "all";
  status: "draft" | "registration_open" | "registration_closed" | "ongoing" | "completed" | "cancelled";
  bannerImage?: string;
  gallery?: string[];
  allowLivestream: boolean;
  streamingRights: "organizer_only" | "participants" | "anyone" | "none";
  isPublic: boolean;
  allowSpectators: boolean;
  spectatorFee: number;
  requireApproval: boolean;
  allowSubstitutes: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ITournamentRegistration {
  _id: string;
  tournamentId: string;
  participantId: {
    _id: string;
    fullName: string;
    avatar: string;
  };
  teamName?: string;
  teamMembers?: Array<{
    userId: {
      _id: string;
      fullName: string;
      avatar: string;
    };
    role: "captain" | "member" | "substitute";
    isConfirmed: boolean;
  }>;
  registeredAt: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentId?: string;
  status: "pending" | "approved" | "rejected" | "withdrawn";
  approvedBy?: string;
  approvedAt?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalConditions?: string;
}

export interface ITournamentStats {
  totalTournaments: number;
  activeTournaments: number;
  totalParticipants: number;
  totalPrizePool: number;
}

export interface ITournamentQuery {
  page?: number;
  limit?: number;
  status?: string;
  sportType?: string;
  venueId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ITournamentCreateData {
  venueId: string;
  name: string;
  description: string;
  sportType: string;
  tournamentType?: "single_elimination" | "double_elimination" | "round_robin" | "swiss";
  maxParticipants: number;
  minParticipants?: number;
  teamSize?: number;
  registrationStartDate: string;
  registrationEndDate: string;
  registrationFee?: number;
  startDate: string;
  endDate: string;
  estimatedDuration?: number;
  prizePool?: number;
  prizeDistribution?: Array<{
    position: string;
    amount: number;
    percentage: number;
    description: string;
  }>;
  rules?: string[];
  ageRestrictions?: {
    minAge: number;
    maxAge: number;
  };
  skillLevel?: "beginner" | "intermediate" | "advanced" | "all";
  bannerImage?: string;
  gallery?: string[];
  allowLivestream?: boolean;
  streamingRights?: "organizer_only" | "participants" | "anyone" | "none";
  isPublic?: boolean;
  allowSpectators?: boolean;
  spectatorFee?: number;
  requireApproval?: boolean;
  allowSubstitutes?: boolean;
}

// Get all tournaments for list page
export const getAllTournamentsListAPI = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sportType?: string;
  venueId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: string;
}) => {
  const urlBackend = "/api/v1/tournaments/list-all";
  return axios.get<IBackendRes<ITournamentListResponse>>(urlBackend, { params });
};

// Get all tournaments
export const getAllTournamentsAPI = (query: ITournamentQuery = {}) => {
  const params = new URLSearchParams();
  
  if (query.page) params.append("page", query.page.toString());
  if (query.limit) params.append("limit", query.limit.toString());
  if (query.status) params.append("status", query.status);
  if (query.sportType) params.append("sportType", query.sportType);
  if (query.venueId) params.append("venueId", query.venueId);
  if (query.sortBy) params.append("sortBy", query.sortBy);
  if (query.sortOrder) params.append("sortOrder", query.sortOrder);

  const urlBackend = `/api/v1/tournaments?${params.toString()}`;
  return axios.get<IBackendRes<{
    tournaments: ITournament[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>>(urlBackend);
};

// Get featured tournaments
export const getFeaturedTournamentsAPI = (limit: number = 5) => {
  const urlBackend = `/api/v1/tournaments/featured?limit=${limit}`;
  return axios.get<IBackendRes<{
    tournaments: Array<{
      id: string;
      name: string;
      description: string;
      prizePool: number;
      prizeCurrency: string;
      status: string;
      isLive: boolean;
      startDate: string;
      endDate: string;
      participants: {
        current: number;
        max: number;
      };
      sportType: string;
      venue: any;
      organizer: any;
    }>;
  }>>(urlBackend);
};

// Get tournament by ID
export const getTournamentByIdAPI = (id: string) => {
  const urlBackend = `/api/v1/tournaments/${id}`;
  return axios.get<IBackendRes<ITournament>>(urlBackend);
};

// Get tournament participants
export const getTournamentParticipantsAPI = (
  tournamentId: string,
  query: { page?: number; limit?: number; status?: string } = {}
) => {
  const params = new URLSearchParams();
  
  if (query.page) params.append("page", query.page.toString());
  if (query.limit) params.append("limit", query.limit.toString());
  if (query.status) params.append("status", query.status);

  const urlBackend = `/api/v1/tournaments/${tournamentId}/participants?${params.toString()}`;
  return axios.get<IBackendRes<{
    participants: ITournamentRegistration[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>>(urlBackend);
};

// Create tournament
export const createTournamentAPI = (data: ITournamentCreateData) => {
  const urlBackend = "/api/v1/tournaments";
  return axios.post<IBackendRes<{
    tournament: ITournament;
  }>>(urlBackend, data);
};

// Update tournament
export const updateTournamentAPI = (id: string, data: Partial<ITournamentCreateData>) => {
  const urlBackend = `/api/v1/tournaments/${id}`;
  return axios.put<IBackendRes<{
    tournament: ITournament;
  }>>(urlBackend, data);
};

// Delete tournament
export const deleteTournamentAPI = (id: string) => {
  const urlBackend = `/api/v1/tournaments/${id}`;
  return axios.delete<IBackendRes<any>>(urlBackend);
};

// Join tournament (simple)
export const joinTournamentAPI = (tournamentId: string) => {
  const urlBackend = `/api/v1/tournaments/${tournamentId}/join`;
  return axios.post<IBackendRes<{
    registration: ITournamentRegistration;
  }>>(urlBackend);
};

// Register for tournament (detailed)
export const registerForTournamentAPI = (data: {
  tournamentId: string;
  registrationType: 'individual' | 'team';
  teamName?: string;
  teamMembers: Array<{
    userId: string;
    fullName: string;
    email: string;
    role: 'captain' | 'member' | 'substitute';
    isConfirmed: boolean;
  }>;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalConditions?: string;
  notes?: string;
}) => {
  const urlBackend = `/api/v1/tournaments/${data.tournamentId}/register`;
  return axios.post<IBackendRes<{
    registration: ITournamentRegistration;
    paymentUrl?: string;
  }>>(urlBackend, data);
};

// Get tournament statistics
export const getTournamentStatsAPI = () => {
  const urlBackend = "/api/v1/tournaments/stats";
  return axios.get<IBackendRes<ITournamentStats>>(urlBackend);
};

// Get latest 3 active tournaments (excludes completed and cancelled)
export const getLatestActiveTournamentsAPI = () => {
  const urlBackend = "/api/v1/tournaments/latest-active";
  return axios.get<IBackendRes<ITournament[]>>(urlBackend);
};

// Export tournament API object
export const tournamentApi = {
  getAllTournamentsList: getAllTournamentsListAPI,
  getAllTournaments: getAllTournamentsAPI,
  getFeaturedTournaments: getFeaturedTournamentsAPI,
  getTournamentById: getTournamentByIdAPI,
  getTournamentParticipants: getTournamentParticipantsAPI,
  joinTournament: joinTournamentAPI,
  registerForTournament: registerForTournamentAPI,
  createTournament: createTournamentAPI,
  updateTournament: updateTournamentAPI,
  deleteTournament: deleteTournamentAPI,
  getTournamentStats: getTournamentStatsAPI,
  getLatestActiveTournaments: getLatestActiveTournamentsAPI,
};

// Tournament Types
export interface Tournament {
  _id: string;
  organizerId: string;
  venueId: {
    _id: string;
    name: string;
    address: {
      street: string;
      ward: string;
      district: string;
      city: string;
    };
  };
  name: string;
  description?: string;
  sportType: string;
  tournamentType: TournamentFormat;
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
  requirements?: string;
  ageRestrictions?: {
    minAge: number;
    maxAge: number;
  };
  skillLevel: "beginner" | "intermediate" | "advanced" | "all";
  status: TournamentStatus;
  bannerImage?: string;
  gallery: string[];
  allowLivestream: boolean;
  streamingRights: "organizer_only" | "participants" | "anyone" | "none";
  officialStreamId?: string;
  isPublic: boolean;
  allowSpectators: boolean;
  spectatorFee: number;
  requireApproval: boolean;
  allowSubstitutes: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TournamentFormat = 
  | "single_elimination" 
  | "double_elimination" 
  | "round_robin" 
  | "swiss";

export type TournamentStatus =
  | "draft"
  | "upcoming"
  | "registration_open"
  | "registration_closed"
  | "about_to_start"
  | "ongoing"
  | "completed"
  | "cancelled";

export interface TournamentParticipant {
  _id: string;
  tournamentId: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  teamName?: string;
  teamMembers?: Array<{
    name: string;
    email: string;
    phone: string;
  }>;
  registrationDate: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  entryFeePaid: number;
  status: "registered" | "confirmed" | "disqualified" | "withdrawn";
  seed?: number;
  notes?: string;
}

export interface TournamentMatch {
  _id: string;
  tournamentId: string;
  round: number;
  matchNumber: number;
  participant1?: TournamentParticipant;
  participant2?: TournamentParticipant;
  court?: {
    _id: string;
    name: string;
  };
  scheduledDate?: string;
  scheduledTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  status: MatchStatus;
  score1?: number;
  score2?: number;
  winner?: TournamentParticipant;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type MatchStatus = 
  | "scheduled" 
  | "ongoing" 
  | "completed" 
  | "cancelled" 
  | "postponed";

export interface TournamentBracket {
  _id: string;
  tournamentId: string;
  round: number;
  matches: TournamentMatch[];
  isElimination: boolean;
  createdAt: string;
}

export interface TournamentRegistration {
  _id: string;
  tournamentId: string;
  participant: TournamentParticipant;
  registrationDate: string;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  entryFee: number;
  notes?: string;
}

export interface TournamentStats {
  totalTournaments: number;
  activeTournaments: number;
  completedTournaments: number;
  totalParticipants: number;
  totalRevenue: number;
  averageParticipantsPerTournament: number;
  popularSportTypes: Array<{
    sportType: string;
    count: number;
  }>;
}

export interface CreateTournamentData {
  name: string;
  description?: string;
  sportType: string;
  venueId: string;
  startDate: string;
  endDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  maxParticipants: number;
  minParticipants: number;
  entryFee: number;
  prizePool: number;
  format: TournamentFormat;
  rules?: string;
  requirements?: string;
  isActive?: boolean;
  images?: string[];
}

export interface UpdateTournamentData {
  name?: string;
  description?: string;
  sportType?: string;
  venueId?: string;
  startDate?: string;
  endDate?: string;
  registrationStartDate?: string;
  registrationEndDate?: string;
  maxParticipants?: number;
  minParticipants?: number;
  entryFee?: number;
  prizePool?: number;
  format?: TournamentFormat;
  rules?: string;
  requirements?: string;
  isActive?: boolean;
  images?: string[];
}

export interface TournamentFilters {
  search?: string;
  status?: TournamentStatus;
  sportType?: string;
  venueId?: string;
  dateFrom?: string;
  dateTo?: string;
  format?: TournamentFormat;
  isActive?: boolean;
}

export interface TournamentFormData {
  name: string;
  description: string;
  sportType: string;
  venueId: string;
  startDate: string;
  endDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  maxParticipants: number;
  minParticipants: number;
  entryFee: number;
  prizePool: number;
  format: TournamentFormat;
  rules: string;
  requirements: string;
  isActive: boolean;
}

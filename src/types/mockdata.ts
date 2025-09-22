// Types cho Mock Data dựa trên Models từ Backend

export interface Address {
  city: string;
  district: string;
  ward: string;
  street: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface SocialLogin {
  google?: {
    id: string;
    email: string;
    name: string;
    picture: string;
  };
  facebook?: {
    id: string;
    email: string;
    name: string;
    picture: string;
  };
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  booking: boolean;
  promotion: boolean;
}

export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: Address;
  isEmailVerified: boolean;
  socialLogin?: SocialLogin;
  role: 'customer' | 'owner' | 'admin' | 'coach';
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  isBlocked: boolean;
  blockedReason?: string;
  blockedUntil?: string;
  blockedBy?: string;
  rewardPoints: number;
  loyaltyTier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  birthdayVoucherClaimed: boolean;
  lastBirthdayVoucherYear?: number;
  totalBookings: number;
  totalSpent: number;
  favoriteVenues: string[];
  favoriteSports: string[];
  isOnline: boolean;
  lastSeen: string;
  friends: string[];
  blockedUsers: string[];
  notificationSettings: NotificationSettings;
  lastLoginDevice?: {
    userAgent: string;
    ip: string;
    location: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
}

export interface Amenity {
  name: string;
  icon: string;
  description: string;
}

export interface OperatingHours {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

export interface Parking {
  available: boolean;
  capacity?: number;
  fee?: number;
}

export interface Ratings {
  average: number;
  count: number;
}

export interface Venue {
  _id: string;
  ownerId: string;
  name: string;
  description?: string;
  address: Address;
  contactInfo: ContactInfo;
  images: string[];
  amenities: Amenity[];
  operatingHours: OperatingHours[];
  parking: Parking;
  ratings: Ratings;
  totalBookings: number;
  totalRevenue: number;
  isActive: boolean;
  isVerified: boolean;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Dimensions {
  length?: number;
  width?: number;
  unit: string;
}

export interface Pricing {
  timeSlot: {
    start: string;
    end: string;
  };
  pricePerHour: number;
  dayType: 'weekday' | 'weekend' | 'holiday';
  isActive: boolean;
}

export interface TimeSlot {
  start: string;
  end: string;
  isAvailable: boolean;
}

export interface DefaultAvailability {
  dayOfWeek: number;
  timeSlots: TimeSlot[];
}

export interface Court {
  _id: string;
  venueId: string;
  name: string;
  sportType: string;
  courtType?: string;
  capacity: number;
  dimensions: Dimensions;
  surface?: string;
  equipment: string[];
  pricing: Pricing[];
  defaultAvailability: DefaultAvailability[];
  isActive: boolean;
  images: string[];
  ratings: Ratings;
  totalBookings: number;
  totalRevenue: number;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountApplied {
  type?: string;
  amount?: number;
  percentage?: number;
}

export interface PaymentMethod {
  type: 'cash' | 'card' | 'transfer' | 'wallet';
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentId?: string;
  paidAt?: string;
}

export interface Booking {
  _id: string;
  customerId: string;
  courtId: string;
  venueId: string;
  bookingDate: string;
  timeSlot: {
    start: string;
    end: string;
  };
  duration: number;
  pricePerHour: number;
  totalPrice: number;
  discountApplied?: DiscountApplied;
  finalPrice: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentId?: string;
  paidAt?: string;
  coachId?: string;
  coachFee?: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  checkedIn: boolean;
  checkedInAt?: string;
  checkedOut: boolean;
  checkedOutAt?: string;
  customerNotes?: string;
  venueNotes?: string;
  contactPhone?: string;
  contactEmail?: string;
  pointsEarned: number;
  pointsUsed: number;
  weatherAlertId?: string;
  weatherImpacted: boolean;
  tournamentId?: string;
  isTournamentMatch: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Certification {
  name: string;
  issuedBy: string;
  issuedDate: string;
  expiryDate?: string;
  certificateUrl?: string;
}

export interface CoachAvailability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface Coach {
  _id: string;
  userId: string;
  specializedSports: string[];
  experience: number;
  certifications: Certification[];
  bio?: string;
  achievements: string[];
  hourlyRate: number;
  availability: CoachAvailability[];
  ratings: Ratings;
  totalSessions: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DetailRatings {
  facilities: number;
  service: number;
  cleanliness: number;
  value: number;
}

export interface VenueResponse {
  message?: string;
  respondedBy?: string;
  respondedAt?: string;
}

export interface Review {
  _id: string;
  bookingId: string;
  customerId: string;
  venueId: string;
  courtId: string;
  overallRating: number;
  detailRatings: DetailRatings;
  comment?: string;
  images: string[];
  coachId?: string;
  coachRating?: number;
  coachComment?: string;
  venueResponse?: VenueResponse;
  pointsAwarded: number;
  isApproved: boolean;
  isFeatured: boolean;
  helpfulVotes: number;
  notHelpfulVotes: number;
  createdAt: string;
  updatedAt: string;
}

export interface PrizeDistribution {
  position: string;
  amount: number;
  percentage: number;
  description: string;
}

export interface AgeRestrictions {
  minAge?: number;
  maxAge?: number;
}

export interface StreamingRights {
  type: 'organizer_only' | 'participants' | 'anyone' | 'none';
  officialStreamId?: string;
}

export interface Tournament {
  _id: string;
  organizerId: string;
  venueId: string;
  name: string;
  description?: string;
  sportType: string;
  tournamentType: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';
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
  prizeDistribution: PrizeDistribution[];
  rules: string[];
  ageRestrictions?: AgeRestrictions;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'all';
  status: 'draft' | 'registration_open' | 'registration_closed' | 'ongoing' | 'completed' | 'cancelled';
  bannerImage?: string;
  gallery: string[];
  allowLivestream: boolean;
  streamingRights: StreamingRights;
  isPublic: boolean;
  allowSpectators: boolean;
  spectatorFee: number;
  requireApproval: boolean;
  allowSubstitutes: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BankAccount {
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
}

export interface Owner {
  _id: string;
  userId: string;
  businessName: string;
  businessLicense: string;
  taxCode?: string;
  bankAccount: BankAccount;
  isVerified: boolean;
  verificationDocuments: string[];
  totalRevenue: number;
  createdAt: string;
  updatedAt: string;
}

// Union types cho các trạng thái
export type UserRole = 'customer' | 'owner' | 'admin' | 'coach';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED';
export type LoyaltyTier = 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
export type Gender = 'male' | 'female' | 'other';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethodType = 'cash' | 'card' | 'transfer' | 'wallet';
export type TournamentStatus = 'draft' | 'registration_open' | 'registration_closed' | 'ongoing' | 'completed' | 'cancelled';
export type TournamentType = 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'all';
export type DayType = 'weekday' | 'weekend' | 'holiday';

// Chat and Message interfaces
export interface Chat {
  _id: string;
  participants: string[];
  type: 'direct' | 'group';
  name?: string;
  avatar?: string;
  lastMessage?: {
    senderId: string;
    content: string;
    type: 'text' | 'image' | 'file';
    sentAt: string;
  };
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  deliveredTo: Array<{
    userId: string;
    deliveredAt: string;
  }>;
  readBy: Array<{
    userId: string;
    readAt: string;
  }>;
  replyTo?: string;
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string;
  sentAt: string;
  createdAt: string;
  updatedAt: string;
}

// Location interface
export interface Location {
  _id: string;
  name: string;
  code: string;
  type: 'city' | 'district' | 'ward';
  parentCode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Token Blacklist interface
export interface TokenBlacklist {
  _id: string;
  token: string;
  userId: string;
  tokenType: 'ACCESS_TOKEN' | 'REFRESH_TOKEN';
  reason: 'LOGOUT' | 'LOGOUT_ALL' | 'PASSWORD_CHANGED' | 'ADMIN_REVOKE';
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

// Tournament Match interface
export interface TournamentMatch {
  _id: string;
  tournamentId: string;
  round: string;
  matchNumber: number;
  team1Id?: string;
  team2Id?: string;
  team1Score: number;
  team2Score: number;
  scheduledDate: string;
  actualStartTime?: string;
  actualEndTime?: string;
  courtId?: string;
  refereeId?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  winnerId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Tournament Registration interface
export interface TournamentRegistration {
  _id: string;
  tournamentId: string;
  participantId: string;
  teamName?: string;
  teamMembers: Array<{
    userId: string;
    role: 'captain' | 'member' | 'substitute';
    isConfirmed: boolean;
  }>;
  registeredAt: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentId?: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  approvedBy?: string;
  approvedAt?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalConditions?: string;
  createdAt: string;
  updatedAt: string;
}

// Additional union types
export type ChatType = 'direct' | 'group';
export type MessageType = 'text' | 'image' | 'file';
export type LocationType = 'city' | 'district' | 'ward';
export type TokenType = 'ACCESS_TOKEN' | 'REFRESH_TOKEN';
export type TokenReason = 'LOGOUT' | 'LOGOUT_ALL' | 'PASSWORD_CHANGED' | 'ADMIN_REVOKE';
export type MatchStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type RegistrationStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn';
export type TeamRole = 'captain' | 'member' | 'substitute';

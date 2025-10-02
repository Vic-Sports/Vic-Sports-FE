// JSON Database Service - Đọc/ghi từng file JSON riêng biệt
import type {
  Booking,
  Chat,
  Coach,
  Court,
  Location,
  Message,
  Owner,
  Review,
  TokenBlacklist,
  Tournament,
  TournamentMatch,
  TournamentRegistration,
  User,
  Venue
} from '../types/mockdata';

// Import JSON data
import bookingsData from '../data/bookings.json';
import chatsData from '../data/chats.json';
import coachesData from '../data/coaches.json';
import courtsData from '../data/courts.json';
import locationsData from '../data/locations.json';
import messagesData from '../data/messages.json';
import ownersData from '../data/owners.json';
import reviewsData from '../data/reviews.json';
import tokenBlacklistData from '../data/tokenBlacklist.json';
import tournamentMatchesData from '../data/tournamentMatches.json';
import tournamentRegistrationsData from '../data/tournamentRegistrations.json';
import tournamentsData from '../data/tournaments.json';
import usersData from '../data/users.json';
import venuesData from '../data/venues.json';

// Database collections
let users: User[] = [...(usersData as User[])];
let venues: Venue[] = [...(venuesData as Venue[])];
let courts: Court[] = [...(courtsData as Court[])];
let bookings: Booking[] = [...(bookingsData as Booking[])];
let coaches: Coach[] = [...(coachesData as Coach[])];
let reviews: Review[] = [...(reviewsData as Review[])];
let tournaments: Tournament[] = [...(tournamentsData as Tournament[])];
let owners: Owner[] = [...(ownersData as Owner[])];
let chats: Chat[] = [...(chatsData as Chat[])];
let messages: Message[] = [...(messagesData as Message[])];
let locations: Location[] = [...(locationsData as Location[])];
let tokenBlacklist: TokenBlacklist[] = [...(tokenBlacklistData as TokenBlacklist[])];
let tournamentMatches: TournamentMatch[] = [...(tournamentMatchesData as TournamentMatch[])];
let tournamentRegistrations: TournamentRegistration[] = [...(tournamentRegistrationsData as TournamentRegistration[])];

// Utility functions
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generic CRUD operations
const create = <T extends { _id: string }>(collection: T[], item: Omit<T, '_id'>): T => {
  const newItem = { ...item, _id: generateId() } as T;
  collection.push(newItem);
  return newItem;
};

const read = <T extends { _id: string }>(collection: T[], id?: string): T | null => {
  if (id) {
    return collection.find(item => item._id === id) || null;
  }
  return null;
};

const update = <T extends { _id: string }>(collection: T[], id: string, updates: Partial<T>): T | null => {
  const index = collection.findIndex(item => item._id === id);
  if (index === -1) return null;

  collection[index] = { ...collection[index], ...updates };
  return collection[index];
};

const remove = <T extends { _id: string }>(collection: T[], id: string): boolean => {
  const index = collection.findIndex(item => item._id === id);
  if (index === -1) return false;

  collection.splice(index, 1);
  return true;
};

// User operations
export const userService = {
  async getAll(): Promise<User[]> {
    await delay(300);
    return [...users];
  },

  async getById(id: string): Promise<User | null> {
    await delay(200);
    return read(users, id);
  },

  async create(userData: Omit<User, '_id'>): Promise<User> {
    await delay(500);
    return create(users, userData);
  },

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    await delay(400);
    return update(users, id, userData);
  },

  async delete(id: string): Promise<boolean> {
    await delay(300);
    return remove(users, id);
  },

  async getByRole(role: string): Promise<User[]> {
    await delay(300);
    return users.filter(user => user.role === role);
  },

  async getByStatus(status: string): Promise<User[]> {
    await delay(300);
    return users.filter(user => user.status === status);
  },

  async search(query: string): Promise<User[]> {
    await delay(400);
    const searchTerm = query.toLowerCase();
    return users.filter(user => 
      user.fullName.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      (user.phone && user.phone.includes(searchTerm))
    );
  }
};

// Venue operations
export const venueService = {
  async getAll(): Promise<Venue[]> {
    await delay(300);
    return [...venues];
  },

  async getById(id: string): Promise<Venue | null> {
    await delay(200);
    return read(venues, id);
  },

  async create(venueData: Omit<Venue, '_id'>): Promise<Venue> {
    await delay(600);
    return create(venues, venueData);
  },

  async update(id: string, venueData: Partial<Venue>): Promise<Venue | null> {
    await delay(400);
    return update(venues, id, venueData);
  },

  async delete(id: string): Promise<boolean> {
    await delay(300);
    return remove(venues, id);
  },

  async getByOwner(ownerId: string): Promise<Venue[]> {
    await delay(300);
    return venues.filter(venue => venue.ownerId === ownerId);
  },

  async getActive(): Promise<Venue[]> {
    await delay(300);
    return venues.filter(venue => venue.isActive);
  },

  async getVerified(): Promise<Venue[]> {
    await delay(300);
    return venues.filter(venue => venue.isVerified);
  },

  async search(query: string): Promise<Venue[]> {
    await delay(400);
    const searchTerm = query.toLowerCase();
    return venues.filter(venue => 
      venue.name.toLowerCase().includes(searchTerm) ||
      venue.address.city.toLowerCase().includes(searchTerm) ||
      venue.address.district.toLowerCase().includes(searchTerm)
    );
  }
};

// Court operations
export const courtService = {
  async getAll(): Promise<Court[]> {
    await delay(300);
    return [...courts];
  },

  async getById(id: string): Promise<Court | null> {
    await delay(200);
    return read(courts, id);
  },

  async create(courtData: Omit<Court, '_id'>): Promise<Court> {
    await delay(500);
    return create(courts, courtData);
  },

  async update(id: string, courtData: Partial<Court>): Promise<Court | null> {
    await delay(400);
    return update(courts, id, courtData);
  },

  async delete(id: string): Promise<boolean> {
    await delay(300);
    return remove(courts, id);
  },

  async getByVenue(venueId: string): Promise<Court[]> {
    await delay(300);
    return courts.filter(court => court.venueId === venueId);
  },

  async getBySport(sportType: string): Promise<Court[]> {
    await delay(300);
    return courts.filter(court => court.sportType === sportType);
  },

  async getActive(): Promise<Court[]> {
    await delay(300);
    return courts.filter(court => court.isActive);
  },

  async search(query: string): Promise<Court[]> {
    await delay(400);
    const searchTerm = query.toLowerCase();
    return courts.filter(court => 
      court.name.toLowerCase().includes(searchTerm) ||
      court.sportType.toLowerCase().includes(searchTerm)
    );
  }
};

// Booking operations
export const bookingService = {
  async getAll(): Promise<Booking[]> {
    await delay(300);
    return [...bookings];
  },

  async getById(id: string): Promise<Booking | null> {
    await delay(200);
    return read(bookings, id);
  },

  async create(bookingData: Omit<Booking, '_id'>): Promise<Booking> {
    await delay(600);
    return create(bookings, bookingData);
  },

  async update(id: string, bookingData: Partial<Booking>): Promise<Booking | null> {
    await delay(400);
    return update(bookings, id, bookingData);
  },

  async delete(id: string): Promise<boolean> {
    await delay(300);
    return remove(bookings, id);
  },

  async getByCustomer(customerId: string): Promise<Booking[]> {
    await delay(300);
    return bookings.filter(booking => booking.customerId === customerId);
  },

  async getByVenue(venueId: string): Promise<Booking[]> {
    await delay(300);
    return bookings.filter(booking => booking.venueId === venueId);
  },

  async getByCourt(courtId: string): Promise<Booking[]> {
    await delay(300);
    return bookings.filter(booking => booking.courtId === courtId);
  },

  async getByStatus(status: string): Promise<Booking[]> {
    await delay(300);
    return bookings.filter(booking => booking.status === status);
  },

  async getByDateRange(startDate: string, endDate: string): Promise<Booking[]> {
    await delay(400);
    return bookings.filter(booking => 
      booking.bookingDate >= startDate && booking.bookingDate <= endDate
    );
  }
};

// Coach operations
export const coachService = {
  async getAll(): Promise<Coach[]> {
    await delay(300);
    return [...coaches];
  },

  async getById(id: string): Promise<Coach | null> {
    await delay(200);
    return read(coaches, id);
  },

  async create(coachData: Omit<Coach, '_id'>): Promise<Coach> {
    await delay(500);
    return create(coaches, coachData);
  },

  async update(id: string, coachData: Partial<Coach>): Promise<Coach | null> {
    await delay(400);
    return update(coaches, id, coachData);
  },

  async delete(id: string): Promise<boolean> {
    await delay(300);
    return remove(coaches, id);
  },

  async getByUserId(userId: string): Promise<Coach | null> {
    await delay(300);
    return coaches.find(coach => coach.userId === userId) || null;
  },

  async getBySport(sportType: string): Promise<Coach[]> {
    await delay(300);
    return coaches.filter(coach => coach.specializedSports.includes(sportType));
  },

  async getVerified(): Promise<Coach[]> {
    await delay(300);
    return coaches.filter(coach => coach.isVerified);
  },

  async getActive(): Promise<Coach[]> {
    await delay(300);
    return coaches.filter(coach => coach.isActive);
  }
};

// Review operations
export const reviewService = {
  async getAll(): Promise<Review[]> {
    await delay(300);
    return [...reviews];
  },

  async getById(id: string): Promise<Review | null> {
    await delay(200);
    return read(reviews, id);
  },

  async create(reviewData: Omit<Review, '_id'>): Promise<Review> {
    await delay(500);
    return create(reviews, reviewData);
  },

  async update(id: string, reviewData: Partial<Review>): Promise<Review | null> {
    await delay(400);
    return update(reviews, id, reviewData);
  },

  async delete(id: string): Promise<boolean> {
    await delay(300);
    return remove(reviews, id);
  },

  async getByVenue(venueId: string): Promise<Review[]> {
    await delay(300);
    return reviews.filter(review => review.venueId === venueId);
  },

  async getByCustomer(customerId: string): Promise<Review[]> {
    await delay(300);
    return reviews.filter(review => review.customerId === customerId);
  },

  async getByCourt(courtId: string): Promise<Review[]> {
    await delay(300);
    return reviews.filter(review => review.courtId === courtId);
  },

  async getFeatured(): Promise<Review[]> {
    await delay(300);
    return reviews.filter(review => review.isFeatured);
  },

  async getApproved(): Promise<Review[]> {
    await delay(300);
    return reviews.filter(review => review.isApproved);
  }
};

// Tournament operations
export const tournamentService = {
  async getAll(): Promise<Tournament[]> {
    await delay(300);
    return [...tournaments];
  },

  async getById(id: string): Promise<Tournament | null> {
    await delay(200);
    return read(tournaments, id);
  },

  async create(tournamentData: Omit<Tournament, '_id'>): Promise<Tournament> {
    await delay(600);
    return create(tournaments, tournamentData);
  },

  async update(id: string, tournamentData: Partial<Tournament>): Promise<Tournament | null> {
    await delay(400);
    return update(tournaments, id, tournamentData);
  },

  async delete(id: string): Promise<boolean> {
    await delay(300);
    return remove(tournaments, id);
  },

  async getByVenue(venueId: string): Promise<Tournament[]> {
    await delay(300);
    return tournaments.filter(tournament => tournament.venueId === venueId);
  },

  async getByOrganizer(organizerId: string): Promise<Tournament[]> {
    await delay(300);
    return tournaments.filter(tournament => tournament.organizerId === organizerId);
  },

  async getByStatus(status: string): Promise<Tournament[]> {
    await delay(300);
    return tournaments.filter(tournament => tournament.status === status);
  },

  async getBySport(sportType: string): Promise<Tournament[]> {
    await delay(300);
    return tournaments.filter(tournament => tournament.sportType === sportType);
  },

  async getActive(): Promise<Tournament[]> {
    await delay(300);
    return tournaments.filter(tournament => 
      ['registration_open', 'ongoing'].includes(tournament.status)
    );
  },

  async getPublic(): Promise<Tournament[]> {
    await delay(300);
    return tournaments.filter(tournament => tournament.isPublic);
  }
};

// Owner operations
export const ownerService = {
  async getAll(): Promise<Owner[]> {
    await delay(300);
    return [...owners];
  },

  async getById(id: string): Promise<Owner | null> {
    await delay(200);
    return read(owners, id);
  },

  async create(ownerData: Omit<Owner, '_id'>): Promise<Owner> {
    await delay(500);
    return create(owners, ownerData);
  },

  async update(id: string, ownerData: Partial<Owner>): Promise<Owner | null> {
    await delay(400);
    return update(owners, id, ownerData);
  },

  async delete(id: string): Promise<boolean> {
    await delay(300);
    return remove(owners, id);
  },

  async getByUserId(userId: string): Promise<Owner | null> {
    await delay(300);
    return owners.find(owner => owner.userId === userId) || null;
  },

  async getVerified(): Promise<Owner[]> {
    await delay(300);
    return owners.filter(owner => owner.isVerified);
  }
};

// Statistics service
export const statisticsService = {
  async getOverview() {
    await delay(300);
    return {
      totalUsers: users.length,
      totalVenues: venues.length,
      totalCourts: courts.length,
      totalBookings: bookings.length,
      totalCoaches: coaches.length,
      totalReviews: reviews.length,
      totalTournaments: tournaments.length,
      totalOwners: owners.length,
      totalChats: chats.length,
      totalMessages: messages.length,
      totalLocations: locations.length,
      totalTokenBlacklist: tokenBlacklist.length,
      totalTournamentMatches: tournamentMatches.length,
      totalTournamentRegistrations: tournamentRegistrations.length,
      activeUsers: users.filter(u => u.status === 'ACTIVE').length,
      activeVenues: venues.filter(v => v.isActive).length,
      activeCourts: courts.filter(c => c.isActive).length,
      verifiedCoaches: coaches.filter(c => c.isVerified).length,
      verifiedOwners: owners.filter(o => o.isVerified).length,
      activeChats: chats.filter(c => c.isActive).length,
      activeLocations: locations.filter(l => l.isActive).length,
      totalRevenue: venues.reduce((sum, venue) => sum + venue.totalRevenue, 0)
    };
  },

  async getUserStats() {
    await delay(300);
    const roleStats = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const tierStats = users.reduce((acc, user) => {
      acc[user.loyaltyTier] = (acc[user.loyaltyTier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalUsers: users.length,
      roleDistribution: roleStats,
      tierDistribution: tierStats,
      averageSpent: users.reduce((sum, user) => sum + user.totalSpent, 0) / users.length,
      averageBookings: users.reduce((sum, user) => sum + user.totalBookings, 0) / users.length
    };
  },

  async getVenueStats() {
    await delay(300);
    return {
      totalVenues: venues.length,
      activeVenues: venues.filter(v => v.isActive).length,
      verifiedVenues: venues.filter(v => v.isVerified).length,
      averageRating: venues.reduce((sum, venue) => sum + venue.ratings.average, 0) / venues.length,
      totalRevenue: venues.reduce((sum, venue) => sum + venue.totalRevenue, 0),
      totalBookings: venues.reduce((sum, venue) => sum + venue.totalBookings, 0)
    };
  }
};

// Chat operations
export const chatService = {
  async getAll(): Promise<Chat[]> {
    await delay(300);
    return [...chats];
  },

  async getById(id: string): Promise<Chat | null> {
    await delay(200);
    return read(chats, id);
  },

  async create(chatData: Omit<Chat, '_id'>): Promise<Chat> {
    await delay(500);
    return create(chats, chatData);
  },

  async update(id: string, chatData: Partial<Chat>): Promise<Chat | null> {
    await delay(400);
    return update(chats, id, chatData);
  },

  async delete(id: string): Promise<boolean> {
    await delay(300);
    return remove(chats, id);
  },

  async getByParticipant(userId: string): Promise<Chat[]> {
    await delay(300);
    return chats.filter(chat => chat.participants.includes(userId));
  },

  async getDirectChat(userId1: string, userId2: string): Promise<Chat | null> {
    await delay(300);
    return chats.find(chat => 
      chat.type === 'direct' && 
      chat.participants.includes(userId1) && 
      chat.participants.includes(userId2)
    ) || null;
  }
};

// Message operations
export const messageService = {
  async getAll(): Promise<Message[]> {
    await delay(300);
    return [...messages];
  },

  async getById(id: string): Promise<Message | null> {
    await delay(200);
    return read(messages, id);
  },

  async create(messageData: Omit<Message, '_id'>): Promise<Message> {
    await delay(500);
    return create(messages, messageData);
  },

  async update(id: string, messageData: Partial<Message>): Promise<Message | null> {
    await delay(400);
    return update(messages, id, messageData);
  },

  async delete(id: string): Promise<boolean> {
    await delay(300);
    return remove(messages, id);
  },

  async getByChat(chatId: string): Promise<Message[]> {
    await delay(300);
    return messages.filter(message => message.chatId === chatId);
  },

  async getBySender(senderId: string): Promise<Message[]> {
    await delay(300);
    return messages.filter(message => message.senderId === senderId);
  }
};

// Location operations
export const locationService = {
  async getAll(): Promise<Location[]> {
    await delay(300);
    return [...locations];
  },

  async getById(id: string): Promise<Location | null> {
    await delay(200);
    return read(locations, id);
  },

  async create(locationData: Omit<Location, '_id'>): Promise<Location> {
    await delay(500);
    return create(locations, locationData);
  },

  async update(id: string, locationData: Partial<Location>): Promise<Location | null> {
    await delay(400);
    return update(locations, id, locationData);
  },

  async delete(id: string): Promise<boolean> {
    await delay(300);
    return remove(locations, id);
  },

  async getByType(type: string): Promise<Location[]> {
    await delay(300);
    return locations.filter(location => location.type === type);
  },

  async getByParent(parentCode: string): Promise<Location[]> {
    await delay(300);
    return locations.filter(location => location.parentCode === parentCode);
  },

  async getCities(): Promise<Location[]> {
    await delay(300);
    return locations.filter(location => location.type === 'city');
  },

  async getDistrictsByCity(cityCode: string): Promise<Location[]> {
    await delay(300);
    return locations.filter(location => 
      location.type === 'district' && location.parentCode === cityCode
    );
  },

  async getWardsByDistrict(districtCode: string): Promise<Location[]> {
    await delay(300);
    return locations.filter(location => 
      location.type === 'ward' && location.parentCode === districtCode
    );
  }
};

// Token Blacklist operations
export const tokenBlacklistService = {
  async getAll(): Promise<TokenBlacklist[]> {
    await delay(300);
    return [...tokenBlacklist];
  },

  async getById(id: string): Promise<TokenBlacklist | null> {
    await delay(200);
    return read(tokenBlacklist, id);
  },

  async create(tokenData: Omit<TokenBlacklist, '_id'>): Promise<TokenBlacklist> {
    await delay(500);
    return create(tokenBlacklist, tokenData);
  },

  async update(id: string, tokenData: Partial<TokenBlacklist>): Promise<TokenBlacklist | null> {
    await delay(400);
    return update(tokenBlacklist, id, tokenData);
  },

  async delete(id: string): Promise<boolean> {
    await delay(300);
    return remove(tokenBlacklist, id);
  },

  async isBlacklisted(token: string): Promise<boolean> {
    await delay(200);
    const now = new Date();
    return tokenBlacklist.some(blacklistedToken => 
      blacklistedToken.token === token && 
      new Date(blacklistedToken.expiresAt) > now
    );
  },

  async getByUser(userId: string): Promise<TokenBlacklist[]> {
    await delay(300);
    return tokenBlacklist.filter(token => token.userId === userId);
  }
};

// Tournament Match operations
export const tournamentMatchService = {
  async getAll(): Promise<TournamentMatch[]> {
    await delay(300);
    return [...tournamentMatches];
  },

  async getById(id: string): Promise<TournamentMatch | null> {
    await delay(200);
    return read(tournamentMatches, id);
  },

  async create(matchData: Omit<TournamentMatch, '_id'>): Promise<TournamentMatch> {
    await delay(500);
    return create(tournamentMatches, matchData);
  },

  async update(id: string, matchData: Partial<TournamentMatch>): Promise<TournamentMatch | null> {
    await delay(400);
    return update(tournamentMatches, id, matchData);
  },

  async delete(id: string): Promise<boolean> {
    await delay(300);
    return remove(tournamentMatches, id);
  },

  async getByTournament(tournamentId: string): Promise<TournamentMatch[]> {
    await delay(300);
    return tournamentMatches.filter(match => match.tournamentId === tournamentId);
  },

  async getByRound(tournamentId: string, round: string): Promise<TournamentMatch[]> {
    await delay(300);
    return tournamentMatches.filter(match => 
      match.tournamentId === tournamentId && match.round === round
    );
  },

  async getByStatus(status: string): Promise<TournamentMatch[]> {
    await delay(300);
    return tournamentMatches.filter(match => match.status === status);
  },

  async getByDateRange(startDate: string, endDate: string): Promise<TournamentMatch[]> {
    await delay(400);
    return tournamentMatches.filter(match => 
      match.scheduledDate >= startDate && match.scheduledDate <= endDate
    );
  }
};

// Tournament Registration operations
export const tournamentRegistrationService = {
  async getAll(): Promise<TournamentRegistration[]> {
    await delay(300);
    return [...tournamentRegistrations];
  },

  async getById(id: string): Promise<TournamentRegistration | null> {
    await delay(200);
    return read(tournamentRegistrations, id);
  },

  async create(registrationData: Omit<TournamentRegistration, '_id'>): Promise<TournamentRegistration> {
    await delay(500);
    return create(tournamentRegistrations, registrationData);
  },

  async update(id: string, registrationData: Partial<TournamentRegistration>): Promise<TournamentRegistration | null> {
    await delay(400);
    return update(tournamentRegistrations, id, registrationData);
  },

  async delete(id: string): Promise<boolean> {
    await delay(300);
    return remove(tournamentRegistrations, id);
  },

  async getByTournament(tournamentId: string): Promise<TournamentRegistration[]> {
    await delay(300);
    return tournamentRegistrations.filter(reg => reg.tournamentId === tournamentId);
  },

  async getByParticipant(participantId: string): Promise<TournamentRegistration[]> {
    await delay(300);
    return tournamentRegistrations.filter(reg => reg.participantId === participantId);
  },

  async getByStatus(status: string): Promise<TournamentRegistration[]> {
    await delay(300);
    return tournamentRegistrations.filter(reg => reg.status === status);
  },

  async getApproved(tournamentId: string): Promise<TournamentRegistration[]> {
    await delay(300);
    return tournamentRegistrations.filter(reg => 
      reg.tournamentId === tournamentId && reg.status === 'approved'
    );
  }
};

// Export all services
export const jsonDbService = {
  users: userService,
  venues: venueService,
  courts: courtService,
  bookings: bookingService,
  coaches: coachService,
  reviews: reviewService,
  tournaments: tournamentService,
  owners: ownerService,
  chats: chatService,
  messages: messageService,
  locations: locationService,
  tokenBlacklist: tokenBlacklistService,
  tournamentMatches: tournamentMatchService,
  tournamentRegistrations: tournamentRegistrationService,
  statistics: statisticsService
};

export default jsonDbService;

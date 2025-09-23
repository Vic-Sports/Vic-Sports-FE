// Venue types based on sample data
export interface IVenueAddress {
  street: string;
  ward: string;
  district: string;
  city: string;
  coordinates: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export interface IVenueContactInfo {
  phone: string;
  email: string;
}

export interface IVenueAmenity {
  name: string;
  icon: string;
  description: string;
}

export interface IVenueOperatingHours {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  openTime: string; // Format: "HH:mm"
  closeTime: string; // Format: "HH:mm"
  isOpen: boolean;
}

export interface IVenueParking {
  available: boolean;
  capacity: number;
  fee: number; // Fee in VND
}

export interface IVenueRatings {
  average: number;
  count: number;
}

export interface IVenue {
  _id: string;
  ownerId: string;
  name: string;
  description: string;
  address: IVenueAddress;
  contactInfo: IVenueContactInfo;
  images: string[];
  amenities: IVenueAmenity[];
  operatingHours: IVenueOperatingHours[];
  parking: IVenueParking;
  ratings: IVenueRatings;
  totalBookings: number;
  totalRevenue: number;
  isActive: boolean;
  isVerified: boolean;
  verifiedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Venue filter and search parameters
export interface IVenueFilterParams {
  sportType?: string;
  location?: string;
  rating?: number;
  amenities?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  isVerified?: boolean;
  sortBy?: "rating" | "price" | "distance" | "name";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// Venue search response
export interface IVenueSearchResponse {
  venues: IVenue[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

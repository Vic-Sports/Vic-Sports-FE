// Court types based on sample data
export interface ICourtDimensions {
  length: number;
  width: number;
  unit: "meters" | "feet";
}

export interface ICourtTimeSlot {
  start: string; // Format: "HH:mm"
  end: string; // Format: "HH:mm"
}

export interface ICourtPricing {
  timeSlot: ICourtTimeSlot;
  pricePerHour: number; // Price in VND
  dayType: "weekday" | "weekend" | "holiday";
  isActive: boolean;
}

export interface ICourtAvailabilitySlot {
  start: string; // Format: "HH:mm"
  end: string; // Format: "HH:mm"
  isAvailable: boolean;
}

export interface ICourtDefaultAvailability {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  timeSlots: ICourtAvailabilitySlot[];
}

export interface ICourtRatings {
  average: number;
  count: number;
}

export interface ICourt {
  _id?: string;
  venueId: string;
  name: string;
  sportType: string;
  courtType: "trong nhà" | "ngoài trời";
  capacity: number;
  dimensions: ICourtDimensions;
  surface: string;
  equipment: string[];
  pricing: ICourtPricing[];
  defaultAvailability: ICourtDefaultAvailability[];
  isActive: boolean;
  images: string[];
  ratings: ICourtRatings;
  totalBookings: number;
  totalRevenue: number;
  createdAt?: string;
  updatedAt?: string;
}

// Court filter and search parameters with time
export interface ICourtFilterParams {
  sportType?: string;
  location?: string;
  date: string; // Required when filtering courts - Format: "YYYY-MM-DD"
  timeSlot: ICourtTimeSlot; // Required when filtering courts
  courtType?: "trong nhà" | "ngoài trời";
  capacity?: number;
  priceRange?: {
    min: number;
    max: number;
  };
  surface?: string;
  equipment?: string[];
  rating?: number;
  sortBy?: "rating" | "price" | "distance" | "name" | "capacity";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// Court availability check
export interface ICourtAvailability {
  courtId: string;
  date: string;
  timeSlots: {
    start: string;
    end: string;
    isAvailable: boolean;
    price: number;
  }[];
}

// Court search response
export interface ICourtSearchResponse {
  courts: ICourt[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Booking related types
export interface ICourtBooking {
  _id?: string;
  courtId: string;
  userId: string;
  date: string;
  timeSlot: ICourtTimeSlot;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

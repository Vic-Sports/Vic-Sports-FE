import type {
  ICourt,
  ICourtFilterParams,
  ICourtSearchResponse,
  ICourtBooking,
  ICourtAvailability,
} from "@/types/court";

// Mock data for courts based on sample provided
const MOCK_COURTS: ICourt[] = [
  {
    venueId: "65234be3f2e81e1c6f123001",
    name: "Sân Bóng Đá Mỹ An",
    sportType: "bóng đá",
    courtType: "ngoài trời",
    capacity: 14,
    dimensions: {
      length: 40,
      width: 20,
      unit: "meters",
    },
    surface: "cỏ nhân tạo",
    equipment: ["khung thành", "lưới chắn", "đèn chiếu sáng"],
    pricing: [
      {
        timeSlot: { start: "06:00", end: "18:00" },
        pricePerHour: 300000,
        dayType: "weekday",
        isActive: true,
      },
      {
        timeSlot: { start: "18:00", end: "22:00" },
        pricePerHour: 400000,
        dayType: "weekend",
        isActive: true,
      },
    ],
    defaultAvailability: [
      {
        dayOfWeek: 1,
        timeSlots: [{ start: "06:00", end: "22:00", isAvailable: true }],
      },
      {
        dayOfWeek: 6,
        timeSlots: [{ start: "06:00", end: "23:00", isAvailable: true }],
      },
    ],
    isActive: true,
    images: ["myan1.jpg", "myan2.jpg"],
    ratings: { average: 4.2, count: 35 },
    totalBookings: 248,
    totalRevenue: 83000000,
  },
  {
    venueId: "65234be3f2e81e1c6f123002",
    name: "Sân Cầu Lông Hải Châu",
    sportType: "cầu lông",
    courtType: "trong nhà",
    capacity: 8,
    dimensions: {
      length: 13.4,
      width: 6.1,
      unit: "meters",
    },
    surface: "thảm PVC",
    equipment: ["cột lưới", "đèn LED"],
    pricing: [
      {
        timeSlot: { start: "07:00", end: "17:00" },
        pricePerHour: 120000,
        dayType: "weekday",
        isActive: true,
      },
      {
        timeSlot: { start: "17:00", end: "22:00" },
        pricePerHour: 180000,
        dayType: "weekday",
        isActive: true,
      },
      {
        timeSlot: { start: "07:00", end: "22:00" },
        pricePerHour: 200000,
        dayType: "weekend",
        isActive: true,
      },
    ],
    defaultAvailability: [
      {
        dayOfWeek: 2,
        timeSlots: [{ start: "07:00", end: "22:00", isAvailable: true }],
      },
      {
        dayOfWeek: 4,
        timeSlots: [{ start: "07:00", end: "22:00", isAvailable: true }],
      },
    ],
    isActive: true,
    images: ["caulong1.jpg"],
    ratings: { average: 4.5, count: 22 },
    totalBookings: 152,
    totalRevenue: 27000000,
  },
  {
    venueId: "65234be3f2e81e1c6f123003",
    name: "Sân Tennis Sơn Trà",
    sportType: "tennis",
    courtType: "ngoài trời",
    capacity: 4,
    dimensions: {
      length: 23.77,
      width: 10.97,
      unit: "meters",
    },
    surface: "cứng",
    equipment: ["lưới tennis", "đèn sân", "ghế trọng tài"],
    pricing: [
      {
        timeSlot: { start: "06:00", end: "16:00" },
        pricePerHour: 180000,
        dayType: "weekday",
        isActive: true,
      },
      {
        timeSlot: { start: "16:00", end: "22:00" },
        pricePerHour: 250000,
        dayType: "weekday",
        isActive: true,
      },
      {
        timeSlot: { start: "06:00", end: "22:00" },
        pricePerHour: 300000,
        dayType: "weekend",
        isActive: true,
      },
    ],
    defaultAvailability: [
      {
        dayOfWeek: 0,
        timeSlots: [{ start: "06:00", end: "22:00", isAvailable: true }],
      },
      {
        dayOfWeek: 5,
        timeSlots: [{ start: "06:00", end: "22:00", isAvailable: true }],
      },
    ],
    isActive: true,
    images: ["tennis_sontra.jpg"],
    ratings: { average: 4.0, count: 17 },
    totalBookings: 97,
    totalRevenue: 19000000,
  },
  {
    venueId: "65234be3f2e81e1c6f123004",
    name: "Sân Bóng Rổ Thanh Khê",
    sportType: "bóng rổ",
    courtType: "ngoài trời",
    capacity: 10,
    dimensions: {
      length: 28,
      width: 15,
      unit: "meters",
    },
    surface: "xi măng",
    equipment: ["rổ bóng", "đèn sân"],
    pricing: [
      {
        timeSlot: { start: "16:00", end: "22:00" },
        pricePerHour: 250000,
        dayType: "weekday",
        isActive: true,
      },
      {
        timeSlot: { start: "06:00", end: "22:00" },
        pricePerHour: 320000,
        dayType: "weekend",
        isActive: true,
      },
    ],
    defaultAvailability: [
      {
        dayOfWeek: 3,
        timeSlots: [{ start: "16:00", end: "22:00", isAvailable: true }],
      },
      {
        dayOfWeek: 6,
        timeSlots: [{ start: "06:00", end: "22:00", isAvailable: true }],
      },
    ],
    isActive: true,
    images: ["basketball_thanhkhe.jpg"],
    ratings: { average: 3.9, count: 10 },
    totalBookings: 66,
    totalRevenue: 9500000,
  },
];

// Mock function to simulate filtering courts with time constraints
const filterCourtsWithTime = (params: ICourtFilterParams): ICourt[] => {
  let filteredCourts = [...MOCK_COURTS];

  // Filter by sport type
  if (params.sportType) {
    filteredCourts = filteredCourts.filter((court) =>
      court.sportType.toLowerCase().includes(params.sportType!.toLowerCase())
    );
  }

  // Filter by court type
  if (params.courtType) {
    filteredCourts = filteredCourts.filter(
      (court) => court.courtType === params.courtType
    );
  }

  // Filter by capacity
  if (params.capacity) {
    filteredCourts = filteredCourts.filter(
      (court) => court.capacity >= params.capacity!
    );
  }

  // Filter by price range
  if (params.priceRange) {
    filteredCourts = filteredCourts.filter((court) => {
      const courtPrices = court.pricing.map((p) => p.pricePerHour);
      const minPrice = Math.min(...courtPrices);
      const maxPrice = Math.max(...courtPrices);

      return (
        (!params.priceRange!.min || minPrice >= params.priceRange!.min) &&
        (!params.priceRange!.max || maxPrice <= params.priceRange!.max)
      );
    });
  }

  // Filter by rating
  if (params.rating) {
    filteredCourts = filteredCourts.filter(
      (court) => court.ratings.average >= params.rating!
    );
  }

  // Filter by equipment
  if (params.equipment && params.equipment.length > 0) {
    filteredCourts = filteredCourts.filter((court) =>
      params.equipment!.some((eq) =>
        court.equipment.some((courtEq) =>
          courtEq.toLowerCase().includes(eq.toLowerCase())
        )
      )
    );
  }

  // Sort results
  if (params.sortBy) {
    filteredCourts.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (params.sortBy) {
        case "rating":
          aValue = a.ratings.average;
          bValue = b.ratings.average;
          break;
        case "price":
          aValue = Math.min(...a.pricing.map((p) => p.pricePerHour));
          bValue = Math.min(...b.pricing.map((p) => p.pricePerHour));
          break;
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "capacity":
          aValue = a.capacity;
          bValue = b.capacity;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return params.sortOrder === "desc" ? 1 : -1;
      if (aValue > bValue) return params.sortOrder === "desc" ? -1 : 1;
      return 0;
    });
  }

  return filteredCourts;
};

// API Functions (with mock implementation for now)

/**
 * Search for courts with time constraints
 * This is used when user selects date and time
 */
export const searchCourtsAPI = async (
  params: ICourtFilterParams
): Promise<IBackendRes<ICourtSearchResponse>> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    const filteredCourts = filterCourtsWithTime(params);

    // Pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCourts = filteredCourts.slice(startIndex, endIndex);

    const response: ICourtSearchResponse = {
      courts: paginatedCourts,
      total: filteredCourts.length,
      page,
      totalPages: Math.ceil(filteredCourts.length / limit),
      hasNext: endIndex < filteredCourts.length,
      hasPrev: page > 1,
    };

    return {
      message: "Courts fetched successfully",
      statusCode: 200,
      data: response,
    };
  } catch {
    return {
      error: "SEARCH_FAILED",
      message: "Failed to fetch courts",
      statusCode: 500,
    };
  }
};

/**
 * Get court by ID
 */
export const getCourtByIdAPI = async (
  courtId: string
): Promise<IBackendRes<ICourt>> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  try {
    const court = MOCK_COURTS.find((c) => c.venueId === courtId);

    if (!court) {
      return {
        error: "COURT_NOT_FOUND",
        message: "Court not found",
        statusCode: 404,
      };
    }

    return {
      message: "Court fetched successfully",
      statusCode: 200,
      data: court,
    };
  } catch {
    return {
      error: "FETCH_FAILED",
      message: "Failed to fetch court",
      statusCode: 500,
    };
  }
};

/**
 * Check court availability for specific date and time
 */
export const checkCourtAvailabilityAPI = async (
  courtId: string,
  date: string
): Promise<IBackendRes<ICourtAvailability>> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    const court = MOCK_COURTS.find((c) => c.venueId === courtId);

    if (!court) {
      return {
        error: "COURT_NOT_FOUND",
        message: "Court not found",
        statusCode: 404,
      };
    }

    // Mock availability data
    const availability: ICourtAvailability = {
      courtId,
      date,
      timeSlots: [
        { start: "06:00", end: "08:00", isAvailable: true, price: 300000 },
        { start: "08:00", end: "10:00", isAvailable: false, price: 300000 },
        { start: "10:00", end: "12:00", isAvailable: true, price: 300000 },
        { start: "12:00", end: "14:00", isAvailable: true, price: 300000 },
        { start: "14:00", end: "16:00", isAvailable: false, price: 300000 },
        { start: "16:00", end: "18:00", isAvailable: true, price: 400000 },
        { start: "18:00", end: "20:00", isAvailable: true, price: 400000 },
        { start: "20:00", end: "22:00", isAvailable: false, price: 400000 },
      ],
    };

    return {
      message: "Availability fetched successfully",
      statusCode: 200,
      data: availability,
    };
  } catch {
    return {
      error: "FETCH_FAILED",
      message: "Failed to fetch availability",
      statusCode: 500,
    };
  }
};

/**
 * Book a court
 */
export const bookCourtAPI = async (
  bookingData: Omit<ICourtBooking, "_id" | "createdAt" | "updatedAt">
): Promise<IBackendRes<ICourtBooking>> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  try {
    const booking: ICourtBooking = {
      _id: Date.now().toString(),
      ...bookingData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      message: "Court booked successfully",
      statusCode: 200,
      data: booking,
    };
  } catch {
    return {
      error: "BOOKING_FAILED",
      message: "Failed to book court",
      statusCode: 500,
    };
  }
};

/**
 * Get courts by venue ID
 */
export const getCourtsByVenueAPI = async (
  venueId: string
): Promise<IBackendRes<ICourt[]>> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    const courts = MOCK_COURTS.filter((court) => court.venueId === venueId);

    return {
      message: "Courts fetched successfully",
      statusCode: 200,
      data: courts,
    };
  } catch {
    return {
      error: "FETCH_FAILED",
      message: "Failed to fetch courts",
      statusCode: 500,
    };
  }
};

// Real API calls (commented out for now, replace mock functions when backend is ready)

/*
export const searchCourtsAPI = (params: ICourtFilterParams) => {
  const urlBackend = "/api/v1/courts/search";
  return axios.post<IBackendRes<ICourtSearchResponse>>(urlBackend, params);
};

export const getCourtByIdAPI = (courtId: string) => {
  const urlBackend = `/api/v1/courts/${courtId}`;
  return axios.get<IBackendRes<ICourt>>(urlBackend);
};

export const checkCourtAvailabilityAPI = (courtId: string, date: string) => {
  const urlBackend = `/api/v1/courts/${courtId}/availability?date=${date}`;
  return axios.get<IBackendRes<ICourtAvailability>>(urlBackend);
};

export const bookCourtAPI = (bookingData: Omit<ICourtBooking, "_id" | "createdAt" | "updatedAt">) => {
  const urlBackend = "/api/v1/bookings/courts";
  return axios.post<IBackendRes<ICourtBooking>>(urlBackend, bookingData);
};

export const getCourtsByVenueAPI = (venueId: string) => {
  const urlBackend = `/api/v1/venues/${venueId}/courts`;
  return axios.get<IBackendRes<ICourt[]>>(urlBackend);
};
*/

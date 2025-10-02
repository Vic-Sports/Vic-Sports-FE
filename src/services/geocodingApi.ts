import axios from "axios";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeocodingResult {
  coordinates: Coordinates;
  formattedAddress: string;
  success: boolean;
  error?: string;
}

// Using Google Maps Geocoding API directly
export const geocodingApi = {
  // Get coordinates from address string
  getCoordinatesFromAddress: async (
    address: string
  ): Promise<GeocodingResult> => {
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
        console.error("Google Maps API key not found");
        return {
          coordinates: { lat: 0, lng: 0 },
          formattedAddress: address,
          success: false,
          error: "API key not configured",
        };
      }

      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${apiKey}`
      );

      if (response.data.status === "OK" && response.data.results.length > 0) {
        const result = response.data.results[0];
        return {
          coordinates: {
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng,
          },
          formattedAddress: result.formatted_address,
          success: true,
        };
      } else {
        return {
          coordinates: { lat: 0, lng: 0 },
          formattedAddress: address,
          success: false,
          error: `Geocoding failed: ${response.data.status}`,
        };
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      return {
        coordinates: { lat: 0, lng: 0 },
        formattedAddress: address,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  // Build address string from components
  buildAddressString: (
    street: string,
    ward: string,
    district: string,
    city: string
  ): string => {
    return [street, ward, district, city].filter(Boolean).join(", ");
  },
};

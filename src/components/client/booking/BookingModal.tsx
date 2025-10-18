import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Modal,
  Row,
  Col,
  Button,
  DatePicker,
  Typography,
  Divider,
  message,
  Card,
  Tag,
  Space,
  Form,
  Checkbox,
  Spin,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  ShopOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import type { ICourt } from "@/types/court";
import type { IBookingData } from "@/types/payment";
import {
  getCourtsBySportAPI,
  getCourtAvailabilityAPI,
  getCourtsByVenueAPI,
} from "@/services/courtApi";
import { getVenueByIdAPI } from "@/services/venueApi";
import { holdBookingAPI } from "@/services/bookingApi";
import "./BookingModal.scss";

const { Title, Text } = Typography;

interface BookingModalProps {
  visible: boolean;
  onCancel: () => void;
  court: ICourt | null;
}

interface TimeSlot {
  start: string;
  end: string;
  isAvailable: boolean;
  price: number;
  // Optional map of courtId -> price for this slot when multiple courts selected
  priceByCourt?: Record<string, number>;
  // New: held slots info from API (per court)
  heldSlots?: {
    courtId?: string;
    holdUntil: string;
    bookingId?: string;
    start?: string;
    end?: string;
    reason?: string; // For synthetic holds like 'unavailable'
  }[];
}

interface CourtWithNumber extends ICourt {
  courtNumber: string;
  isSelected: boolean;
}

const BookingModal: React.FC<BookingModalProps> = ({
  visible,
  onCancel,
  court,
}) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(
    dayjs() // Allow booking from today
  );
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [selectedCourts, setSelectedCourts] = useState<string[]>([]);
  const [availableCourts, setAvailableCourts] = useState<CourtWithNumber[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [venueName, setVenueName] = useState<string>("");
  const [holdModalVisible, setHoldModalVisible] = useState<boolean>(false);
  const [holdConflicts, setHoldConflicts] = useState<
    { slotKey: string; holds: TimeSlot["heldSlots"] }[]
  >([]);

  // Helper function to get fallback price based on day type
  const getFallbackPrice = (dayType: "weekend" | "weekday"): number => {
    // Basic pricing based on day type if no specific pricing found
    return dayType === "weekend" ? 400000 : 100000;
  };

  // Load courts with same sport type
  const loadAvailableCourts = useCallback(async () => {
    if (!court) return;

    setLoading(true);
    try {
      // Load venue name first
      const venueResponse = await getVenueByIdAPI(court.venueId);
      if (venueResponse?.data?.name) {
        setVenueName(venueResponse.data.name);
      }

      // Try venue API first, then fallback to sport API if needed
      let response;
      try {
        response = await getCourtsByVenueAPI(court.venueId);
      } catch (error) {
        console.log("Venue API failed, trying sport API:", error);
        response = await getCourtsBySportAPI(court.sportType, {
          venueId: court.venueId,
        });
      }

      console.log("API Response:", response); // Debug log

      // Handle the response structure properly
      let allCourts: ICourt[] = [];

      // Handle multiple possible response structures
      if (response?.data?.courts && Array.isArray(response.data.courts)) {
        // Standard ICourtSearchResponse: { data: { courts: [...] } }
        allCourts = response.data.courts;
      } else if (
        (response as any)?.data?.data?.courts &&
        Array.isArray((response as any).data.data.courts)
      ) {
        // Nested structure: { data: { data: { courts: [...] } } }
        allCourts = (response as any).data.data.courts;
      } else if (response?.data && Array.isArray(response.data)) {
        // Direct array: { data: [...] }
        allCourts = response.data;
      } else if (
        (response as any)?.success &&
        (response as any)?.data?.courts
      ) {
        // Backend custom format: { success: true, data: { courts: [...] } }
        allCourts = (response as any).data.courts;
      }

      console.log("Processed courts:", allCourts); // Debug log
      console.log("Current court:", court); // Debug log
      console.log("Current court venueId:", court.venueId); // Debug log

      // Filter courts with same sport type and venue
      const sameSportTypeCourts = allCourts.filter((c: ICourt) => {
        const isSameSport = c.sportType === court.sportType;
        const isSameVenue =
          c.venueId === court.venueId ||
          (typeof c.venueId === "object" &&
            (c.venueId as any).id === court.venueId) ||
          (typeof c.venueId === "object" &&
            (c.venueId as any)._id === court.venueId);
        const isActive = c.isActive;

        console.log(`Court ${c.name}:`, {
          courtVenueId: c.venueId,
          currentCourtVenueId: court.venueId,
          isSameSport,
          isSameVenue,
          isActive,
          courtVenue: c.venueId,
          currentVenue: court.venueId,
        });

        return isSameSport && isSameVenue && isActive;
      });

      console.log("Filtered same sport/venue courts:", sameSportTypeCourts); // Debug log

      if (sameSportTypeCourts.length === 0) {
        console.log("No courts found for same sport type and venue");
        message.warning(`Không tìm thấy sân ${court.sportType} tại venue này`);
        setAvailableCourts([]);
        setSelectedCourts([]);
        return;
      }

      console.log("Filtered courts:", sameSportTypeCourts); // Debug log

      if (sameSportTypeCourts.length === 0) {
        console.log("No courts found matching criteria:", {
          sportType: court.sportType,
          venueId: court.venueId,
          totalCourts: allCourts.length,
        });
        // Show message to user
        message.warning(`Không tìm thấy sân ${court.sportType} tại venue này`);
      }

      // Additional safety check - only show courts from same venue
      const sameVenueCourts = sameSportTypeCourts.filter((c: ICourt) => {
        // Convert both IDs to string for comparison
        const courtVenueStr =
          typeof c.venueId === "object"
            ? (c.venueId as any)._id ||
              (c.venueId as any).id ||
              String(c.venueId)
            : String(c.venueId);
        const currentVenueStr =
          typeof court.venueId === "object"
            ? (court.venueId as any)._id ||
              (court.venueId as any).id ||
              String(court.venueId)
            : String(court.venueId);

        console.log(`Venue comparison for ${c.name}:`, {
          courtVenueStr,
          currentVenueStr,
          matches: courtVenueStr === currentVenueStr,
        });

        return courtVenueStr === currentVenueStr;
      });

      console.log("Final same venue courts:", sameVenueCourts); // Debug log

      // Sort courts by name and add court numbers
      const courtsWithNumbers: CourtWithNumber[] = sameVenueCourts
        .sort((a: ICourt, b: ICourt) => a.name.localeCompare(b.name))
        .map((c: ICourt, index: number) => {
          // Đánh số sân: có thể dùng số (1, 2, 3...) hoặc chữ (A, B, C...)
          const courtNumber =
            index < 26
              ? `Sân ${String.fromCharCode(65 + index)}` // A, B, C...
              : `Sân ${index + 1}`; // 1, 2, 3... nếu quá 26 sân

          return {
            ...c,
            courtNumber,
            isSelected: c._id === court._id, // Auto select current court
          };
        });

      setAvailableCourts(courtsWithNumbers);

      // Không chọn sân nào mặc định khi mở modal
      setSelectedCourts([]);
    } catch (error) {
      console.error("Error loading courts:", error);

      // Try to use current court as fallback
      if (court) {
        console.log("Using current court as fallback");
        const fallbackCourt: CourtWithNumber = {
          ...court,
          courtNumber: "Sân A",
          isSelected: true,
        };
        setAvailableCourts([fallbackCourt]);
        setSelectedCourts([court._id || ""]);
        message.warning("Không thể tải danh sách sân, sử dụng sân hiện tại");
      } else {
        message.error("Không thể tải danh sách sân");
      }
    } finally {
      setLoading(false);
    }
  }, [court]);

  const generateTimeSlots = useCallback(async (): Promise<TimeSlot[]> => {
    if (!court || !selectedDate || selectedCourts.length === 0) return [];

    const selectedDayOfWeek = selectedDate.day(); // 0 = Sunday, 1 = Monday, ...

    // Check if SELECTED courts are open on selected day
    const selectedCourtsData = availableCourts.filter((courtItem) =>
      selectedCourts.includes(courtItem._id || "")
    );

    const selectedCourtsOpenToday = selectedCourtsData.filter((courtItem) => {
      const dayAvailability = courtItem.defaultAvailability.find(
        (day) => day.dayOfWeek === selectedDayOfWeek
      );

      const isOpen =
        dayAvailability &&
        dayAvailability.timeSlots.some((slot) => slot.isAvailable);

      return isOpen;
    });

    // NEW BUSINESS LOGIC: If ANY selected court is closed, show NO time slots
    if (selectedCourtsOpenToday.length < selectedCourtsData.length) {
      setAvailableTimeSlots([]);
      return [];
    }

    if (selectedCourtsOpenToday.length === 0) {
      setAvailableTimeSlots([]);
      return [];
    }

    // Get operating hours for SELECTED courts on selected day
    // For multiple courts, find intersection of operating hours
    const operatingRanges = selectedCourtsOpenToday
      .map((courtItem) => {
        const dayAvailability = courtItem.defaultAvailability.find(
          (day) => day.dayOfWeek === selectedDayOfWeek
        );
        return dayAvailability?.timeSlots || [];
      })
      .flat();

    if (operatingRanges.length === 0) {
      setAvailableTimeSlots([]);
      return [];
    }

    // For multiple courts, find common operating hours
    let commonOperatingHours = { start: 6, end: 22 }; // Default range

    if (selectedCourtsOpenToday.length > 1) {
      // Find intersection of all courts' operating hours
      const allRanges = selectedCourtsOpenToday.map((courtItem) => {
        const dayAvailability = courtItem.defaultAvailability.find(
          (day) => day.dayOfWeek === selectedDayOfWeek
        );
        if (!dayAvailability?.timeSlots?.length) return { start: 0, end: 0 };

        const slots = dayAvailability.timeSlots;
        const minStart = Math.min(
          ...slots.map((s) => parseInt(s.start.split(":")[0]))
        );
        const maxEnd = Math.max(
          ...slots.map((s) => parseInt(s.end.split(":")[0]))
        );
        return { start: minStart, end: maxEnd };
      });

      // Find intersection (latest start, earliest end)
      commonOperatingHours = {
        start: Math.max(...allRanges.map((r) => r.start)),
        end: Math.min(...allRanges.map((r) => r.end)),
      };

      if (commonOperatingHours.start >= commonOperatingHours.end) {
        // No common operating hours
        setAvailableTimeSlots([]);
        return [];
      }
    } else if (selectedCourtsOpenToday.length === 1) {
      // Single court - use its operating hours
      const courtSlots = operatingRanges;
      if (courtSlots.length > 0) {
        commonOperatingHours = {
          start: Math.min(
            ...courtSlots.map((s) => parseInt(s.start.split(":")[0]))
          ),
          end: Math.max(
            ...courtSlots.map((s) => parseInt(s.end.split(":")[0]))
          ),
        };
      }
    }

    const timeSlots: TimeSlot[] = [];

    try {
      // Get availability data for selected courts
      const availabilityPromises = selectedCourts.map((courtId) =>
        getCourtAvailabilityAPI(courtId, selectedDate.format("YYYY-MM-DD"))
      );

      const availabilityResponses = await Promise.all(availabilityPromises);

      // Generate time slots based on common operating hours
      console.log("Common operating hours:", commonOperatingHours);
      console.log("Selected date:", selectedDate.format("YYYY-MM-DD"));
      console.log("Current time:", dayjs().format("YYYY-MM-DD HH:mm"));

      for (
        let hour = commonOperatingHours.start;
        hour < commonOperatingHours.end;
        hour++
      ) {
        const start = `${hour.toString().padStart(2, "0")}:00`;
        const end = `${(hour + 1).toString().padStart(2, "0")}:00`;

        // Check if time slot has passed (for today only)
        const isToday = selectedDate.isSame(dayjs(), "day");
        let hasTimePassed = false;

        if (isToday) {
          const currentHour = dayjs().hour();
          const currentMinute = dayjs().minute();
          const timeSlotHour = parseInt(start.split(":")[0]);

          // Mark as passed if slot has started or already finished
          hasTimePassed =
            timeSlotHour < currentHour ||
            (timeSlotHour === currentHour && currentMinute > 0);

          console.log(
            `Slot ${start}-${end}: currentHour=${currentHour}, timeSlotHour=${timeSlotHour}, hasTimePassed=${hasTimePassed}`
          );
        }

        // Find pricing for this time slot
        const dayOfWeek = selectedDate.day();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const dayType = isWeekend ? "weekend" : "weekday";

        // Improved pricing logic - find matching time slot or use default for day type
        let pricing = court.pricing.find((p) => {
          // Handle cases where timeSlot might be empty object {}
          const pricingStart = p.timeSlot?.start;
          const pricingEnd = p.timeSlot?.end;

          // Skip if timeSlot is invalid/empty
          if (!pricingStart || !pricingEnd) {
            return false;
          }

          // Check if current time slot overlaps with pricing time slot
          const isTimeOverlap = start >= pricingStart && end <= pricingEnd;
          const isDayTypeMatch = p.dayType === dayType;
          const isActive = p.isActive !== false; // Default to true if undefined

          return isTimeOverlap && isDayTypeMatch && isActive;
        });

        // If no exact match, find any active pricing for the day type (even with invalid timeSlot)
        if (!pricing) {
          pricing = court.pricing.find(
            (p) =>
              p.dayType === dayType &&
              p.isActive !== false &&
              p.pricePerHour > 0
          );
        }

        // If still no match, use first active pricing (even with invalid timeSlot)
        if (!pricing) {
          pricing = court.pricing.find(
            (p) => p.isActive !== false && p.pricePerHour > 0
          );
        }

        // Final fallback - use any pricing with valid price
        if (!pricing && court.pricing.length > 0) {
          pricing =
            court.pricing.find((p) => p.pricePerHour > 0) || court.pricing[0];
        }

        // Debug logging
        console.log(`Time slot ${start}-${end}:`, {
          dayType,
          pricing: pricing
            ? {
                timeSlot: pricing.timeSlot,
                timeSlotValid: !!(
                  pricing.timeSlot?.start && pricing.timeSlot?.end
                ),
                pricePerHour: pricing.pricePerHour,
                dayType: pricing.dayType,
                isActive: pricing.isActive,
              }
            : "No pricing found",
          allCourtPricing: court.pricing.map((p) => ({
            timeSlot: p.timeSlot,
            timeSlotValid: !!(p.timeSlot?.start && p.timeSlot?.end),
            pricePerHour: p.pricePerHour,
            dayType: p.dayType,
            isActive: p.isActive,
          })),
        });

        // Logic hiển thị khung giờ trống theo số sân được chọn
        let isAvailable = false;
        // Collect held slots for this time slot (from API)
        const heldSlotsForThisSlot: {
          courtId?: string;
          holdUntil: string;
          bookingId?: string;
          start?: string;
          end?: string;
        }[] = [];

        // If time slot has passed, mark as unavailable regardless of API response
        if (hasTimePassed) {
          isAvailable = false;
          console.log(
            `Slot ${start}-${end} marked unavailable because time has passed`
          );
        } else {
          // Check availability from API for future time slots
          if (selectedCourts.length === 1) {
            // Nếu chỉ chọn 1 sân, hiển thị khung giờ trống của sân đó
            const availability = availabilityResponses[0];
            const timeSlotData = availability?.data?.timeSlots?.find(
              (slot) => slot.start === start && slot.end === end
            );
            // Check heldSlots from API (backend returns heldSlots per court)
            const held =
              (availability?.data as any)?.heldSlots?.find(
                (h: any) =>
                  h.start === start &&
                  h.end === end &&
                  dayjs(h.holdUntil).isAfter(dayjs())
              ) || null;

            if (held) {
              heldSlotsForThisSlot.push({
                courtId: selectedCourts[0],
                holdUntil: held.holdUntil,
                bookingId: held.bookingId,
                start: held.start,
                end: held.end,
              });
            }

            isAvailable =
              !held && (timeSlotData?.isAvailable === true || false);

            console.log(`Slot ${start}-${end} availability:`, {
              timeSlotData,
              isAvailable,
              allTimeSlots: availability?.data?.timeSlots,
            });
          } else {
            // Nếu chọn nhiều sân, chỉ hiển thị khung giờ trống chung của tất cả các sân
            // Khung giờ chỉ available nếu TẤT CẢ các sân đều trống cùng lúc
            // Nếu chọn nhiều sân, chỉ hiển thị khung giờ trống chung của tất cả các sân
            // Khung giờ chỉ available nếu TẤT CẢ các sân đều trống cùng lúc và không có hold
            let allAvailable = true;

            for (let i = 0; i < availabilityResponses.length; i++) {
              const availability = availabilityResponses[i];
              const courtId = selectedCourts[i];

              const timeSlotData = availability?.data?.timeSlots?.find(
                (slot) => slot.start === start && slot.end === end
              );

              const held =
                (availability?.data as any)?.heldSlots?.find(
                  (h: any) =>
                    h.start === start &&
                    h.end === end &&
                    dayjs(h.holdUntil).isAfter(dayjs())
                ) || null;

              if (held) {
                heldSlotsForThisSlot.push({
                  courtId,
                  holdUntil: held.holdUntil,
                  bookingId: held.bookingId,
                  start: held.start,
                  end: held.end,
                });
              }

              // If any court either not available or held -> not available for combined booking
              if (!timeSlotData?.isAvailable || held) {
                allAvailable = false;
              }
            }

            isAvailable = allAvailable;
          }
        }

        // TEMPORARY DEBUG: Force availability to true for testing (only for future slots)
        if (start === "22:00" && end === "23:00" && !hasTimePassed) {
          console.log(
            `FORCING slot ${start}-${end} to be available for testing`
          );
          // don't override if it's held - respect holds
          if (heldSlotsForThisSlot.length === 0) {
            isAvailable = true;
          }
        }

        // Compute per-court prices from availability API when possible
        const priceByCourt: Record<string, number> = {};
        if (selectedCourts.length >= 1) {
          for (let i = 0; i < selectedCourts.length; i++) {
            const courtId = selectedCourts[i];
            const availability = availabilityResponses[i];
            const timeSlotData = availability?.data?.timeSlots?.find(
              (slot) => slot.start === start && slot.end === end
            );

            // Prefer availability API price but only if it's a positive number
            let perCourtPrice: number | undefined =
              typeof timeSlotData?.price === "number" && timeSlotData.price > 0
                ? timeSlotData.price
                : undefined;

            // Fallback to court pricing if availability API didn't return a positive price
            if (typeof perCourtPrice !== "number" || perCourtPrice <= 0) {
              // Find pricing from the court object
              const courtObj = selectedCourtsData.find(
                (c) => c._id === courtId
              ) as any;
              if (courtObj && Array.isArray(courtObj.pricing)) {
                // Try to match pricing same as earlier logic (timeSlot/dayType)
                let courtPricing = courtObj.pricing.find((p: any) => {
                  const pricingStart = p.timeSlot?.start;
                  const pricingEnd = p.timeSlot?.end;
                  if (!pricingStart || !pricingEnd) return false;
                  return (
                    start >= pricingStart &&
                    end <= pricingEnd &&
                    p.dayType === dayType &&
                    p.isActive !== false &&
                    typeof p.pricePerHour === "number" &&
                    p.pricePerHour > 0
                  );
                });

                if (!courtPricing) {
                  courtPricing = courtObj.pricing.find(
                    (p: any) =>
                      p.dayType === dayType &&
                      p.isActive !== false &&
                      typeof p.pricePerHour === "number" &&
                      p.pricePerHour > 0
                  );
                }

                if (!courtPricing) {
                  courtPricing = courtObj.pricing.find(
                    (p: any) =>
                      p.isActive !== false &&
                      typeof p.pricePerHour === "number" &&
                      p.pricePerHour > 0
                  );
                }

                if (
                  courtPricing &&
                  typeof courtPricing.pricePerHour === "number" &&
                  courtPricing.pricePerHour > 0
                ) {
                  perCourtPrice = courtPricing.pricePerHour;
                }
              }
            }

            // Final fallback if still not a positive number
            if (typeof perCourtPrice !== "number" || perCourtPrice <= 0) {
              perCourtPrice = getFallbackPrice(dayType);
            }

            priceByCourt[courtId] = perCourtPrice;
          }
        }

        // Sum per-court prices for the slot as the slot's total price
        const summedSlotPrice = Object.values(priceByCourt).reduce(
          (s, v) => s + v,
          0
        );

        timeSlots.push({
          start,
          end,
          isAvailable,
          price:
            selectedCourts.length > 1
              ? summedSlotPrice
              : priceByCourt[selectedCourts[0]] || getFallbackPrice(dayType),
          priceByCourt: Object.keys(priceByCourt).length
            ? priceByCourt
            : undefined,
          heldSlots: heldSlotsForThisSlot.length
            ? heldSlotsForThisSlot
            : undefined,
        });

        console.log(`Added time slot ${start}-${end}:`, {
          isAvailable,
          price:
            selectedCourts.length > 1
              ? summedSlotPrice
              : priceByCourt[selectedCourts[0]] ||
                pricing?.pricePerHour ||
                getFallbackPrice(dayType),
        });
      }

      console.log("Final time slots created:", timeSlots);
      setAvailableTimeSlots(timeSlots);
      return timeSlots;

      // Show warning if fallback prices were used due to invalid pricing data
      const hasInvalidPricing = court!.pricing.some(
        (p) =>
          !p.timeSlot?.start ||
          !p.timeSlot?.end ||
          !p.pricePerHour ||
          p.pricePerHour <= 0
      );

      if (hasInvalidPricing) {
        console.warn(
          "Court has invalid pricing data, using fallback prices:",
          court!.pricing
        );
      }
    } catch (error) {
      console.error("Error loading time slots:", error);

      // Only create fallback slots if there are courts open today
      if (selectedCourtsOpenToday.length === 0) {
        console.log("No courts open today, not creating fallback slots");
        setAvailableTimeSlots([]);
        return [];
      }

      // Fallback to mock data if API fails - use common operating hours
      const timeSlots: TimeSlot[] = [];

      for (
        let hour = commonOperatingHours.start;
        hour < commonOperatingHours.end;
        hour++
      ) {
        const start = `${hour.toString().padStart(2, "0")}:00`;
        const end = `${(hour + 1).toString().padStart(2, "0")}:00`;

        // Check if time slot has passed (for today only) - don't skip, just mark unavailable
        const isToday = selectedDate.isSame(dayjs(), "day");
        let hasTimePassed = false;

        if (isToday) {
          const currentHour = dayjs().hour();
          const currentMinute = dayjs().minute();
          const timeSlotHour = parseInt(start.split(":")[0]);

          hasTimePassed =
            timeSlotHour < currentHour ||
            (timeSlotHour === currentHour && currentMinute > 0);
        }

        const dayOfWeek = selectedDate.day();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const dayType = isWeekend ? "weekend" : "weekday";

        // Improved pricing logic for fallback
        let pricing = court.pricing.find((p) => {
          // Handle cases where timeSlot might be empty object {}
          const pricingStart = p.timeSlot?.start;
          const pricingEnd = p.timeSlot?.end;

          // Skip if timeSlot is invalid/empty
          if (!pricingStart || !pricingEnd) {
            return false;
          }

          const isTimeOverlap = start >= pricingStart && end <= pricingEnd;
          const isDayTypeMatch = p.dayType === dayType;
          const isActive = p.isActive !== false;

          return isTimeOverlap && isDayTypeMatch && isActive;
        });

        // If no exact match, find any active pricing for the day type (even with invalid timeSlot)
        if (!pricing) {
          pricing = court.pricing.find(
            (p) =>
              p.dayType === dayType &&
              p.isActive !== false &&
              p.pricePerHour > 0
          );
        }

        // If still no match, use first active pricing (even with invalid timeSlot)
        if (!pricing) {
          pricing = court.pricing.find(
            (p) => p.isActive !== false && p.pricePerHour > 0
          );
        }

        // Final fallback - use any pricing with valid price
        if (!pricing && court.pricing.length > 0) {
          pricing =
            court.pricing.find((p) => p.pricePerHour > 0) || court.pricing[0];
        }

        // Debug logging for fallback
        console.log(`Fallback time slot ${start}-${end}:`, {
          dayType,
          pricing: pricing
            ? {
                timeSlot: pricing.timeSlot,
                timeSlotValid: !!(
                  pricing.timeSlot?.start && pricing.timeSlot?.end
                ),
                pricePerHour: pricing.pricePerHour,
                dayType: pricing.dayType,
                isActive: pricing.isActive,
              }
            : "No pricing found",
        });

        // Fallback availability simulation
        let isAvailable = false;

        // If time slot has passed, mark as unavailable
        if (hasTimePassed) {
          isAvailable = false;
        } else {
          // Simulate availability for future time slots
          if (selectedCourts.length === 1) {
            isAvailable = Math.random() > 0.3; // 70% availability simulation
          } else {
            isAvailable = Math.random() > 0.6; // 40% availability cho khung giờ chung
          }
        }

        timeSlots.push({
          start,
          end,
          isAvailable,
          price:
            pricing?.pricePerHour && pricing.pricePerHour > 0
              ? pricing.pricePerHour
              : getFallbackPrice(dayType), // Use fallback price based on day type
        });
      }
      setAvailableTimeSlots(timeSlots);

      // Show warning for fallback pricing
      console.warn("Using fallback time slots and pricing due to API error");
      return timeSlots;
    }
  }, [court, selectedDate, selectedCourts, availableCourts]);

  useEffect(() => {
    if (visible && court) {
      loadAvailableCourts();
    }
  }, [visible, court, loadAvailableCourts]);

  // Check and deselect courts that are not open on selected date
  // DISABLED: Allow user to select any court, just don't show time slots
  /*
  useEffect(() => {
    if (selectedDate && availableCourts.length > 0 && selectedCourts.length > 0) {
      const selectedDayOfWeek = selectedDate.day();
      
      const validSelectedCourts = selectedCourts.filter(courtId => {
        const courtData = availableCourts.find(c => c._id === courtId);
        if (!courtData) return false;
        
        const dayAvailability = courtData.defaultAvailability.find(
          day => day.dayOfWeek === selectedDayOfWeek
        );
        
        return dayAvailability && dayAvailability.timeSlots.some(slot => slot.isAvailable);
      });
      
      if (validSelectedCourts.length !== selectedCourts.length) {
        console.log("Deselecting courts that are not open on selected day");
        setSelectedCourts(validSelectedCourts);
        
        if (validSelectedCourts.length === 0) {
          message.warning(`Các sân đã chọn không mở cửa vào ${selectedDate.format("dddd, DD/MM/YYYY")}. Vui lòng chọn sân khác.`);
        }
      }
    }
  }, [selectedDate, availableCourts, selectedCourts]);
  */

  useEffect(() => {
    if (visible && court && selectedDate) {
      generateTimeSlots();
    }
  }, [visible, court, selectedDate, generateTimeSlots]);

  const handleCourtSelection = (courtId: string, checked: boolean) => {
    setSelectedCourts((prev) => {
      let newSelection;
      if (checked) {
        newSelection = [...prev, courtId];
      } else {
        newSelection = prev.filter((id) => id !== courtId);
      }

      // Reset selected time slots when court selection changes
      setSelectedTimeSlots([]);
      return newSelection;
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleDateChange = (date: Dayjs | null) => {
    if (date && (date.isAfter(dayjs(), "day") || date.isSame(dayjs(), "day"))) {
      setSelectedDate(date);
      setSelectedTimeSlots([]); // Reset selected time slots when date changes
    } else {
      message.warning("Vui lòng chọn ngày từ hôm nay trở đi");
    }
  };

  const handleTimeSlotToggle = (timeSlotKey: string) => {
    setSelectedTimeSlots((prev) => {
      if (prev.includes(timeSlotKey)) {
        return prev.filter((slot) => slot !== timeSlotKey);
      } else {
        return [...prev, timeSlotKey];
      }
    });
  };

  const getSelectedSlotsDetails = () => {
    return selectedTimeSlots
      .map((slotKey) => {
        return availableTimeSlots.find(
          (slot) => `${slot.start}-${slot.end}` === slotKey
        );
      })
      .filter(Boolean) as TimeSlot[];
  };

  const calculateTotal = () => {
    const selectedSlots = getSelectedSlotsDetails();
    // If priceByCourt exists, sum per-court prices for each slot; otherwise use slot.price
    const totalPrice = selectedSlots.reduce((sum, slot) => {
      if (slot.priceByCourt && selectedCourts.length > 0) {
        // Sum prices only for selected courts (ensure order matches)
        const perSlotSum = selectedCourts.reduce((s, courtId) => {
          return s + (slot.priceByCourt?.[courtId] || 0);
        }, 0);
        return sum + perSlotSum;
      }
      // slot.price already represents single-court price or summed price
      return sum + (slot.price || 0);
    }, 0);

    return totalPrice;
  };

  const handleProceedToBooking = async () => {
    if (!selectedDate || selectedTimeSlots.length === 0) {
      message.warning("Vui lòng chọn ngày và ít nhất một khung giờ");
      return;
    }

    if (selectedCourts.length === 0) {
      message.warning("Vui lòng chọn ít nhất một sân");
      return;
    }

    // Prepare booking data
    const selectedSlots = getSelectedSlotsDetails();

    // FE check: if any selected slot is currently held, show modal and refresh UI
    const conflicts = selectedSlots
      .map((slot) => {
        const slotKey = `${slot.start}-${slot.end}`;
        const activeHolds = (slot.heldSlots || []).filter((h) =>
          dayjs(h!.holdUntil).isAfter(dayjs())
        );
        return activeHolds.length ? { slotKey, holds: activeHolds } : null;
      })
      .filter(Boolean) as { slotKey: string; holds: TimeSlot["heldSlots"] }[];

    if (conflicts.length > 0) {
      setHoldConflicts(conflicts);
      setHoldModalVisible(true);
      // Refresh availability UI
      try {
        // generateTimeSlots returns refreshed slots
        await generateTimeSlots();
      } catch (err) {
        console.error("Error refreshing time slots after hold conflict:", err);
      }
      return;
    }
    const bookingData: IBookingData = {
      courtIds: selectedCourts, // Thay đổi từ courtId thành courtIds
      courtNames: availableCourts
        .filter((c) => selectedCourts.includes(c._id || ""))
        .map((c) => `${c.courtNumber} (${c.name})`)
        .join(", "),
      date: selectedDate.format("YYYY-MM-DD"),
      timeSlots: selectedSlots.map((slot) => ({
        start: slot.start,
        end: slot.end,
        price: slot.price,
      })),
      courtQuantity: selectedCourts.length,
      totalPrice: calculateTotal(),
      venue: court?.venueId || "",
    };

    // Navigate to booking page with booking data
    // First, call backend to create a short-term hold for this booking
    // Backend is expected to set holdUntil = now + 5 minutes and return bookingId (optional)
    try {
      // Final server-side availability check to avoid race where local state is stale
      try {
        const availabilityResponses = await Promise.all(
          selectedCourts.map((courtId) =>
            getCourtAvailabilityAPI(courtId, bookingData.date)
          )
        );

        // Check for ANY active hold on selected time slots across all selected courts
        const serverConflicts: { slotKey: string; holds: any[] }[] = [];

        // For each selected time slot, check all courts
        for (const slot of selectedSlots) {
          const slotKey = `${slot.start}-${slot.end}`;
          const holds: any[] = [];

          for (let i = 0; i < availabilityResponses.length; i++) {
            const resp = availabilityResponses[i];
            const courtId = selectedCourts[i];

            // Check if this court has any held slots for this time
            const heldSlots = (resp?.data as any)?.heldSlots || [];

            for (const h of heldSlots) {
              if (
                h.start === slot.start &&
                h.end === slot.end &&
                dayjs(h.holdUntil).isAfter(dayjs())
              ) {
                holds.push({ courtId, ...h });
                console.log(
                  `Server conflict detected: Court ${courtId}, slot ${slotKey}, hold until ${h.holdUntil}`
                );
              }
            }

            // Also check if the slot is marked as unavailable (could indicate a booking)
            const timeSlotData = resp?.data?.timeSlots?.find(
              (ts: any) => ts.start === slot.start && ts.end === slot.end
            );

            if (timeSlotData && !timeSlotData.isAvailable) {
              console.log(
                `Server conflict detected: Court ${courtId}, slot ${slotKey} is not available`
              );
              // Add a synthetic hold entry for unavailable slots
              holds.push({
                courtId,
                start: slot.start,
                end: slot.end,
                holdUntil: dayjs().add(1, "hour").toISOString(),
                reason: "unavailable",
              });
            }
          }

          if (holds.length > 0) {
            serverConflicts.push({ slotKey, holds });
          }
        }

        if (serverConflicts.length > 0) {
          console.log("Server conflicts found:", serverConflicts);

          // Automatically remove conflicted time slots from selection
          const conflictedSlotKeys = serverConflicts.map((c) => c.slotKey);
          const remainingSlots = selectedTimeSlots.filter(
            (slotKey) => !conflictedSlotKeys.includes(slotKey)
          );

          setSelectedTimeSlots(remainingSlots);
          setHoldConflicts(serverConflicts);
          setHoldModalVisible(true);

          // Show message about removed slots
          if (conflictedSlotKeys.length === 1) {
            message.warning(
              `Đã bỏ chọn khung giờ ${conflictedSlotKeys[0]} vì đang bị giữ`
            );
          } else {
            message.warning(
              `Đã bỏ chọn ${
                conflictedSlotKeys.length
              } khung giờ bị giữ: ${conflictedSlotKeys.join(", ")}`
            );
          }

          // Refresh availability UI
          try {
            await generateTimeSlots();
          } catch (e) {
            console.error(
              "Error refreshing time slots after server conflict:",
              e
            );
          }
          return;
        }

        console.log(
          "No server conflicts detected, proceeding with hold request"
        );
      } catch (e) {
        console.error("Server availability check failed:", e);
        message.error(
          "Không thể kiểm tra trạng thái khung giờ, vui lòng thử lại"
        );
        return;
      }

      const holdRequestPayload = {
        venueId: bookingData.venue,
        courtIds: bookingData.courtIds,
        date: bookingData.date,
        timeSlots: bookingData.timeSlots.map((ts) => ({
          startTime: ts.start,
          endTime: ts.end,
          price: ts.price,
        })),
      };

      // Fire the hold request and await response
      console.log(
        "Attempting to create hold with payload:",
        holdRequestPayload
      );
      const holdResp = await holdBookingAPI(holdRequestPayload);
      console.log("Hold API response:", holdResp);

      const holdData = (holdResp?.data as any) || {};

      // Treat backend response as success if it does not explicitly set success=false
      const isSuccess = holdData && holdData.success !== false;
      console.log("Hold success status:", isSuccess, "holdData:", holdData);

      if (!isSuccess) {
        message.error(`Không thể giữ khung giờ: ${holdData.message || "Lỗi"}`);
        // Refresh availability UI to reflect current server state
        try {
          await generateTimeSlots();
        } catch (e) {
          console.error("Error refreshing time slots after failed hold:", e);
        }
        return;
      }

      // Optionally retrieve bookingId returned from hold endpoint
      const bookingId =
        holdData?.data?.bookingId || holdData?.bookingId || null;

      // Calculate holdUntil time (backend sets 5-minute hold from now)
      const holdUntil = dayjs().add(5, "minutes").toISOString();

      // Save hold information to sessionStorage for reload recovery
      const holdInfo = {
        bookingData,
        bookingId,
        holdUntil,
        timestamp: dayjs().toISOString(),
      };
      sessionStorage.setItem("booking_hold_info", JSON.stringify(holdInfo));

      // Navigate immediately based on hold success. We consider BE's response authoritative.
      navigate("/booking", {
        state: { bookingData, bookingId, holdUntil },
      });

      onCancel(); // Close modal

      // Refresh availability in background to update UI for other users
      generateTimeSlots().catch((err) => {
        console.error("Background refresh of time slots failed:", err);
      });
    } catch (err: any) {
      console.error("Hold request failed:", err);
      message.error("Không thể giữ khung giờ, vui lòng thử lại");
    }
  };

  const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().startOf("day");
  };

  if (!court) return null;

  return (
    <Modal
      title={
        <div className="booking-modal-header">
          <ShopOutlined />
          <span>Đặt sân {court.sportType}</span>
          {availableCourts.length > 0 && (
            <Text
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: "12px",
                marginLeft: "8px",
              }}
            >
              ({availableCourts.length} sân khả dụng)
            </Text>
          )}
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={900}
      footer={null}
      className="booking-modal"
      destroyOnClose
    >
      <Spin spinning={loading}>
        <div className="booking-modal-content">
          {/* Current Court Info */}
          <Card size="small" className="court-info-card">
            <Row align="middle" gutter={[16, 8]}>
              <Col>
                <Tag color="blue" icon={<TeamOutlined />}>
                  {court.capacity} người
                </Tag>
              </Col>
              <Col>
                <Tag color="green">{court.courtType}</Tag>
              </Col>
              <Col>
                <Tag color="orange">{court.sportType}</Tag>
              </Col>
            </Row>
          </Card>

          <Form form={form} layout="vertical">
            {/* Step 1: Court Selection */}
            <Form.Item
              label={
                <span>
                  <Text strong style={{ fontSize: "16px" }}>
                    Bước 1: Chọn sân
                  </Text>
                  <Text
                    type="secondary"
                    style={{ marginLeft: "8px", fontSize: "14px" }}
                  >
                    (Chọn một hoặc nhiều sân để đặt)
                  </Text>
                </span>
              }
              required
            >
              <Card size="small" className="court-selection-card">
                <Text
                  type="secondary"
                  style={{ marginBottom: 12, display: "block" }}
                >
                  Tất cả sân {court.sportType} tại {venueName || court.venueId}:
                </Text>
                {availableCourts.length === 0 && !loading ? (
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <Text type="secondary">
                      Không tìm thấy sân {court.sportType} khả dụng tại venue
                      này
                    </Text>
                  </div>
                ) : (
                  <>
                    <Row gutter={[12, 12]}>
                      {availableCourts.map((c) => (
                        <Col xs={12} sm={8} md={6} key={c._id}>
                          <Card
                            size="small"
                            className={`court-selection-item ${
                              selectedCourts.includes(c._id || "")
                                ? "selected"
                                : ""
                            }`}
                            onClick={() =>
                              handleCourtSelection(
                                c._id || "",
                                !selectedCourts.includes(c._id || "")
                              )
                            }
                            hoverable
                          >
                            <div style={{ textAlign: "center" }}>
                              <Checkbox
                                checked={selectedCourts.includes(c._id || "")}
                                onChange={(e) =>
                                  handleCourtSelection(
                                    c._id || "",
                                    e.target.checked
                                  )
                                }
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div style={{ marginTop: 4 }}>
                                <Text strong>{c.courtNumber}</Text>
                                <br />
                                <Text
                                  type="secondary"
                                  style={{ fontSize: "12px" }}
                                >
                                  {c.name}
                                </Text>
                              </div>
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </>
                )}

                {selectedCourts.length > 0 && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: "8px 12px",
                      background: "#f6ffed",
                      borderRadius: "6px",
                      border: "1px solid #b7eb8f",
                    }}
                  >
                    <Text strong style={{ color: "#52c41a" }}>
                      Đã chọn {selectedCourts.length} sân:{" "}
                    </Text>
                    <Text>
                      {availableCourts
                        .filter((c) => selectedCourts.includes(c._id || ""))
                        .map((c) => c.courtNumber)
                        .join(", ")}
                    </Text>
                  </div>
                )}
              </Card>
            </Form.Item>

            {/* Step 2: Date Selection */}
            <Form.Item
              label={
                <span>
                  <Text strong style={{ fontSize: "16px" }}>
                    Bước 2: Chọn ngày
                  </Text>
                </span>
              }
              required
            >
              <DatePicker
                value={selectedDate}
                onChange={handleDateChange}
                disabledDate={disabledDate}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày"
                style={{ width: "100%" }}
                suffixIcon={<CalendarOutlined />}
              />
            </Form.Item>

            {/* Step 3: Time Slots */}
            {selectedCourts.length > 0 ? (
              <Form.Item
                label={
                  <span>
                    <Text strong style={{ fontSize: "16px" }}>
                      Bước 3: Chọn khung giờ
                    </Text>
                    <Text
                      type="secondary"
                      style={{ marginLeft: "8px", fontSize: "14px" }}
                    >
                      (Chọn một hoặc nhiều khung giờ)
                    </Text>
                  </span>
                }
                required
              >
                <Card size="small">
                  {selectedCourts.length === 1 ? (
                    <Text
                      type="secondary"
                      style={{ marginBottom: 12, display: "block" }}
                    >
                      Khung giờ trống của{" "}
                      {
                        availableCourts.find((c) => c._id === selectedCourts[0])
                          ?.courtNumber
                      }
                      :
                    </Text>
                  ) : (
                    <Text
                      type="secondary"
                      style={{ marginBottom: 12, display: "block" }}
                    >
                      Khung giờ trống chung của {selectedCourts.length} sân đã
                      chọn:
                    </Text>
                  )}

                  <div className="time-slots-container">
                    {availableTimeSlots.length === 0 ? (
                      <div
                        style={{ textAlign: "center", padding: "40px 20px" }}
                      >
                        <ClockCircleOutlined
                          style={{
                            fontSize: "48px",
                            color: "#d9d9d9",
                            marginBottom: "16px",
                          }}
                        />
                        <br />
                        <Text type="secondary" style={{ fontSize: "16px" }}>
                          Sân đã chọn không mở cửa vào{" "}
                          {selectedDate?.format("dddd, DD/MM/YYYY")}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: "14px" }}>
                          Vui lòng chọn ngày khác hoặc chọn sân khác
                        </Text>
                      </div>
                    ) : (
                      <div className="time-slots-grid">
                        {availableTimeSlots.map((slot) => {
                          const slotKey = `${slot.start}-${slot.end}`;
                          const isSelected =
                            selectedTimeSlots.includes(slotKey);

                          // Check if this slot has passed (for today only)
                          const isToday = selectedDate?.isSame(dayjs(), "day");
                          const hasPassed =
                            isToday &&
                            (() => {
                              const currentHour = dayjs().hour();
                              const currentMinute = dayjs().minute();
                              const slotHour = parseInt(
                                slot.start.split(":")[0]
                              );
                              return (
                                slotHour < currentHour ||
                                (slotHour === currentHour && currentMinute > 0)
                              );
                            })();

                          // Check if slot is held (active holdUntil)
                          const slotHeld = (slot.heldSlots || []).some((h) =>
                            dayjs(h.holdUntil).isAfter(dayjs())
                          );
                          const firstHoldUntil =
                            slot.heldSlots && slot.heldSlots[0]?.holdUntil;
                          const holdUntilLabel = firstHoldUntil
                            ? dayjs(firstHoldUntil).format("HH:mm")
                            : null;

                          return (
                            <Button
                              key={slotKey}
                              className={`time-slot-btn ${
                                isSelected ? "selected" : ""
                              } ${!slot.isAvailable ? "disabled" : ""}`}
                              disabled={!slot.isAvailable}
                              onClick={() => handleTimeSlotToggle(slotKey)}
                              size="small"
                              title={
                                !slot.isAvailable
                                  ? hasPassed
                                    ? "Khung giờ đã qua"
                                    : slotHeld
                                    ? holdUntilLabel
                                      ? `Đang giữ đến ${holdUntilLabel}`
                                      : "Đang giữ"
                                    : "Khung giờ đã được đặt"
                                  : `Đặt khung giờ ${slot.start} - ${slot.end}`
                              }
                            >
                              <div className="time-slot-content">
                                <div className="time-slot-time">
                                  <ClockCircleOutlined />
                                  {slot.start} - {slot.end}
                                  {hasPassed && (
                                    <span
                                      style={{
                                        marginLeft: "4px",
                                        fontSize: "10px",
                                        opacity: 0.7,
                                      }}
                                    >
                                      (Đã qua)
                                    </span>
                                  )}
                                  {slotHeld && !hasPassed && (
                                    <span
                                      style={{
                                        marginLeft: "6px",
                                        fontSize: "11px",
                                        color: "#faad14",
                                      }}
                                    >
                                      (Đang giữ đến {holdUntilLabel || "?"})
                                    </span>
                                  )}
                                </div>
                                <div className="time-slot-price">
                                  {slot.priceByCourt &&
                                  selectedCourts.length > 1 ? (
                                    (() => {
                                      const perCourtPrices = selectedCourts.map(
                                        (id) => ({
                                          id,
                                          price: slot.priceByCourt?.[id] || 0,
                                          courtNumber:
                                            availableCourts.find(
                                              (c) => c._id === id
                                            )?.courtNumber || id,
                                        })
                                      );

                                      const uniquePrices = new Set(
                                        perCourtPrices.map((p) => p.price)
                                      );

                                      // If prices differ between courts, show breakdown
                                      if (uniquePrices.size > 1) {
                                        return (
                                          <div className="per-court-prices">
                                            <div className="per-court-list">
                                              {perCourtPrices.map((p) => (
                                                <div
                                                  className="per-court-price"
                                                  key={p.id}
                                                >
                                                  <span className="court-number">
                                                    {p.courtNumber}:
                                                  </span>
                                                  <span className="court-price">
                                                    {formatCurrency(p.price)}
                                                  </span>
                                                </div>
                                              ))}
                                            </div>
                                            <div className="per-court-total">
                                              Tổng:{" "}
                                              {formatCurrency(
                                                perCourtPrices.reduce(
                                                  (s, p) => s + p.price,
                                                  0
                                                )
                                              )}
                                            </div>
                                          </div>
                                        );
                                      }

                                      // Otherwise show the slot price (single value)
                                      return <>{formatCurrency(slot.price)}</>;
                                    })()
                                  ) : (
                                    <>{formatCurrency(slot.price)}</>
                                  )}
                                </div>
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                    )}

                    {selectedTimeSlots.length > 0 && (
                      <div className="selected-slots-summary">
                        <Text strong>
                          Đã chọn {selectedTimeSlots.length} khung giờ:
                        </Text>
                        <Space wrap size="small" style={{ marginTop: 8 }}>
                          {selectedTimeSlots.map((slotKey) => (
                            <Tag
                              key={slotKey}
                              color="blue"
                              closable
                              onClose={() => handleTimeSlotToggle(slotKey)}
                            >
                              {slotKey}
                            </Tag>
                          ))}
                        </Space>
                      </div>
                    )}
                  </div>
                </Card>
              </Form.Item>
            ) : (
              <Form.Item
                label={
                  <span>
                    <Text strong style={{ fontSize: "16px" }}>
                      Bước 3: Chọn khung giờ
                    </Text>
                  </span>
                }
              >
                <Card
                  size="small"
                  style={{
                    background: "#f9f9f9",
                    border: "1px dashed #d9d9d9",
                  }}
                >
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <ClockCircleOutlined
                      style={{
                        fontSize: "24px",
                        color: "#d9d9d9",
                        marginBottom: "8px",
                      }}
                    />
                    <br />
                    <Text type="secondary">
                      Vui lòng chọn sân ở bước 1 để xem khung giờ có sẵn
                    </Text>
                  </div>
                </Card>
              </Form.Item>
            )}
          </Form>

          {/* Booking Summary */}
          {selectedTimeSlots.length > 0 && selectedCourts.length > 0 && (
            <Card className="booking-summary" size="small">
              <Title level={5}>Tóm tắt đặt sân</Title>
              <div className="summary-details">
                <Row gutter={[16, 8]}>
                  <Col span={12}>
                    <Text>Ngày:</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>{selectedDate?.format("DD/MM/YYYY")}</Text>
                  </Col>

                  <Col span={12}>
                    <Text>Sân đã chọn:</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>
                      {availableCourts
                        .filter((c) => selectedCourts.includes(c._id || ""))
                        .map((c) => c.courtNumber)
                        .join(", ")}
                    </Text>
                  </Col>

                  <Col span={12}>
                    <Text>Số khung giờ:</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>{selectedTimeSlots.length} khung</Text>
                  </Col>

                  <Col span={12}>
                    <Text>Số lượng sân:</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>{selectedCourts.length} sân</Text>
                  </Col>
                </Row>

                <Divider style={{ margin: "12px 0" }} />

                <Row justify="space-between" align="middle">
                  <Col>
                    <Text strong style={{ fontSize: "16px" }}>
                      Tổng tiền:
                    </Text>
                  </Col>
                  <Col>
                    <Text strong style={{ fontSize: "18px", color: "#f5222d" }}>
                      {formatCurrency(calculateTotal())}
                    </Text>
                  </Col>
                </Row>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="modal-actions">
            <Button onClick={onCancel} size="large">
              Hủy
            </Button>
            <Button
              type="primary"
              onClick={handleProceedToBooking}
              disabled={
                selectedTimeSlots.length === 0 || selectedCourts.length === 0
              }
              size="large"
              icon={<CreditCardOutlined />}
            >
              Tiếp tục đặt sân
            </Button>
          </div>
          {/* Hold conflict modal */}
          <Modal
            title="Khung giờ đang được giữ"
            open={holdModalVisible}
            onCancel={() => setHoldModalVisible(false)}
            footer={
              <div style={{ textAlign: "right" }}>
                <Button
                  onClick={() => {
                    setHoldModalVisible(false);
                    // Refresh slots
                    generateTimeSlots();
                  }}
                >
                  Làm mới
                </Button>
                {selectedTimeSlots.length > 0 && (
                  <Button
                    type="primary"
                    onClick={() => {
                      setHoldModalVisible(false);
                      // Continue with remaining slots
                      handleProceedToBooking();
                    }}
                    style={{ marginLeft: 8 }}
                  >
                    Tiếp tục với {selectedTimeSlots.length} khung giờ còn lại
                  </Button>
                )}
                <Button
                  onClick={() => setHoldModalVisible(false)}
                  style={{ marginLeft: 8 }}
                >
                  Đóng
                </Button>
              </div>
            }
          >
            <div>
              <Text>
                Một số khung giờ bạn chọn đang được giữ tạm và đã được bỏ chọn
                tự động.
                {selectedTimeSlots.length > 0
                  ? ` Bạn có thể tiếp tục đặt với ${selectedTimeSlots.length} khung giờ còn lại.`
                  : " Vui lòng chọn khung giờ khác."}
              </Text>
              <Divider />
              <Text strong>Các khung giờ đã bỏ chọn:</Text>
              {holdConflicts.map((c) => (
                <div key={c.slotKey} style={{ marginBottom: 8, marginTop: 8 }}>
                  <Tag color="red" style={{ marginBottom: 4 }}>
                    {c.slotKey}
                  </Tag>
                  <div>
                    {(c.holds || []).map((h, idx) => (
                      <div
                        key={idx}
                        style={{ fontSize: 12, color: "#666", marginLeft: 8 }}
                      >
                        {h.reason === "unavailable"
                          ? "Khung giờ không có sẵn"
                          : `Giữ đến: ${
                              h?.holdUntil
                                ? dayjs(h.holdUntil).format("HH:mm")
                                : "-"
                            }`}
                        {h?.bookingId ? ` (id: ${h.bookingId})` : ""}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {selectedTimeSlots.length > 0 && (
                <>
                  <Divider />
                  <Text strong>Khung giờ còn lại đã chọn:</Text>
                  <div style={{ marginTop: 8 }}>
                    {selectedTimeSlots.map((slotKey) => (
                      <Tag
                        key={slotKey}
                        color="blue"
                        style={{ marginBottom: 4, marginRight: 4 }}
                      >
                        {slotKey}
                      </Tag>
                    ))}
                  </div>
                </>
              )}
            </div>
          </Modal>
        </div>
      </Spin>
    </Modal>
  );
};

export default BookingModal;

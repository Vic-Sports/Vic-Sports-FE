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
    dayjs().add(1, "day")
  );
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [selectedCourts, setSelectedCourts] = useState<string[]>([]);
  const [availableCourts, setAvailableCourts] = useState<CourtWithNumber[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [venueName, setVenueName] = useState<string>("");

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

  const generateTimeSlots = useCallback(async () => {
    if (!court || !selectedDate || selectedCourts.length === 0) return;

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
      return;
    }

    if (selectedCourtsOpenToday.length === 0) {
      setAvailableTimeSlots([]);
      return;
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
      return;
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
        return;
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
      for (
        let hour = commonOperatingHours.start;
        hour < commonOperatingHours.end;
        hour++
      ) {
        const start = `${hour.toString().padStart(2, "0")}:00`;
        const end = `${(hour + 1).toString().padStart(2, "0")}:00`;

        // Find pricing for this time slot
        const dayOfWeek = selectedDate.day();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const dayType = isWeekend ? "weekend" : "weekday";

        const pricing =
          court.pricing.find(
            (p) =>
              p.timeSlot.start <= start &&
              p.timeSlot.end >= end &&
              p.dayType === dayType
          ) || court.pricing[0];

        // Logic hiển thị khung giờ trống theo số sân được chọn
        let isAvailable = false;

        if (selectedCourts.length === 1) {
          // Nếu chỉ chọn 1 sân, hiển thị khung giờ trống của sân đó
          const availability = availabilityResponses[0];
          const timeSlotData = availability?.data?.timeSlots?.find(
            (slot) => slot.start === start && slot.end === end
          );
          isAvailable = timeSlotData?.isAvailable || false;
        } else {
          // Nếu chọn nhiều sân, chỉ hiển thị khung giờ trống chung của tất cả các sân
          // Khung giờ chỉ available nếu TẤT CẢ các sân đều trống cùng lúc
          isAvailable = availabilityResponses.every((availability) => {
            const timeSlotData = availability?.data?.timeSlots?.find(
              (slot) => slot.start === start && slot.end === end
            );
            return timeSlotData?.isAvailable || false;
          });
        }

        // Prefer price returned by availability API if present; fallback to court pricing
        let slotPrice: number | undefined = undefined;
        if (selectedCourts.length === 1) {
          const availability = availabilityResponses[0];
          const timeSlotData = availability?.data?.timeSlots?.find(
            (slot) => slot.start === start && slot.end === end
          );
          slotPrice = timeSlotData?.price;
        } else {
          // If multiple courts, ensure price is consistent; take first available price
          const firstWithPrice = availabilityResponses.find((availability) => {
            const timeSlotData = availability?.data?.timeSlots?.find(
              (slot) => slot.start === start && slot.end === end
            );
            return typeof timeSlotData?.price === "number";
          });
          if (firstWithPrice) {
            const timeSlotData = firstWithPrice?.data?.timeSlots?.find(
              (slot) => slot.start === start && slot.end === end
            );
            slotPrice = timeSlotData?.price;
          }
        }

        timeSlots.push({
          start,
          end,
          isAvailable,
          price:
            typeof slotPrice === "number"
              ? slotPrice
              : pricing?.pricePerHour || 100000,
        });
      }

      setAvailableTimeSlots(timeSlots);
    } catch (error) {
      console.error("Error loading time slots:", error);

      // Only create fallback slots if there are courts open today
      if (selectedCourtsOpenToday.length === 0) {
        console.log("No courts open today, not creating fallback slots");
        setAvailableTimeSlots([]);
        return;
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

        const dayOfWeek = selectedDate.day();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const dayType = isWeekend ? "weekend" : "weekday";

        const pricing =
          court.pricing.find(
            (p) =>
              p.timeSlot.start <= start &&
              p.timeSlot.end >= end &&
              p.dayType === dayType
          ) || court.pricing[0];

        // Fallback availability simulation
        let isAvailable = false;
        if (selectedCourts.length === 1) {
          isAvailable = Math.random() > 0.3; // 70% availability simulation
        } else {
          isAvailable = Math.random() > 0.6; // 40% availability cho khung giờ chung
        }

        timeSlots.push({
          start,
          end,
          isAvailable,
          price: pricing?.pricePerHour || 100000,
        });
      }
      setAvailableTimeSlots(timeSlots);
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
    if (date && date.isAfter(dayjs(), "day")) {
      setSelectedDate(date);
      setSelectedTimeSlots([]); // Reset selected time slots when date changes
    } else {
      message.warning("Vui lòng chọn ngày từ ngày mai trở đi");
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
    const totalPrice = selectedSlots.reduce((sum, slot) => sum + slot.price, 0);
    return totalPrice * selectedCourts.length; // Nhân với số sân được chọn
  };

  const handleProceedToBooking = () => {
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
    navigate("/booking", {
      state: { bookingData },
    });

    onCancel(); // Close modal
  };

  const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().endOf("day");
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

                          return (
                            <Button
                              key={slotKey}
                              className={`time-slot-btn ${
                                isSelected ? "selected" : ""
                              } ${!slot.isAvailable ? "disabled" : ""}`}
                              disabled={!slot.isAvailable}
                              onClick={() => handleTimeSlotToggle(slotKey)}
                              size="small"
                            >
                              <div className="time-slot-content">
                                <div className="time-slot-time">
                                  <ClockCircleOutlined />
                                  {slot.start} - {slot.end}
                                </div>
                                <div className="time-slot-price">
                                  {formatCurrency(slot.price)}
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
        </div>
      </Spin>
    </Modal>
  );
};

export default BookingModal;

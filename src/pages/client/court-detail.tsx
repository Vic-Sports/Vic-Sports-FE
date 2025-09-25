import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Button,
  DatePicker,
  Tag,
  Carousel,
  Rate,
  Space,
  Typography,
  Divider,
  message,
  Modal,
  Timeline,
  Image,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  StarOutlined,
  HomeOutlined,
  ThunderboltOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import type { ICourt, ICourtTimeSlot } from "@/types/court";
import { getCourtByIdAPI, getCourtAvailabilityAPI } from "@/services/courtApi";
import "./court-detail.scss";

const { Title, Text } = Typography;

const CourtDetailPage: React.FC = () => {
  const { courtId } = useParams<{ courtId: string }>();
  const navigate = useNavigate();

  const [court, setCourt] = useState<ICourt | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(
    dayjs().add(1, "day")
  );
  const [selectedTimeSlot, setSelectedTimeSlot] =
    useState<ICourtTimeSlot | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<
    Array<{
      start: string;
      end: string;
      isAvailable: boolean;
      price: number;
    }>
  >([]);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);

  useEffect(() => {
    if (courtId) {
      fetchCourtDetail();
    }
  }, [courtId]);

  useEffect(() => {
    if (court && selectedDate) {
      fetchAvailableTimeSlots();
    }
  }, [court, selectedDate]);

  const fetchCourtDetail = useCallback(async () => {
    if (!courtId) return;

    try {
      setLoading(true);
      const response = await getCourtByIdAPI(courtId);
      if (response.data) {
        setCourt(response.data);
      }
    } catch (error) {
      message.error("Không thể tải thông tin sân");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [courtId]);

  const fetchAvailableTimeSlots = useCallback(async () => {
    if (!court || !selectedDate) return;

    try {
      const dateString = selectedDate.format("YYYY-MM-DD");
      const response = await getCourtAvailabilityAPI(court._id!, dateString);

      if (response.data && response.data.timeSlots) {
        setAvailableTimeSlots(response.data.timeSlots);
      } else {
        // Fallback to generating mock time slots if API doesn't return data
        const timeSlots = [];
        const startHour = 6; // 6:00 AM
        const endHour = 22; // 10:00 PM

        for (let hour = startHour; hour < endHour; hour++) {
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

          timeSlots.push({
            start,
            end,
            isAvailable: Math.random() > 0.3, // Mock availability
            price: pricing?.pricePerHour || 100000,
          });
        }
        setAvailableTimeSlots(timeSlots);
      }
    } catch (error) {
      console.error("Error fetching time slots:", error);
      message.error("Không thể tải thông tin khung giờ");
    }
  }, [court, selectedDate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleDateChange = (date: Dayjs | null) => {
    if (date && date.isAfter(dayjs(), "day")) {
      setSelectedDate(date);
      setSelectedTimeSlot(null);
    } else {
      message.warning("Vui lòng chọn ngày từ ngày mai trở đi");
    }
  };

  const handleTimeSlotSelect = (timeSlot: {
    start: string;
    end: string;
    price: number;
  }) => {
    if (timeSlot) {
      setSelectedTimeSlot({
        start: timeSlot.start,
        end: timeSlot.end,
      });
    }
  };

  const handleBookNow = () => {
    if (!selectedDate || !selectedTimeSlot) {
      message.warning("Vui lòng chọn ngày và giờ đặt sân");
      return;
    }
    setBookingModalVisible(true);
  };

  const confirmBooking = () => {
    if (!selectedDate || !selectedTimeSlot || !court) return;

    const selectedSlot = availableTimeSlots.find(
      (slot) =>
        slot.start === selectedTimeSlot.start &&
        slot.end === selectedTimeSlot.end
    );

    const bookingData = {
      courtIds: [court._id], // Đổi từ courtId thành courtIds array
      courtNames: court.name, // Đổi từ courtName thành courtNames
      date: selectedDate.format("YYYY-MM-DD"),
      timeSlots: [
        {
          start: selectedTimeSlot.start,
          end: selectedTimeSlot.end,
          price: selectedSlot?.price || 0,
        },
      ], // Đổi từ timeSlot thành timeSlots array
      courtQuantity: 1, // Thêm courtQuantity
      totalPrice: selectedSlot?.price || 0, // Đổi từ price thành totalPrice
      venue: court.venueId,
    };

    // Navigate to booking page with booking data
    navigate("/booking", {
      state: { bookingData },
    });
  };

  const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().endOf("day");
  };

  if (loading) {
    return (
      <div className="court-detail-loading">
        <Card loading={true} />
      </div>
    );
  }

  if (!court) {
    return (
      <div className="court-detail-error">
        <Card>
          <Title level={3}>Không tìm thấy thông tin sân</Title>
          <Button type="primary" onClick={() => navigate(-1)}>
            Quay lại
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="court-detail-page">
      <div className="container">
        {/* Court Images */}
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card className="court-images-card">
              <Carousel autoplay dots={{ className: "court-carousel-dots" }}>
                {court.images && court.images.length > 0 ? (
                  court.images.map((image, index) => (
                    <div key={index} className="court-image-slide">
                      <Image
                        src={image}
                        alt={`${court.name} - ${index + 1}`}
                        className="court-image"
                        fallback="https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=400&fit=crop&crop=center&auto=format&q=80"
                      />
                    </div>
                  ))
                ) : (
                  <div className="court-image-slide">
                    <Image
                      src="https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=400&fit=crop&crop=center&auto=format&q=80"
                      alt={court.name}
                      className="court-image"
                    />
                  </div>
                )}
              </Carousel>
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]} className="court-detail-content">
          {/* Court Information */}
          <Col xs={24} lg={14}>
            <Card className="court-info-card">
              <div className="court-header">
                <Title level={2}>{court.name}</Title>
                <div className="court-rating">
                  <Rate disabled defaultValue={court.ratings.average} />
                  <Text className="rating-text">
                    {court.ratings.average} ({court.ratings.count} đánh giá)
                  </Text>
                </div>
              </div>

              <Space wrap className="court-tags">
                <Tag
                  icon={
                    court.courtType === "trong nhà" ? (
                      <HomeOutlined />
                    ) : (
                      <ThunderboltOutlined />
                    )
                  }
                  color={court.courtType === "trong nhà" ? "blue" : "green"}
                >
                  {court.courtType}
                </Tag>
                <Tag icon={<TeamOutlined />} color="orange">
                  {court.capacity} người
                </Tag>
                <Tag color="purple">{court.sportType}</Tag>
                <Tag color="cyan">{court.surface}</Tag>
              </Space>

              <Divider />

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div className="court-detail-item">
                    <Text strong>Kích thước:</Text>
                    <Text>
                      {court.dimensions.length}x{court.dimensions.width}m
                    </Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="court-detail-item">
                    <Text strong>Sức chứa:</Text>
                    <Text>{court.capacity} người</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="court-detail-item">
                    <Text strong>Loại sân:</Text>
                    <Text>{court.courtType}</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="court-detail-item">
                    <Text strong>Mặt sân:</Text>
                    <Text>{court.surface}</Text>
                  </div>
                </Col>
              </Row>

              <Divider />

              <div className="court-equipment">
                <Title level={4}>Tiện nghi</Title>
                <div className="equipment-list">
                  {court.equipment.map((item, index) => (
                    <Tag
                      key={index}
                      icon={<CheckCircleOutlined />}
                      color="green"
                    >
                      {item}
                    </Tag>
                  ))}
                </div>
              </div>

              <Divider />

              <div className="court-stats">
                <Title level={4}>Thống kê</Title>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Card size="small" className="stat-card">
                      <div className="stat-number">{court.totalBookings}</div>
                      <div className="stat-label">Lượt đặt</div>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small" className="stat-card">
                      <div className="stat-number">
                        <StarOutlined /> {court.ratings.average}
                      </div>
                      <div className="stat-label">Đánh giá</div>
                    </Card>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>

          {/* Booking Panel */}
          <Col xs={24} lg={10}>
            <Card className="booking-panel" title="Đặt sân ngay">
              <div className="booking-form">
                <div className="form-item">
                  <Text strong>Chọn ngày:</Text>
                  <DatePicker
                    value={selectedDate}
                    onChange={handleDateChange}
                    disabledDate={disabledDate}
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày"
                    className="date-picker"
                    suffixIcon={<CalendarOutlined />}
                  />
                </div>

                <div className="form-item">
                  <Text strong>Chọn giờ:</Text>
                  <div className="time-slots-grid">
                    {availableTimeSlots.map((slot, index) => (
                      <Button
                        key={index}
                        className={`time-slot-btn ${
                          selectedTimeSlot?.start === slot.start
                            ? "selected"
                            : ""
                        } ${!slot.isAvailable ? "disabled" : ""}`}
                        disabled={!slot.isAvailable}
                        onClick={() => handleTimeSlotSelect(slot)}
                      >
                        <div className="time-slot-time">
                          {slot.start} - {slot.end}
                        </div>
                        <div className="time-slot-price">
                          {formatCurrency(slot.price)}
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {selectedDate && selectedTimeSlot && (
                  <div className="booking-summary">
                    <Divider />
                    <Title level={5}>Thông tin đặt sân</Title>
                    <div className="summary-item">
                      <CalendarOutlined />
                      <Text>{selectedDate.format("DD/MM/YYYY")}</Text>
                    </div>
                    <div className="summary-item">
                      <ClockCircleOutlined />
                      <Text>
                        {selectedTimeSlot.start} - {selectedTimeSlot.end}
                      </Text>
                    </div>
                    <div className="summary-item total-price">
                      <Text strong>Tổng tiền: </Text>
                      <Text strong className="price-text">
                        {formatCurrency(
                          availableTimeSlots.find(
                            (slot) => slot.start === selectedTimeSlot.start
                          )?.price || 0
                        )}
                      </Text>
                    </div>
                  </div>
                )}

                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={handleBookNow}
                  disabled={!selectedDate || !selectedTimeSlot}
                  className="book-now-btn"
                >
                  Đặt sân ngay
                </Button>
              </div>
            </Card>

            {/* Court Pricing */}
            <Card className="pricing-card" title="Bảng giá">
              <Timeline
                items={court.pricing.map((pricing, index) => ({
                  children: (
                    <div key={index} className="pricing-item">
                      <div className="pricing-time">
                        {pricing.timeSlot.start} - {pricing.timeSlot.end}
                      </div>
                      <div className="pricing-day">
                        {pricing.dayType === "weekday"
                          ? "Thứ 2 - Thứ 6"
                          : "Cuối tuần"}
                      </div>
                      <div className="pricing-price">
                        {formatCurrency(pricing.pricePerHour)}
                      </div>
                    </div>
                  ),
                }))}
              />
            </Card>
          </Col>
        </Row>

        {/* Booking Confirmation Modal */}
        <Modal
          title="Xác nhận đặt sân"
          open={bookingModalVisible}
          onOk={confirmBooking}
          onCancel={() => setBookingModalVisible(false)}
          okText="Tiếp tục thanh toán"
          cancelText="Hủy"
          className="booking-modal"
        >
          {selectedDate && selectedTimeSlot && (
            <div className="booking-confirmation">
              <Title level={4}>{court.name}</Title>
              <div className="confirmation-details">
                <div className="detail-row">
                  <CalendarOutlined />
                  <Text>Ngày: {selectedDate.format("DD/MM/YYYY")}</Text>
                </div>
                <div className="detail-row">
                  <ClockCircleOutlined />
                  <Text>
                    Giờ: {selectedTimeSlot.start} - {selectedTimeSlot.end}
                  </Text>
                </div>
                <div className="detail-row">
                  <UserOutlined />
                  <Text>Sức chứa: {court.capacity} người</Text>
                </div>
                <Divider />
                <div className="detail-row total">
                  <Text strong>Tổng tiền: </Text>
                  <Text strong className="total-amount">
                    {formatCurrency(
                      availableTimeSlots.find(
                        (slot) => slot.start === selectedTimeSlot.start
                      )?.price || 0
                    )}
                  </Text>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default CourtDetailPage;

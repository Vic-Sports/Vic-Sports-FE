import React, { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Spin,
  Empty,
  Select,
  Divider,
  Rate,
  Tag,
  Breadcrumb,
  Space,
  Statistic,
  notification,
} from "antd";
import {
  EnvironmentOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  FilterOutlined,
  ArrowLeftOutlined,
  StarOutlined,
  TeamOutlined,
  TrophyOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import type { ICourt } from "@/types/court";
import type { IVenue } from "@/types/venue";
import { getVenueByIdAPI, getVenueCourtsAPI } from "@/services/venueApi";
import BookingModal from "@/components/client/booking/BookingModal";
import "./VenueCourts.scss";

import VenueImageCarousel from "./VenueImageCarousel";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface SportTypeGroup {
  sportType: string;
  courts: ICourt[];
  sampleCourt: ICourt; // Sân đại diện để hiển thị thông tin chung
  totalCourts: number;
  minPrice: number;
  maxPrice: number;
  averageRating: number;
}

const VenueCourts: React.FC = () => {
  const { venueId } = useParams<{ venueId: string }>();
  const [searchParams] = useSearchParams();

  // State
  const [venue, setVenue] = useState<IVenue | null>(null);
  const [courts, setCourts] = useState<ICourt[]>([]);
  const [sportGroups, setSportGroups] = useState<SportTypeGroup[]>([]);
  const [filteredSportGroups, setFilteredSportGroups] = useState<
    SportTypeGroup[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking modal state
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedSampleCourt, setSelectedSampleCourt] = useState<ICourt | null>(
    null
  );

  // Filter states
  const [sportTypeFilter, setSportTypeFilter] = useState<string | undefined>(
    searchParams.get("sportType") || undefined
  );
  const [courtTypeFilter, setCourtTypeFilter] = useState<string | undefined>(
    searchParams.get("courtType") || undefined
  );
  const [sortBy, setSortBy] = useState<string>("rating");

  // Load venue data
  const loadVenueData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getVenueByIdAPI(venueId!);

      if (response.data) {
        setVenue(response.data);
      } else {
        setError("Không thể tải thông tin venue");
        notification.error({ message: "Không thể tải thông tin venue" });
      }
    } catch (error) {
      console.error("Error loading venue:", error);
      setError("Không thể tải thông tin venue");
      notification.error({ message: "Không thể tải thông tin venue" });
    }
  }, [venueId]);

  // Group courts by sport type
  const groupCourtsBySportType = useCallback((courtsData: ICourt[]) => {
    const sportTypesMap = new Map<string, ICourt[]>();

    courtsData.forEach((court) => {
      if (!sportTypesMap.has(court.sportType)) {
        sportTypesMap.set(court.sportType, []);
      }
      sportTypesMap.get(court.sportType)!.push(court);
    });

    const groups: SportTypeGroup[] = Array.from(sportTypesMap.entries()).map(
      ([sportType, courts]) => {
        const prices = courts.flatMap((court) =>
          court.pricing.map((p) => p.pricePerHour)
        );
        const ratings = courts.map((court) => court.ratings?.average || 0);

        return {
          sportType,
          courts,
          sampleCourt: courts[0], // Lấy sân đầu tiên làm đại diện
          totalCourts: courts.length,
          minPrice: Math.min(...prices),
          maxPrice: Math.max(...prices),
          averageRating:
            ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length,
        };
      }
    );

    setSportGroups(groups);
    setFilteredSportGroups(groups); // Initially show all groups
  }, []);

  const loadCourtsData = useCallback(async () => {
    try {
      // Load all courts without filters - filtering will be done on FE
      const response = await getVenueCourtsAPI(venueId!);

      if (response.data?.courts) {
        setCourts(response.data.courts);
        // Group courts by sport type
        groupCourtsBySportType(response.data.courts);
      } else {
        setCourts([]);
        setSportGroups([]);
        setFilteredSportGroups([]);
      }
    } catch (error) {
      console.error("Error loading courts:", error);
      setError("Không thể tải danh sách sân");
      notification.error({ message: "Không thể tải danh sách sân" });
      setCourts([]);
      setSportGroups([]);
      setFilteredSportGroups([]);
    } finally {
      setLoading(false);
    }
  }, [venueId, groupCourtsBySportType]);

  // Load data on component mount
  useEffect(() => {
    if (venueId) {
      loadVenueData();
      loadCourtsData();
    }
  }, [venueId, loadVenueData, loadCourtsData]);

  // Apply filters on frontend
  const applyFilters = useCallback(() => {
    let filtered = [...sportGroups];

    // Filter by sport type
    if (sportTypeFilter) {
      filtered = filtered.filter(
        (group) => group.sportType === sportTypeFilter
      );
    }

    // Filter by court type
    if (courtTypeFilter) {
      filtered = filtered.filter((group) =>
        group.courts.some((court) => court.courtType === courtTypeFilter)
      );
    }

    // Sort by selected criteria
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.averageRating - a.averageRating;
        case "price":
          return a.minPrice - b.minPrice;
        case "name":
          return a.sportType.localeCompare(b.sportType);
        case "capacity":
          return b.sampleCourt.capacity - a.sampleCourt.capacity;
        default:
          return 0;
      }
    });

    setFilteredSportGroups(filtered);
  }, [sportGroups, sportTypeFilter, courtTypeFilter, sortBy]);

  // Apply filters when sport groups data or filter states change
  useEffect(() => {
    if (sportGroups.length > 0) {
      applyFilters();
    }
  }, [sportGroups, sportTypeFilter, courtTypeFilter, sortBy, applyFilters]);

  const formatAddress = (address: IVenue["address"]) => {
    return `${address.street}, ${address.ward}, ${address.district}, ${address.city}`;
  };

  const getOperatingHoursToday = () => {
    if (!venue) return "";
    const today = new Date().getDay();
    const todayHours = venue.operatingHours.find(
      (hours) => hours.dayOfWeek === today
    );

    if (!todayHours || !todayHours.isOpen) {
      return "Đóng cửa hôm nay";
    }

    return `${todayHours.openTime} - ${todayHours.closeTime}`;
  };

  const getSportTypes = () => {
    // Return unique sport types from available courts
    return [...new Set(courts.map((court) => court.sportType))];
  };

  const getCourtTypes = () => {
    // Return unique court types from available courts
    return [...new Set(courts.map((court) => court.courtType))];
  };

  const handleBookSportType = (sportGroup: SportTypeGroup) => {
    // Open booking modal with sample court - modal will load all courts of this sport type
    setSelectedSampleCourt(sportGroup.sampleCourt);
    setBookingModalVisible(true);
  };

  const handleCloseBookingModal = () => {
    setBookingModalVisible(false);
    setSelectedSampleCourt(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="venue-courts-loading">
        <Spin size="large" />
        <Text>Đang tải dữ liệu...</Text>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="venue-courts-error">
        <Empty
          description={error || "Không tìm thấy venue"}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={() => window.history.back()}
        >
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="venue-courts-page">
      {/* Breadcrumb */}
      <Breadcrumb className="venue-breadcrumb">
        <Breadcrumb.Item>
          <a href="/search">Tìm kiếm</a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <a href="#" onClick={() => window.history.back()}>
            Danh sách venue
          </a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{venue.name}</Breadcrumb.Item>
      </Breadcrumb>

      {/* Venue Information Header */}
      <Card className="venue-info-header">
        <Row gutter={[24, 16]}>
          <Col xs={24} md={8}>
            <div className="venue-image">
              <VenueImageCarousel images={venue.images} alt={venue.name} />
              {venue.isVerified && (
                <div className="verified-badge">
                  <CrownOutlined />
                  <span>Venue Đã Xác Thực</span>
                </div>
              )}
            </div>
          </Col>
          <Col xs={24} md={16}>
            <div className="venue-details">
              <div className="venue-title-section">
                <Title level={2}>{venue.name}</Title>
                <div className="venue-rating-location">
                  <Rate disabled value={venue.ratings.average} allowHalf />
                  <Text className="rating-text">
                    <StarOutlined style={{ color: "#ffa940" }} />{" "}
                    {venue.ratings.average} ({venue.ratings.count} đánh giá)
                  </Text>
                </div>
              </div>

              <div className="venue-stats-row">
                <Space size="large">
                  <Statistic
                    title="Tổng Đặt Sân"
                    value={venue.totalBookings}
                    prefix={<TrophyOutlined style={{ color: "#1890ff" }} />}
                    valueStyle={{ color: "#1890ff", fontSize: "18px" }}
                  />
                  <Statistic
                    title="Sân Khả Dụng"
                    value={courts.length}
                    prefix={<TeamOutlined style={{ color: "#722ed1" }} />}
                    valueStyle={{ color: "#722ed1", fontSize: "18px" }}
                  />
                </Space>
              </div>

              <div className="venue-meta">
                <div className="meta-item">
                  <EnvironmentOutlined />
                  <Text>{formatAddress(venue.address)}</Text>
                </div>
                <div className="meta-item">
                  <PhoneOutlined />
                  <Text>{venue.contactInfo.phone}</Text>
                </div>
                <div className="meta-item">
                  <ClockCircleOutlined />
                  <Text>Hôm nay: {getOperatingHoursToday()}</Text>
                </div>
              </div>

              <Paragraph className="venue-description">
                {venue.description}
              </Paragraph>

              <div className="venue-amenities">
                {venue.amenities.slice(0, 4).map((amenity, index) => (
                  <Tag key={index} className="amenity-tag">
                    {amenity.name}
                  </Tag>
                ))}
                {venue.amenities.length > 4 && (
                  <Tag className="amenity-more">
                    +{venue.amenities.length - 4} tiện ích khác
                  </Tag>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Booking Filters */}
      <Card className="booking-filters">
        <div className="filter-header">
          <Title level={4}>
            <FilterOutlined style={{ color: "#1890ff" }} /> Bộ lọc sân thể thao
          </Title>
          <Text type="secondary">Tìm sân phù hợp với nhu cầu của bạn</Text>
        </div>

        <Row gutter={[24, 16]} align="middle">
          <Col xs={24} sm={8}>
            <div className="filter-group">
              <Text strong style={{ color: "#1890ff" }}>
                🏃‍♂️ Môn thể thao:
              </Text>
              <Select
                value={sportTypeFilter}
                onChange={setSportTypeFilter}
                placeholder="Chọn môn thể thao"
                allowClear
                style={{ width: "100%" }}
                size="large"
              >
                {getSportTypes().map((type) => (
                  <Option key={type} value={type}>
                    <Space>
                      {type === "football" && "⚽"}
                      {type === "tennis" && "🎾"}
                      {type === "badminton" && "🏸"}
                      {type === "basketball" && "🏀"}
                      {type}
                    </Space>
                  </Option>
                ))}
              </Select>
            </div>
          </Col>

          <Col xs={24} sm={8}>
            <div className="filter-group">
              <Text strong style={{ color: "#722ed1" }}>
                🏟️ Loại sân:
              </Text>
              <Select
                value={courtTypeFilter}
                onChange={setCourtTypeFilter}
                placeholder="Chọn loại sân"
                allowClear
                style={{ width: "100%" }}
                size="large"
              >
                {getCourtTypes().map((type) => (
                  <Option key={type} value={type}>
                    <Space>
                      {type === "trong nhà" ? "🏢" : "🌞"}
                      {type}
                    </Space>
                  </Option>
                ))}
              </Select>
            </div>
          </Col>

          <Col xs={24} sm={8}>
            <div className="filter-group">
              <Text strong style={{ color: "#52c41a" }}>
                📊 Sắp xếp theo:
              </Text>
              <Select
                value={sortBy}
                onChange={setSortBy}
                style={{ width: "100%" }}
                size="large"
              >
                <Option value="rating">
                  <Space>
                    <StarOutlined style={{ color: "#ffa940" }} />
                    Đánh giá cao nhất
                  </Space>
                </Option>
                <Option value="price">
                  <Space>💰 Giá thấp nhất</Space>
                </Option>
                <Option value="name">
                  <Space>🔤 Tên sân A-Z</Space>
                </Option>
                <Option value="capacity">
                  <Space>
                    <TeamOutlined style={{ color: "#1890ff" }} />
                    Sức chứa lớn
                  </Space>
                </Option>
              </Select>
            </div>
          </Col>
        </Row>

        <div className="filter-summary">
          <Text type="secondary">
            🎯 Hiển thị {filteredSportGroups.length} loại thể thao phù hợp từ
            tổng số {sportGroups.length} loại thể thao
          </Text>
        </div>
      </Card>

      <Divider />

      {/* Sports List */}
      <div className="courts-section">
        <div className="section-header">
          <div className="header-content">
            <Title level={3}>
              <TrophyOutlined style={{ color: "#1890ff" }} />
              Danh sách loại thể thao
            </Title>
            <div className="court-count-badge">
              <Text strong style={{ color: "#1890ff" }}>
                {filteredSportGroups.length} loại thể thao khả dụng
              </Text>
            </div>
          </div>
          <Text type="secondary" className="section-description">
            Chọn loại thể thao yêu thích và bắt đầu đặt lịch ngay hôm nay! 🎯
          </Text>
        </div>

        {filteredSportGroups.length === 0 ? (
          <Empty
            description="Không có loại thể thao nào phù hợp với bộ lọc"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Row gutter={[16, 16]}>
            {filteredSportGroups.map((sportGroup) => (
              <Col key={sportGroup.sportType} xs={24} sm={12} lg={8}>
                <Card
                  hoverable
                  className="sport-type-card"
                  cover={
                    <div className="sport-card-cover">
                      <img
                        src={
                          sportGroup.sampleCourt.images[0] ||
                          "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=200&fit=crop&crop=center&auto=format&q=80"
                        }
                        alt={sportGroup.sportType}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=200&fit=crop&crop=center&auto=format&q=80";
                        }}
                      />
                      <div className="sport-type-overlay">
                        <Title level={4} style={{ color: "white", margin: 0 }}>
                          {sportGroup.sportType.toUpperCase()}
                        </Title>
                      </div>
                    </div>
                  }
                  actions={[
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => handleBookSportType(sportGroup)}
                      style={{ width: "90%" }}
                    >
                      Đặt sân ngay
                    </Button>,
                  ]}
                >
                  <div className="sport-card-content">
                    <div className="sport-stats">
                      <Space
                        direction="vertical"
                        size="small"
                        style={{ width: "100%" }}
                      >
                        <div className="stat-item">
                          <TeamOutlined style={{ color: "#1890ff" }} />
                          <Text strong>
                            {sportGroup.totalCourts} sân khả dụng
                          </Text>
                        </div>
                        <div className="stat-item">
                          <StarOutlined style={{ color: "#ffa940" }} />
                          <Text>
                            {sportGroup.averageRating.toFixed(1)} ⭐ trung bình
                          </Text>
                        </div>
                        <div className="stat-item">
                          <Text type="secondary">
                            Giá: {formatCurrency(sportGroup.minPrice)} -{" "}
                            {formatCurrency(sportGroup.maxPrice)}/giờ
                          </Text>
                        </div>
                      </Space>
                    </div>

                    <div className="sport-details">
                      <Text type="secondary">
                        <strong>Loại sân:</strong>{" "}
                        {sportGroup.sampleCourt.courtType}
                      </Text>
                      <br />
                      <Text type="secondary">
                        <strong>Sức chứa:</strong>{" "}
                        {sportGroup.sampleCourt.capacity} người
                      </Text>
                      <br />
                      <Text type="secondary">
                        <strong>Bề mặt:</strong>{" "}
                        {sportGroup.sampleCourt.surface}
                      </Text>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* Booking Modal */}
      <BookingModal
        visible={bookingModalVisible}
        onCancel={handleCloseBookingModal}
        court={selectedSampleCourt}
      />
    </div>
  );
};

export default VenueCourts;

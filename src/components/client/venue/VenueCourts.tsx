import React, { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import { notification } from "antd";
import {
  FaMapMarkerAlt,
  FaPhone,
  FaClock,
  FaStar,
  FaTrophy,
  FaUsers,
  FaFilter,
  FaArrowLeft,
  FaCheckCircle,
  FaCalendarAlt,
  FaFutbol,
  FaBasketballBall,
  FaTableTennis,
  FaVolleyballBall,
  FaSortAmountDown,
} from "react-icons/fa";
import type { ICourt } from "@/types/court";
import type { IVenue } from "@/types/venue";
import { getVenueByIdAPI, getVenueCourtsAPI } from "@/services/venueApi";
import BookingModal from "@/components/client/booking/BookingModal";
import CustomSelect from "@/components/client/community/CustomSelect";
import "./VenueCourts.scss";
import FullscreenLoader from "@/components/shared/FullscreenLoader";
import VenueImageCarousel from "./VenueImageCarousel";

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
  const navigate = useNavigate();

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
    }
  }, [venueId, groupCourtsBySportType]);

  // Load data on component mount with centralized loading state
  useEffect(() => {
    let mounted = true;
    const loadAll = async () => {
      if (!venueId) return;
      try {
        setLoading(true);
        await Promise.all([loadVenueData(), loadCourtsData()]);
      } catch (err) {
        console.error("Error loading venue or courts:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadAll();

    return () => {
      mounted = false;
    };
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

  // Prepare options for CustomSelect
  const sportTypeOptions = [
    { value: "", label: "Tất cả môn thể thao" },
    ...getSportTypes().map((type) => ({
      value: type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
    })),
  ];

  const courtTypeOptions = [
    { value: "", label: "Tất cả loại sân" },
    ...getCourtTypes().map((type) => ({
      value: type,
      label: type,
    })),
  ];

  const sortOptions = [
    { value: "rating", label: "⭐ Đánh giá cao nhất" },
    { value: "price", label: "💰 Giá thấp nhất" },
    { value: "name", label: "🔤 Tên sân A-Z" },
    { value: "capacity", label: "👥 Sức chứa lớn" },
  ];

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

  const getSportIcon = (sportType: string) => {
    const sport = sportType.toLowerCase();
    if (sport.includes("football") || sport.includes("bóng đá"))
      return <FaFutbol />;
    if (sport.includes("basketball") || sport.includes("rổ"))
      return <FaBasketballBall />;
    if (sport.includes("tennis") || sport.includes("quần vợt"))
      return <FaTableTennis />;
    if (sport.includes("badminton") || sport.includes("cầu lông"))
      return <FaTableTennis />;
    if (sport.includes("volleyball") || sport.includes("bóng chuyền"))
      return <FaVolleyballBall />;
    return <FaTrophy />;
  };

  if (loading) {
    return <FullscreenLoader message="Đang tải dữ liệu..." />;
  }

  if (error || !venue) {
    return (
      <div className="venue-courts-page error-page">
        <Container>
          <div className="error-content text-center">
            <div className="error-icon mb-4">
              <FaTrophy size={80} className="text-muted" />
            </div>
            <h2 className="mb-3">{error || "Không tìm thấy venue"}</h2>
            <button
              className="btn btn-primary btn-lg rounded-pill px-5"
              onClick={() => navigate(-1)}
            >
              <FaArrowLeft className="me-2" />
              Quay lại
            </button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="venue-courts-page">
      <Container>
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb-nav mb-4">
          <button onClick={() => navigate("/")} className="breadcrumb-link">
            Trang chủ
          </button>
          <span className="breadcrumb-separator">/</span>
          <button onClick={() => navigate(-1)} className="breadcrumb-link">
            Danh sách venue
          </button>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{venue.name}</span>
        </nav>

        {/* Hero Section with Venue Info */}
        <div className="venue-hero-section mb-5">
          <Row className="g-4">
            {/* Venue Image Gallery */}
            <Col lg={6} md={12}>
              <div className="venue-image-gallery">
                <VenueImageCarousel images={venue.images} alt={venue.name} />
                {venue.isVerified && (
                  <div className="verified-badge-overlay">
                    <FaCheckCircle className="me-2" />
                    <span>Đã Xác Thực</span>
                  </div>
                )}
              </div>
            </Col>

            {/* Venue Details */}
            <Col lg={6} md={12}>
              <div className="venue-info-card">
                <div className="venue-header mb-4">
                  <h1 className="venue-title">{venue.name}</h1>
                  <div className="venue-rating">
                    {[...Array(5)].map((_, index) => (
                      <FaStar
                        key={index}
                        className={
                          index < Math.floor(venue.ratings.average)
                            ? "star-filled"
                            : "star-empty"
                        }
                      />
                    ))}
                    <span className="rating-value ms-2">
                      {venue.ratings.average.toFixed(1)} ({venue.ratings.count}{" "}
                      đánh giá)
                    </span>
                  </div>
                </div>

                <div className="venue-stats-grid mb-4">
                  <div className="stat-box">
                    <div className="stat-icon bg-primary">
                      <FaTrophy />
                    </div>
                    <div className="stat-info">
                      <div className="stat-value">
                        {venue.totalBookings.toLocaleString()}
                      </div>
                      <div className="stat-label">Tổng Đặt Sân</div>
                    </div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-icon bg-success">
                      <FaUsers />
                    </div>
                    <div className="stat-info">
                      <div className="stat-value">{courts.length}</div>
                      <div className="stat-label">Sân Khả Dụng</div>
                    </div>
                  </div>
                </div>

                <div className="venue-details-list">
                  <div className="detail-item">
                    <FaMapMarkerAlt className="detail-icon" />
                    <span>{formatAddress(venue.address)}</span>
                  </div>
                  <div className="detail-item">
                    <FaPhone className="detail-icon" />
                    <span>{venue.contactInfo.phone}</span>
                  </div>
                  <div className="detail-item">
                    <FaClock className="detail-icon" />
                    <span>Hôm nay: {getOperatingHoursToday()}</span>
                  </div>
                </div>

                <p className="venue-description mt-4">{venue.description}</p>

                <div className="venue-amenities mt-4">
                  {venue.amenities.slice(0, 6).map((amenity, index) => (
                    <span key={index} className="amenity-badge">
                      {amenity.name}
                    </span>
                  ))}
                  {venue.amenities.length > 6 && (
                    <span className="amenity-badge more">
                      +{venue.amenities.length - 6} tiện ích
                    </span>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Filter Section */}
        <div className="filter-section mb-5">
          <div className="filter-header text-center mb-4">
            <h3 className="section-title">
              <FaFilter className="me-2" />
              Tìm Sân Phù Hợp
            </h3>
            <p className="section-subtitle">
              Lọc và sắp xếp để tìm sân hoàn hảo cho bạn
            </p>
          </div>

          <Row className="g-4">
            <Col lg={4} md={6}>
              <div className="filter-group">
                <label className="filter-label">
                  <FaTrophy className="me-2" />
                  Môn thể thao
                </label>
                <CustomSelect
                  value={sportTypeFilter || ""}
                  onChange={(value) => setSportTypeFilter(value || undefined)}
                  options={sportTypeOptions}
                  placeholder="Chọn môn thể thao"
                  icon={<FaTrophy />}
                />
              </div>
            </Col>

            <Col lg={4} md={6}>
              <div className="filter-group">
                <label className="filter-label">
                  <FaUsers className="me-2" />
                  Loại sân
                </label>
                <CustomSelect
                  value={courtTypeFilter || ""}
                  onChange={(value) => setCourtTypeFilter(value || undefined)}
                  options={courtTypeOptions}
                  placeholder="Chọn loại sân"
                  icon={<FaUsers />}
                />
              </div>
            </Col>

            <Col lg={4} md={6}>
              <div className="filter-group">
                <label className="filter-label">
                  <FaSortAmountDown className="me-2" />
                  Sắp xếp theo
                </label>
                <CustomSelect
                  value={sortBy}
                  onChange={setSortBy}
                  options={sortOptions}
                  placeholder="Sắp xếp theo"
                  icon={<FaSortAmountDown />}
                />
              </div>
            </Col>
          </Row>

          <div className="filter-result-info text-center mt-4">
            <span className="result-badge">
              🎯 Hiển thị {filteredSportGroups.length} / {sportGroups.length}{" "}
              loại thể thao
            </span>
          </div>
        </div>

        {/* Courts Grid */}
        <div className="courts-grid-section">
          <div className="section-header text-center mb-5">
            <h2 className="section-title gradient-text">
              Danh Sách Sân Thể Thao
            </h2>
            <p className="section-subtitle">
              Chọn loại thể thao yêu thích và bắt đầu đặt lịch ngay! 🚀
            </p>
          </div>

          {filteredSportGroups.length === 0 ? (
            <div className="no-results text-center py-5">
              <FaTrophy size={60} className="text-muted mb-3" />
              <h4>Không tìm thấy sân phù hợp</h4>
              <p className="text-muted">Thử thay đổi bộ lọc của bạn</p>
            </div>
          ) : (
            <Row className="g-4">
              {filteredSportGroups.map((sportGroup) => (
                <Col key={sportGroup.sportType} lg={4} md={6} sm={12}>
                  <div className="sport-card">
                    <div className="sport-card-image">
                      <img
                        src={
                          sportGroup.sampleCourt.images[0] ||
                          "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop&auto=format&q=80"
                        }
                        alt={sportGroup.sportType}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop&auto=format&q=80";
                        }}
                      />
                      <div className="sport-card-overlay">
                        <div className="sport-icon">
                          {getSportIcon(sportGroup.sportType)}
                        </div>
                        <h4 className="sport-name">
                          {sportGroup.sportType.toUpperCase()}
                        </h4>
                      </div>
                    </div>

                    <div className="sport-card-body">
                      <div className="sport-stats-row mb-3">
                        <div className="stat-item-small">
                          <FaUsers className="text-primary" />
                          <span>{sportGroup.totalCourts} sân</span>
                        </div>
                        <div className="stat-item-small">
                          <FaStar className="text-warning" />
                          <span>{sportGroup.averageRating.toFixed(1)}</span>
                        </div>
                      </div>

                      <div className="price-range mb-3">
                        <span className="price-label">Giá:</span>
                        <span className="price-value">
                          {formatCurrency(sportGroup.minPrice)} -{" "}
                          {formatCurrency(sportGroup.maxPrice)}
                        </span>
                      </div>

                      <div className="court-details mb-3">
                        <div className="detail-row">
                          <span className="detail-label">Loại:</span>
                          <span className="detail-value">
                            {sportGroup.sampleCourt.courtType}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Sức chứa:</span>
                          <span className="detail-value">
                            {sportGroup.sampleCourt.capacity} người
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Bề mặt:</span>
                          <span className="detail-value">
                            {sportGroup.sampleCourt.surface}
                          </span>
                        </div>
                      </div>

                      <button
                        className="btn btn-primary w-100 rounded-pill"
                        onClick={() => handleBookSportType(sportGroup)}
                      >
                        <FaCalendarAlt className="me-2" />
                        Đặt Sân Ngay
                      </button>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </Container>

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

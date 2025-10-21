import SearchFilter from "@/components/client/search/SearchFilter";
import { useCurrentApp } from "@/components/context/app.context";
import { useCommunityHub } from "@/hooks/useCommunityHub";
import { useSportsMatching } from "@/hooks/useSportsMatching";
import { fetchAccountAPI } from "@/services/api";
import type { ITournament } from "@/services/tournamentApi";
import { getLatestActiveTournamentsAPI } from "@/services/tournamentApi";
import { searchVenuesAPI } from "@/services/venueApi";
import type { IVenue, IVenueFilterParams } from "@/types/venue";
import { App, Pagination } from "antd";
import { useEffect, useRef, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import {
  FaCalendar,
  FaChartLine,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaRobot,
  FaStar,
  FaTimes,
  FaTrophy,
  FaUsers,
  FaWifi,
} from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./home.scss";

const HomePage = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { message } = App.useApp();
  const { setIsAuthenticated, setUser } = useCurrentApp();
  const navigate = useNavigate();

  // Community Hub data
  const { fetchAllData } = useCommunityHub();
  const {
    data: sportsMatchingData,
    findPlayersBySports,
    getSportsOptions,
    sendInvitation,
    initializeData: initializeSportsMatching,
  } = useSportsMatching();

  // Sports matching states
  const [selectedSport, setSelectedSport] = useState<string>("");
  const [showSportsFilter, setShowSportsFilter] = useState(false);
  const [sportsOptions, setSportsOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  // Search states
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    venues: IVenue[];
    total: number;
    page: number;
    totalPages: number;
  }>({
    venues: [],
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [showResults, setShowResults] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Tournaments states
  const [tournamentsData, setTournamentsData] = useState<{
    tournaments: ITournament[];
    loading: boolean;
    error: string | null;
  }>({
    tournaments: [],
    loading: true,
    error: null,
  });

  // Handle search function - only for venues now
  const handleSearch = async (params: IVenueFilterParams) => {
    setSearchLoading(true);
    try {
      const response = await searchVenuesAPI(params);
      const payload = response?.data;
      if (payload) {
        setSearchResults({
          venues: payload.venues || [],
          total: payload.total || 0,
          page: payload.page || 1,
          totalPages: payload.totalPages || 1,
        });
      }
      setShowResults(true);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Search error:", error);
      message.error("Không thể tìm kiếm. Vui lòng thử lại.");
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    // Re-search with new page
    // For demo, we'll just update the page state
    setSearchResults((prev) => ({ ...prev, page }));
  };

  // Load latest active tournaments
  const loadLatestTournaments = async () => {
    setTournamentsData((prev) => ({ ...prev, loading: true, error: null }));
    try {
      console.log("🔄 Loading latest tournaments...");
      const response = (await getLatestActiveTournamentsAPI()) as any;
      console.log("📡 Tournament API response:", response);
      console.log("📡 Response success:", response?.success);
      console.log("📡 Response data array:", response?.data);

      // Axios interceptor returns response.data directly
      let tournaments = [];

      if (response?.success && response?.data) {
        console.log("✅ Tournaments loaded successfully:", response.data);
        tournaments = response.data || [];
      } else if (Array.isArray(response)) {
        // If response is directly an array (from axios interceptor)
        console.log("✅ Tournaments loaded directly as array:", response);
        tournaments = response || [];
      } else {
        console.log("❌ API response failed:", response);
        setTournamentsData({
          tournaments: [],
          loading: false,
          error: "Failed to load tournaments",
        });
        return;
      }

      // Use real data from database only
      if (tournaments.length === 0) {
        console.log("⚠️ No tournaments from API");
        setTournamentsData({
          tournaments: [],
          loading: false,
          error: "No tournaments available",
        });
      } else {
        console.log(
          "✅ Using real tournament data from database:",
          tournaments
        );
        setTournamentsData({
          tournaments: tournaments,
          loading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error("💥 Error loading tournaments:", error);
      setTournamentsData({
        tournaments: [],
        loading: false,
        error: "Failed to load tournaments from database",
      });
    }
  };

  // Xóa hàm handleFindVenues vì scroll đã tích hợp vào handleSearch
  // Handle venue actions
  const handleViewCourts = (venueId: string) => {
    navigate(`/venue/${venueId}`);
  };

  // Get gradient by tier
  const getGradientByTier = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case "platinum":
        return "from-purple-500 to-pink-500";
      case "gold":
        return "from-yellow-500 to-orange-500";
      case "silver":
        return "from-gray-400 to-gray-600";
      case "bronze":
        return "from-orange-600 to-red-500";
      default:
        return "from-blue-500 to-purple-500";
    }
  };

  // Get sport icon
  const getSportIcon = (sport: string) => {
    switch (sport?.toLowerCase()) {
      case "football":
      case "soccer":
        return "futbol";
      case "basketball":
        return "basketball-ball";
      case "tennis":
        return "table-tennis";
      case "badminton":
        return "badminton";
      case "swimming":
        return "swimmer";
      case "volleyball":
        return "volleyball-ball";
      case "baseball":
        return "baseball-ball";
      case "golf":
        return "golf-ball";
      case "running":
        return "running";
      case "cycling":
        return "bicycle";
      case "yoga":
        return "om";
      case "gym":
      case "fitness":
        return "dumbbell";
      case "boxing":
        return "boxing-glove";
      case "martial-arts":
        return "fist-raised";
      default:
        return "gamepad";
    }
  };

  // Handle sports filter
  const handleSportsFilter = async (sport: string) => {
    setSelectedSport(sport);
    await findPlayersBySports(sport ? [sport] : undefined);
  };

  // Handle sending sports invitation
  const handleSendInvitation = async (
    playerId: string,
    commonSports: string[]
  ) => {
    try {
      const result = await sendInvitation({
        targetUserId: playerId,
        sport: commonSports[0], // Use first common sport
        message: `Hi! I'd like to play ${commonSports.join(
          " or "
        )} with you. Are you interested?`,
        proposedDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0], // Tomorrow
        proposedTime: "14:00",
        location: "Sports Center",
      });

      if (result.success) {
        message.success("Invitation sent successfully!");
      } else {
        message.error(result.error || "Failed to send invitation");
      }
    } catch {
      message.error("Failed to send invitation");
    }
  };

  useEffect(() => {
    setIsVisible(true);

    // Initialize both Community Hub and Sports Matching data
    Promise.all([
      fetchAllData(),
      initializeSportsMatching(),
      loadLatestTournaments(), // Load latest tournaments
    ]).then(async () => {
      // Set default selected sport based on current user's favorite sports
      if (
        sportsMatchingData.currentUser?.favoriteSports &&
        sportsMatchingData.currentUser.favoriteSports.length > 0
      ) {
        setSelectedSport(sportsMatchingData.currentUser.favoriteSports[0]);
      }

      // Load sports options
      const sportsResponse = await getSportsOptions();
      if (sportsResponse.success) {
        setSportsOptions(sportsResponse.data);
      }
    });
  }, []); // Empty dependency array to run only once

  // Separate useEffect for email verification
  useEffect(() => {
    const verified = searchParams.get("verified");
    const token = searchParams.get("token");

    if (verified === "true" && token) {
      // Set token and login user automatically
      localStorage.setItem("access_token", token);

      // Fetch user data and login
      const loginAfterVerification = async () => {
        try {
          const response = await fetchAccountAPI();
          if (response?.data?.user) {
            setIsAuthenticated(true);
            setUser(response.data.user);
            message.success(
              t("verify_email.success_message") ||
                "Email verified successfully! You are now logged in."
            );
          }
        } catch (error) {
          console.error("Error fetching user data after verification:", error);
          message.error("Failed to login after verification");
        }
      };

      loginAfterVerification();

      // Clean up URL parameters
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, setIsAuthenticated, setUser, message, t]);

  // Use real data from API instead of mock data
  const livePlayers = (sportsMatchingData.matchedPlayers || []).map(
    (player) => ({
      name: player.fullName,
      avatar: player.avatar || player.fullName.charAt(0),
      sport: `🏆 ${player.commonSports.join(", ")} • ${
        player.matchPercentage
      }% match`,
      level: player.level || 0,
      tags: [player.tier || "PLAYER", `${player.commonSportsCount} sports`],
      gradient: getGradientByTier(player.tier || "Bronze"),
      matchPercentage: player.matchPercentage,
      commonSports: player.commonSports,
      playerId: player._id,
    })
  );

  const tournaments = tournamentsData.tournaments.map((tournament) => ({
    _id: tournament._id,
    name: tournament.name,
    registrationFee: tournament.registrationFee
      ? `${tournament.registrationFee.toLocaleString()} VND`
      : "Miễn phí",
    status:
      tournament.status === "ongoing"
        ? "ĐANG DIỄN RA"
        : tournament.status === "registration_open"
        ? "MỞ ĐĂNG KÝ"
        : "UPCOMING",
    isLive: tournament.status === "ongoing",
    sportType:
      tournament.sportType?.charAt(0).toUpperCase() +
        tournament.sportType?.slice(1) || "Thể thao",
  }));

  return (
    <div className="futuristic-home">
      {/* Animated Background */}
      <div className="animated-background">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
      </div>

      {/* Hero Section */}
      <section className="futuristic-hero">
        <Container>
          <div className={`text-center ${isVisible ? "fade-in" : ""}`}>
            <div className="hero-badge mb-4">
              <span>🚀 NEXT-GEN SPORTS PLATFORM</span>
            </div>

            <h1 className="hero-title">
              <span className="title-line-1">PLAY</span>
              <br />
              <span className="title-line-2">BEYOND</span>
            </h1>

            <p className="hero-description">
              {t("home.hero.futuristicDescription")}
            </p>

            {/* New Search Filter */}
            <SearchFilter onSearch={handleSearch} loading={searchLoading} />
          </div>
        </Container>
      </section>

      {/* Search Results Section */}
      {showResults && (
        <section
          className="smart-courts-section search-results"
          ref={resultsRef}
        >
          <Container>
            <Row className="align-items-center mb-5">
              <Col lg={8}>
                <h2 className="section-title text-start">
                  <span className="gradient-text">
                    {t("search.result_title")}
                  </span>
                </h2>
                <p className="section-subtitle text-start">
                  {searchResults.total === 1
                    ? t("search.result_found_single")
                    : t("search.result_found_multiple", {
                        count: searchResults.total,
                      })}
                </p>
              </Col>
              <Col lg={4} className="text-end">
                {searchResults.totalPages > 1 && (
                  <div className="pagination-info">
                    {t("search.pagination", {
                      current: searchResults.page,
                      total: searchResults.totalPages,
                    })}
                  </div>
                )}
              </Col>
            </Row>

            {searchResults.total > 0 ? (
              <>
                <Row className="g-4">
                  {/* Display venues in smart court card style */}
                  {(searchResults.venues || []).map((venue) => (
                    <Col lg={4} key={venue._id}>
                      <div className="smart-court-card">
                        <div className="court-glow"></div>

                        {/* Venue Visual */}
                        <div className="court-visual bg-gradient-to-br from-green-900 via-green-800 to-green-900">
                          <div className="court-overlay"></div>

                          {/* Venue Image or Icon */}
                          <div className="field-lines">
                            <div className="venue-display">
                              {venue.images.length > 0 ? (
                                <img
                                  src={venue.images[0]}
                                  alt={venue.name}
                                  className="venue-bg-image"
                                  onError={(e) => {
                                    (
                                      e.target as HTMLImageElement
                                    ).style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="venue-icon">🏟️</div>
                              )}
                            </div>
                          </div>

                          {/* Tech Overlays */}
                          <div className="tech-overlays">
                            <div className="tech-badge-left">
                              <div className="status-dot"></div>
                              <span>
                                {venue.isVerified
                                  ? "ĐÃ XÁC THỰC"
                                  : "CHƯA XÁC THỰC"}
                              </span>
                            </div>
                            <div className="tech-badge-right">
                              <span>🏢 KHU THỂ THAO</span>
                            </div>
                            <div className="court-info">
                              <div className="info-left">
                                <FaMapMarkerAlt className="me-2" />
                                <span>{venue.address.district}</span>
                              </div>
                              <div className="info-right">
                                <FaStar className="me-2" />
                                <span>{venue.ratings.average}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Venue Details */}
                        <div className="court-details">
                          <div className="court-header">
                            <h3 className="court-name">{venue.name}</h3>
                            <div className="court-rating">
                              <FaStar className="text-warning" />
                              <span>{venue.ratings.average}</span>
                            </div>
                          </div>

                          <p className="court-location">
                            <FaMapMarkerAlt className="me-2" />
                            {venue.address.ward}, {venue.address.district}
                          </p>

                          {/* Venue Features */}
                          <div className="tech-features">
                            {Array.isArray(venue.amenities) &&
                            venue.amenities.length > 0 ? (
                              venue.amenities
                                .slice(0, 3)
                                .map((amenity, index) => (
                                  <div key={index} className="tech-feature">
                                    <FaWifi />
                                    <span>{amenity.name}</span>
                                  </div>
                                ))
                            ) : (
                              <div className="tech-feature">
                                <FaWifi />
                                <span>Tiện ích hiện chưa cập nhật</span>
                              </div>
                            )}
                          </div>

                          <div className="court-pricing">
                            <div className="price-info">
                              <span className="price">
                                {venue.totalBookings}
                              </span>
                              <span className="price-unit">lượt đặt</span>
                            </div>
                            <div className="earn-info">
                              <div className="earn-label">Phí gửi xe</div>
                              <div className="earn-amount">
                                {venue.parking.available
                                  ? new Intl.NumberFormat("vi-VN").format(
                                      venue.parking.fee
                                    ) + " VNĐ"
                                  : "Miễn phí"}
                              </div>
                            </div>
                          </div>

                          <button
                            className="book-court-btn"
                            onClick={() => handleViewCourts(venue._id)}
                          >
                            <FaRobot className="me-2" />
                            XEM DANH SÁCH SÂN
                          </button>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>

                {/* Smart Pagination */}
                {searchResults.totalPages > 1 && (
                  <div className="smart-pagination">
                    <Pagination
                      current={searchResults.page}
                      total={searchResults.total}
                      pageSize={10}
                      onChange={handlePageChange}
                      showSizeChanger={false}
                      showQuickJumper={false}
                      showTotal={(total, range) =>
                        `${range[0]}-${range[1]} của ${total} kết quả`
                      }
                      className="futuristic-pagination"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="no-results-smart">
                <div className="no-results-card">
                  <div
                    className="no-results-icon"
                    style={{ color: "#0099ff", fontSize: 48 }}
                  >
                    �️
                  </div>
                  <h3 style={{ color: "#0099ff", fontWeight: 700 }}>
                    Không tìm thấy kết quả
                  </h3>
                  <p style={{ color: "#333", fontWeight: 500 }}>
                    Không có khu thể thao nào phù hợp với tiêu chí tìm kiếm của
                    bạn
                  </p>
                  <div
                    style={{
                      color: "#0099ff",
                      fontWeight: 600,
                      margin: "12px 0 4px 0",
                      fontSize: 16,
                    }}
                  >
                    Using official Vietnam API v2 (updated after merger 07/2025)
                  </div>
                  <div
                    style={{
                      color: "#333",
                      fontWeight: 500,
                      marginBottom: 8,
                      fontSize: 15,
                    }}
                  >
                    🎯 Districts optimized for 6 major cities: HCM, HN, DN, HP,
                    CT
                  </div>
                  <button
                    className="view-all-btn"
                    onClick={() => setShowResults(false)}
                  >
                    Tìm kiếm lại
                  </button>
                </div>
              </div>
            )}
          </Container>
        </section>
      )}

      {/* Features Section */}
      {/* <section className="future-features-section">
        <Container>
          <div className="text-center mb-5">
            <h2 className="section-title">
              <span className="gradient-text">
                {t("home.features.futuristicTitle")}
              </span>
            </h2>
            <p className="section-subtitle">
              {t("home.features.futuristicSubtitle")}
            </p>
          </div>

          <Row className="g-4">
            {futureFeatures.map((feature, index) => (
              <Col md={6} lg={4} key={index}>
                <div className="future-feature-card">
                  <div className="feature-glow"></div>
                  <div className="feature-content">
                    <div
                      className={`feature-icon-futuristic bg-gradient-to-r ${feature.gradient}`}
                    >
                      {feature.icon}
                    </div>
                    <h3 className="feature-title-futuristic">
                      {feature.title}
                    </h3>
                    <p className="feature-description-futuristic">
                      {feature.description}
                    </p>
                    <div className="feature-tags">
                      {feature.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className="feature-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section> */}

      {/* Smart Courts Section */}
      {/* <section className="smart-courts-section">
        <Container>
          <Row className="align-items-center mb-5">
            <Col lg={8}>
              <h2 className="section-title text-start">
                <span className="gradient-text">{t("home.courts.title")}</span>
              </h2>
              <p className="section-subtitle text-start">
                {t("home.courts.subtitle")}
              </p>
            </Col>
            <Col lg={4} className="text-end">
              <button className="view-all-btn">
                {t("home.courts.viewAll")}
              </button>
            </Col>
          </Row>

          <Row className="g-4">
            {smartCourts.map((court, index) => (
              <Col lg={6} key={index}>
                <div className="smart-court-card">
                  <div className="court-glow"></div>


                  <div
                    className={`court-visual bg-gradient-to-br ${court.bgGradient}`}
                  >
                    <div className="court-overlay"></div>

                    <div className="field-lines">
                      {court.type === "football" ? (
                        <div className="football-field">
                          <div className="center-circle"></div>
                        </div>
                      ) : (
                        <div className="tennis-court">
                          <div className="net-line"></div>
                          <div className="service-line-1"></div>
                          <div className="service-line-2"></div>
                        </div>
                      )}
                    </div>

  
                    <div className="tech-overlays">
                      <div className="tech-badge-left">
                        <div className="status-dot"></div>
                        <span>AI TRACKING</span>
                      </div>
                      <div className="tech-badge-right">
                        <span>{court.techBadge}</span>
                      </div>
                      <div className="court-info">
                        <div className="info-left">
                          <FaUsers className="me-2" />
                          <span>{court.players}</span>
                        </div>
                        <div className="info-right">
                          {court.type === "football" ? (
                            <>
                              <FaThermometerHalf className="me-2" />
                              <span>{court.temperature}</span>
                            </>
                          ) : (
                            <>
                              <FaWind className="me-2" />
                              <span>{court.temperature}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>


                  <div className="court-details">
                    <div className="court-header">
                      <h3 className="court-name">{court.name}</h3>
                      <div className="court-rating">
                        <FaStar className="text-warning" />
                        <span>{court.rating}</span>
                      </div>
                    </div>

                    <p className="court-location">
                      <FaMapMarkerAlt className="me-2" />
                      {court.location}
                    </p>

                    <div className="tech-features">
                      {court.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="tech-feature">
                          {feature.icon}
                          <span>{feature.name}</span>
                        </div>
                      ))}
                    </div>

                    <div className="court-pricing">
                      <div className="price-info">
                        <span className="price">{court.price}</span>
                        <span className="price-unit">/hour</span>
                      </div>
                      <div className="earn-info">
                        <div className="earn-label">Earn up to</div>
                        <div className="earn-amount">{court.earnTokens}</div>
                      </div>
                    </div>

                    <button className="book-court-btn">
                      <FaRobot className="me-2" />
                      BOOK SMART COURT
                    </button>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section> */}

      {/* Community Hub Section */}
      <section className="community-hub-section">
        <Container>
          <div className="section-header text-center">
            <div className="section-badge">
              <FaUsers className="me-2" />
              <span>COMMUNITY HUB</span>
            </div>
            <h2 className="section-title">
              <span className="gradient-text">Connect & Play Together</span>
            </h2>
            <p className="section-description">
              Join our vibrant community of sports enthusiasts. Find teammates,
              create events, and share your passion!
            </p>
          </div>

          <Row className="g-4 mt-4">
            <Col lg={4} md={6}>
              <div
                className="community-card"
                onClick={() => navigate("/community")}
              >
                <div className="card-icon">
                  <FaUsers />
                </div>
                <h3 className="card-title">Find Playing Partners</h3>
                <p className="card-description">
                  Connect with players near you who share your interests and
                  skill level
                </p>
                <div className="card-stats">
                  <span className="stat-item">
                    <FaUsers className="stat-icon" />
                    2,500+ Active Users
                  </span>
                </div>
                <button className="card-action">
                  Explore Community
                  <FaPaperPlane className="ms-2" />
                </button>
              </div>
            </Col>

            <Col lg={4} md={6}>
              <div
                className="community-card highlight"
                onClick={() => navigate("/community")}
              >
                <div className="card-badge">POPULAR</div>
                <div className="card-icon">
                  <FaCalendar />
                </div>
                <h3 className="card-title">Create Activities</h3>
                <p className="card-description">
                  Organize sports events, matches, and training sessions with
                  ease
                </p>
                <div className="card-stats">
                  <span className="stat-item">
                    <FaCalendar className="stat-icon" />
                    500+ Events This Week
                  </span>
                </div>
                <button className="card-action featured">
                  Create Event
                  <FaPaperPlane className="ms-2" />
                </button>
              </div>
            </Col>

            <Col lg={4} md={6}>
              <div
                className="community-card"
                onClick={() => navigate("/community")}
              >
                <div className="card-icon">
                  <FaChartLine />
                </div>
                <h3 className="card-title">Track Progress</h3>
                <p className="card-description">
                  Monitor your activities, achievements, and connections
                </p>
                <div className="card-stats">
                  <span className="stat-item">
                    <FaChartLine className="stat-icon" />
                    Real-time Stats
                  </span>
                </div>
                <button className="card-action">
                  View Stats
                  <FaPaperPlane className="ms-2" />
                </button>
              </div>
            </Col>
          </Row>

          <div className="quick-preview">
            <div className="preview-header">
              <h3>Latest Community Activities</h3>
              <button
                className="view-all-btn"
                onClick={() => navigate("/community")}
              >
                View All
                <FaPaperPlane className="ms-2" />
              </button>
            </div>

            <Row className="g-4 mt-3">
              {[
                {
                  sport: "Football",
                  status: "open",
                  title: "Weekend Football Match",
                  location: "District 1, HCMC",
                  participants: 8,
                  maxParticipants: 12,
                },
                {
                  sport: "Basketball",
                  status: "filling",
                  title: "3v3 Basketball Tournament",
                  location: "District 7, HCMC",
                  participants: 5,
                  maxParticipants: 6,
                },
                {
                  sport: "Badminton",
                  status: "open",
                  title: "Morning Badminton Session",
                  location: "Thu Duc, HCMC",
                  participants: 3,
                  maxParticipants: 16,
                },
              ].map((activity: any, index: number) => (
                <Col lg={4} md={6} key={index}>
                  <div className="activity-preview-card">
                    <div className="activity-header">
                      <span className="activity-sport">{activity.sport}</span>
                      <span className={`activity-status ${activity.status}`}>
                        {activity.status}
                      </span>
                    </div>
                    <h4 className="activity-title">{activity.title}</h4>
                    <div className="activity-info">
                      <span className="info-item">
                        <FaMapMarkerAlt /> {activity.location}
                      </span>
                      <span className="info-item">
                        <FaUsers /> {activity.participants}/
                        {activity.maxParticipants}
                      </span>
                    </div>
                    <button className="activity-join-btn">
                      Join Activity
                      <FaPaperPlane className="ms-2" />
                    </button>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </Container>
      </section>

      {/* Tournaments Hub Section */}
      <section className="tournaments-hub-section">
        <Container>
          <div className="section-header text-center">
            <div className="section-badge">
              <FaTrophy className="me-2" />
              <span>TOURNAMENTS HUB</span>
            </div>
            <h2 className="section-title">
              <span className="gradient-text">Compete & Win Together</span>
            </h2>
            <p className="section-description">
              Join competitive tournaments, showcase your skills, and win
              amazing prizes!
            </p>
          </div>
          <Row className="g-4 mt-4">
            {/* Sports Matching Section - Left Side */}
            <Col lg={8}>
              <div className="community-card h-100">
                <div className="community-header d-flex align-items-center justify-content-between mb-4">
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      <i className="fas fa-users fa-2x text-primary"></i>
                    </div>
                    <div>
                      <h3 className="community-title mb-0 fw-bold">
                        <span className="text-dark">SPORTS</span>
                        <span className="text-primary ms-2">MATCHING</span>
                      </h3>
                      <p className="text-muted small mb-0">
                        Find players with similar interests
                      </p>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    <button
                      className={`btn btn-sm px-3 py-2 rounded-pill ${
                        showSportsFilter ? "btn-primary" : "btn-outline-primary"
                      }`}
                      onClick={() => setShowSportsFilter(!showSportsFilter)}
                    >
                      <i className="fas fa-filter me-1"></i>
                      Filter Sports
                    </button>
                    <div className="online-indicator d-flex align-items-center bg-light rounded-pill px-3 py-2">
                      <div
                        className="online-dot me-2"
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: "#28a745",
                        }}
                      ></div>
                      <span className="online-count text-primary fw-bold small">
                        {sportsMatchingData.matchedPlayers.length.toLocaleString()}{" "}
                        MATCHES
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sports Filter Dropdown */}
                {showSportsFilter && (
                  <div className="sports-filter-panel mb-4 p-4 bg-white rounded-3 shadow-sm border">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h5 className="mb-0 text-dark fw-bold">
                        <i className="fas fa-filter text-primary me-2"></i>
                        Filter by Sports
                      </h5>
                      <button
                        className="btn btn-sm btn-danger rounded-circle"
                        onClick={() => setShowSportsFilter(false)}
                        style={{
                          width: "12px",
                          height: "12px",
                          padding: "0",
                          fontSize: "14px",
                        }}
                        title="Close filter"
                      >
                        <i className="fas fa-times text-white"></i>
                      </button>
                    </div>

                    {sportsMatchingData.loading.sports ? (
                      <div className="text-center py-3">
                        <div
                          className="spinner-border spinner-border-sm text-primary"
                          role="status"
                        >
                          <span className="visually-hidden">
                            Loading sports...
                          </span>
                        </div>
                        <p className="text-muted mt-2 mb-0">
                          Loading sports options...
                        </p>
                      </div>
                    ) : sportsMatchingData.errors.sports ? (
                      <div className="text-center py-3 text-danger">
                        <i className="fas fa-exclamation-triangle fa-2x mb-2"></i>
                        <p className="mb-2">
                          Failed to load sports:{" "}
                          {sportsMatchingData.errors.sports}
                        </p>
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => window.location.reload()}
                        >
                          <i className="fas fa-redo me-1"></i>
                          Retry
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="mb-3">
                          <label className="form-label text-muted small">
                            Select Sport:
                          </label>
                          <div className="d-flex flex-wrap gap-2">
                            {sportsOptions.length > 0 ? (
                              sportsOptions.map((sport) => (
                                <button
                                  key={sport.value}
                                  className={`btn btn-sm px-3 py-2 rounded-pill ${
                                    selectedSport === sport.value
                                      ? "btn-primary"
                                      : "btn-outline-primary"
                                  }`}
                                  onClick={() =>
                                    handleSportsFilter(sport.value)
                                  }
                                >
                                  <i
                                    className={`fas fa-${getSportIcon(
                                      sport.value
                                    )} me-1`}
                                  ></i>
                                  {sport.label}
                                </button>
                              ))
                            ) : (
                              <div className="text-center text-muted py-3 w-100">
                                <i className="fas fa-info-circle me-1"></i>
                                No sports available
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="players-list">
                  {sportsMatchingData.loading.players ? (
                    <div className="text-center py-5">
                      <div
                        className="spinner-border text-primary mb-3"
                        role="status"
                        style={{ width: "3rem", height: "3rem" }}
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <h6 className="text-muted">Finding players...</h6>
                    </div>
                  ) : sportsMatchingData.errors.players ? (
                    <div className="text-center py-5">
                      <div className="bg-light rounded-3 p-4">
                        <i className="fas fa-exclamation-triangle text-warning fa-3x mb-3"></i>
                        <h6 className="text-danger mb-2">
                          Failed to load players
                        </h6>
                        <p className="text-muted mb-3">
                          {sportsMatchingData.errors.players}
                        </p>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() =>
                            findPlayersBySports(
                              selectedSport ? [selectedSport] : undefined
                            )
                          }
                        >
                          <i className="fas fa-redo me-1"></i>
                          Try Again
                        </button>
                      </div>
                    </div>
                  ) : livePlayers.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="bg-light rounded-3 p-4">
                        <i className="fas fa-users text-muted fa-3x mb-3"></i>
                        <h6 className="text-muted mb-2">
                          {sportsMatchingData.isRandom
                            ? "No favorite sports found"
                            : "No players found"}
                        </h6>
                        <p className="text-muted small mb-0">
                          {sportsMatchingData.isRandom
                            ? "Showing random players from the community"
                            : "Try selecting different sports or clear filters"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="row g-3">
                      {livePlayers.map((player, index) => (
                        <div key={index} className="col-12">
                          <div className="player-card bg-white rounded-3 p-3 shadow-sm border h-100">
                            <div className="d-flex align-items-center">
                              <div className="player-avatar-container me-3 position-relative">
                                {player.avatar &&
                                player.avatar.startsWith("http") ? (
                                  <img
                                    src={player.avatar}
                                    alt={player.name}
                                    className="player-avatar"
                                    style={{
                                      width: "60px",
                                      height: "60px",
                                      borderRadius: "50%",
                                      objectFit: "cover",
                                    }}
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                      const nextElement = e.currentTarget
                                        .nextElementSibling as HTMLElement;
                                      if (nextElement) {
                                        nextElement.style.display = "flex";
                                      }
                                    }}
                                  />
                                ) : null}
                                <div
                                  className={`player-avatar bg-gradient-to-r ${player.gradient} d-flex align-items-center justify-content-center text-white fw-bold`}
                                  style={{
                                    width: "60px",
                                    height: "60px",
                                    borderRadius: "50%",
                                    display:
                                      player.avatar &&
                                      player.avatar.startsWith("http")
                                        ? "none"
                                        : "flex",
                                  }}
                                >
                                  {player.avatar &&
                                  !player.avatar.startsWith("http")
                                    ? player.avatar
                                    : player.name?.charAt(0)?.toUpperCase()}
                                </div>
                              </div>

                              <div className="player-info flex-grow-1">
                                <h6 className="player-name mb-1 fw-bold text-dark">
                                  {player.name}
                                </h6>
                                <p className="player-sport mb-2 text-muted small">
                                  <i className="fas fa-trophy text-warning me-1"></i>
                                  {player.commonSports.map((sport) => (
                                    <span key={sport} className="me-1">
                                      <i
                                        className={`fas fa-${getSportIcon(
                                          sport
                                        )} me-1`}
                                      ></i>
                                      {sport.charAt(0).toUpperCase() +
                                        sport.slice(1)}
                                    </span>
                                  ))}
                                  <span className="ms-2 fw-bold text-primary">
                                    {player.matchPercentage}% match
                                  </span>
                                </p>
                                <div className="player-tags d-flex gap-1 flex-wrap">
                                  {player.tags.map((tag, tagIndex) => (
                                    <span
                                      key={tagIndex}
                                      className="badge bg-light text-dark border"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="player-actions d-flex gap-2">
                                <button
                                  className="btn btn-outline-primary btn-sm rounded-pill px-3"
                                  onClick={() =>
                                    handleSendInvitation(
                                      player.playerId,
                                      player.commonSports
                                    )
                                  }
                                  title="Send Sports Invitation"
                                >
                                  <i className="fas fa-gamepad me-1"></i>
                                  Invite
                                </button>
                                <button
                                  className="btn btn-primary btn-sm rounded-pill px-3"
                                  onClick={() =>
                                    handleSendInvitation(
                                      player.playerId,
                                      player.commonSports
                                    )
                                  }
                                  title="Send Message"
                                >
                                  <i className="fas fa-paper-plane me-1"></i>
                                  Message
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Col>

            {/* Tournaments Section - Right Side */}
            <Col lg={4}>
              <div className="tournaments-sidebar h-100">
                <div className="community-card h-100">
                  <div className="d-flex align-items-center mb-3">
                    <FaTrophy className="me-2 text-primary" size={24} />
                    <h5 className="mb-0 fw-bold text-dark">TOURNAMENTS</h5>
                  </div>

                  <div
                    className="tournaments-list"
                    style={{ maxHeight: "600px", overflowY: "auto" }}
                  >
                    {tournamentsData.loading ? (
                      <div className="text-center py-4">
                        <div
                          className="spinner-border text-primary"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : tournamentsData.error ? (
                      <div className="text-center py-4 text-danger">
                        <p>
                          Failed to load tournaments: {tournamentsData.error}
                        </p>
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={loadLatestTournaments}
                        >
                          Retry
                        </button>
                      </div>
                    ) : tournaments.length === 0 ? (
                      <div className="text-center py-4 text-muted">
                        <p>Không có giải đấu nào đang diễn ra</p>
                        <small className="text-muted">
                          Hãy quay lại sau để xem các giải đấu mới
                        </small>
                      </div>
                    ) : (
                      tournaments.map((tournament, index) => (
                        <div
                          key={index}
                          className={`tournament-item ${
                            tournament.isLive ? "live" : ""
                          }`}
                          style={{
                            background: "white",
                            borderRadius: "12px",
                            padding: "20px",
                            marginBottom: "15px",
                            boxShadow: "0 4px 15px rgba(102, 126, 234, 0.1)",
                            border: "1px solid rgba(102, 126, 234, 0.1)",
                            transition: "all 0.3s ease",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                            e.currentTarget.style.boxShadow =
                              "0 8px 25px rgba(102, 126, 234, 0.2)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 15px rgba(102, 126, 234, 0.1)";
                          }}
                          onClick={() => {
                            const tournamentId = (tournament as any)._id;
                            console.log("🎯 Clicking tournament:", tournament);
                            console.log(
                              "🎯 Tournament _id from database:",
                              tournamentId
                            );
                            console.log("🎯 Tournament name:", tournament.name);

                            if (tournamentId) {
                              console.log(
                                "✅ Using real tournament ID from database"
                              );
                              navigate(`/tournament/${tournamentId}`);
                            } else {
                              console.log(
                                "❌ No _id found in tournament object"
                              );
                              console.log(
                                "❌ Tournament object keys:",
                                Object.keys(tournament)
                              );
                            }
                          }}
                        >
                          {tournament.isLive && (
                            <div className="live-badge">LIVE</div>
                          )}
                          <h4 className="tournament-name text-dark fw-bold">
                            {tournament.name}
                          </h4>
                          <div className="tournament-info mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span
                                className="badge"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                  color: "white",
                                  border: "none",
                                }}
                              >
                                <i className="fas fa-trophy me-1"></i>
                                {tournament.sportType}
                              </span>
                              <span
                                className={`badge ${
                                  tournament.isLive ? "bg-danger" : ""
                                }`}
                                style={{
                                  background: tournament.isLive
                                    ? "#dc3545"
                                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                  color: "white",
                                  border: "none",
                                }}
                              >
                                {tournament.status}
                              </span>
                            </div>
                            <div className="registration-fee text-dark">
                              <i className="fas fa-money-bill-wave me-1 text-primary"></i>
                              <strong>
                                Phí tham gia: {tournament.registrationFee}
                              </strong>
                            </div>
                          </div>
                          <div className="tournament-footer">
                            {tournament.isLive ? (
                              <button
                                className="btn w-100"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                  color: "white",
                                  border: "none",
                                  fontWeight: "bold",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const tournamentId = (tournament as any)._id;
                                  if (tournamentId) {
                                    navigate(`/tournament/${tournamentId}`);
                                  } else {
                                    console.log(
                                      "❌ No _id found for button click"
                                    );
                                  }
                                }}
                              >
                                <i className="fas fa-play me-1"></i>
                                THAM GIA NGAY
                              </button>
                            ) : tournament.status === "MỞ ĐĂNG KÝ" ? (
                              <button
                                className="btn w-100"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                  color: "white",
                                  border: "none",
                                  fontWeight: "bold",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const tournamentId = (tournament as any)._id;
                                  if (tournamentId) {
                                    navigate(`/tournament/${tournamentId}`);
                                  } else {
                                    console.log(
                                      "❌ No _id found for button click"
                                    );
                                  }
                                }}
                              >
                                <i className="fas fa-user-plus me-1"></i>
                                ĐĂNG KÝ NGAY
                              </button>
                            ) : (
                              <button
                                className="btn w-100"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #e9ecef 0%, #f8f9fa 100%)",
                                  color: "#6c757d",
                                  border: "1px solid #dee2e6",
                                  fontWeight: "bold",
                                }}
                                disabled
                                onClick={(e) => e.stopPropagation()}
                              >
                                <i className="fas fa-clock me-1"></i>
                                {tournament.status}
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}

                    <button
                      className="view-all-tournaments w-100 mt-3"
                      onClick={() => navigate("/tournaments")}
                      style={{
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        padding: "12px 20px",
                        fontWeight: "bold",
                        fontSize: "14px",
                        transition: "all 0.3s ease",
                        boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
                        cursor: "pointer",
                      }}
                    >
                      <FaTrophy className="me-2" />
                      VIEW ALL TOURNAMENTS
                    </button>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Floating Chat Bot */}
      <div className="floating-chatbot">
        <button
          className="chatbot-toggle"
          onClick={() => setShowChatBot(!showChatBot)}
        >
          <FaRobot />
          <div className="ai-badge">AI</div>
        </button>

        {showChatBot && (
          <div className="chatbot-window">
            <div className="chatbot-header">
              <div className="chatbot-info">
                <div className="chatbot-avatar">
                  <FaRobot />
                </div>
                <div className="chatbot-details">
                  <h3>VIC AI Assistant</h3>
                  <p>Powered by GPT-4 & Sports AI</p>
                </div>
              </div>
              <button
                className="chatbot-close"
                onClick={() => setShowChatBot(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="chatbot-messages">
              <div className="message ai-message">
                <div className="message-avatar">
                  <FaRobot />
                </div>
                <div className="message-content">
                  <p>
                    🚀 Welcome to VIC Sports! I'm your AI assistant powered by
                    advanced sports analytics.
                  </p>
                  <p>I can help you with:</p>
                  <ul>
                    <li>• Smart court booking</li>
                    <li>• Performance analysis</li>
                    <li>• Finding training partners</li>
                    <li>• Tournament recommendations</li>
                  </ul>
                  <span className="message-time">Just now</span>
                </div>
              </div>
            </div>

            <div className="chatbot-input">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Ask me anything about sports..."
                  className="chatbot-text-input"
                />
                <button className="send-btn">
                  <FaPaperPlane />
                </button>
              </div>
              <div className="quick-actions">
                <button className="quick-action">Book smart court</button>
                <button className="quick-action">Find players</button>
                <button className="quick-action">VIC tokens</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;

/*
<CommunityPage /> // Example usage of CommunityPage
*/

import { searchVenuesAPI } from "@/services/venueApi";
import type { IVenue } from "@/types/venue";
import { App, Pagination, Spin } from "antd";
import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { FaMapMarkerAlt, FaRobot, FaStar, FaWifi } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./home.scss";

const VenuesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { message } = App.useApp();

  // Search states
  const [loading, setLoading] = useState(false);
  const [venues, setVenues] = useState<IVenue[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch venues on component mount
  useEffect(() => {
    fetchVenues();
  }, [currentPage]);

  const fetchVenues = async () => {
    setLoading(true);
    try {
      const response = await searchVenuesAPI({
        page: currentPage,
        limit: 12,
      });
      const payload = response?.data?.data || response?.data;
      if (payload) {
        setVenues(payload.venues || []);
        setTotal(payload.total || 0);
        setTotalPages(payload.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching venues:", error);
      message.error("Unable to load venues list. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle venue actions
  const handleViewCourts = (venueId: string) => {
    navigate(`/venue/${venueId}`);
  };

  return (
    <div className="futuristic-home">
      {/* Animated Background */}
      <div className="animated-background">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
      </div>

      {/* Hero Section */}
      <section
        className="futuristic-hero"
        style={{ paddingTop: "120px", paddingBottom: "60px" }}
      >
        <Container>
          <div className="text-center">
            <div className="hero-badge mb-4">
              <span>🏟️ PREMIUM SPORTS VENUES</span>
            </div>

            <h1 className="hero-title">
              <span className="title-line-1">DISCOVER</span>
              <br />
              <span className="title-line-2">SPORTS VENUES</span>
            </h1>

            <p className="hero-description">
              Find and book courts at top sports venues with modern amenities
            </p>

            {/* Stats */}
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">{total}+</div>
                <div className="stat-label">SPORTS VENUES</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">50K+</div>
                <div className="stat-label">COURT BOOKINGS</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">4.8★</div>
                <div className="stat-label">AVERAGE RATING</div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Venues Section */}
      <section className="smart-courts-section">
        <Container>
          <Row className="align-items-center mb-5">
            <Col lg={8}>
              <h2 className="section-title text-start">
                <span className="gradient-text">Sports Venues List</span>
              </h2>
              <p className="section-subtitle text-start">
                {total === 1
                  ? "Found 1 sports venue"
                  : `Found ${total} sports venues`}
              </p>
            </Col>
            <Col lg={4} className="text-end">
              {totalPages > 1 && (
                <div className="pagination-info">
                  Page {currentPage} / {totalPages}
                </div>
              )}
            </Col>
          </Row>

          {loading ? (
            <div className="text-center py-5">
              <Spin size="large" />
              <p className="mt-3">Loading sports venues...</p>
            </div>
          ) : venues.length > 0 ? (
            <>
              <Row className="g-4">
                {venues.map((venue) => (
                  <Col lg={4} md={6} key={venue._id}>
                    <div className="smart-court-card">
                      <div className="court-glow"></div>

                      {/* Venue Visual */}
                      <div className="court-visual bg-gradient-to-br from-green-900 via-green-800 to-green-900">
                        <div className="court-overlay"></div>

                        {/* Venue Image or Icon */}
                        <div className="field-lines">
                          <div className="venue-display">
                            {venue.images && venue.images.length > 0 ? (
                              <img
                                src={venue.images[0]}
                                alt={venue.name}
                                className="venue-bg-image"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display =
                                    "none";
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
                              {venue.isVerified ? "VERIFIED" : "UNVERIFIED"}
                            </span>
                          </div>
                          <div className="tech-badge-right">
                            <span>🏢 SPORTS VENUE</span>
                          </div>
                          <div className="court-info">
                            <div className="info-left">
                              <FaMapMarkerAlt className="me-2" />
                              <span>{venue.address?.district || "N/A"}</span>
                            </div>
                            <div className="info-right">
                              <FaStar className="me-2" />
                              <span>{venue.ratings?.average || "N/A"}</span>
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
                            <span>{venue.ratings?.average || "N/A"}</span>
                          </div>
                        </div>

                        <p className="court-location">
                          <FaMapMarkerAlt className="me-2" />
                          {venue.address?.ward && venue.address?.district
                            ? `${venue.address.ward}, ${venue.address.district}`
                            : venue.address?.district || "Address not updated"}
                        </p>

                        {/* Venue Features */}
                        <div className="tech-features">
                          {venue.amenities && venue.amenities.length > 0 ? (
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
                              <span>Modern Amenities</span>
                            </div>
                          )}
                        </div>

                        <div className="court-pricing">
                          <div className="price-info">
                            <span className="price">
                              {venue.totalBookings || 0}
                            </span>
                            <span className="price-unit">bookings</span>
                          </div>
                          <div className="earn-info">
                            <div className="earn-label">Parking Fee</div>
                            <div className="earn-amount">
                              {venue.parking?.available
                                ? new Intl.NumberFormat("en-US").format(
                                    venue.parking.fee
                                  ) + " VND"
                                : "Free"}
                            </div>
                          </div>
                        </div>

                        <button
                          className="book-court-btn"
                          onClick={() => handleViewCourts(venue._id)}
                        >
                          <FaRobot className="me-2" />
                          VIEW COURT LIST
                        </button>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>

              {/* Smart Pagination */}
              {totalPages > 1 && (
                <div className="smart-pagination">
                  <Pagination
                    current={currentPage}
                    total={total}
                    pageSize={12}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                    showQuickJumper={false}
                    showTotal={(total, range) =>
                      `${range[0]}-${range[1]} of ${total} results`
                    }
                    className="futuristic-pagination"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="no-results-smart">
              <div className="no-results-card">
                <div className="no-results-icon">🏟️</div>
                <h3>No Sports Venues Available</h3>
                <p>Currently there are no sports venues in the system</p>
                <button className="view-all-btn" onClick={() => navigate("/")}>
                  Back to Home
                </button>
              </div>
            </div>
          )}
        </Container>
      </section>
    </div>
  );
};

export default VenuesPage;

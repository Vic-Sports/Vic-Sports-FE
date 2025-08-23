import { Container, Row, Col } from "react-bootstrap";
import {
  FaBrain,
  FaBitcoin,
  FaEye,
  FaChartLine,
  FaTachometerAlt,
  FaVideo,
  FaRobot,
  FaBullseye,
  FaShieldAlt,
  FaWifi,
  FaUsers,
  FaGamepad,
  FaPaperPlane,
  FaTrophy,
  FaStar,
  FaMapMarkerAlt,
  FaThermometerHalf,
  FaWind,
  FaTimes
} from "react-icons/fa";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Select, Input, DatePicker, TimePicker, Button, App } from "antd";
import { useSearchParams } from "react-router-dom";
import { useCurrentApp } from "@/components/context/app.context";
import { fetchAccountAPI } from "@/services/api";
import {
  SearchOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";
import "./home.scss";

const HomePage = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { message } = App.useApp();
  const { setIsAuthenticated, setUser } = useCurrentApp();

  useEffect(() => {
    setIsVisible(true);

    // Check if user was redirected from email verification
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

  const futureFeatures = [
    {
      icon: <FaBrain />,
      title: t("home.features.aiCoach.title"),
      description: t("home.features.aiCoach.description"),
      tags: ["MACHINE LEARNING", "REAL-TIME"],
      gradient: "from-neon-500 to-electric-500"
    },
    {
      icon: <FaEye />,
      title: t("home.features.vrTraining.title"),
      description: t("home.features.vrTraining.description"),
      tags: ["VIRTUAL REALITY", "IMMERSIVE"],
      gradient: "from-electric-500 to-neon-500"
    },
    {
      icon: <FaBitcoin />,
      title: t("home.features.cryptoRewards.title"),
      description: t("home.features.cryptoRewards.description"),
      tags: ["BLOCKCHAIN", "NFT"],
      gradient: "from-neon-500 to-electric-500"
    }
  ];

  const smartCourts = [
    {
      id: 1,
      name: t("home.courts.nexusFootball.name"),
      type: "football",
      location: t("home.courts.nexusFootball.location"),
      rating: 4.9,
      price: "300K VIC",
      earnTokens: "50 VIC tokens",
      features: [
        { icon: <FaEye />, name: t("home.courts.features.motionTracking") },
        {
          icon: <FaChartLine />,
          name: t("home.courts.features.performanceAnalytics")
        },
        { icon: <FaWifi />, name: t("home.courts.features.5gConnected") },
        { icon: <FaShieldAlt />, name: t("home.courts.features.smartSecurity") }
      ],
      bgGradient: "from-green-900 via-green-800 to-green-900",
      techBadge: "⚡ SMART FIELD",
      players: "16 players online",
      temperature: "25°C"
    },
    {
      id: 2,
      name: t("home.courts.quantumTennis.name"),
      type: "tennis",
      location: t("home.courts.quantumTennis.location"),
      rating: 4.8,
      price: "250K VIC",
      earnTokens: "40 VIC tokens",
      features: [
        { icon: <FaBullseye />, name: t("home.courts.features.shotAnalysis") },
        {
          icon: <FaTachometerAlt />,
          name: t("home.courts.features.speedDetection")
        },
        { icon: <FaVideo />, name: t("home.courts.features.matchRecording") },
        { icon: <FaRobot />, name: t("home.courts.features.aiReferee") }
      ],
      bgGradient: "from-orange-900 via-orange-800 to-red-900",
      techBadge: "🎾 SMART TENNIS",
      players: "4 players active",
      temperature: "5 km/h"
    }
  ];

  const livePlayers = [
    {
      name: "Alex Chen",
      avatar: "A",
      sport: "⚽ Looking for football match",
      level: 23,
      tags: ["PRO PLAYER", "VR READY"],
      gradient: "from-neon-500 to-electric-500"
    },
    {
      name: "Maria Santos",
      avatar: "M",
      sport: "🎾 Tennis doubles partner needed",
      level: 18,
      tags: ["COACH", "AI TRAINED"],
      gradient: "from-electric-500 to-neon-500"
    },
    {
      name: "Kevin Park",
      avatar: "K",
      sport: "🏓 Pickleball tournament prep",
      level: 31,
      tags: ["CHAMPION", "NFT HOLDER"],
      gradient: "from-neon-500 to-electric-500"
    }
  ];

  const tournaments = [
    {
      name: "VIC CUP 2024",
      description: "Global Football Championship",
      prizePool: "1,000,000",
      status: "LIVE",
      isLive: true
    },
    {
      name: "AI Tennis Masters",
      description: "Human vs AI Championship",
      prizePool: "500,000",
      startsIn: "2 days"
    },
    {
      name: "Metaverse Olympics",
      description: "VR Multi-Sport Event",
      prizePool: "2,000,000",
      startsIn: "1 week"
    }
  ];

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

            {/* Futuristic Search with Ant Design */}
            <div className="futuristic-search">
              <div className="search-container">
                <div className="search-grid">
                  <div className="search-field">
                    <Select
                      defaultValue="sport-type"
                      style={{
                        width: "100%",
                        height: "50px"
                      }}
                      size="large"
                      placeholder="🎯 SPORT TYPE"
                      options={[
                        { value: "football", label: "⚽ Football" },
                        { value: "tennis", label: "🎾 Tennis" },
                        { value: "pickleball", label: "🏓 Pickleball" },
                        { value: "badminton", label: "🏸 Badminton" },
                        { value: "basketball", label: "🏀 Basketball" }
                      ]}
                    />
                  </div>

                  <div className="search-field">
                    <Input
                      size="large"
                      placeholder="📍 LOCATION"
                      prefix={
                        <EnvironmentOutlined style={{ color: "#0ea5e9" }} />
                      }
                      style={{ height: "50px" }}
                    />
                  </div>

                  <div className="search-field">
                    <DatePicker
                      size="large"
                      placeholder="Select Date"
                      style={{
                        width: "100%",
                        height: "50px"
                      }}
                      suffixIcon={
                        <CalendarOutlined style={{ color: "#0ea5e9" }} />
                      }
                    />
                  </div>

                  <div className="search-field">
                    <TimePicker
                      size="large"
                      placeholder="Select Time"
                      format="HH:mm"
                      style={{
                        width: "100%",
                        height: "50px"
                      }}
                      suffixIcon={
                        <ClockCircleOutlined style={{ color: "#0ea5e9" }} />
                      }
                    />
                  </div>

                  <Button
                    type="primary"
                    size="large"
                    icon={<SearchOutlined />}
                    style={{
                      height: "50px",
                      background: "linear-gradient(45deg, #0ea5e9, #d946ef)",
                      border: "none",
                      borderRadius: "25px",
                      fontWeight: "600",
                      fontSize: "16px",
                      minWidth: "120px"
                    }}
                  >
                    SEARCH
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">1K+</div>
                <div className="stat-label">SMART COURTS</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">50K+</div>
                <div className="stat-label">ACTIVE PLAYERS</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">100K+</div>
                <div className="stat-label">MATCHES PLAYED</div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="future-features-section">
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
      </section>

      {/* Smart Courts Section */}
      <section className="smart-courts-section">
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

                  {/* Court Visual */}
                  <div
                    className={`court-visual bg-gradient-to-br ${court.bgGradient}`}
                  >
                    <div className="court-overlay"></div>

                    {/* Field Lines */}
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

                    {/* Tech Overlays */}
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

                  {/* Court Details */}
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

                    {/* Tech Features */}
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
      </section>

      {/* Community Hub Section */}
      <section className="community-hub-section">
        <Container>
          <div className="text-center mb-5">
            <h2 className="section-title">
              <span className="gradient-text">{t("home.community.title")}</span>
            </h2>
            <p className="section-subtitle">{t("home.community.subtitle")}</p>
          </div>

          <Row className="g-4">
            {/* Live Players */}
            <Col lg={8}>
              <div className="community-card">
                <div className="community-header">
                  <h3 className="community-title">LIVE PLAYERS</h3>
                  <div className="online-indicator">
                    <div className="online-dot"></div>
                    <span className="online-count">2,847 ONLINE</span>
                  </div>
                </div>

                <div className="players-list">
                  {livePlayers.map((player, index) => (
                    <div key={index} className="player-item">
                      <div className="player-info">
                        <div
                          className={`player-avatar bg-gradient-to-r ${player.gradient}`}
                        >
                          {player.avatar}
                          <div className="player-status"></div>
                        </div>
                        <div className="player-details">
                          <p className="player-name">{player.name}</p>
                          <p className="player-sport">
                            {player.sport} • Level {player.level}
                          </p>
                          <div className="player-tags">
                            {player.tags.map((tag, tagIndex) => (
                              <span key={tagIndex} className="player-tag">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="player-actions">
                        <button className="action-btn game-btn">
                          <FaGamepad />
                        </button>
                        <button className="action-btn message-btn">
                          <FaPaperPlane />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Col>

            {/* Tournaments */}
            <Col lg={4}>
              <div className="tournaments-card">
                <h3 className="tournaments-title">TOURNAMENTS</h3>

                <div className="tournaments-list">
                  {tournaments.map((tournament, index) => (
                    <div
                      key={index}
                      className={`tournament-item ${
                        tournament.isLive ? "live" : ""
                      }`}
                    >
                      {tournament.isLive && (
                        <div className="live-badge">LIVE</div>
                      )}
                      <h4 className="tournament-name">{tournament.name}</h4>
                      <p className="tournament-description">
                        {tournament.description}
                      </p>
                      <div className="tournament-footer">
                        <div className="prize-pool">
                          <div className="prize-amount">
                            {tournament.prizePool}
                          </div>
                          <div className="prize-label">VIC Prize Pool</div>
                        </div>
                        {tournament.isLive ? (
                          <button className="join-btn">JOIN NOW</button>
                        ) : (
                          <div className="tournament-time">
                            <div className="time-label">Starts in</div>
                            <div className="time-value">
                              {tournament.startsIn}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button className="view-all-tournaments">
                  <FaTrophy className="me-2" />
                  VIEW ALL TOURNAMENTS
                </button>
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

import { Container, Row, Col, Button, Card } from "react-bootstrap";
import {
  FaCalendarCheck,
  FaCreditCard,
  FaSearch,
  FaRunning,
  FaUsers,
  FaChartLine,
  FaClipboardList,
  FaUserFriends,
  FaCogs,
  FaArrowRight,
  FaStar,
  FaMapMarkerAlt,
  FaClock,
  FaPhone
} from "react-icons/fa";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./home.scss";

const HomePage = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const services = [
    {
      icon: <FaCalendarCheck />,
      label: t("home.services.onlineBooking.title"),
      description: t("home.services.onlineBooking.description")
    },
    {
      icon: <FaCreditCard />,
      label: t("home.services.onlinePayment.title"),
      description: t("home.services.onlinePayment.description")
    },
    {
      icon: <FaSearch />,
      label: t("home.services.guestSearch.title"),
      description: t("home.services.guestSearch.description")
    },
    {
      icon: <FaRunning />,
      label: t("home.services.quickPass.title"),
      description: t("home.services.quickPass.description")
    },
    {
      icon: <FaUsers />,
      label: t("home.services.community.title"),
      description: t("home.services.community.description")
    },
    {
      icon: <FaChartLine />,
      label: t("home.services.revenueManagement.title"),
      description: t("home.services.revenueManagement.description")
    },
    {
      icon: <FaClipboardList />,
      label: t("home.services.bookingManagement.title"),
      description: t("home.services.bookingManagement.description")
    },
    {
      icon: <FaUserFriends />,
      label: t("home.services.customerManagement.title"),
      description: t("home.services.customerManagement.description")
    },
    {
      icon: <FaCogs />,
      label: t("home.services.otherFeatures.title"),
      description: t("home.services.otherFeatures.description")
    }
  ];

  const features = [
    {
      icon: <FaMapMarkerAlt />,
      title: t("home.features.locations.title"),
      description: t("home.features.locations.description")
    },
    {
      icon: <FaClock />,
      title: t("home.features.availability.title"),
      description: t("home.features.availability.description")
    },
    {
      icon: <FaPhone />,
      title: t("home.features.support.title"),
      description: t("home.features.support.description")
    }
  ];

  const testimonials = [
    {
      name: "Nguyễn Văn A",
      role: "Cầu thủ nghiệp dư",
      content:
        "Rất hài lòng với dịch vụ đặt sân online. Giao diện dễ sử dụng, thanh toán nhanh chóng.",
      rating: 5
    },
    {
      name: "Trần Thị B",
      role: "Chủ sân bóng",
      content:
        "Hệ thống quản lý rất hiệu quả, giúp tôi tiết kiệm thời gian và tăng doanh thu.",
      rating: 5
    },
    {
      name: "Lê Văn C",
      role: "Huấn luyện viên",
      content:
        "Dễ dàng tìm kiếm và đặt sân cho đội bóng. Dịch vụ rất chuyên nghiệp.",
      rating: 5
    }
  ];

  return (
    <div className="home-page bg-theme-body">
      {/* Hero Section */}
      <section className="hero-section position-relative overflow-hidden bg-theme-hero">
        <div className="hero-background"></div>
        <Container className="position-relative z-3">
          <Row className="min-vh-100 align-items-center">
            <Col lg={6} className="text-white">
              <div className={`hero-content ${isVisible ? "fade-in" : ""}`}>
                <h1 className="hero-title display-3 fw-bold mb-4">
                  {t("home.hero.title")}
                  <span className="d-block text-primary">
                    {t("home.hero.subtitle")}
                  </span>
                </h1>
                <p className="hero-subtitle lead mb-4 opacity-75">
                  {t("home.hero.description")}
                </p>
                <div className="hero-buttons d-flex gap-3 flex-wrap">
                  <Button
                    variant="primary"
                    size="lg"
                    className="fw-semibold px-4 py-3 rounded-pill shadow-lg"
                  >
                    {t("home.hero.bookNow")}
                    <FaArrowRight className="ms-2" />
                  </Button>
                  <Button
                    variant="outline-light"
                    size="lg"
                    className="fw-semibold px-4 py-3 rounded-pill"
                  >
                    {t("home.hero.learnMore")}
                  </Button>
                </div>
              </div>
            </Col>
            <Col lg={6} className="d-none d-lg-block">
              <div className={`hero-image ${isVisible ? "slide-in" : ""}`}>
                <div className="floating-card">
                  <div className="card-stats">
                    <div className="stat-item">
                      <h3 className="stat-number">500+</h3>
                      <p className="stat-label">{t("home.stats.fields")}</p>
                    </div>
                    <div className="stat-item">
                      <h3 className="stat-number">10K+</h3>
                      <p className="stat-label">{t("home.stats.customers")}</p>
                    </div>
                    <div className="stat-item">
                      <h3 className="stat-number">99%</h3>
                      <p className="stat-label">
                        {t("home.stats.satisfaction")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section py-5 theme-section">
        <Container>
          <Row className="justify-content-center mb-5">
            <Col lg={8} className="text-center">
              <h2 className="theme-section-title display-5 fw-bold mb-3">
                {t("home.features.title")}
              </h2>
              <p className="theme-section-subtitle lead">
                {t("home.features.subtitle")}
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            {features.map((feature, index) => (
              <Col lg={4} key={index}>
                <Card className="theme-card feature-card h-100 border-0 shadow-theme-medium">
                  <Card.Body className="text-center p-4">
                    <div className="feature-icon mb-3">{feature.icon}</div>
                    <Card.Title className="theme-card-title fw-bold mb-3">
                      {feature.title}
                    </Card.Title>
                    <Card.Text className="theme-card-text">
                      {feature.description}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Services Section */}
      <section className="services-section py-5 bg-theme-section">
        <Container>
          <Row className="justify-content-center mb-5">
            <Col lg={8} className="text-center">
              <h2 className="theme-section-title display-5 fw-bold mb-3">
                {t("home.services.title")}
              </h2>
              <p className="theme-section-subtitle lead">
                {t("home.services.subtitle")}
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            {services.map((service, index) => (
              <Col xs={12} md={6} lg={4} key={index}>
                <Card className="theme-card service-card h-100 border-0 shadow-theme-medium">
                  <Card.Body className="p-4">
                    <div className="service-icon mb-3">{service.icon}</div>
                    <Card.Title className="theme-card-title fw-bold mb-3">
                      {service.label}
                    </Card.Title>
                    <Card.Text className="theme-card-text">
                      {service.description}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Gallery Section */}
      <section className="gallery-section py-5 theme-section">
        <Container>
          <Row className="justify-content-center mb-5">
            <Col lg={8} className="text-center">
              <h2 className="theme-section-title display-5 fw-bold mb-3">
                {t("home.gallery.title")}
              </h2>
              <p className="theme-section-subtitle lead">
                {t("home.gallery.subtitle")}
              </p>
            </Col>
          </Row>
          <Row className="g-3">
            {["1.jpg", "2.jpg", "3.jpg", "4.jpg"].map((img, i) => (
              <Col xs={6} md={3} key={i}>
                <div className="gallery-item">
                  <img
                    src={`https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center`}
                    alt={`Sân bóng ${i + 1}`}
                    className="img-fluid rounded shadow-theme-light"
                  />
                  <div className="gallery-overlay">
                    <div className="gallery-info">
                      <h5>Sân bóng {i + 1}</h5>
                      <p>Chất lượng cao</p>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section py-5 bg-primary text-white">
        <Container>
          <Row className="justify-content-center mb-5">
            <Col lg={8} className="text-center">
              <h2 className="section-title display-5 fw-bold mb-3">
                {t("home.testimonials.title")}
              </h2>
              <p className="section-subtitle lead opacity-75">
                {t("home.testimonials.subtitle")}
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            {testimonials.map((testimonial, index) => (
              <Col lg={4} key={index}>
                <Card className="testimonial-card h-100 border-0 bg-white text-dark">
                  <Card.Body className="p-4">
                    <div className="testimonial-rating mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <FaStar key={i} className="text-warning" />
                      ))}
                    </div>
                    <Card.Text className="mb-3 fst-italic">
                      "{testimonial.content}"
                    </Card.Text>
                    <div className="testimonial-author">
                      <h6 className="fw-bold mb-1">{testimonial.name}</h6>
                      <small className="text-muted">{testimonial.role}</small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5 bg-theme-section">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8} className="text-center">
              <h2 className="theme-section-title display-5 fw-bold mb-4">
                {t("home.cta.title")}
              </h2>
              <p className="theme-section-subtitle lead mb-4">
                {t("home.cta.subtitle")}
              </p>
              <Button
                variant="primary"
                size="lg"
                className="fw-semibold px-5 py-3 rounded-pill shadow-lg"
              >
                {t("home.cta.button")}
                <FaArrowRight className="ms-2" />
              </Button>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default HomePage;

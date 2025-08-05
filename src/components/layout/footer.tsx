import { Container, Row, Col } from "react-bootstrap";
import {
  FaFacebookSquare,
  FaInstagram,
  FaYoutube,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaHome,
  FaInfoCircle,
  FaConciergeBell,
  FaCalendarCheck,
  FaUsers,
  FaTools,
  FaCreditCard
} from "react-icons/fa";
import { useCurrentApp } from "../context/app.context";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Divider from "@/share/divider";
import "./footer.scss";

const Footer = () => {
  const { theme } = useCurrentApp();
  const { t } = useTranslation();

  return (
    <footer data-bs-theme={theme} className="footer-main">
      <Container className="p-4">
        <Row className="my-4">
          {/* Logo and Description */}
          <Col
            lg={3}
            md={6}
            className="mb-4 mb-md-0 d-flex flex-column align-items-center"
          >
            <div className="footer-logo mb-4">
              <span className="brand-blue fw-bold fs-3">Vic Sports</span>
            </div>
            <p className="text-center footer-description">
              {t("footer.desciption")}
            </p>
            <div className="social-links">
              <a href="#" className="social-link">
                <FaFacebookSquare size={24} />
              </a>
              <a href="#" className="social-link">
                <FaInstagram size={24} />
              </a>
              <a href="#" className="social-link">
                <FaYoutube size={24} />
              </a>
            </div>
          </Col>

          {/* Links */}
          <Col
            lg={3}
            md={6}
            className="mb-4 mb-md-0 d-flex flex-column align-items-center align-items-md-start text-center text-md-start"
          >
            <h5 className="footer-section-title mb-4">{t("footer.link")}</h5>
            <ul className="footer-links">
              <li>
                <Link to="/" className="footer-link">
                  <FaHome className="me-2" />
                  {t("footer.link1")}
                </Link>
              </li>
              <li>
                <Link to="/about" className="footer-link">
                  <FaInfoCircle className="me-2" />
                  {t("footer.link2")}
                </Link>
              </li>
              <li>
                <Link to="/services" className="footer-link">
                  <FaConciergeBell className="me-2" />
                  {t("footer.link3")}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="footer-link">
                  <FaEnvelope className="me-2" />
                  {t("footer.link4")}
                </Link>
              </li>
            </ul>
          </Col>

          {/* Services */}
          <Col
            lg={3}
            md={6}
            className="mb-4 mb-md-0 d-flex flex-column align-items-center align-items-md-start text-center text-md-start"
          >
            <h5 className="footer-section-title mb-4">{t("footer.service")}</h5>
            <ul className="footer-links">
              <li>
                <Link to="/" className="footer-link">
                  <FaCalendarCheck className="me-2" />
                  {t("footer.service1")}
                </Link>
              </li>
              <li>
                <Link to="/about" className="footer-link">
                  <FaUsers className="me-2" />
                  {t("footer.service2")}
                </Link>
              </li>
              <li>
                <Link to="/services" className="footer-link">
                  <FaTools className="me-2" />
                  {t("footer.service3")}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="footer-link">
                  <FaCreditCard className="me-2" />
                  {t("footer.service4")}
                </Link>
              </li>
            </ul>
          </Col>

          {/* Contact */}
          <Col
            lg={3}
            md={6}
            className="mb-4 mb-md-0 d-flex flex-column align-items-center align-items-md-start text-center text-md-start"
          >
            <h5 className="footer-section-title mb-4">{t("footer.contact")}</h5>
            <ul className="footer-contact">
              <li>
                <FaMapMarkerAlt className="me-2" />
                {t("footer.contact1")}
              </li>
              <li>
                <FaPhone className="me-2" />
                +01 234 567 89
              </li>
              <li>
                <FaEnvelope className="me-2" />
                contact@example.com
              </li>
            </ul>
          </Col>
        </Row>
      </Container>

      <Divider />

      <div className="footer-copyright">{t("footer.author")}</div>
    </footer>
  );
};

export default Footer;

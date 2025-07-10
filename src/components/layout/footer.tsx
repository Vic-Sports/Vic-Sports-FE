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

const Footer = () => {
  const { theme } = useCurrentApp();
  const { t } = useTranslation();

  return (
    <footer
      data-bs-theme={theme}
      className="custom-navbar-theme"
      style={{ zIndex: 1, fontWeight: "600" }}
    >
      <Container className="p-4">
        <Row className="my-4">
          {/* Logo and Description */}
          <Col
            lg={3}
            md={6}
            className="mb-4 mb-md-0 d-flex flex-column align-items-center"
          >
            <div
              className="rounded-circle bg-white d-flex align-items-center justify-content-center mb-4"
              style={{ width: 120, height: 120 }}
            >
              <img
                src="https://mdbootstrap.com/img/Photos/new-templates/animal-shelter/logo.png"
                alt="Logo"
                height={60}
                loading="lazy"
              />
            </div>
            <p className="text-center text-body">{t("footer.desciption")}</p>
            <ul className="list-unstyled d-flex justify-content-center gap-3 mb-0">
              <li>
                <a href="#" className="text-decoration-none text-body">
                  <FaFacebookSquare size={20} />
                </a>
              </li>
              <li>
                <a href="#" className="text-decoration-none text-body">
                  <FaInstagram size={20} />
                </a>
              </li>
              <li>
                <a href="#" className="text-decoration-none text-body">
                  <FaYoutube size={20} />
                </a>
              </li>
            </ul>
          </Col>

          {/* Links */}
          <Col
            lg={3}
            md={6}
            className="mb-4 mb-md-0 d-flex flex-column align-items-center align-items-md-start text-center text-md-start"
          >
            <h5 className="text-uppercase mb-4 text-body">
              {t("footer.link")}
            </h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-decoration-none text-body">
                  <FaHome className="me-2" />
                  {t("footer.link1")}
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/about" className="text-decoration-none text-body">
                  <FaInfoCircle className="me-2" />
                  {t("footer.link2")}
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/services" className="text-decoration-none text-body">
                  <FaConciergeBell className="me-2" />
                  {t("footer.link3")}
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/contact" className="text-decoration-none text-body">
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
            <h5 className="text-uppercase mb-4 text-body">
              {t("footer.service")}
            </h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-decoration-none text-body">
                  <FaCalendarCheck className="me-2" />
                  {t("footer.service1")}
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/about" className="text-decoration-none text-body">
                  <FaUsers className="me-2" />
                  {t("footer.service2")}
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/services" className="text-decoration-none text-body">
                  <FaTools className="me-2" />
                  {t("footer.service3")}
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/contact" className="text-decoration-none text-body">
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
            <h5 className="text-uppercase mb-4 text-body">
              {t("footer.contact")}
            </h5>
            <ul className="list-unstyled text-body">
              <li className="mb-2">
                <FaMapMarkerAlt className="me-2" />
                {t("footer.contact1")}
              </li>
              <li className="mb-2">
                <FaPhone className="me-2" />
                +01 234 567 89
              </li>
              <li className="mb-2">
                <FaEnvelope className="me-2" />
                contact@example.com
              </li>
            </ul>
          </Col>
        </Row>
      </Container>

      <Divider />

      <div className="text-center p-3 text-body">{t("footer.author")}</div>
    </footer>
  );
};

export default Footer;

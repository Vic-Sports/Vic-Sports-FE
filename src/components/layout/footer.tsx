import { Container, Row, Col } from "react-bootstrap";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaDiscord,
  FaBolt
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="futuristic-footer">
      <Container>
        <Row className="g-4">
          <Col md={6}>
            <div className="footer-brand">
              <div className="d-flex align-items-center mb-4">
                <div className="footer-logo">
                  <FaBolt />
                </div>
                <div className="ms-3">
                  <h3 className="footer-brand-name">VIC SPORTS</h3>
                  <p className="footer-brand-subtitle">FUTURE OF SPORTS</p>
                </div>
              </div>
              <p className="footer-description">
                {t("home.footer.description")}
              </p>
              <div className="social-links">
                <a href="#" className="social-link facebook">
                  <FaFacebook />
                </a>
                <a href="#" className="social-link twitter">
                  <FaTwitter />
                </a>
                <a href="#" className="social-link instagram">
                  <FaInstagram />
                </a>
                <a href="#" className="social-link discord">
                  <FaDiscord />
                </a>
              </div>
            </div>
          </Col>
          <Col md={3}>
            <div className="footer-section">
              <h4 className="footer-section-title">PLATFORM</h4>
              <ul className="footer-links">
                <li>
                  <Link to="/field">Smart Courts</Link>
                </li>
                <li>
                  <a href="#">AI Coaching</a>
                </li>
                <li>
                  <a href="#">VR Training</a>
                </li>
                <li>
                  <a href="#">Tournaments</a>
                </li>
                <li>
                  <a href="#">NFT Marketplace</a>
                </li>
              </ul>
            </div>
          </Col>
          <Col md={3}>
            <div className="footer-section">
              <h4 className="footer-section-title">SUPPORT</h4>
              <ul className="footer-links">
                <li>
                  <a href="#">Help Center</a>
                </li>
                <li>
                  <a href="#">Contact Us</a>
                </li>
                <li>
                  <Link to="/policy">Privacy Policy</Link>
                </li>
                <li>
                  <Link to="/terms">Terms of Service</Link>
                </li>
                <li>
                  <a href="#">Whitepaper</a>
                </li>
              </ul>
            </div>
          </Col>
        </Row>
        <div className="footer-bottom">
          <p>{t("home.footer.copyright")}</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;

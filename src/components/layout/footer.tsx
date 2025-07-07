import {
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useCurrentApp } from "components/context/app.context";
import { Container, Row, Col } from "react-bootstrap";
import "./footer.scss";

const Footer = () => {
  const { t } = useTranslation();
  const { theme } = useCurrentApp();

  return (
    <footer className={`footer ${theme}`}>
      <Container>
        <Row className="py-5 gx-4 gy-4">
          <Col md={4}>
            <div className="footer-logo">🏟️ VIC</div>
            <p className="footer-description">
              Nền tảng đặt sân thể thao thông minh, kết nối cộng đồng yêu thể
              thao.
            </p>
            <div className="footer-socials">
              <FacebookOutlined />
              <InstagramOutlined />
              <TwitterOutlined />
            </div>
          </Col>

          <Col xs={6} md={2}>
            <h5 className="footer-title">Liên kết</h5>
            <ul>
              <li className="footer-item">Trang chủ</li>
              <li className="footer-item">Giới thiệu</li>
              <li className="footer-item">Dịch vụ</li>
              <li className="footer-item">Liên hệ</li>
            </ul>
          </Col>

          <Col xs={6} md={3}>
            <h5 className="footer-title">Dịch vụ</h5>
            <ul>
              <li className="footer-item">Đặt sân</li>
              <li className="footer-item">Tìm đồng đội</li>
              <li className="footer-item">Quản lý sân</li>
              <li className="footer-item">Thanh toán</li>
            </ul>
          </Col>

          <Col md={3}>
            <h5 className="footer-title">Liên hệ</h5>
            <ul>
              <li className="footer-item">
                <PhoneOutlined /> +84 123 456 789
              </li>
              <li className="footer-item">
                <MailOutlined /> info@vic.vn
              </li>
              <li className="footer-item">
                <EnvironmentOutlined /> Hà Nội, Việt Nam
              </li>
            </ul>
          </Col>
        </Row>

        <div className="footer-bottom text-center py-3 border-top">
          © 2024 VIC. Tất cả quyền được bảo lưu.
        </div>
      </Container>
    </footer>
  );
};

export default Footer;

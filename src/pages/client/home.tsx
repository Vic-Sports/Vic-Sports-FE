import { Container, Row, Col, Button } from "react-bootstrap";
import {
  FaCalendarCheck,
  FaCreditCard,
  FaSearch,
  FaRunning,
  FaUsers,
  FaChartLine,
  FaClipboardList,
  FaUserFriends,
  FaCogs
} from "react-icons/fa";

const services = [
  { icon: <FaCalendarCheck />, label: "Đặt sân trực tuyến" },
  { icon: <FaCreditCard />, label: "Thanh toán online" },
  { icon: <FaSearch />, label: "Tìm kiếm vãng lai" },
  { icon: <FaRunning />, label: "Pass sân nhanh chóng" },
  { icon: <FaUsers />, label: "Cộng đồng trực tuyến" },
  { icon: <FaChartLine />, label: "Quản lý doanh thu" },
  { icon: <FaClipboardList />, label: "Quản lý đặt sân online" },
  { icon: <FaUserFriends />, label: "Quản lý khách hàng" },
  { icon: <FaCogs />, label: "Chức năng khác" }
];

const HomePage = () => {
  return (
    <div className="body">
      {/* Banner */}
      <div className="home-banner d-flex align-items-center text-white">
        <Container>
          <Row>
            <Col md={6} className="text-start">
              <h1 className="fw-bold display-5">
                ĐẶT SÂN TRỰC TUYẾN – KẾT BẠN BỐN PHƯƠNG
              </h1>
              <p className="lead my-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <Button variant="light" className="fw-semibold px-4 py-2">
                ĐẶT SÂN NGAY
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Field Images */}
      <Container className="my-5">
        <Row className="g-3">
          {["1.jpg", "2.jpg", "3.jpg", "4.jpg"].map((img, i) => (
            <Col xs={6} md={3} key={i}>
              <div className="img-thumbnail overflow-hidden rounded shadow-sm">
                <img
                  src={`https://res.cloudinary.com/demo/image/upload/sample.jpg`} // Replace with actual URL
                  alt={`field-${i}`}
                  className="img-fluid w-100 h-100 object-fit-cover"
                />
              </div>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Services */}
      <Container className="text-center my-5">
        <h2 className="fw-bold mb-4">DỊCH VỤ CỦA CHÚNG TÔI</h2>
        <Row className="g-4">
          {services.map((service, index) => (
            <Col xs={6} md={4} key={index}>
              <div className="service-box py-4 px-2 bg-primary text-white rounded shadow h-100 d-flex flex-column justify-content-center align-items-center">
                <div className="icon mb-2" style={{ fontSize: 24 }}>
                  {service.icon}
                </div>
                <div className="label fw-semibold text-center">
                  {service.label}
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default HomePage;

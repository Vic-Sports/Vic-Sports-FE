import { Container, Row, Col } from "react-bootstrap";
import {
  FaFacebookSquare,
  FaInstagram,
  FaYoutube,
  FaPaw,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope
} from "react-icons/fa";

const Footer = () => {
  return (
    <div className="my-5">
      <footer className="bg-primary text-white text-center text-lg-start">
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
                style={{ width: 150, height: 150 }}
              >
                <img
                  src="https://mdbootstrap.com/img/Photos/new-templates/animal-shelter/logo.png"
                  alt="Logo"
                  height={70}
                  loading="lazy"
                />
              </div>
              <p className="text-center">
                Homless animal shelter — The budgetary unit of the Capital City
                of Warsaw
              </p>
              <ul className="list-unstyled d-flex justify-content-center gap-3 mb-0">
                <li>
                  <a className="text-white" href="#">
                    <FaFacebookSquare size={20} />
                  </a>
                </li>
                <li>
                  <a className="text-white" href="#">
                    <FaInstagram size={20} />
                  </a>
                </li>
                <li>
                  <a className="text-white" href="#">
                    <FaYoutube size={20} />
                  </a>
                </li>
              </ul>
            </Col>

            {/* Animals 1 */}
            <Col lg={3} md={6} className="mb-4 mb-md-0">
              <h5 className="text-uppercase mb-4">Animals</h5>
              <ul className="list-unstyled">
                {[
                  "When your pet is missing",
                  "Recently found",
                  "How to adopt?",
                  "Pets for adoption",
                  "Material gifts",
                  "Help with walks",
                  "Volunteer activities"
                ].map((item, index) => (
                  <li key={index} className="mb-2">
                    <a href="#" className="text-white text-decoration-none">
                      <FaPaw className="me-2" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </Col>

            {/* Animals 2 */}
            <Col lg={3} md={6} className="mb-4 mb-md-0">
              <h5 className="text-uppercase mb-4">Animals</h5>
              <ul className="list-unstyled">
                {[
                  "General information",
                  "About the shelter",
                  "Statistic data",
                  "Job",
                  "Tenders",
                  "Contact"
                ].map((item, index) => (
                  <li key={index} className="mb-2">
                    <a href="#" className="text-white text-decoration-none">
                      <FaPaw className="me-2" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </Col>

            {/* Contact */}
            <Col lg={3} md={6} className="mb-4 mb-md-0">
              <h5 className="text-uppercase mb-4">Contact</h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <FaMapMarkerAlt className="me-2" />
                  Warsaw, 57 Street, Poland
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

        <div
          className="text-center p-3"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
        >
          © 2020 Copyright:{" "}
          <a
            className="text-white text-decoration-none"
            href="https://mdbootstrap.com/"
          >
            MDBootstrap.com
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Footer;

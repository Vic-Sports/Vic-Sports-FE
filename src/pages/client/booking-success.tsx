import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Result,
  Space,
  Tag,
  Divider,
  Timeline,
} from "antd";
import {
  CheckCircleOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CreditCardOutlined,
  HomeOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "./booking-success.scss";

const { Title, Text, Paragraph } = Typography;

interface BookingResult {
  _id: string;
  bookingRef: string;
  courtIds: string[];
  courtNames?: string;
  venue: string;
  date: string;
  timeSlots: {
    start: string;
    end: string;
    price: number;
  }[];
  totalPrice: number;
  customerInfo: {
    fullName: string;
    phone: string;
    email: string;
  };
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | "cancelled";
  status: "confirmed" | "pending" | "cancelled";
  createdAt: string;
  notes?: string;
}

const BookingSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const bookingData = location.state?.booking as BookingResult;

  // Get booking data with fallback to localStorage
  const getBookingData = (): BookingResult | null => {
    // First try from navigation state
    if (location.state?.booking) {
      console.log("Using location.state.booking:", location.state.booking);
      return location.state.booking;
    }

    // Then try localStorage as fallback
    const storedBooking = localStorage.getItem("currentBooking");
    if (storedBooking) {
      try {
        const parsed = JSON.parse(storedBooking);
        console.log("Using localStorage booking:", parsed);
        return parsed;
      } catch (error) {
        console.error("Error parsing stored booking:", error);
      }
    }

    console.log(
      "No booking data found in either location.state or localStorage"
    );
    return null;
  };

  const finalBookingData = getBookingData();

  // Debug: Log the data structure
  useEffect(() => {
    console.log("BookingSuccess - location.state:", location.state);
    console.log("BookingSuccess - original bookingData:", bookingData);
    console.log(
      "BookingSuccess - bookingData.customerInfo:",
      bookingData?.customerInfo
    );
    console.log("BookingSuccess - finalBookingData:", finalBookingData);
    console.log(
      "BookingSuccess - customerInfo:",
      finalBookingData?.customerInfo
    );

    // Log all properties of finalBookingData to see what's available
    if (finalBookingData) {
      console.log(
        "BookingSuccess - All finalBookingData properties:",
        Object.keys(finalBookingData)
      );
      console.log(
        "BookingSuccess - Full finalBookingData object:",
        finalBookingData
      );
    }

    // Also check localStorage
    const storedBooking = localStorage.getItem("currentBooking");
    if (storedBooking) {
      const parsed = JSON.parse(storedBooking);
      console.log("BookingSuccess - localStorage booking:", parsed);
      console.log(
        "BookingSuccess - localStorage customerInfo:",
        parsed?.customerInfo
      );
      console.log(
        "BookingSuccess - localStorage all properties:",
        Object.keys(parsed)
      );
    }
  }, [location.state, bookingData, finalBookingData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getPaymentMethodName = (method: string) => {
    const methods: Record<string, string> = {
      vnpay: "VNPay",
      momo: "MoMo",
      zalopay: "ZaloPay",
      banking: "Chuyển khoản ngân hàng",
      cash: "Tiền mặt",
    };
    return methods[method] || method;
  };

  const getPaymentStatusName = (status: string) => {
    const statuses: Record<string, { text: string; color: string }> = {
      paid: { text: "Đã thanh toán", color: "green" },
      pending: { text: "Chờ thanh toán", color: "orange" },
      failed: { text: "Thanh toán thất bại", color: "red" },
      cancelled: { text: "Đã hủy", color: "red" },
    };
    return statuses[status] || { text: status, color: "default" };
  };

  const timelineItems = [
    {
      color: "green",
      children: (
        <div>
          <Text strong>Đặt sân thành công</Text>
          <br />
          <Text type="secondary">
            {dayjs(finalBookingData?.createdAt).format("DD/MM/YYYY HH:mm")}
          </Text>
        </div>
      ),
    },
    {
      color: finalBookingData?.paymentStatus === "paid" ? "green" : "orange",
      children: (
        <div>
          <Text strong>
            {finalBookingData?.paymentStatus === "paid"
              ? "Thanh toán thành công"
              : "Chờ thanh toán"}
          </Text>
          <br />
          <Text type="secondary">
            {getPaymentMethodName(finalBookingData?.paymentMethod || "")}
          </Text>
        </div>
      ),
    },
    {
      color: "blue",
      children: (
        <div>
          <Text strong>Xác nhận đặt sân</Text>
          <br />
          <Text type="secondary">Sân đã được giữ chỗ cho bạn</Text>
        </div>
      ),
    },
    {
      color: "orange",
      children: (
        <div>
          <Text strong>Ngày sử dụng sân</Text>
          <br />
          <Text type="secondary">
            {dayjs(finalBookingData?.date).format("DD/MM/YYYY")} lúc{" "}
            {finalBookingData?.timeSlots?.[0]?.start || ""}
          </Text>
        </div>
      ),
    },
  ];

  if (!finalBookingData) {
    return (
      <div className="booking-success-page">
        <div className="container">
          <Row gutter={[24, 24]} justify="center">
            <Col xs={24} lg={16}>
              <Card className="success-card">
                <Result
                  status="warning"
                  title="Không tìm thấy thông tin đặt sân"
                  subTitle="Dữ liệu booking không hợp lệ hoặc đã bị mất."
                  extra={
                    <Space size="large">
                      <Button type="primary" onClick={() => navigate("/")}>
                        Về trang chủ
                      </Button>
                      <Button onClick={() => navigate("/history")}>
                        Xem lịch sử đặt sân
                      </Button>
                    </Space>
                  }
                />
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-success-page">
      <div className="container">
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} lg={16}>
            <Card className="success-card">
              <Result
                status="success"
                title="Đặt sân thành công!"
                subTitle={`Mã đặt sân: ${bookingData.bookingRef}`}
                icon={<CheckCircleOutlined />}
                extra={
                  <Space size="large">
                    <Button type="primary" onClick={() => navigate("/")}>
                      Về trang chủ
                    </Button>
                    <Button onClick={() => navigate("/history")}>
                      Xem lịch sử đặt sân
                    </Button>
                  </Space>
                }
              />
            </Card>
          </Col>

          <Col xs={24} lg={16}>
            <Card title="Chi tiết đặt sân" className="booking-details-card">
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <div className="detail-section">
                    <Title level={5}>Thông tin sân</Title>
                    <div className="detail-item">
                      <HomeOutlined />
                      <div>
                        <Text strong>
                          {finalBookingData?.courtNames ||
                            `${finalBookingData?.courtIds?.length || 0} sân`}
                        </Text>
                        <br />
                        <Text type="secondary">
                          Mã sân:{" "}
                          {finalBookingData?.courtIds?.join(", ") || "N/A"}
                        </Text>
                      </div>
                    </div>
                    <div className="detail-item">
                      <CalendarOutlined />
                      <div>
                        <Text strong>
                          {finalBookingData?.date
                            ? dayjs(finalBookingData.date).format(
                                "dddd, DD/MM/YYYY"
                              )
                            : "N/A"}
                        </Text>
                        <br />
                        <Text type="secondary">Ngày sử dụng</Text>
                      </div>
                    </div>
                    <div className="detail-item">
                      <ClockCircleOutlined />
                      <div>
                        <Space wrap>
                          {finalBookingData?.timeSlots?.map((slot, index) => (
                            <Tag key={index} color="blue">
                              {slot.start} - {slot.end}
                            </Tag>
                          )) || <Text type="secondary">N/A</Text>}
                        </Space>
                        <br />
                        <Text type="secondary">Thời gian sử dụng</Text>
                      </div>
                    </div>
                  </div>
                </Col>

                <Col xs={24} md={12}>
                  <div className="detail-section">
                    <Title level={5}>Thông tin khách hàng</Title>
                    <div className="detail-item">
                      <UserOutlined />
                      <div>
                        <Text strong>
                          {finalBookingData?.customerInfo?.fullName || "N/A"}
                        </Text>
                        <br />
                        <Text type="secondary">Họ và tên</Text>
                      </div>
                    </div>
                    <div className="detail-item">
                      <PhoneOutlined />
                      <div>
                        <Text strong>
                          {finalBookingData?.customerInfo?.phone || "N/A"}
                        </Text>
                        <br />
                        <Text type="secondary">Số điện thoại</Text>
                      </div>
                    </div>
                    <div className="detail-item">
                      <MailOutlined />
                      <div>
                        <Text strong>
                          {finalBookingData?.customerInfo?.email || "N/A"}
                        </Text>
                        <br />
                        <Text type="secondary">Email</Text>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>

              <Divider />

              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <div className="detail-section">
                    <Title level={5}>Thông tin thanh toán</Title>
                    <div className="payment-info">
                      <div className="payment-item">
                        <Text>Phương thức:</Text>
                        <Tag color="blue" icon={<CreditCardOutlined />}>
                          {getPaymentMethodName(
                            finalBookingData?.paymentMethod || "cash"
                          )}
                        </Tag>
                      </div>
                      <div className="payment-item">
                        <Text>Trạng thái:</Text>
                        <Tag
                          color={
                            getPaymentStatusName(
                              finalBookingData?.paymentStatus || "pending"
                            ).color
                          }
                        >
                          {
                            getPaymentStatusName(
                              finalBookingData?.paymentStatus || "pending"
                            ).text
                          }
                        </Tag>
                      </div>
                      <div className="payment-item total">
                        <Text strong>Tổng tiền:</Text>
                        <Text strong className="amount">
                          {formatCurrency(finalBookingData?.totalPrice || 0)}
                        </Text>
                      </div>
                    </div>
                  </div>
                </Col>

                <Col xs={24} md={12}>
                  <div className="detail-section">
                    <Title level={5}>Trạng thái đặt sân</Title>
                    <Timeline items={timelineItems} />
                  </div>
                </Col>
              </Row>

              {finalBookingData?.notes && (
                <>
                  <Divider />
                  <div className="detail-section">
                    <Title level={5}>Ghi chú</Title>
                    <Paragraph>{finalBookingData.notes}</Paragraph>
                  </div>
                </>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={16}>
            <Card title="Hướng dẫn sử dụng" className="instructions-card">
              <div className="instructions">
                <div className="instruction-item">
                  <CheckCircleOutlined className="instruction-icon" />
                  <div>
                    <Text strong>Đến sân đúng giờ</Text>
                    <br />
                    <Text type="secondary">
                      Vui lòng có mặt trước 15 phút so với giờ đặt sân để làm
                      thủ tục check-in
                    </Text>
                  </div>
                </div>

                <div className="instruction-item">
                  <CheckCircleOutlined className="instruction-icon" />
                  <div>
                    <Text strong>Mang theo giấy tờ</Text>
                    <br />
                    <Text type="secondary">
                      Cần xuất trình CMND/CCCD hoặc giấy tờ tùy thân có ảnh để
                      xác minh
                    </Text>
                  </div>
                </div>

                <div className="instruction-item">
                  <CheckCircleOutlined className="instruction-icon" />
                  <div>
                    <Text strong>Tuân thủ quy định</Text>
                    <br />
                    <Text type="secondary">
                      Vui lòng tuân thủ các quy định của sân và sử dụng đúng mục
                      đích
                    </Text>
                  </div>
                </div>

                <div className="instruction-item">
                  <CheckCircleOutlined className="instruction-icon" />
                  <div>
                    <Text strong>Liên hệ hỗ trợ</Text>
                    <br />
                    <Text type="secondary">
                      Gọi hotline 1900 123 456 nếu cần hỗ trợ hoặc có thắc mắc
                    </Text>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default BookingSuccessPage;

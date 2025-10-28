import React, { useEffect, useState } from "react";
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
import { getPayOSPaymentStatus } from "@/services/payOSApi";
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
  const [finalBookingData, setFinalBookingData] =
    useState<BookingResult | null>(null);

  // Get booking data with fallback to localStorage and API call
  const getBookingData = (): BookingResult | null => {
    // First try from navigation state
    if (location.state?.booking) {
      console.log("Using location.state.booking:", location.state.booking);
      let bookingResult = location.state.booking;

      // Merge payment status from location.state if provided
      if (location.state?.paymentStatus) {
        console.log(
          "Merging paymentStatus from location.state:",
          location.state.paymentStatus
        );
        bookingResult = {
          ...bookingResult,
          paymentStatus: location.state.paymentStatus,
        };
      }

      console.log("Final booking result from navigation state:", bookingResult);
      return bookingResult;
    }

    // Then try localStorage as fallback
    const storedBooking = localStorage.getItem("currentBooking");
    if (storedBooking) {
      try {
        const parsed = JSON.parse(storedBooking);
        console.log("Using localStorage booking:", parsed);

        // Also check if paymentStatus was stored
        if (parsed.paymentStatus) {
          console.log(
            "Using stored paymentStatus from localStorage:",
            parsed.paymentStatus
          );
        }

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

  // Check PayOS payment status from backend if reload
  const checkPayOSStatus = async (booking: BookingResult) => {
    try {
      // Check if booking has payosOrderCode (from PayOS flow)
      const payosOrderCode = (booking as any)?.payosOrderCode;

      if (!payosOrderCode) {
        console.log("No PayOS order code found, skipping backend check");
        return booking;
      }

      console.log(
        "🔄 Checking PayOS status from backend for orderCode:",
        payosOrderCode
      );

      const backendResult = await getPayOSPaymentStatus(String(payosOrderCode));
      console.log("✅ Backend payment status result:", backendResult);

      if (backendResult.success && backendResult.data) {
        const payload = backendResult.data;
        const normalizedStatus = String(payload.status || "")
          .trim()
          .toUpperCase();

        // If backend shows payment is PAID, update booking status
        if (["PAID", "SUCCESS", "SUCCEEDED"].includes(normalizedStatus)) {
          console.log(
            "✅ Backend confirms payment is PAID, updating booking status"
          );
          const updatedBooking: BookingResult = {
            ...booking,
            paymentStatus: "paid",
          };
          return updatedBooking;
        }
      }

      return booking;
    } catch (error) {
      console.error("❌ Failed to check PayOS status from backend:", error);
      // Return original booking on error
      return booking;
    }
  };

  // Initialize booking data on mount and on location.state change
  useEffect(() => {
    const initializeBookingData = async () => {
      const initialBooking = getBookingData();

      if (initialBooking) {
        // Check PayOS status from backend if this is a reload scenario
        const updatedBooking = await checkPayOSStatus(initialBooking);
        setFinalBookingData(updatedBooking);

        // Save updated booking to localStorage
        localStorage.setItem("currentBooking", JSON.stringify(updatedBooking));
      } else {
        setFinalBookingData(null);
      }
    };

    initializeBookingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // Debug: Log the data structure
  useEffect(() => {
    console.log("BookingSuccess - location.state:", location.state);
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
  }, [finalBookingData, location.state]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getPaymentMethodName = (method: string) => {
    const methods: Record<string, string> = {
      payos: "PayOS",
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
                subTitle={`Mã đặt sân: ${
                  finalBookingData?.bookingRef || "N/A"
                }`}
                icon={<CheckCircleOutlined />}
                extra={
                  <Space size="large">
                    <Button type="primary" onClick={() => navigate("/")}>
                      Về trang chính
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
                          {finalBookingData?.courtIds &&
                          finalBookingData.courtIds.length > 0
                            ? `${finalBookingData.courtIds.length} sân${
                                finalBookingData.courtNames
                                  ? ` (${finalBookingData.courtNames})`
                                  : ""
                              }`
                            : "Không có thông tin sân"}
                        </Text>
                        <br />
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

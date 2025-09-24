import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Form,
  Input,
  Radio,
  Divider,
  message,
  Spin,
  Space,
  Tag,
  Modal,
} from "antd";
import {
  CreditCardOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ShopOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { createBookingAPI, createVNPayPaymentAPI } from "@/services/bookingApi";
import type { IBookingData } from "@/types/payment";
import "./payment.scss";

const { Title, Text } = Typography;

interface LocationState {
  bookingData: IBookingData;
}

const Payment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("vnpay");
  const [bookingData, setBookingData] = useState<IBookingData | null>(null);

  useEffect(() => {
    const state = location.state as LocationState;

    if (!state?.bookingData) {
      message.error("Không tìm thấy thông tin đặt sân");
      navigate("/");
      return;
    }

    setBookingData(state.bookingData);
  }, [location.state, navigate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSubmit = async (values: any) => {
    console.log("=== PAYMENT SUBMIT STARTED ===");
    console.log("Form values:", values);
    console.log("Selected payment method:", paymentMethod);
    console.log("Booking data:", bookingData);

    if (!bookingData) {
      message.error("Không tìm thấy thông tin đặt sân");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create booking
      const bookingRequest = {
        courtIds: bookingData.courtIds,
        venue: bookingData.venue,
        date: bookingData.date,
        timeSlots: bookingData.timeSlots,
        totalPrice: bookingData.totalPrice,
        customerInfo: {
          fullName: values.fullName,
          phone: values.phone,
          email: values.email,
        },
        paymentMethod: paymentMethod,
        notes: values.notes || "",
      };

      console.log("Creating booking with data:", bookingRequest);

      const bookingResponse = await createBookingAPI(bookingRequest);

      if (!bookingResponse.success || !bookingResponse.data) {
        throw new Error(bookingResponse.message || "Tạo booking thất bại");
      }

      const booking = bookingResponse.data;
      console.log("Booking created:", booking);
      console.log("Booking ID available:", booking._id || booking.bookingId);

      // Save booking data with customerInfo to localStorage for VNPay return handling
      const bookingWithCustomerInfo = {
        ...booking,
        customerInfo: {
          fullName: values.fullName,
          phone: values.phone,
          email: values.email,
        },
      };
      console.log("Booking with customerInfo:", bookingWithCustomerInfo);
      localStorage.setItem(
        "currentBooking",
        JSON.stringify(bookingWithCustomerInfo)
      );

      // Step 2: Create payment URL if VNPay
      if (paymentMethod === "vnpay") {
        console.log("=== VNPAY FLOW STARTED ===");
        const bookingId = booking._id || booking.bookingId;
        console.log("Extracted booking ID:", bookingId);

        if (!bookingId) {
          throw new Error("Không tìm thấy ID booking");
        }

        const paymentRequest = {
          amount: booking.totalPrice,
          bookingId: bookingId,
          returnUrl: `${window.location.origin}/payment/return`,
          locale: "vn" as const,
          orderInfo: `Thanh toán đặt sân ${
            bookingData.courtNames
          } - ${formatDate(bookingData.date)}`,
        };

        console.log("Creating VNPay payment with data:", paymentRequest);

        try {
          const paymentResponse = await createVNPayPaymentAPI(paymentRequest);
          console.log("Raw VNPay API response:", paymentResponse);

          if (!paymentResponse.success || !paymentResponse.data) {
            console.error("VNPay API failed:", paymentResponse);
            throw new Error(
              paymentResponse.message || "Tạo thanh toán thất bại"
            );
          }

          console.log("VNPay payment URL created:", paymentResponse.data);
          console.log("About to show confirmation modal...");

          // Step 3: Redirect to VNPay
          Modal.confirm({
            title: "Chuyển hướng thanh toán",
            content:
              "Bạn sẽ được chuyển hướng đến trang thanh toán VNPay. Bạn có muốn tiếp tục?",
            okText: "Tiếp tục",
            cancelText: "Hủy",
            onOk: () => {
              console.log(
                "User confirmed, redirecting to:",
                paymentResponse.data!.paymentUrl
              );
              window.location.href = paymentResponse.data!.paymentUrl;
            },
            onCancel: () => {
              console.log("User cancelled VNPay payment");
              setLoading(false);
            },
          });
        } catch (vnpayError) {
          console.error("VNPay API call failed:", vnpayError);
          throw vnpayError;
        }
      } else {
        // Handle other payment methods here (cash, bank transfer, etc.)
        message.success(
          "Đặt sân thành công! Quý khách vui lòng thanh toán khi đến sân."
        );
        navigate("/booking-success", {
          state: {
            booking: bookingWithCustomerInfo,
            paymentMethod: "cash",
          },
        });
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      message.error(
        error.message || "Có lỗi xảy ra trong quá trình thanh toán"
      );
      setLoading(false);
    }
  };

  if (!bookingData) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-content">
        <Title level={2} style={{ textAlign: "center", marginBottom: 32 }}>
          <CreditCardOutlined /> Thanh toán đặt sân
        </Title>

        <Row gutter={[24, 24]}>
          {/* Booking Summary */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <span>
                  <ShopOutlined /> Thông tin đặt sân
                </span>
              }
              className="booking-summary-card"
            >
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                <div>
                  <Text strong>Sân đã chọn:</Text>
                  <br />
                  <Text>{bookingData.courtNames}</Text>
                </div>

                <div>
                  <CalendarOutlined /> <Text strong>Ngày:</Text>
                  <br />
                  <Text>{formatDate(bookingData.date)}</Text>
                </div>

                <div>
                  <ClockCircleOutlined /> <Text strong>Khung giờ:</Text>
                  <br />
                  <Space wrap>
                    {bookingData.timeSlots.map((slot, index) => (
                      <Tag key={index} color="blue">
                        {slot.start} - {slot.end}
                      </Tag>
                    ))}
                  </Space>
                </div>

                <div>
                  <Text strong>Số lượng sân:</Text>
                  <Text style={{ marginLeft: 8 }}>
                    {bookingData.courtQuantity} sân
                  </Text>
                </div>

                <div>
                  <Text strong>Số khung giờ:</Text>
                  <Text style={{ marginLeft: 8 }}>
                    {bookingData.timeSlots.length} khung
                  </Text>
                </div>

                <Divider />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px",
                    background: "#f6ffed",
                    borderRadius: "8px",
                    border: "1px solid #b7eb8f",
                  }}
                >
                  <Text strong style={{ fontSize: "18px" }}>
                    <DollarOutlined /> Tổng tiền:
                  </Text>
                  <Text
                    strong
                    style={{
                      fontSize: "20px",
                      color: "#52c41a",
                    }}
                  >
                    {formatCurrency(bookingData.totalPrice)}
                  </Text>
                </div>
              </Space>
            </Card>
          </Col>

          {/* Payment Form */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <span>
                  <UserOutlined /> Thông tin khách hàng
                </span>
              }
              className="payment-form-card"
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
              >
                <Form.Item
                  label="Họ và tên"
                  name="fullName"
                  rules={[
                    { required: true, message: "Vui lòng nhập họ và tên!" },
                    { min: 2, message: "Họ và tên phải có ít nhất 2 ký tự!" },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Nhập họ và tên"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  label="Số điện thoại"
                  name="phone"
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại!" },
                    {
                      pattern: /(84|0[3|5|7|8|9])+([0-9]{8})\b/,
                      message: "Số điện thoại không hợp lệ!",
                    },
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="Nhập số điện thoại"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email!" },
                    { type: "email", message: "Email không hợp lệ!" },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="Nhập email"
                    size="large"
                  />
                </Form.Item>

                <Form.Item label="Ghi chú (tùy chọn)" name="notes">
                  <Input.TextArea
                    placeholder="Ghi chú thêm về booking..."
                    rows={3}
                  />
                </Form.Item>

                <Divider>Phương thức thanh toán</Divider>

                <Form.Item>
                  <Radio.Group
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="payment-method-group"
                  >
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <Radio value="vnpay" className="payment-option">
                        <div className="payment-option-content">
                          <CreditCardOutlined style={{ color: "#1890ff" }} />
                          <span>
                            VNPay (Thẻ ATM, Internet Banking, Ví điện tử)
                          </span>
                          <Tag color="blue">Khuyến nghị</Tag>
                        </div>
                      </Radio>

                      <Radio value="cash" className="payment-option">
                        <div className="payment-option-content">
                          <DollarOutlined style={{ color: "#52c41a" }} />
                          <span>Thanh toán tiền mặt khi đến sân</span>
                        </div>
                      </Radio>
                    </Space>
                  </Radio.Group>
                </Form.Item>

                <Form.Item style={{ marginBottom: 0 }}>
                  <Space style={{ width: "100%" }}>
                    <Button
                      onClick={() => navigate(-1)}
                      size="large"
                      style={{ flex: 1 }}
                    >
                      Quay lại
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      size="large"
                      style={{ flex: 2 }}
                      icon={
                        paymentMethod === "vnpay" ? (
                          <CreditCardOutlined />
                        ) : (
                          <DollarOutlined />
                        )
                      }
                    >
                      {paymentMethod === "vnpay"
                        ? "Thanh toán VNPay"
                        : "Xác nhận đặt sân"}
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Payment;

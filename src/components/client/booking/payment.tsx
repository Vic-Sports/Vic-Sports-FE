import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  Form,
  Input,
  Button,
  Radio,
  Typography,
  Space,
  Descriptions,
  Tag,
  message,
  Spin,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ShopOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { createBookingAPI } from "@/services/bookingApi";
import type { IBookingData, ICreateBookingRequest } from "@/types/payment";
import "./payment.scss";

const { Text } = Typography;

interface LocationState {
  bookingData: IBookingData;
}

const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("payos");
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
    return new Date(dateString).toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const onFinish = async (values: any) => {
    if (!bookingData) {
      message.error("Không tìm thấy thông tin đặt sân");
      return;
    }

    setLoading(true);
    try {
      console.log("=== BOOKING CREATION STARTED ===");
      console.log("Form values:", values);
      console.log("Booking data:", bookingData);

      // Step 1: Create booking
      const bookingPayload: ICreateBookingRequest = {
        venueId: bookingData.venue,
        courtIds: bookingData.courtIds,
        date: bookingData.date,
        timeSlots: bookingData.timeSlots.map((slot) => ({
          startTime: slot.start, // Map start -> startTime for BE
          endTime: slot.end, // Map end -> endTime for BE
          price: slot.price,
        })),
        paymentMethod: paymentMethod as
          | "payos"
          | "momo"
          | "zalopay"
          | "banking",
        customerInfo: {
          fullName: values.fullName,
          email: values.email,
          phoneNumber: values.phone, // Map phone -> phoneNumber for BE
        },
        notes: values.notes || "",
      };

      console.log("Creating booking with payload:", bookingPayload);
      const bookingResponse = await createBookingAPI(bookingPayload);

      if (!bookingResponse.success || !bookingResponse.data) {
        throw new Error(bookingResponse.message || "Tạo booking thất bại");
      }

      const booking = bookingResponse.data;
      console.log("Booking created:", booking);

      // Save booking with customer info
      const bookingWithCustomerInfo = {
        ...booking,
        customerInfo: {
          fullName: values.fullName,
          phone: values.phone,
          email: values.email,
        },
      };

      localStorage.setItem(
        "currentBooking",
        JSON.stringify(bookingWithCustomerInfo)
      );

      // Redirect based on payment method
      if (paymentMethod === "payos") {
        // Redirect back to booking page for PayOS payment
        navigate("/booking", {
          state: {
            ...bookingData,
            bookingId: booking._id || booking.bookingId,
            customerInfo: {
              fullName: values.fullName,
              phone: values.phone,
              email: values.email,
            },
          },
        });
      } else {
        // For other payment methods, go to success
        navigate("/booking/success", {
          state: {
            booking: bookingWithCustomerInfo,
            paymentMethod: paymentMethod,
          },
        });
      }
    } catch (error: any) {
      console.error("Booking creation error:", error);
      message.error(error.message || "Có lỗi xảy ra khi tạo booking");
    } finally {
      setLoading(false);
    }
  };

  if (!bookingData) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Đang tải thông tin đặt sân...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Card title="Thông tin khách hàng" className="payment-form-card">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                fullName: bookingData.customerInfo?.fullName || "",
                phone: bookingData.customerInfo?.phone || "",
                email: bookingData.customerInfo?.email || "",
              }}
            >
              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Nhập họ và tên"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                  {
                    pattern: /^[0-9]{10,11}$/,
                    message: "Số điện thoại không hợp lệ",
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
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Nhập địa chỉ email"
                  size="large"
                />
              </Form.Item>

              <Form.Item name="notes" label="Ghi chú (tùy chọn)">
                <Input.TextArea
                  placeholder="Nhập ghi chú nếu có"
                  rows={3}
                  size="large"
                />
              </Form.Item>

              <Form.Item label="Phương thức thanh toán">
                <Radio.Group
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  size="large"
                >
                  <Space direction="vertical">
                    <Radio value="payos">
                      <span>
                        <strong>PayOS</strong> - Thanh toán qua PayOS
                      </span>
                    </Radio>
                    <Radio value="momo">
                      <span>
                        <strong>MoMo</strong> - Ví điện tử MoMo
                      </span>
                    </Radio>
                    <Radio value="zalopay">
                      <span>
                        <strong>ZaloPay</strong> - Ví điện tử ZaloPay
                      </span>
                    </Radio>
                    <Radio value="banking">
                      <span>
                        <strong>Chuyển khoản</strong> - Chuyển khoản ngân hàng
                      </span>
                    </Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  block
                  style={{ height: "50px", fontSize: "16px" }}
                >
                  {paymentMethod === "payos"
                    ? "Tiến hành thanh toán PayOS"
                    : "Xác nhận đặt sân"}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="Chi tiết đặt sân" className="booking-summary-card">
            <Descriptions column={1} size="small">
              <Descriptions.Item
                label={
                  <span>
                    <ShopOutlined /> Sân thể thao
                  </span>
                }
              >
                <Text strong>{bookingData.courtNames}</Text>
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <span>
                    <CalendarOutlined /> Ngày đặt
                  </span>
                }
              >
                <Text>{formatDate(bookingData.date)}</Text>
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <span>
                    <ClockCircleOutlined /> Khung giờ
                  </span>
                }
              >
                <Space wrap>
                  {bookingData.timeSlots.map((slot, index) => (
                    <Tag key={index} color="blue">
                      {slot.start} - {slot.end}
                    </Tag>
                  ))}
                </Space>
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <span>
                    <DollarOutlined /> Tổng tiền
                  </span>
                }
              >
                <Text strong style={{ fontSize: "18px", color: "#d32f2f" }}>
                  {formatCurrency(bookingData.totalPrice)}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PaymentPage;

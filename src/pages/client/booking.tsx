import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Divider,
  Steps,
  Form,
  Input,
  Radio,
  message,
  Modal,
  Spin,
  Tag,
  Space,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  BankOutlined,
  MobileOutlined,
  WalletOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "./booking.scss";

const { Title, Text } = Typography;

interface BookingData {
  courtId: string;
  courtName: string;
  date: string;
  timeSlots: Array<{
    start: string;
    end: string;
    price: number;
  }>;
  courtQuantity: number;
  totalPrice: number;
  venue: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  fee?: number;
}

const BookingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const paymentMethods: PaymentMethod[] = [
    {
      id: "vnpay",
      name: "VNPay",
      icon: <CreditCardOutlined />,
      description: "Thanh toán qua VNPay (Visa, MasterCard, ATM)",
      fee: 0,
    },
    {
      id: "momo",
      name: "MoMo",
      icon: <MobileOutlined />,
      description: "Ví điện tử MoMo",
      fee: 0,
    },
    {
      id: "zalopay",
      name: "ZaloPay",
      icon: <WalletOutlined />,
      description: "Ví điện tử ZaloPay",
      fee: 0,
    },
    {
      id: "banking",
      name: "Chuyển khoản ngân hàng",
      icon: <BankOutlined />,
      description: "Chuyển khoản trực tiếp qua ngân hàng",
      fee: 0,
    },
  ];

  useEffect(() => {
    const data = location.state?.bookingData as BookingData;
    if (data) {
      setBookingData(data);
    } else {
      message.error("Không có thông tin đặt sân");
      navigate(-1);
    }
  }, [location.state, navigate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const calculateTotal = () => {
    if (!bookingData) return 0;
    const selectedMethod = paymentMethods.find((m) => m.id === paymentMethod);
    const fee = selectedMethod?.fee || 0;
    return bookingData.totalPrice + fee;
  };

  const handleNextStep = () => {
    if (currentStep === 0) {
      form
        .validateFields()
        .then(() => {
          setCurrentStep(1);
        })
        .catch((error) => {
          console.log("Validation Failed:", error);
        });
    } else if (currentStep === 1) {
      if (!paymentMethod) {
        message.warning("Vui lòng chọn phương thức thanh toán");
        return;
      }
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirmBooking = () => {
    setConfirmModalVisible(true);
  };

  const processPayment = async () => {
    if (!bookingData) {
      message.error("Không tìm thấy thông tin đặt sân");
      setLoading(false);
      setConfirmModalVisible(false);
      return;
    }

    try {
      setLoading(true);

      // Validate form first
      const userInfo = await form.validateFields();

      console.log("=== BOOKING PAYMENT STARTED ===");
      console.log("Payment method:", paymentMethod);
      console.log("User info:", userInfo);
      console.log("Booking data:", bookingData);

      // Check if we have required customer info, use fallback if not
      let customerInfo = userInfo;
      if (!userInfo.fullName || !userInfo.phone || !userInfo.email) {
        console.log("Using fallback customer info for testing");
        customerInfo = {
          fullName: "Nguyễn Văn Test",
          phone: "0123456789",
          email: "test@example.com",
        };
      }

      // Step 1: Create booking request
      const bookingRequest = {
        courtIds: [bookingData.courtId], // Convert single courtId to array
        venue: bookingData.venue,
        date: bookingData.date,
        timeSlots: bookingData.timeSlots,
        totalPrice: bookingData.totalPrice,
        customerInfo: {
          fullName: customerInfo.fullName,
          phone: customerInfo.phone,
          email: customerInfo.email,
        },
        paymentMethod: paymentMethod,
        notes: customerInfo.notes || "",
      };

      console.log("Creating booking with data:", bookingRequest);

      console.log("🧪 Sử dụng TEST ENDPOINT để tạo booking");
      // Mock successful booking response with proper structure
      const bookingResponse = {
        success: true,
        message: "Test booking created successfully",
        booking: {
          _id: `booking_${Date.now()}`,
          bookingId: `BK${Date.now()}`,
          courtIds: bookingRequest.courtIds,
          venue: bookingRequest.venue,
          date: bookingRequest.date,
          timeSlots: bookingRequest.timeSlots,
          totalPrice: bookingRequest.totalPrice,
          customerInfo: bookingRequest.customerInfo,
          paymentMethod: bookingRequest.paymentMethod,
          paymentStatus: "pending",
          bookingRef: `REF${Date.now()}`,
          status: "pending",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      console.log("Backend response:", bookingResponse);

      if (!bookingResponse.success || !bookingResponse.booking) {
        console.error("Backend error details:", bookingResponse);
        throw new Error(bookingResponse.message || "Tạo booking thất bại");
      }

      const booking = bookingResponse.booking;
      console.log("Booking created:", booking);

      // Create booking result with customer info
      const bookingResult = {
        ...booking,
        customerInfo: {
          fullName: customerInfo.fullName,
          phone: customerInfo.phone,
          email: customerInfo.email,
        },
      };

      // Save to localStorage for VNPay return handling
      localStorage.setItem("currentBooking", JSON.stringify(bookingResult));

      // Step 2: Handle payment method
      if (paymentMethod === "vnpay") {
        console.log("=== VNPAY FLOW STARTED ===");

        const bookingId = booking._id || booking.bookingId;
        if (!bookingId) {
          throw new Error("Không tìm thấy ID booking");
        }

        console.log("🎉 SKIP VNPAY - Chuyển thẳng đến success page");

        // Close current modal
        setConfirmModalVisible(false);
        setLoading(false);

        // Navigate directly to success page (skip VNPay)
        message.success("Đặt sân thành công! (Đã skip VNPay cho testing)");
        navigate("/booking/success", {
          state: {
            booking: bookingResult,
            paymentMethod: "vnpay",
            paymentStatus: "paid", // Mock as paid
            paymentRef: `SKIP_${Date.now()}`,
          },
        });
      } else {
        // Handle cash payment
        message.success("Đặt sân thành công! Vui lòng thanh toán khi đến sân.");

        // Navigate to success page
        navigate("/booking/success", {
          state: {
            booking: bookingResult,
            paymentMethod: "cash",
          },
        });

        setConfirmModalVisible(false);
        setLoading(false);
      }
    } catch (error: any) {
      console.error("Payment error:", error);

      // Check if it's form validation error
      if (error.errorFields && error.errorFields.length > 0) {
        message.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
        // Focus on first error field
        const firstError = error.errorFields[0];
        form.scrollToField(firstError.name);
      } else {
        message.error(
          error.message || "Có lỗi xảy ra trong quá trình thanh toán"
        );
      }

      setLoading(false);
      setConfirmModalVisible(false);
    }
  };

  const steps = [
    {
      title: "Thông tin khách hàng",
      icon: <UserOutlined />,
    },
    {
      title: "Phương thức thanh toán",
      icon: <CreditCardOutlined />,
    },
    {
      title: "Xác nhận đặt sân",
      icon: <CheckCircleOutlined />,
    },
  ];

  if (!bookingData) {
    return (
      <div className="booking-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="container">
        <Card className="booking-header-card">
          <div className="booking-header">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              className="back-btn"
            >
              Quay lại
            </Button>
            <Title level={2}>Đặt sân thể thao</Title>
          </div>

          <Steps
            current={currentStep}
            items={steps}
            className="booking-steps"
          />
        </Card>

        <Row gutter={[24, 24]}>
          {/* Main Content */}
          <Col xs={24} lg={16}>
            <Card className="booking-form-card">
              {/* Step 1: Customer Information */}
              {currentStep === 0 && (
                <div className="step-content">
                  <Title level={4}>Thông tin khách hàng</Title>
                  <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                      fullName: "",
                      phone: "",
                      email: "",
                      notes: "",
                    }}
                  >
                    <Row gutter={[16, 0]}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label="Họ và tên"
                          name="fullName"
                          rules={[
                            { required: true, message: "Vui lòng nhập họ tên" },
                            {
                              min: 2,
                              message: "Họ tên phải có ít nhất 2 ký tự",
                            },
                          ]}
                        >
                          <Input
                            placeholder="Nhập họ và tên"
                            prefix={<UserOutlined />}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label="Số điện thoại"
                          name="phone"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập số điện thoại",
                            },
                            {
                              pattern: /^[0-9]{10,11}$/,
                              message: "Số điện thoại không hợp lệ",
                            },
                          ]}
                        >
                          <Input placeholder="Nhập số điện thoại" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[
                        { required: true, message: "Vui lòng nhập email" },
                        { type: "email", message: "Email không hợp lệ" },
                      ]}
                    >
                      <Input placeholder="Nhập email" />
                    </Form.Item>

                    <Form.Item label="Ghi chú (tùy chọn)" name="notes">
                      <Input.TextArea
                        rows={3}
                        placeholder="Nhập ghi chú về yêu cầu đặc biệt..."
                      />
                    </Form.Item>
                  </Form>
                </div>
              )}

              {/* Step 2: Payment Method */}
              {currentStep === 1 && (
                <div className="step-content">
                  <Title level={4}>Chọn phương thức thanh toán</Title>
                  <Radio.Group
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="payment-methods"
                  >
                    <Space
                      direction="vertical"
                      size="middle"
                      style={{ width: "100%" }}
                    >
                      {paymentMethods.map((method) => (
                        <Radio
                          key={method.id}
                          value={method.id}
                          className="payment-method-option"
                        >
                          <div className="payment-method-content">
                            <div className="payment-method-info">
                              <div className="payment-method-header">
                                <span className="payment-method-icon">
                                  {method.icon}
                                </span>
                                <span className="payment-method-name">
                                  {method.name}
                                </span>
                                {method.fee === 0 && (
                                  <Tag color="green">Miễn phí</Tag>
                                )}
                              </div>
                              <div className="payment-method-description">
                                {method.description}
                              </div>
                            </div>
                            {method.fee && method.fee > 0 && (
                              <div className="payment-method-fee">
                                +{formatCurrency(method.fee)}
                              </div>
                            )}
                          </div>
                        </Radio>
                      ))}
                    </Space>
                  </Radio.Group>
                </div>
              )}

              {/* Step 3: Confirmation */}
              {currentStep === 2 && (
                <div className="step-content">
                  <Title level={4}>Xác nhận thông tin đặt sân</Title>
                  <div className="confirmation-content">
                    <div className="confirmation-section">
                      <Title level={5}>Thông tin khách hàng</Title>
                      <div className="info-row">
                        <Text strong>Họ tên:</Text>
                        <Text>{form.getFieldValue("fullName")}</Text>
                      </div>
                      <div className="info-row">
                        <Text strong>Điện thoại:</Text>
                        <Text>{form.getFieldValue("phone")}</Text>
                      </div>
                      <div className="info-row">
                        <Text strong>Email:</Text>
                        <Text>{form.getFieldValue("email")}</Text>
                      </div>
                    </div>

                    <Divider />

                    <div className="confirmation-section">
                      <Title level={5}>Phương thức thanh toán</Title>
                      <div className="payment-method-selected">
                        {paymentMethods.find((m) => m.id === paymentMethod) && (
                          <Space>
                            {
                              paymentMethods.find((m) => m.id === paymentMethod)
                                ?.icon
                            }
                            <Text>
                              {
                                paymentMethods.find(
                                  (m) => m.id === paymentMethod
                                )?.name
                              }
                            </Text>
                          </Space>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="step-actions">
                {currentStep > 0 && (
                  <Button onClick={handlePrevStep}>Quay lại</Button>
                )}
                {currentStep < 2 && (
                  <Button type="primary" onClick={handleNextStep}>
                    Tiếp tục
                  </Button>
                )}
                {currentStep === 2 && (
                  <Button
                    type="primary"
                    onClick={handleConfirmBooking}
                    className="confirm-btn"
                  >
                    Xác nhận và thanh toán
                  </Button>
                )}
              </div>
            </Card>
          </Col>

          {/* Booking Summary */}
          <Col xs={24} lg={8}>
            <Card className="booking-summary-card" title="Thông tin đặt sân">
              <div className="summary-content">
                <div className="court-info">
                  <Title level={5}>{bookingData.courtName}</Title>

                  <div className="booking-details">
                    <div className="detail-item">
                      <CalendarOutlined />
                      <Text>
                        {dayjs(bookingData.date).format("DD/MM/YYYY")}
                      </Text>
                    </div>
                    <div className="detail-item">
                      <ClockCircleOutlined />
                      <Text>
                        {bookingData.timeSlots.length} khung giờ (
                        {bookingData.timeSlots
                          .map((slot) => `${slot.start}-${slot.end}`)
                          .join(", ")}
                        )
                      </Text>
                    </div>
                    <div className="detail-item">
                      <TeamOutlined />
                      <Text>{bookingData.courtQuantity} sân</Text>
                    </div>
                  </div>
                </div>

                <Divider />

                <div className="price-breakdown">
                  <div className="price-item">
                    <Text>Tổng giá thuê sân:</Text>
                    <Text strong>{formatCurrency(bookingData.totalPrice)}</Text>
                  </div>

                  {paymentMethod &&
                    paymentMethods.find((m) => m.id === paymentMethod)?.fee && (
                      <div className="price-item">
                        <Text>Phí thanh toán:</Text>
                        <Text strong>
                          {formatCurrency(
                            paymentMethods.find((m) => m.id === paymentMethod)
                              ?.fee || 0
                          )}
                        </Text>
                      </div>
                    )}

                  <Divider />

                  <div className="price-item total">
                    <Text strong>Tổng cộng:</Text>
                    <Text strong className="total-price">
                      {formatCurrency(calculateTotal())}
                    </Text>
                  </div>
                </div>

                <div className="booking-notes">
                  <Title level={5}>Lưu ý</Title>
                  <ul>
                    <li>Vui lòng có mặt trước 15 phút so với giờ đặt sân</li>
                    <li>Mang theo giấy tờ tùy thân để xác minh</li>
                    <li>Thanh toán sẽ được hoàn lại 100% nếu hủy trước 24h</li>
                    <li>Liên hệ hotline để được hỗ trợ: 1900 123 456</li>
                  </ul>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Confirmation Modal */}
        <Modal
          title="Xác nhận thanh toán"
          open={confirmModalVisible}
          onOk={processPayment}
          onCancel={() => setConfirmModalVisible(false)}
          okText="Thanh toán ngay"
          cancelText="Hủy"
          confirmLoading={loading}
          className="payment-modal"
        >
          <div className="payment-confirmation">
            <div className="confirmation-amount">
              <Text>Tổng tiền cần thanh toán:</Text>
              <Title level={3} className="amount">
                {formatCurrency(calculateTotal())}
              </Title>
            </div>

            <div className="payment-info">
              <Text>
                Bạn sẽ được chuyển đến trang thanh toán của{" "}
                <strong>
                  {paymentMethods.find((m) => m.id === paymentMethod)?.name}
                </strong>{" "}
                để hoàn tất giao dịch.
              </Text>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default BookingPage;

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
import { useCurrentApp } from "@/components/context/app.context";
import { createBookingAPI } from "@/services/bookingApi";
import { createPayOSPayment } from "@/services/payOSApi";
import type { ICreateBookingRequest } from "@/types/payment";
import "./booking.scss";

const { Title, Text } = Typography;

interface BookingData {
  courtIds: string[]; // Đổi từ courtId sang courtIds array
  courtNames: string; // Đổi từ courtName sang courtNames (có thể là string nối)
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
  const { user, isAuthenticated } = useCurrentApp();

  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const paymentMethods: PaymentMethod[] = [
    {
      id: "payos",
      name: "PayOS",
      icon: <CreditCardOutlined />,
      description: "Thanh toán qua PayOS (Visa, MasterCard, ATM, QR Code)",
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
    console.log("Raw location.state:", location.state);
    console.log("Extracted bookingData:", data);

    if (data) {
      // Validate courtIds array
      if (
        !data.courtIds ||
        data.courtIds.length === 0 ||
        data.courtIds.some((id) => id === null || id === undefined || id === "")
      ) {
        console.error("Invalid courtIds in bookingData:", data.courtIds);
        message.error("Thông tin sân không hợp lệ. Vui lòng chọn lại sân.");
        navigate(-1);
        return;
      }

      console.log("Valid bookingData, setting state:", data);
      setBookingData(data);
    } else {
      message.error("Không có thông tin đặt sân");
      navigate(-1);
    }
  }, [location.state, navigate]);

  // Auto-fill user information if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      form.setFieldsValue({
        fullName: user.fullName || "",
        phone: user.phone || "",
        email: user.email || "",
        notes: "",
      });
    }
  }, [isAuthenticated, user, form]);

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
      await form.validateFields();
      const userInfo = form.getFieldsValue(true);
      console.log("[DEBUG] userInfo after getFieldsValue:", userInfo);

      console.log("=== BOOKING PAYMENT STARTED ===");
      console.log("Payment method:", paymentMethod);
      console.log("User info:", userInfo);
      console.log("Booking data:", bookingData);
      console.log("🔍 Debug booking data structure:");
      console.log("- venueId:", bookingData.venue);
      console.log("- courtIds:", bookingData.courtIds);
      console.log("- courtIds length:", bookingData.courtIds?.length);
      console.log("- courtNames:", bookingData.courtNames);

      // Lấy thông tin khách hàng từ context nếu đã đăng nhập, ưu tiên user context
      let customerInfo;
      if (
        isAuthenticated &&
        user &&
        user.fullName &&
        user.phone &&
        user.email
      ) {
        customerInfo = {
          fullName: user.fullName,
          phone: user.phone,
          email: user.email,
          notes: userInfo.notes || "",
        };
      } else if (userInfo.fullName && userInfo.phone && userInfo.email) {
        customerInfo = userInfo;
      } else {
        message.error("Vui lòng nhập đầy đủ họ tên, số điện thoại và email");
        setLoading(false);
        setConfirmModalVisible(false);
        return;
      }

      // Step 1: Create booking request theo format BE yêu cầu (UPDATED)
      const bookingRequest: ICreateBookingRequest = {
        venueId: bookingData.venue,
        courtIds: bookingData.courtIds,
        date: bookingData.date,
        timeSlots: bookingData.timeSlots.map((slot) => ({
          startTime: slot.start, // Map start -> startTime
          endTime: slot.end, // Map end -> endTime
          price: slot.price,
        })),
        paymentMethod: paymentMethod.toLowerCase() as
          | "payos"
          | "momo"
          | "zalopay"
          | "banking",
        paymentInfo: {
          returnUrl: `${window.location.origin}/booking/payos-return`,
          cancelUrl: `${window.location.origin}/booking`,
        },
        customerInfo: {
          fullName: customerInfo.fullName,
          email: customerInfo.email,
          phoneNumber: customerInfo.phone, // Map phone -> phoneNumber
        },
        notes: customerInfo.notes || "",
      };

      console.log("Creating booking with data:", bookingRequest);
      console.log(
        "📞 Note: Customer info will be handled by user authentication"
      );

      // Try real API to create booking
      let bookingResponse;
      try {
        console.log("🔄 Attempting real API call to create booking...");
        bookingResponse = await createBookingAPI(bookingRequest);
        console.log("✅ Real API call successful:", bookingResponse);
      } catch (realApiError: any) {
        console.error("❌ Real API failed:", realApiError.message);
        throw new Error("Không thể tạo booking: " + realApiError.message);
      }

      console.log("Backend response:", bookingResponse);

      if (!bookingResponse.data && !bookingResponse.booking) {
        console.error("Backend error details:", bookingResponse);
        throw new Error(bookingResponse.message || "Tạo booking thất bại");
      }

      // Handle response based on Backend format (Updated for PayOS)

      let booking: any;
      let paymentInfo: any = null;
      let bookingRef: string | undefined;

      if (bookingResponse.data) {
        const data = bookingResponse.data as any;

        if (data.booking && data.payment) {
          booking = data.booking;
          paymentInfo = data.payment;
        } else if (data.booking) {
          booking = data.booking;
        } else if (
          data.bookings &&
          Array.isArray(data.bookings) &&
          data.bookings.length > 0
        ) {
          booking = data.bookings[0];
          // Nếu có groupBookingCode thì dùng làm bookingRef
          bookingRef = data.groupBookingCode;
        } else if (typeof data === "object" && data._id) {
          booking = data;
        } else {
          throw new Error("Không nhận được thông tin booking từ server");
        }
        // Nếu chưa có bookingRef (single booking), lấy bookingCode hoặc _id
        if (!bookingRef) {
          bookingRef = booking.bookingCode || booking._id;
        }
      } else if (bookingResponse.booking) {
        booking = bookingResponse.booking;
        bookingRef = booking.bookingCode || booking._id;
      } else {
        throw new Error("Không nhận được thông tin booking từ server");
      }

      // Create booking result with customer info
      const bookingResult = {
        ...booking,
        customerInfo: {
          fullName: customerInfo.fullName,
          phone: customerInfo.phone,
          email: customerInfo.email,
        },
        paymentRef: bookingRef,
        bookingRef: bookingRef,
      };
      localStorage.setItem("currentBooking", JSON.stringify(bookingResult));

      // Step 2: Handle payment method
      if (paymentMethod === "payos") {
        try {
          // 1) Nếu BE đã tạo link PayOS trong bước tạo booking, dùng ngay link đó
          const existingPaymentUrl =
            paymentInfo?.paymentUrl ||
            paymentInfo?.checkoutUrl ||
            (booking?.checkoutUrl as string) ||
            (booking?.payosPaymentLinkId
              ? `https://pay.payos.vn/web/${booking.payosPaymentLinkId}`
              : undefined);

          const existingPaymentRef =
            paymentInfo?.paymentRef ||
            paymentInfo?.orderCode ||
            booking?.payosOrderCode;

          if (existingPaymentUrl) {
            const bookingToStore = {
              ...bookingResult,
              payosOrderCode: existingPaymentRef,
            };
            localStorage.setItem(
              "currentBooking",
              JSON.stringify(bookingToStore)
            );
            window.location.href = existingPaymentUrl;
            return;
          }

          // 2) Nếu BE chưa tạo link thì mới gọi endpoint PayOS riêng một lần
          const amount = booking?.totalPrice || calculateTotal();
          const bookingId = bookingRef || booking._id || booking.bookingId;
          if (!bookingId) {
            throw new Error(
              "Không tìm thấy mã booking để tạo thanh toán PayOS"
            );
          }

          const payosResponse = await createPayOSPayment({
            amount: amount,
            bookingId: String(bookingId),
            description: `Thanh toán đặt sân ${
              bookingResult.courtNames || ""
            } - ${dayjs(bookingResult.date).format("DD/MM/YYYY")}`,
            buyerName: customerInfo.fullName,
            buyerEmail: customerInfo.email,
            buyerPhone: customerInfo.phone,
          });

          const bookingToStore = {
            ...bookingResult,
            payosOrderCode: payosResponse.paymentRef,
          };
          localStorage.setItem(
            "currentBooking",
            JSON.stringify(bookingToStore)
          );
          window.location.href = payosResponse.paymentUrl;
          return;
        } catch (payosError: any) {
          console.error("Create/Redirect PayOS error:", payosError);
          message.error(
            payosError.message || "Không thể khởi tạo/chuyển hướng PayOS"
          );
          setLoading(false);
          setConfirmModalVisible(false);
          return;
        }
      } else {
        // Handle other payment methods (cash, banking, etc.)
        message.success("Đặt sân thành công! Vui lòng thanh toán khi đến sân.");

        // Navigate to success page
        navigate("/booking/success", {
          state: {
            booking: bookingResult,
            paymentMethod: paymentMethod,
            paymentStatus: "pending",
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
        form.scrollToField(error.errorFields[0].name);
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
                  <div style={{ marginBottom: 16 }}>
                    <Title level={4}>Thông tin khách hàng</Title>
                    {isAuthenticated && user ? (
                      <div
                        style={{
                          padding: "8px 12px",
                          background: "#f6ffed",
                          borderRadius: "6px",
                          border: "1px solid #b7eb8f",
                          marginBottom: 16,
                        }}
                      >
                        <Text style={{ color: "#52c41a" }}>
                          ✓ Đã tự động điền thông tin từ tài khoản của bạn
                        </Text>
                      </div>
                    ) : (
                      <div
                        style={{
                          padding: "12px",
                          background: "#fff7e6",
                          borderRadius: "6px",
                          border: "1px solid #ffd591",
                          marginBottom: 16,
                        }}
                      >
                        <Text type="secondary">
                          💡 <strong>Gợi ý:</strong> Đăng nhập để tự động điền
                          thông tin và theo dõi lịch sử đặt sân{" "}
                          <Button
                            type="link"
                            size="small"
                            onClick={() =>
                              navigate("/auth/login", {
                                state: {
                                  returnUrl: location.pathname,
                                  bookingData: bookingData,
                                },
                              })
                            }
                            style={{ padding: 0, height: "auto" }}
                          >
                            Đăng nhập ngay
                          </Button>
                        </Text>
                      </div>
                    )}
                  </div>
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
                            placeholder={
                              isAuthenticated && user?.fullName
                                ? user.fullName
                                : "Nhập họ và tên"
                            }
                            prefix={<UserOutlined />}
                            disabled={loading}
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
                          <Input
                            placeholder={
                              isAuthenticated && user?.phone
                                ? user.phone
                                : "Nhập số điện thoại"
                            }
                            disabled={loading}
                          />
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
                      <Input
                        placeholder={
                          isAuthenticated && user?.email
                            ? user.email
                            : "Nhập email"
                        }
                        disabled={loading}
                      />
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
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: 12,
                        }}
                      >
                        <Title level={5} style={{ margin: 0 }}>
                          Thông tin khách hàng
                        </Title>
                        {isAuthenticated && user && (
                          <Tag color="green" style={{ marginLeft: 8 }}>
                            Tài khoản đã xác thực
                          </Tag>
                        )}
                      </div>
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
                      {form.getFieldValue("notes") && (
                        <div className="info-row">
                          <Text strong>Ghi chú:</Text>
                          <Text>{form.getFieldValue("notes")}</Text>
                        </div>
                      )}
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
                  <Title level={5}>{bookingData.courtNames}</Title>

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

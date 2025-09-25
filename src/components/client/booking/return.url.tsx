import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Result,
  Button,
  Card,
  Typography,
  Spin,
  Space,
  Tag,
  Descriptions,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  HomeOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import {
  getBookingByIdAPI,
  getPaymentTransactionAPI,
} from "@/services/bookingApi";
import "./return.url.scss";

const { Title, Text } = Typography;

const PaymentReturn: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<
    "success" | "failed" | "processing"
  >("processing");
  const [bookingData, setBookingData] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    processPaymentReturn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processPaymentReturn = async () => {
    try {
      // This is now a generic payment return handler
      // PayOS-specific logic is in payos.return.tsx

      const paymentRef = searchParams.get("ref") || searchParams.get("id");
      const status = searchParams.get("status");

      if (!paymentRef) {
        throw new Error("Thiếu thông tin thanh toán");
      }

      // Try to get payment transaction details
      try {
        const paymentResponse = await getPaymentTransactionAPI(paymentRef);
        if (paymentResponse.success && paymentResponse.data) {
          const paymentResponseData = paymentResponse.data;
          setPaymentData(paymentResponseData);

          // Get booking details
          const bookingResponse = await getBookingByIdAPI(
            paymentResponseData.bookingId
          );
          if (bookingResponse.success && bookingResponse.data) {
            setBookingData(bookingResponse.data);
          }
        }
      } catch (error) {
        console.warn("Could not fetch payment/booking details:", error);
      }

      // Determine payment status
      if (status === "success" || status === "00") {
        setPaymentStatus("success");
        message.success("Thanh toán thành công!");

        // Redirect to booking success
        setTimeout(() => {
          if (bookingData) {
            localStorage.removeItem("currentBooking");
            navigate("/booking/success", {
              state: {
                booking: bookingData,
                paymentMethod: "generic",
                paymentData,
              },
            });
          }
        }, 2000);
      } else {
        setPaymentStatus("failed");
        setErrorMessage("Thanh toán thất bại");
        message.error("Thanh toán thất bại");
      }
    } catch (error: any) {
      console.error("Payment return processing error:", error);
      setPaymentStatus("failed");
      setErrorMessage(error.message || "Có lỗi xảy ra khi xử lý thanh toán");
      message.error(error.message || "Có lỗi xảy ra khi xử lý thanh toán");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatPaymentDate = (payDate: string) => {
    // Generic date format function
    if (!payDate) return payDate;
    try {
      return new Date(payDate).toLocaleString("vi-VN");
    } catch {
      return payDate;
    }
  };

  if (loading) {
    return (
      <div className="payment-return-container">
        <Card className="result-card">
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin
              size="large"
              indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
            />
            <Title level={3} style={{ marginTop: 24 }}>
              Đang xử lý kết quả thanh toán...
            </Title>
            <Text type="secondary">Vui lòng chờ trong giây lát</Text>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="payment-return-container">
      <Card className="result-card">
        {paymentStatus === "success" ? (
          <Result
            status="success"
            icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
            title="Thanh toán thành công!"
            subTitle="Cảm ơn bạn đã sử dụng dịch vụ. Thông tin đặt sân đã được gửi tới email của bạn."
            extra={[
              <Button
                type="primary"
                key="home"
                icon={<HomeOutlined />}
                onClick={() => navigate("/")}
              >
                Về trang chủ
              </Button>,
              <Button
                key="history"
                icon={<HistoryOutlined />}
                onClick={() => navigate("/history")}
              >
                Lịch sử đặt sân
              </Button>,
            ]}
          />
        ) : (
          <Result
            status="error"
            icon={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />}
            title="Thanh toán thất bại!"
            subTitle={
              errorMessage || "Đã có lỗi xảy ra trong quá trình thanh toán."
            }
            extra={[
              <Button
                type="primary"
                key="retry"
                onClick={() => navigate("/booking")}
              >
                Thử lại
              </Button>,
              <Button key="home" onClick={() => navigate("/")}>
                Về trang chủ
              </Button>,
            ]}
          />
        )}

        {/* Transaction Details */}
        {(bookingData || paymentData) && (
          <Card
            title="Chi tiết giao dịch"
            style={{ marginTop: 24 }}
            size="small"
          >
            <Descriptions column={1} bordered size="small">
              {bookingData && (
                <>
                  <Descriptions.Item label="Mã booking">
                    <Tag color="blue">{bookingData.bookingRef}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày đặt sân">
                    {new Date(bookingData.date).toLocaleDateString("vi-VN")}
                  </Descriptions.Item>
                  <Descriptions.Item label="Khung giờ">
                    <Space wrap>
                      {bookingData.timeSlots?.map(
                        (slot: any, index: number) => (
                          <Tag key={index}>
                            {slot.start} - {slot.end}
                          </Tag>
                        )
                      )}
                    </Space>
                  </Descriptions.Item>
                </>
              )}

              {paymentData && (
                <>
                  <Descriptions.Item label="Mã thanh toán">
                    {paymentData.paymentRef}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số tiền">
                    {formatCurrency(paymentData.amount)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Phương thức">
                    <Tag color="blue">Generic Payment</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Tag
                      color={paymentData.status === "success" ? "green" : "red"}
                    >
                      {paymentData.status === "success"
                        ? "Thành công"
                        : "Thất bại"}
                    </Tag>
                  </Descriptions.Item>
                </>
              )}

              {/* Generic transaction details */}
              {searchParams.get("id") && (
                <Descriptions.Item label="Mã giao dịch">
                  {searchParams.get("id")}
                </Descriptions.Item>
              )}
              {searchParams.get("date") && (
                <Descriptions.Item label="Thời gian thanh toán">
                  {formatPaymentDate(searchParams.get("date") || "")}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        )}
      </Card>
    </div>
  );
};

export default PaymentReturn;

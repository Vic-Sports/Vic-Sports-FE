import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Result,
  Button,
  Card,
  Typography,
  Spin,
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
import type { IPayOSReturnParams } from "@/types/payment";
import { verifyPayOSReturn } from "@/services/payOSApi";

const { Text } = Typography;

const PayOSReturn: React.FC = () => {
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
    processPayOSReturn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, navigate]);

  const processPayOSReturn = async () => {
    try {
      console.log("=== PAYOS PAYMENT RETURN PROCESSING ===");

      // Extract PayOS parameters from URL
      const payosParams: IPayOSReturnParams = {
        code: searchParams.get("code") || "",
        id: searchParams.get("id") || "",
        cancel: searchParams.get("cancel") === "true",
        status: searchParams.get("status") || "",
        orderCode: searchParams.get("orderCode") || "",
      };

      console.log("PayOS return parameters:", payosParams);

      if (!payosParams.orderCode) {
        throw new Error("Missing PayOS orderCode");
      }

      // Step 1: Call Backend API to verify payment
      try {
        console.log("🔄 Calling Backend PayOS verification API...");
        
        const verifyPayload = {
          orderCode: parseInt(payosParams.orderCode),
          amount: 0, // Will be validated by Backend  
          description: `Payment verification for order ${payosParams.orderCode}`,
          accountNumber: "", // Optional
          reference: payosParams.id,
          transactionDateTime: new Date().toISOString(),
          currency: "VND"
        };

        // Call Backend verification endpoint  
        const backendResponse = await fetch('/api/v1/payments/payos/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(verifyPayload),
        });

        const backendResult = await backendResponse.json();
        console.log("✅ Backend verification result:", backendResult);

        if (backendResult.success && backendResult.data) {
          const { booking: verifiedBooking, paymentInfo } = backendResult.data;
          
          // Update local state with verified data
          setBookingData(verifiedBooking);
          setPaymentData({
            paymentRef: paymentInfo.orderCode,
            amount: paymentInfo.amount,
            status: paymentInfo.status === "PAID" ? "success" : "failed",
            method: "PayOS",
            transactionId: payosParams.id,
          });

          if (paymentInfo.status === "PAID") {
            setPaymentStatus("success");
            message.success("Thanh toán thành công!");
            
            // Clear localStorage
            localStorage.removeItem("currentBooking");
            
            // Navigate to success page
            setTimeout(() => {
              navigate("/booking/success", {
                state: {
                  booking: verifiedBooking,
                  paymentMethod: "payos",
                  paymentData: paymentInfo,
                },
              });
            }, 2000);
          } else {
            throw new Error("Payment was not successful");
          }
        } else {
          throw new Error(backendResult.message || "Backend verification failed");
        }
      } catch (backendError: any) {
        console.error("❌ Backend verification failed:", backendError.message);
        
        // Fallback: Use local verification and localStorage
        console.log("⚠️ Falling back to local verification...");
        
        const isValid = verifyPayOSReturn(payosParams);
        console.log("PayOS local verification result:", isValid);

        if (!isValid && !payosParams.cancel) {
          throw new Error("PayOS payment verification failed");
        }

        // Check payment status
        if (
          payosParams.code === "00" &&
          payosParams.status === "PAID" &&
          !payosParams.cancel
        ) {
          setPaymentStatus("success");
          message.success("Thanh toán thành công!");

          // Get booking data from localStorage
          const savedBooking = localStorage.getItem("currentBooking");
          if (savedBooking) {
            try {
              const booking = JSON.parse(savedBooking);
              console.log("Retrieved booking data:", booking);
              setBookingData(booking);

              // Clear localStorage after successful use
              localStorage.removeItem("currentBooking");

              // Set payment data for display
              setPaymentData({
                paymentRef: payosParams.orderCode,
                amount: booking.totalPrice || 0,
                status: "success",
                method: "PayOS",
                transactionId: payosParams.id,
              });

              // Navigate to success page after a delay
              setTimeout(() => {
                navigate("/booking/success", {
                  state: {
                    booking: booking,
                    paymentMethod: "payos",
                    paymentData: {
                      paymentRef: payosParams.orderCode,
                      amount: booking.totalPrice || 0,
                      status: "success",
                      method: "PayOS",
                      transactionId: payosParams.id,
                    },
                  },
                });
              }, 2000);
            } catch (error) {
              console.error("Error parsing saved booking:", error);
              // Continue without booking data
            }
          }
        } else {
          // Payment failed or cancelled
          setPaymentStatus("failed");
          const errorMsg = payosParams.cancel
            ? "Thanh toán đã bị hủy"
            : `Thanh toán thất bại (Code: ${payosParams.code})`;
          setErrorMessage(errorMsg);
          message.error(errorMsg);
        }
      }
    } catch (error: any) {
      console.error("PayOS return processing error:", error);
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

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Card>
          <Spin
            size="large"
            indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
          />
          <div style={{ marginTop: 24 }}>
            <Text>Đang xử lý kết quả thanh toán PayOS...</Text>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <Card>
        {paymentStatus === "success" ? (
          <Result
            status="success"
            icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
            title="Thanh toán PayOS thành công!"
            subTitle="Cảm ơn bạn đã sử dụng dịch vụ. Thông tin đặt sân đã được xác nhận."
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
            title="Thanh toán PayOS thất bại!"
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
            title="Chi tiết giao dịch PayOS"
            style={{ marginTop: 24 }}
            size="small"
          >
            <Descriptions column={1} bordered size="small">
              {bookingData && (
                <>
                  <Descriptions.Item label="Mã booking">
                    <Tag color="blue">{bookingData.bookingCode || bookingData._id}</Tag>
                  </Descriptions.Item>
                  {bookingData.date && (
                    <Descriptions.Item label="Ngày đặt sân">
                      {new Date(bookingData.date).toLocaleDateString("vi-VN")}
                    </Descriptions.Item>
                  )}
                  {bookingData.venue?.name && (
                    <Descriptions.Item label="Sân">
                      {bookingData.venue.name}
                    </Descriptions.Item>
                  )}
                  {bookingData.court?.name && (
                    <Descriptions.Item label="Sân số">
                      {bookingData.court.name}
                    </Descriptions.Item>
                  )}
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
                    <Tag color="green">PayOS</Tag>
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
                  {paymentData.transactionId && (
                    <Descriptions.Item label="Mã GD PayOS">
                      {paymentData.transactionId}
                    </Descriptions.Item>
                  )}
                </>
              )}
            </Descriptions>
          </Card>
        )}
      </Card>
    </div>
  );
};

export default PayOSReturn;
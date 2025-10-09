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
import { getPayOSPaymentStatus } from "@/services/payOSApi";

const { Text } = Typography;

const PayOSReturn: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [suppressRender, setSuppressRender] = useState(true);
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

      // HANDLE CANCEL EARLY: call backend to update booking status, then show cancelled UI
      if (payosParams.cancel) {
        console.log("🚫 User cancelled payment");

        try {
          // Clear localStorage immediately to prevent stale pending UI
          localStorage.removeItem("currentBooking");

          // If we have orderCode, call backend to update booking status
          if (payosParams.orderCode) {
            console.log(
              "🔄 Calling backend cancel API for orderCode:",
              payosParams.orderCode
            );

            // Try to get auth token (adjust path based on your auth implementation)
            const token =
              localStorage.getItem("token") ||
              localStorage.getItem("authToken");
            const headers: Record<string, string> = {
              "Content-Type": "application/json",
            };

            if (token) {
              headers["Authorization"] = `Bearer ${token}`;
            }

            const cancelResponse = await fetch(
              `/api/v1/payments/payos/${encodeURIComponent(
                payosParams.orderCode
              )}/cancel`,
              {
                method: "POST",
                headers,
                body: JSON.stringify({
                  reason: "Payment cancelled by user",
                }),
              }
            );

            if (cancelResponse.ok) {
              const cancelResult = await cancelResponse.json();
              console.log("✅ Backend cancel successful:", cancelResult);

              // Update UI with cancelled booking data if available
              if (cancelResult.data?.booking) {
                setBookingData(cancelResult.data.booking);
              }
            } else {
              console.warn(
                "⚠️ Backend cancel failed, but continuing with UI update"
              );
            }
          }
        } catch (error) {
          console.warn(
            "⚠️ Failed to call backend cancel (non-blocking):",
            error
          );
        }

        // Always show cancelled UI regardless of backend call result
        setSuppressRender(false);
        setLoading(false);
        setPaymentStatus("failed");
        setErrorMessage("Thanh toán đã bị hủy bởi người dùng");
        message.error("Thanh toán đã bị hủy bởi người dùng");
        return;
      }

      if (!payosParams.orderCode) {
        throw new Error("Missing PayOS orderCode");
      }

      // Step 1: Call Backend API to get payment status via service helper
      try {
        console.log(
          "🔄 Calling Backend PayOS status API (JSON) via service helper..."
        );
        const backendResult = await getPayOSPaymentStatus(
          String(payosParams.orderCode)
        );
        console.log("✅ Backend status result:", backendResult);

        // Unpack BE payload: either {orderCode,status} or {booking}
        if (!backendResult.success) {
          throw new Error(
            backendResult.message || "Backend verification failed"
          );
        }
        const payload = backendResult.data;
        // Case 1: success payment info
        if (payload.orderCode) {
          const normalizedStatus = String(payload.status || "")
            .trim()
            .toUpperCase();
          const paymentInfo = {
            orderCode: payload.orderCode,
            status: normalizedStatus,
          };
          // update state
          setPaymentData({
            paymentRef: paymentInfo.orderCode,
            amount: (payload as any).totalPrice || 0,
            status: ["PAID", "SUCCESS", "SUCCEEDED"].includes(normalizedStatus)
              ? "success"
              : "failed",
            method: "PayOS",
            transactionId: payosParams.id,
          });
          // success → navigate
          if (["PAID", "SUCCESS", "SUCCEEDED"].includes(normalizedStatus)) {
            const stored =
              JSON.parse(localStorage.getItem("currentBooking") || "null") ||
              {};
            localStorage.removeItem("currentBooking");
            navigate("/booking/success", {
              state: {
                booking: stored,
                paymentMethod: "payos",
                paymentData: paymentInfo,
              },
            });
            return;
          }
          // pending or failed → show error
          setSuppressRender(false);
          setLoading(false);
          setPaymentStatus(
            ["PAID", "SUCCESS", "SUCCEEDED"].includes(normalizedStatus)
              ? "success"
              : "failed"
          );
          setErrorMessage(
            ["PAID", "SUCCESS", "SUCCEEDED"].includes(normalizedStatus)
              ? ""
              : "Thanh toán không thành công"
          );
          message[
            ["PAID", "SUCCESS", "SUCCEEDED"].includes(normalizedStatus)
              ? "success"
              : "error"
          ](
            ["PAID", "SUCCESS", "SUCCEEDED"].includes(normalizedStatus)
              ? "Thanh toán thành công"
              : "Thanh toán thất bại"
          );
          return;
        }
        // Case 2: fallback booking info
        if (payload.booking) {
          setBookingData(payload.booking);
          setSuppressRender(false);
          setLoading(false);
          setPaymentStatus("failed");
          setErrorMessage(backendResult.message || "Booking info only");
          return;
        }
      } catch (backendError: any) {
        console.error("❌ Backend status check failed:", backendError.message);
        setSuppressRender(false);
        setPaymentStatus("failed");
        const errorMsg = payosParams.cancel
          ? "Thanh toán đã bị hủy"
          : backendError.message || "Kiểm tra trạng thái thanh toán thất bại";
        setErrorMessage(errorMsg);
        message.error(errorMsg);
      }
    } catch (error: any) {
      console.error("PayOS return processing error:", error);
      setSuppressRender(false);
      setPaymentStatus("failed");
      setErrorMessage(error.message || "Có lỗi xảy ra khi xử lý thanh toán");
      message.error(error.message || "Có lỗi xảy ra khi xử lý thanh toán");
    } finally {
      if (!suppressRender) setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (suppressRender) return null;

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
                    <Tag color="blue">
                      {bookingData.bookingCode || bookingData._id}
                    </Tag>
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

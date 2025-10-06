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
          currency: "VND",
        };

        // Call Backend verification endpoint
        const backendResponse = await fetch("/api/v1/payments/payos/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(verifyPayload),
        });

        // Safe JSON parsing: backend may return non-JSON on errors (405) or empty body
        const safeParseJson = async (res: Response) => {
          try {
            const contentType = res.headers.get("content-type") || "";
            if (!contentType.includes("application/json")) {
              // Not JSON — return null but include text for logging
              const txt = await res.text();
              return { __rawText: txt } as any;
            }
            // Try parse JSON; if empty body this will throw and caught below
            return await res.json();
          } catch {
            // Fall back to raw text for diagnostics
            try {
              const txt = await res.text();
              return { __rawText: txt } as any;
            } catch {
              return null;
            }
          }
        };

        const backendResult = await safeParseJson(backendResponse);
        console.log(
          "✅ Backend verification response status:",
          backendResponse.status,
          backendResponse.statusText
        );
        if (backendResult && (backendResult as any).__rawText) {
          console.warn(
            "Backend returned non-JSON body:",
            (backendResult as any).__rawText
          );
        } else {
          console.log("✅ Backend verification result:", backendResult);
        }

        if (!backendResponse.ok) {
          // Provide a helpful error with status and potential body for debugging
          const bodyPreview =
            backendResult && (backendResult as any).__rawText
              ? (backendResult as any).__rawText
              : JSON.stringify(backendResult);
          throw new Error(
            `Backend verify failed: HTTP ${backendResponse.status} ${backendResponse.statusText} - ${bodyPreview}`
          );
        }

        if (backendResult.success && backendResult.data) {
          const { booking: verifiedBooking, paymentInfo } = backendResult.data;

          // Update local state with verified data
          setBookingData(verifiedBooking);
          const inferredStatus =
            paymentInfo?.status ||
            (verifiedBooking?.paymentStatus === "paid"
              ? "PAID"
              : verifiedBooking?.status === "confirmed"
              ? "PAID"
              : undefined);
          const normalizedStatus = String(inferredStatus || "")
            .trim()
            .toUpperCase();
          setPaymentData({
            paymentRef:
              paymentInfo.orderCode ||
              paymentInfo.paymentRef ||
              payosParams.orderCode ||
              verifiedBooking?.payosOrderCode,
            amount:
              Number(paymentInfo.amount) ||
              Number(verifiedBooking?.totalPrice) ||
              0,
            status:
              normalizedStatus === "PAID" ||
              normalizedStatus === "SUCCESS" ||
              normalizedStatus === "SUCCEEDED"
                ? "success"
                : "failed",
            method: "PayOS",
            transactionId: payosParams.id,
          });

          if (
            normalizedStatus === "PAID" ||
            normalizedStatus === "SUCCESS" ||
            normalizedStatus === "SUCCEEDED"
          ) {
            // Merge booking data with any previously stored info (court names, customer info)
            let stored: any = null;
            try {
              const raw = localStorage.getItem("currentBooking");
              stored = raw ? JSON.parse(raw) : null;
            } catch {
              // ignore JSON parse error
            }

            const mergedBooking = {
              ...stored,
              ...verifiedBooking,
              courtIds: stored?.courtIds || verifiedBooking?.courtIds || [],
              courtNames:
                stored?.courtNames ||
                verifiedBooking?.courtNames ||
                verifiedBooking?.court?.name,
              customerInfo:
                stored?.customerInfo || bookingData?.customerInfo || undefined,
              bookingRef:
                verifiedBooking?.bookingCode || stored?.bookingRef || undefined,
              paymentStatus: "paid",
            };

            // Clear localStorage and navigate immediately to success page
            localStorage.removeItem("currentBooking");
            navigate("/booking/success", {
              state: {
                booking: mergedBooking,
                paymentMethod: "payos",
                paymentData: paymentInfo,
              },
            });
            return;
          } else {
            // Check if user cancelled payment first (highest priority)
            if (payosParams.cancel) {
              setPaymentStatus("failed");
              setErrorMessage("Thanh toán đã bị hủy bởi người dùng");
              message.error("Thanh toán đã bị hủy bởi người dùng");
              return;
            }

            // If BE already classifies as FAILED/CANCELLED → fail immediately
            if (
              normalizedStatus === "FAILED" ||
              normalizedStatus === "CANCELLED"
            ) {
              setPaymentStatus("failed");
              setErrorMessage("Thanh toán thất bại hoặc đã hủy");
              message.error("Thanh toán thất bại hoặc đã hủy");
              return;
            }

            // If not paid, try redirecting to checkout if available (PENDING/INIT)
            // But only if user didn't cancel
            const redirectUrl =
              paymentInfo.checkoutUrl || paymentInfo.paymentUrl;
            if (
              (normalizedStatus === "PENDING" || normalizedStatus === "INIT") &&
              redirectUrl &&
              !payosParams.cancel
            ) {
              window.location.href = redirectUrl;
              return;
            }
            // Otherwise poll status until PAID/FAILED
            try {
              const orderCode =
                paymentInfo.orderCode ||
                paymentInfo.paymentRef ||
                payosParams.orderCode;
              if (!orderCode)
                throw new Error("Missing order code to poll status");

              let attempts = 0;
              const maxAttempts = 30; // ~60s at 2s interval
              const poll = setInterval(async () => {
                attempts++;
                try {
                  const statusRes = await getPayOSPaymentStatus(
                    String(orderCode)
                  );
                  const status = statusRes?.data?.status || statusRes?.status;
                  if (status === "PAID") {
                    clearInterval(poll);
                    // Merge booking data with stored info before navigating
                    let stored: any = null;
                    try {
                      const raw = localStorage.getItem("currentBooking");
                      stored = raw ? JSON.parse(raw) : null;
                    } catch {
                      // ignore JSON parse error
                    }
                    const mergedBooking = {
                      ...stored,
                      ...verifiedBooking,
                      courtIds:
                        stored?.courtIds || verifiedBooking?.courtIds || [],
                      courtNames:
                        stored?.courtNames ||
                        verifiedBooking?.courtNames ||
                        verifiedBooking?.court?.name,
                      customerInfo:
                        stored?.customerInfo ||
                        bookingData?.customerInfo ||
                        undefined,
                      bookingRef:
                        verifiedBooking?.bookingCode ||
                        stored?.bookingRef ||
                        undefined,
                      paymentStatus: "paid",
                    };
                    localStorage.removeItem("currentBooking");
                    navigate("/booking/success", {
                      state: {
                        booking: mergedBooking,
                        paymentMethod: "payos",
                        paymentData: { ...paymentInfo, status: "PAID" },
                      },
                      replace: true,
                    });
                    return;
                  } else if (status === "FAILED" || status === "CANCELLED") {
                    setSuppressRender(false);
                    clearInterval(poll);
                    setPaymentStatus("failed");
                    setErrorMessage("Thanh toán thất bại hoặc đã hủy");
                    message.error("Thanh toán thất bại hoặc đã hủy");
                  } else if (attempts >= maxAttempts) {
                    setSuppressRender(false);
                    clearInterval(poll);
                    setPaymentStatus("failed");
                    setErrorMessage("Hết thời gian chờ thanh toán");
                    message.error("Hết thời gian chờ thanh toán");
                  }
                } catch {
                  setSuppressRender(false);
                  clearInterval(poll);
                  setPaymentStatus("failed");
                  setErrorMessage("Không thể kiểm tra trạng thái thanh toán");
                  message.error("Không thể kiểm tra trạng thái thanh toán");
                }
              }, 2000);
              return;
            } catch {
              setSuppressRender(false);
              throw new Error(
                `Payment was not successful (status: ${
                  normalizedStatus || "UNKNOWN"
                })`
              );
            }
          }
        } else {
          // Check if user cancelled payment first (before any polling)
          if (payosParams.cancel) {
            setSuppressRender(false);
            setPaymentStatus("failed");
            setErrorMessage("Thanh toán đã bị hủy bởi người dùng");
            message.error("Thanh toán đã bị hủy bởi người dùng");
            return;
          }

          // Treat 202 or explicit pending/unknown statuses as processing → start polling
          const statusCode = backendResponse.status;
          const topLevelStatus = backendResult?.status;
          if (
            statusCode === 202 ||
            topLevelStatus === "PENDING" ||
            topLevelStatus === "UNKNOWN"
          ) {
            setPaymentStatus("processing");

            const orderCode = payosParams.orderCode;
            if (!orderCode) {
              throw new Error(
                "Thiếu orderCode để kiểm tra trạng thái thanh toán"
              );
            }

            let attempts = 0;
            const maxAttempts = 30; // ~60s at 2s interval
            const poll = setInterval(async () => {
              attempts++;
              try {
                const statusRes = await getPayOSPaymentStatus(
                  String(orderCode)
                );
                const status = statusRes?.data?.status || statusRes?.status;
                if (status === "PAID") {
                  clearInterval(poll);
                  localStorage.removeItem("currentBooking");
                  navigate("/booking/success", {
                    state: {
                      booking: bookingData,
                      paymentMethod: "payos",
                      paymentData: { paymentRef: orderCode, status: "PAID" },
                    },
                    replace: true,
                  });
                } else if (status === "FAILED" || status === "CANCELLED") {
                  setSuppressRender(false);
                  clearInterval(poll);
                  setPaymentStatus("failed");
                  setErrorMessage("Thanh toán thất bại hoặc đã hủy");
                  message.error("Thanh toán thất bại hoặc đã hủy");
                } else if (attempts >= maxAttempts) {
                  setSuppressRender(false);
                  clearInterval(poll);
                  setPaymentStatus("failed");
                  setErrorMessage("Hết thời gian chờ thanh toán");
                  message.error("Hết thời gian chờ thanh toán");
                }
              } catch {
                setSuppressRender(false);
                clearInterval(poll);
                setPaymentStatus("failed");
                setErrorMessage("Không thể kiểm tra trạng thái thanh toán");
                message.error("Không thể kiểm tra trạng thái thanh toán");
              }
            }, 2000);
            return;
          }

          throw new Error(
            backendResult.message || "Backend verification failed"
          );
        }
      } catch (backendError: any) {
        console.error("❌ Backend verification failed:", backendError.message);
        setSuppressRender(false);
        setPaymentStatus("failed");
        const errorMsg = payosParams.cancel
          ? "Thanh toán đã bị hủy"
          : backendError.message || "Xác thực thanh toán thất bại";
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

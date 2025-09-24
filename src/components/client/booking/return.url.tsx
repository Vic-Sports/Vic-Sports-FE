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
  verifyVNPayPaymentAPI,
  getBookingByIdAPI,
  getPaymentTransactionAPI,
} from "@/services/bookingApi";
import type { IVNPayReturnParams } from "@/types/payment";
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
      // Extract VNPay parameters from URL
      const vnpayParams: IVNPayReturnParams = {
        vnp_Amount: searchParams.get("vnp_Amount") || "",
        vnp_BankCode: searchParams.get("vnp_BankCode") || "",
        vnp_BankTranNo: searchParams.get("vnp_BankTranNo") || "",
        vnp_CardType: searchParams.get("vnp_CardType") || "",
        vnp_OrderInfo: searchParams.get("vnp_OrderInfo") || "",
        vnp_PayDate: searchParams.get("vnp_PayDate") || "",
        vnp_ResponseCode: searchParams.get("vnp_ResponseCode") || "",
        vnp_TmnCode: searchParams.get("vnp_TmnCode") || "",
        vnp_TransactionNo: searchParams.get("vnp_TransactionNo") || "",
        vnp_TransactionStatus: searchParams.get("vnp_TransactionStatus") || "",
        vnp_TxnRef: searchParams.get("vnp_TxnRef") || "",
        vnp_SecureHash: searchParams.get("vnp_SecureHash") || "",
      };

      console.log("VNPay return parameters:", vnpayParams);

      // Check if all required parameters are present
      if (!vnpayParams.vnp_TxnRef || !vnpayParams.vnp_ResponseCode) {
        throw new Error("Thiếu thông tin thanh toán từ VNPay");
      }

      // Step 1: Verify payment with backend
      const verifyResponse = await verifyVNPayPaymentAPI(vnpayParams);

      if (!verifyResponse.success) {
        throw new Error(
          verifyResponse.message || "Xác thực thanh toán thất bại"
        );
      }

      console.log("Payment verification result:", verifyResponse.data);

      let paymentResponseData = null;
      let bookingResponseData = null;

      // Step 2: Get payment transaction details
      try {
        const paymentResponse = await getPaymentTransactionAPI(
          vnpayParams.vnp_TxnRef
        );
        if (paymentResponse.success && paymentResponse.data) {
          paymentResponseData = paymentResponse.data;
          setPaymentData(paymentResponseData);

          // Step 3: Get booking details
          const bookingResponse = await getBookingByIdAPI(
            paymentResponseData.bookingId
          );
          if (bookingResponse.success && bookingResponse.data) {
            bookingResponseData = bookingResponse.data;
            setBookingData(bookingResponseData);
          }
        }
      } catch (error) {
        console.warn("Could not fetch payment/booking details:", error);
      }

      // Determine payment status based on VNPay response code
      if (
        vnpayParams.vnp_ResponseCode === "00" &&
        vnpayParams.vnp_TransactionStatus === "00"
      ) {
        setPaymentStatus("success");
        message.success("Thanh toán thành công!");

        // After successful payment verification, redirect to booking success with data
        setTimeout(() => {
          if (bookingResponseData) {
            // Clear localStorage after successful use
            localStorage.removeItem("currentBooking");
            navigate("/booking-success", {
              state: {
                booking: bookingResponseData,
                paymentMethod: "vnpay",
                paymentData: paymentResponseData,
              },
            });
          } else {
            // Try to get booking from localStorage as fallback
            const savedBooking = localStorage.getItem("currentBooking");
            if (savedBooking) {
              try {
                const booking = JSON.parse(savedBooking);
                localStorage.removeItem("currentBooking");
                navigate("/booking-success", {
                  state: {
                    booking,
                    paymentMethod: "vnpay",
                    paymentData: paymentResponseData,
                  },
                });
                return;
              } catch (error) {
                console.error("Error parsing saved booking:", error);
              }
            }
            // If no booking data, stay on return page to show transaction details
            console.warn("No booking data available for redirect");
          }
        }, 2000); // Wait 2 seconds to show success message
      } else {
        setPaymentStatus("failed");
        const errorMsg = getVNPayErrorMessage(vnpayParams.vnp_ResponseCode);
        setErrorMessage(errorMsg);
        message.error(`Thanh toán thất bại: ${errorMsg}`);
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

  const getVNPayErrorMessage = (responseCode: string): string => {
    const errorMessages: { [key: string]: string } = {
      "01": "Giao dịch chưa hoàn tất",
      "02": "Giao dịch bị lỗi",
      "04": "Giao dịch đảo (Khách hàng đã bị trừ tiền tại Ngân hàng nhưng GD chưa thành công ở VNPAY)",
      "05": "VNPAY đang xử lý giao dịch này (GD hoàn tiền)",
      "06": "VNPAY đã gửi yêu cầu hoàn tiền sang Ngân hàng (GD hoàn tiền)",
      "07": "Giao dịch bị nghi ngờ gian lận",
      "09": "GD Hoàn trả bị từ chối",
      "10": "Đã giao hàng",
      "11": "Giao dịch không hợp lệ",
      "12": "Giao dịch không thành công",
      "13": "Tài khoản khách hàng bị khóa",
      "24": "Khách hàng hủy giao dịch",
      "51": "Tài khoản của quý khách không đủ số dư để thực hiện giao dịch",
      "65": "Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày",
      "75": "Ngân hàng thanh toán đang bảo trì",
      "79": "KH nhập sai mật khẩu thanh toán quá số lần quy định",
    };

    return (
      errorMessages[responseCode] || `Lỗi không xác định (Mã: ${responseCode})`
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatVNPayDate = (vnpPayDate: string) => {
    // VNPay date format: yyyyMMddHHmmss
    if (vnpPayDate.length !== 14) return vnpPayDate;

    const year = vnpPayDate.substring(0, 4);
    const month = vnpPayDate.substring(4, 6);
    const day = vnpPayDate.substring(6, 8);
    const hour = vnpPayDate.substring(8, 10);
    const minute = vnpPayDate.substring(10, 12);
    const second = vnpPayDate.substring(12, 14);

    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
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
                    <Tag color="blue">VNPay</Tag>
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

              {/* VNPay transaction details */}
              {searchParams.get("vnp_TransactionNo") && (
                <>
                  <Descriptions.Item label="Mã GD VNPay">
                    {searchParams.get("vnp_TransactionNo")}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngân hàng">
                    {searchParams.get("vnp_BankCode")}
                  </Descriptions.Item>
                  {searchParams.get("vnp_PayDate") && (
                    <Descriptions.Item label="Thời gian thanh toán">
                      {formatVNPayDate(searchParams.get("vnp_PayDate") || "")}
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

export default PaymentReturn;

import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Tag,
  Typography,
  Spin,
  Empty,
  Button,
  message,
} from "antd";
import { UserAddOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getUserBookingsAPI } from "@/services/bookingApi";
import { useCurrentApp } from "@/components/context/app.context";
import type { IBookingResponse } from "@/types/payment";

const { Title } = Typography;

const BookingHistory: React.FC = () => {
  const { user } = useCurrentApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<IBookingResponse[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    getUserBookingsAPI(user.id)
      .then((res) => {
        const arr = Array.isArray(res?.data?.bookings) ? res.data.bookings : [];
        setBookings(arr);
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handleCreateCommunityPost = (booking: IBookingResponse) => {
    if (!booking.court?._id && !booking.courtIds?.[0]) {
      message.error("Không tìm thấy thông tin sân!");
      return;
    }

    // Get venue and court info
    const venueId = booking.venue?._id || "";
    const venueName = booking.venue?.name || "";
    const courtId = booking.court?._id || booking.courtIds?.[0] || "";
    const courtName = booking.court?.name || "Sân";
    const sportType = booking.court?.type || "Football"; // Use 'type' instead of 'sportType'

    // Get time slot info
    const firstSlot =
      Array.isArray(booking.timeSlots) && booking.timeSlots.length > 0
        ? booking.timeSlots[0]
        : null;
    const startTime = firstSlot?.start || "08:00";
    const endTime = firstSlot?.end || "10:00";

    // Prepare initial data for the modal
    const initialPostData = {
      title: `Tuyển người chơi ${sportType} - ${courtName}`,
      description: `Mình đã đặt sân ${courtName} tại ${venueName} vào ngày ${new Date(
        booking.date
      ).toLocaleDateString(
        "vi-VN"
      )} (${startTime} - ${endTime}). Hiện tại đang cần tuyển thêm người chơi cùng. Các bạn quan tâm liên hệ nhé!`,
      sport: sportType,
      venueId: venueId,
      courtId: courtId,
      location: venueName || booking.venue?.address || "TP.HCM",
      date: new Date(booking.date).toISOString().split("T")[0], // YYYY-MM-DD
      startTime: startTime,
      endTime: endTime,
      maxParticipants: 10,
      currentParticipants: 1,
    };

    console.log("Navigating to community with initial data:", initialPostData);

    // Navigate to community page with initial data
    navigate("/community", {
      state: { initialPostData },
    });
  };

  const columns = [
    {
      title: "Mã đặt sân",
      dataIndex: "bookingCode",
      key: "bookingCode",
      render: (code: string) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: "Tên sân",
      dataIndex: "court",
      key: "court",
      render: (court: any, record: any) =>
        court?.name ||
        (record.courtIds && Array.isArray(record.courtIds)
          ? record.courtIds.map((c: any) => c.name).join(", ")
          : "N/A"),
    },
    {
      title: "Tên khu thể thao",
      dataIndex: "venue",
      key: "venue",
      render: (venue: any) => venue?.name || "N/A",
    },
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Khung giờ",
      dataIndex: "timeSlots",
      key: "timeSlots",
      render: (slots: any[]) =>
        Array.isArray(slots)
          ? slots.map((slot, idx) => (
              <Tag key={idx} color="green">
                {slot.start} - {slot.end}
              </Tag>
            ))
          : "N/A",
    },
    {
      title: "Số lượng sân",
      dataIndex: "courtQuantity",
      key: "courtQuantity",
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price: number) =>
        price?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
    {
      title: "Khách hàng",
      dataIndex: "customerInfo",
      key: "customerInfo",
      render: (info: any) => (
        <>
          <div>{info?.fullName}</div>
          <div>{info?.phone}</div>
          <div>{info?.email}</div>
        </>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "default";
        if (status === "confirmed") color = "green";
        else if (status === "pending") color = "orange";
        else if (status === "cancelled") color = "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (status: string) => {
        let color = "default";
        if (status === "paid") color = "green";
        else if (status === "pending") color = "orange";
        else if (status === "failed" || status === "cancelled") color = "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      width: 150,
      render: (_: any, record: IBookingResponse) => {
        // Debug: log booking info
        const bookingDate = new Date(record.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to compare only dates
        bookingDate.setHours(0, 0, 0, 0);

        const isConfirmed = record.status === "confirmed";
        const isPaid = record.paymentStatus === "paid";
        const isFuture = bookingDate >= today;

        console.log("Booking check:", {
          code: record.bookingCode,
          status: record.status,
          paymentStatus: record.paymentStatus,
          date: record.date,
          isConfirmed,
          isPaid,
          isFuture,
          canShow: isConfirmed && isPaid && isFuture,
        });

        // Show button if confirmed, paid, and future/today
        const canCreatePost = isConfirmed && isPaid && isFuture;

        if (!canCreatePost) {
          return (
            <span style={{ color: "#999", fontSize: "12px" }}>
              {!isConfirmed
                ? "Chưa xác nhận"
                : !isPaid
                ? "Chưa thanh toán"
                : "Đã qua"}
            </span>
          );
        }

        return (
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            size="small"
            onClick={() => handleCreateCommunityPost(record)}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
            }}
          >
            Tuyển người chơi
          </Button>
        );
      },
    },
  ];

  return (
    <Card style={{ margin: 24 }}>
      <Title level={3}>Lịch sử đặt sân</Title>
      <Spin spinning={loading}>
        {bookings.length === 0 && !loading ? (
          <Empty description="Bạn chưa có lịch sử đặt sân nào." />
        ) : (
          <Table
            columns={columns}
            dataSource={bookings}
            rowKey={(record) => record._id || record.bookingId || "row"}
            pagination={{ pageSize: 8 }}
          />
        )}
      </Spin>
    </Card>
  );
};

export default BookingHistory;

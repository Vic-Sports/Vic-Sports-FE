import React, { useEffect, useState } from "react";
import { Table, Card, Tag, Typography, Spin, Empty } from "antd";
import { getUserBookingsAPI } from "@/services/bookingApi";
import { useCurrentApp } from "@/components/context/app.context";
import type { IBookingResponse } from "@/types/payment";

const { Title } = Typography;

const BookingHistory: React.FC = () => {
  const { user } = useCurrentApp();
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

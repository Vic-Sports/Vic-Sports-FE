import {
  Table,
  Tag,
  Button,
  Modal,
  message,
  Card,
  Space,
  Select,
  Input
} from "antd";
import {
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from "@ant-design/icons";
import type { TableProps } from "antd";
import { useState, useEffect } from "react";
import { getAllBookings, updateBookingStatus } from "../../../services/adminApi";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

interface BookingData {
  _id: string;
  bookingCode: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  venue: {
    _id: string;
    name: string;
  };
  court: {
    _id: string;
    name: string;
    sportType: string;
  };
  customerInfo: {
    fullName: string;
    phone: string;
    email: string;
    notes?: string;
  };
  date: string;
  timeSlots: Array<{
    start: string;
    end: string;
    price: number;
  }>;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus: "pending" | "paid" | "failed" | "refunded" | "cancelled";
  paymentMethod: string;
  paymentRef?: string;
  createdAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

const ManageBookingAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState<any>({});

  // Modals
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(
    null
  );
  const [newStatus, setNewStatus] = useState<string>("");
  const [cancellationReason, setCancellationReason] = useState("");

  useEffect(() => {
    fetchBookings();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await getAllBookings({
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters
      });

      if (response.success) {
        setBookings(response.data.bookings || []);
        setPagination({
          ...pagination,
          total: response.data.pagination?.total || 0
        });
      }
    } catch (error: any) {
      message.error("Không thể tải danh sách đặt sân");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedBooking || !newStatus) return;

    try {
      await updateBookingStatus(
        selectedBooking._id,
        newStatus,
        newStatus === "cancelled" ? cancellationReason : undefined
      );
      message.success("Đã cập nhật trạng thái thành công");
      setStatusModalVisible(false);
      setNewStatus("");
      setCancellationReason("");
      fetchBookings();
    } catch (error: any) {
      message.error("Không thể cập nhật trạng thái");
    }
  };

  const getStatusColor = (
    status: string
  ): "default" | "processing" | "success" | "error" | "warning" => {
    const colors: Record<
      string,
      "default" | "processing" | "success" | "error" | "warning"
    > = {
      pending: "warning",
      confirmed: "processing",
      completed: "success",
      cancelled: "error"
    };
    return colors[status] || "default";
  };

  const getPaymentStatusColor = (
    status: string
  ): "default" | "processing" | "success" | "error" | "warning" => {
    const colors: Record<
      string,
      "default" | "processing" | "success" | "error" | "warning"
    > = {
      pending: "warning",
      paid: "success",
      failed: "error",
      refunded: "processing",
      cancelled: "error"
    };
    return colors[status] || "default";
  };

  const columns: TableProps<BookingData>["columns"] = [
    {
      title: "Mã đặt sân",
      dataIndex: "bookingCode",
      key: "bookingCode",
      render: (code) => <strong>{code}</strong>
    },
    {
      title: "Khách hàng",
      key: "customer",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.customerInfo?.fullName || record.user?.fullName || "N/A"}
          </div>
          <div style={{ fontSize: "12px", color: "#999" }}>
            {record.customerInfo?.phone || record.user?.phone || "N/A"}
          </div>
        </div>
      )
    },
    {
      title: "Sân",
      key: "venue",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {typeof record.venue === "object" ? record.venue.name : "N/A"}
          </div>
          <div style={{ fontSize: "12px", color: "#999" }}>
            {typeof record.court === "object"
              ? `${record.court.name} - ${record.court.sportType}`
              : "N/A"}
          </div>
        </div>
      )
    },
    {
      title: "Ngày đặt",
      dataIndex: "date",
      key: "date",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
      sorter: true
    },
    {
      title: "Giờ",
      key: "timeSlots",
      render: (_, record) => {
        if (!record.timeSlots || record.timeSlots.length === 0) return "N/A";
        const first = record.timeSlots[0];
        const last = record.timeSlots[record.timeSlots.length - 1];
        return `${first.start} - ${last.end}`;
      }
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price: number) => `${price.toLocaleString()}đ`,
      sorter: true
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
      filters: [
        { text: "Pending", value: "pending" },
        { text: "Confirmed", value: "confirmed" },
        { text: "Completed", value: "completed" },
        { text: "Cancelled", value: "cancelled" }
      ]
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (status: string) => (
        <Tag color={getPaymentStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
      filters: [
        { text: "Pending", value: "pending" },
        { text: "Paid", value: "paid" },
        { text: "Failed", value: "failed" },
        { text: "Refunded", value: "refunded" },
        { text: "Cancelled", value: "cancelled" }
      ]
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm")
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedBooking(record);
              setDetailModalVisible(true);
            }}
            size="small"
          >
            Xem
          </Button>
          {record.status === "pending" && (
            <>
              <Button
                type="link"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  setSelectedBooking(record);
                  setNewStatus("confirmed");
                  setStatusModalVisible(true);
                }}
                size="small"
                style={{ color: "#52c41a" }}
              >
                Xác nhận
              </Button>
              <Button
                type="link"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => {
                  setSelectedBooking(record);
                  setNewStatus("cancelled");
                  setStatusModalVisible(true);
                }}
                size="small"
              >
                Hủy
              </Button>
            </>
          )}
          {record.status === "confirmed" && (
            <Button
              type="link"
              onClick={() => {
                setSelectedBooking(record);
                setNewStatus("completed");
                setStatusModalVisible(true);
              }}
              size="small"
              style={{ color: "#1890ff" }}
            >
              Hoàn thành
            </Button>
          )}
        </Space>
      )
    }
  ];

  const handleTableChange = (
    newPagination: any,
    newFilters: any,
    sorter: any
  ) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize
    });

    // Apply filters
    const appliedFilters: any = {};
    if (newFilters.status && newFilters.status.length > 0) {
      appliedFilters.status = newFilters.status[0];
    }
    if (newFilters.paymentStatus && newFilters.paymentStatus.length > 0) {
      appliedFilters.paymentStatus = newFilters.paymentStatus[0];
    }
    setFilters(appliedFilters);
  };

  return (
    <Card title="Quản lý đặt sân">
      <Table
        columns={columns}
        dataSource={bookings}
        loading={loading}
        rowKey="_id"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} đặt sân`,
          pageSizeOptions: ["10", "20", "50", "100"]
        }}
        onChange={handleTableChange}
        scroll={{ x: 1500 }}
      />

      {/* Detail Modal */}
      <Modal
        title={`Chi tiết đặt sân: ${selectedBooking?.bookingCode}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {selectedBooking && (
          <div>
            <h4>Thông tin khách hàng</h4>
            <div style={{ marginBottom: "8px" }}>
              <strong>Họ tên:</strong> {selectedBooking.customerInfo?.fullName}
            </div>
            <div style={{ marginBottom: "8px" }}>
              <strong>Số điện thoại:</strong>{" "}
              {selectedBooking.customerInfo?.phone}
            </div>
            <div style={{ marginBottom: "8px" }}>
              <strong>Email:</strong> {selectedBooking.customerInfo?.email}
            </div>
            {selectedBooking.customerInfo?.notes && (
              <div style={{ marginBottom: "16px" }}>
                <strong>Ghi chú:</strong> {selectedBooking.customerInfo.notes}
              </div>
            )}

            <h4 style={{ marginTop: "16px" }}>Thông tin đặt sân</h4>
            <div style={{ marginBottom: "8px" }}>
              <strong>Sân:</strong>{" "}
              {typeof selectedBooking.venue === "object"
                ? selectedBooking.venue.name
                : "N/A"}
            </div>
            <div style={{ marginBottom: "8px" }}>
              <strong>Loại sân:</strong>{" "}
              {typeof selectedBooking.court === "object"
                ? `${selectedBooking.court.name} - ${selectedBooking.court.sportType}`
                : "N/A"}
            </div>
            <div style={{ marginBottom: "8px" }}>
              <strong>Ngày:</strong>{" "}
              {dayjs(selectedBooking.date).format("DD/MM/YYYY")}
            </div>
            <div style={{ marginBottom: "8px" }}>
              <strong>Khung giờ:</strong>
              <ul>
                {selectedBooking.timeSlots?.map((slot, idx) => (
                  <li key={idx}>
                    {slot.start} - {slot.end}: {slot.price.toLocaleString()}đ
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <strong>Tổng tiền:</strong>{" "}
              <span style={{ fontSize: "18px", color: "#52c41a" }}>
                {selectedBooking.totalPrice.toLocaleString()}đ
              </span>
            </div>

            <h4 style={{ marginTop: "16px" }}>Thanh toán</h4>
            <div style={{ marginBottom: "8px" }}>
              <strong>Phương thức:</strong>{" "}
              {selectedBooking.paymentMethod?.toUpperCase()}
            </div>
            <div style={{ marginBottom: "8px" }}>
              <strong>Trạng thái thanh toán:</strong>{" "}
              <Tag color={getPaymentStatusColor(selectedBooking.paymentStatus)}>
                {selectedBooking.paymentStatus?.toUpperCase()}
              </Tag>
            </div>
            {selectedBooking.paymentRef && (
              <div style={{ marginBottom: "8px" }}>
                <strong>Mã giao dịch:</strong> {selectedBooking.paymentRef}
              </div>
            )}

            <h4 style={{ marginTop: "16px" }}>Trạng thái</h4>
            <div style={{ marginBottom: "8px" }}>
              <strong>Trạng thái đặt sân:</strong>{" "}
              <Tag color={getStatusColor(selectedBooking.status)}>
                {selectedBooking.status?.toUpperCase()}
              </Tag>
            </div>
            <div style={{ marginBottom: "8px" }}>
              <strong>Ngày tạo:</strong>{" "}
              {dayjs(selectedBooking.createdAt).format("DD/MM/YYYY HH:mm")}
            </div>
            {selectedBooking.confirmedAt && (
              <div style={{ marginBottom: "8px" }}>
                <strong>Ngày xác nhận:</strong>{" "}
                {dayjs(selectedBooking.confirmedAt).format("DD/MM/YYYY HH:mm")}
              </div>
            )}
            {selectedBooking.cancelledAt && (
              <div style={{ marginBottom: "8px" }}>
                <strong>Ngày hủy:</strong>{" "}
                {dayjs(selectedBooking.cancelledAt).format("DD/MM/YYYY HH:mm")}
              </div>
            )}
            {selectedBooking.cancellationReason && (
              <div style={{ marginBottom: "8px" }}>
                <strong>Lý do hủy:</strong>{" "}
                {selectedBooking.cancellationReason}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Status Update Modal */}
      <Modal
        title="Cập nhật trạng thái"
        open={statusModalVisible}
        onOk={handleUpdateStatus}
        onCancel={() => {
          setStatusModalVisible(false);
          setNewStatus("");
          setCancellationReason("");
        }}
        okText="Cập nhật"
        cancelText="Hủy"
        okButtonProps={{
          danger: newStatus === "cancelled"
        }}
      >
        <p>
          Bạn có chắc chắn muốn{" "}
          {newStatus === "confirmed" && "xác nhận"}
          {newStatus === "cancelled" && "hủy"}
          {newStatus === "completed" && "hoàn thành"} đặt sân{" "}
          <strong>{selectedBooking?.bookingCode}</strong>?
        </p>
        {newStatus === "cancelled" && (
          <TextArea
            rows={4}
            placeholder="Lý do hủy"
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
          />
        )}
      </Modal>
    </Card>
  );
};

export default ManageBookingAdmin;


import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Tag,
  Space,
  Typography,
  Tooltip,
  notification,
  Modal,
  DatePicker,
  Select,
  Input,
  Statistic,
  Avatar,
} from "antd";
import {
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  PhoneOutlined,
  MailOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import type { ColumnsType } from "antd/es/table";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { ownerBookingApi, handleApiError } from "@/services/ownerApi";

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;
const { confirm } = Modal;

// Booking interface
interface Booking {
  _id: string;
  bookingCode: string;
  court: {
    _id: string;
    name: string;
    sportType: string;
    courtType: string;
    capacity: number;
    surface: string;
  };
  venue: {
    _id: string;
    name: string;
    address: {
      street: string;
      ward: string;
      district: string;
      city: string;
    };
    contactInfo: {
      phone: string;
      email: string;
    };
  };
  user: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    avatar?: string;
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
    _id: string;
  }>;
  courtQuantity: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no-show";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: string;
  payosOrderCode?: string;
  isGroupBooking: boolean;
  createdAt: string;
  updatedAt: string;
  checkedIn?: boolean;
  checkedInAt?: string;
}

const ManageBookings = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchText, setSearchText] = useState<string>("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Load bookings data
  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async (params?: any) => {
    try {
      setLoading(true);
      const response = await ownerBookingApi.getBookings(params);

      if (
        response.success &&
        response.data?.bookings &&
        Array.isArray(response.data.bookings)
      ) {
        setBookings(response.data.bookings);
      } else if (response.success && Array.isArray(response.data)) {
        // Fallback for direct array response
        setBookings(response.data);
      } else {
        console.error(
          "Bookings API response is not properly structured:",
          response
        );
        setBookings([]);
      }
    } catch (error) {
      const apiError = handleApiError(error);
      setBookings([]);
      notification.error({
        message: "Lỗi tải dữ liệu",
        description: apiError.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings
  useEffect(() => {
    let filtered = bookings;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    // Filter by date
    if (selectedDate) {
      filtered = filtered.filter((booking) =>
        dayjs(booking.date).isSame(selectedDate, "day")
      );
    }

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(
        (booking) =>
          booking.customerInfo.fullName
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          booking.customerInfo.phone.includes(searchText) ||
          booking.bookingCode
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          booking.court.name.toLowerCase().includes(searchText.toLowerCase()) ||
          booking.venue.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredBookings(filtered);
  }, [bookings, statusFilter, selectedDate, searchText]);

  // Table columns
  const columns: ColumnsType<Booking> = [
    {
      title: "Mã đặt sân",
      dataIndex: "bookingCode",
      key: "bookingCode",
      render: (text) => <Text code>{text}</Text>,
    },
    {
      title: "Khách hàng",
      key: "customer",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>
            <UserOutlined /> {record.customerInfo.fullName}
          </div>
          <div>
            <PhoneOutlined /> {record.customerInfo.phone}
          </div>
          <div>
            <MailOutlined /> {record.customerInfo.email}
          </div>
          {record.user.avatar && (
            <Avatar
              src={record.user.avatar}
              size="small"
              style={{ marginTop: 4 }}
            />
          )}
        </div>
      ),
    },
    {
      title: "Sân & Cơ sở",
      key: "court",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.court.name}</div>
          <Text type="secondary">{record.venue.name}</Text>
          <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
            {record.court.sportType} • {record.court.courtType} •{" "}
            {record.court.capacity} người
          </div>
        </div>
      ),
    },
    {
      title: "Thời gian",
      key: "schedule",
      render: (_, record) => {
        const duration = record.timeSlots.length;
        const firstSlot = record.timeSlots[0];
        const lastSlot = record.timeSlots[record.timeSlots.length - 1];

        return (
          <div>
            <div>
              <CalendarOutlined /> {dayjs(record.date).format("DD/MM/YYYY")}
            </div>
            <div>
              <ClockCircleOutlined /> {firstSlot.start} - {lastSlot.end}
            </div>
            <Text type="secondary">{duration} giờ</Text>
            {record.courtQuantity > 1 && (
              <div>
                <Text type="secondary">x{record.courtQuantity} sân</Text>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Trạng thái booking",
      key: "bookingStatus",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Tag color={getStatusColor(record.status)}>
            {getStatusText(record.status)}
          </Tag>
          {record.checkedIn && <Tag color="blue">Đã check-in</Tag>}
          {record.isGroupBooking && <Tag color="purple">Group</Tag>}
        </Space>
      ),
    },
    {
      title: "Thanh toán",
      key: "paymentStatus",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Tag color={getPaymentStatusColor(record.paymentStatus)}>
            {getPaymentStatusText(record.paymentStatus)}
          </Tag>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.paymentMethod}
          </Text>
          {record.payosOrderCode && (
            <Text type="secondary" style={{ fontSize: "11px" }}>
              #{record.payosOrderCode}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Số tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price) => (
        <div>
          <Text strong style={{ color: "#52c41a" }}>
            {price.toLocaleString()} VNĐ
          </Text>
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          {record.status === "pending" && (
            <>
              <Tooltip title="Duyệt">
                <Button
                  type="text"
                  icon={<CheckCircleOutlined />}
                  style={{ color: "#52c41a" }}
                  onClick={() => handleApproveBooking(record._id)}
                />
              </Tooltip>
              <Tooltip title="Từ chối">
                <Button
                  type="text"
                  icon={<CloseCircleOutlined />}
                  danger
                  onClick={() => handleRejectBooking(record._id)}
                />
              </Tooltip>
            </>
          )}
          {record.status === "confirmed" && !record.checkedIn && (
            <Button size="small" onClick={() => handleCheckIn(record._id)}>
              Check-in
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // Helper functions for status
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: "orange",
      confirmed: "green",
      completed: "blue",
      cancelled: "red",
      "no-show": "volcano",
    };
    return colorMap[status] || "default";
  };

  const getStatusText = (status: string) => {
    const textMap: Record<string, string> = {
      pending: "Chờ duyệt",
      confirmed: "Đã duyệt",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
      "no-show": "Không đến",
    };
    return textMap[status] || status;
  };

  const getPaymentStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: "orange",
      paid: "green",
      failed: "red",
      refunded: "purple",
    };
    return colorMap[status] || "default";
  };

  const getPaymentStatusText = (status: string) => {
    const textMap: Record<string, string> = {
      pending: "Chờ thanh toán",
      paid: "Đã thanh toán",
      failed: "Thanh toán thất bại",
      refunded: "Đã hoàn tiền",
    };
    return textMap[status] || status;
  };

  // Handlers
  const handleViewDetail = (booking: Booking) => {
    setSelectedBooking(booking);
    setDetailModalVisible(true);
  };

  const handleApproveBooking = async (bookingId: string) => {
    try {
      const response = await ownerBookingApi.approveBooking(bookingId);
      if (response.success) {
        setBookings(
          bookings.map((booking) =>
            booking._id === bookingId
              ? { ...booking, status: "confirmed" as const }
              : booking
          )
        );
        notification.success({
          message: "Đã duyệt",
          description: "Yêu cầu đặt sân đã được duyệt thành công!",
        });
      }
    } catch (error) {
      const apiError = handleApiError(error);
      notification.error({
        message: "Lỗi duyệt booking",
        description: apiError.message,
      });
    }
  };

  const handleRejectBooking = (bookingId: string) => {
    confirm({
      title: "Xác nhận từ chối",
      icon: <ExclamationCircleOutlined />,
      content: "Bạn có chắc chắn muốn từ chối yêu cầu đặt sân này?",
      okText: "Từ chối",
      okType: "danger",
      cancelText: "Hủy",
      async onOk() {
        try {
          const response = await ownerBookingApi.rejectBooking(bookingId);
          if (response.success) {
            setBookings(
              bookings.map((booking) =>
                booking._id === bookingId
                  ? {
                      ...booking,
                      status: "cancelled" as const,
                      paymentStatus: "refunded" as const,
                    }
                  : booking
              )
            );
            notification.info({
              message: "Đã từ chối",
              description: "Yêu cầu đặt sân đã bị từ chối!",
            });
          }
        } catch (error) {
          const apiError = handleApiError(error);
          notification.error({
            message: "Lỗi từ chối booking",
            description: apiError.message,
          });
        }
      },
    });
  };

  const handleCheckIn = async (bookingId: string) => {
    try {
      const response = await ownerBookingApi.checkInBooking(bookingId);
      if (response.success) {
        setBookings(
          bookings.map((booking) =>
            booking._id === bookingId
              ? {
                  ...booking,
                  checkedIn: true,
                  checkedInAt: new Date().toISOString(),
                }
              : booking
          )
        );
        notification.success({
          message: "Check-in thành công",
          description: "Khách hàng đã check-in thành công!",
        });
      }
    } catch (error) {
      const apiError = handleApiError(error);
      notification.error({
        message: "Lỗi check-in",
        description: apiError.message,
      });
    }
  };

  // Statistics
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const confirmedBookings = bookings.filter(
    (b) => b.status === "confirmed"
  ).length;
  const completedBookings = bookings.filter(
    (b) => b.status === "completed"
  ).length;
  const todayRevenue = bookings
    .filter(
      (b) => dayjs(b.date).isSame(dayjs(), "day") && b.paymentStatus === "paid"
    )
    .reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
          <CalendarOutlined /> Quản lý đặt sân
        </Title>
        <Text type="secondary">
          Xử lý yêu cầu đặt sân và theo dõi lịch sử booking
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={12} lg={6}>
          <Card>
            <Statistic
              title="Chờ duyệt"
              value={pendingBookings}
              valueStyle={{ color: "#fa8c16" }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Statistic
              title="Đã duyệt"
              value={confirmedBookings}
              valueStyle={{ color: "#52c41a" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Statistic
              title="Hoàn thành"
              value={completedBookings}
              valueStyle={{ color: "#1890ff" }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Statistic
              title="Doanh thu hôm nay"
              value={todayRevenue}
              valueStyle={{ color: "#722ed1" }}
              prefix={<DollarOutlined />}
              suffix="VNĐ"
              formatter={(value) => value?.toLocaleString()}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Search
              placeholder="Tìm theo tên, SĐT, mã booking..."
              allowClear
              onSearch={setSearchText}
              style={{ width: "100%" }}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Select
              placeholder="Trạng thái"
              style={{ width: "100%" }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="pending">Chờ duyệt</Option>
              <Option value="confirmed">Đã duyệt</Option>
              <Option value="completed">Hoàn thành</Option>
              <Option value="cancelled">Đã hủy</Option>
              <Option value="no-show">Không đến</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <DatePicker
              placeholder="Chọn ngày"
              style={{ width: "100%" }}
              value={selectedDate}
              onChange={setSelectedDate}
              format="DD/MM/YYYY"
            />
          </Col>
          <Col xs={24} sm={4}>
            <Button
              onClick={() => {
                setStatusFilter("all");
                setSelectedDate(null);
                setSearchText("");
              }}
            >
              Xóa bộ lọc
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Bookings Table */}
      <Card title={`Danh sách đặt sân (${filteredBookings.length})`}>
        <Table
          columns={columns}
          dataSource={filteredBookings}
          rowKey="_id"
          loading={loading}
          scroll={{ x: 1600 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} booking`,
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết đặt sân"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedBooking && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Title level={5}>Thông tin booking</Title>
                <p>
                  <strong>Mã booking:</strong> {selectedBooking.bookingCode}
                </p>
                <p>
                  <strong>Ngày tạo:</strong>{" "}
                  {dayjs(selectedBooking.createdAt).format("DD/MM/YYYY HH:mm")}
                </p>
                <p>
                  <strong>Trạng thái:</strong>
                  <Tag
                    color={getStatusColor(selectedBooking.status)}
                    style={{ marginLeft: 8 }}
                  >
                    {getStatusText(selectedBooking.status)}
                  </Tag>
                </p>
                <p>
                  <strong>Thanh toán:</strong>
                  <Tag
                    color={getPaymentStatusColor(selectedBooking.paymentStatus)}
                    style={{ marginLeft: 8 }}
                  >
                    {getPaymentStatusText(selectedBooking.paymentStatus)}
                  </Tag>
                </p>
                {selectedBooking.payosOrderCode && (
                  <p>
                    <strong>PayOS Order:</strong> #
                    {selectedBooking.payosOrderCode}
                  </p>
                )}
              </Col>
              <Col span={12}>
                <Title level={5}>Thông tin khách hàng</Title>
                <p>
                  <strong>Họ tên:</strong>{" "}
                  {selectedBooking.customerInfo.fullName}
                </p>
                <p>
                  <strong>Điện thoại:</strong>{" "}
                  {selectedBooking.customerInfo.phone}
                </p>
                <p>
                  <strong>Email:</strong> {selectedBooking.customerInfo.email}
                </p>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Title level={5}>Thông tin sân</Title>
                <p>
                  <strong>Sân:</strong> {selectedBooking.court.name}
                </p>
                <p>
                  <strong>Cơ sở:</strong> {selectedBooking.venue.name}
                </p>
                <p>
                  <strong>Địa chỉ:</strong>{" "}
                  {selectedBooking.venue.address.street},{" "}
                  {selectedBooking.venue.address.ward},{" "}
                  {selectedBooking.venue.address.district},{" "}
                  {selectedBooking.venue.address.city}
                </p>
                <p>
                  <strong>Ngày chơi:</strong>{" "}
                  {dayjs(selectedBooking.date).format("DD/MM/YYYY")}
                </p>
                <p>
                  <strong>Khung giờ:</strong>
                </p>
                <ul>
                  {selectedBooking.timeSlots.map((slot) => (
                    <li key={slot._id}>
                      {slot.start} - {slot.end} ({slot.price.toLocaleString()}{" "}
                      VNĐ)
                    </li>
                  ))}
                </ul>
                <p>
                  <strong>Số sân:</strong> {selectedBooking.courtQuantity}
                </p>
              </Col>
              <Col span={12}>
                <Title level={5}>Thông tin thanh toán</Title>
                <p>
                  <strong>Tổng tiền:</strong>{" "}
                  <Text strong style={{ color: "#52c41a", fontSize: "16px" }}>
                    {selectedBooking.totalPrice.toLocaleString()} VNĐ
                  </Text>
                </p>
                <p>
                  <strong>Phương thức:</strong> {selectedBooking.paymentMethod}
                </p>
                {selectedBooking.checkedIn && (
                  <p>
                    <strong>Thời gian check-in:</strong>{" "}
                    {dayjs(selectedBooking.checkedInAt).format(
                      "DD/MM/YYYY HH:mm"
                    )}
                  </p>
                )}
              </Col>
            </Row>

            {selectedBooking.customerInfo.notes && (
              <div>
                <Title level={5}>Ghi chú</Title>
                <Text>{selectedBooking.customerInfo.notes}</Text>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageBookings;

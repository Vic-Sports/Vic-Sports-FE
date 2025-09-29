import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Progress,
  List,
  Avatar,
  Badge,
  Space,
  Button,
  Tag,
  Alert,
  Spin,
  message,
} from "antd";
import {
  CalendarOutlined,
  DollarOutlined,
  BellOutlined,
  FieldTimeOutlined,
  UserOutlined,
  HomeOutlined,
  TrophyOutlined,
  RiseOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import { Line, Pie } from "@ant-design/plots";
import { useNavigate } from "react-router-dom";
import { ownerDashboardApi } from "@/services/ownerApi";

const { Title, Text } = Typography;

// Dashboard overview interfaces
interface DashboardStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalBookings: number;
  monthlyBookings: number;
  totalVenues: number;
  totalCourts: number;
  activeBookings: number;
  pendingBookings: number;
  confirmedBookings?: number;
  completedBookings?: number;
}

interface RecentActivity {
  id: string;
  type: "booking" | "payment" | "review";
  title: string;
  description: string;
  time: string;
  status: string;
}

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalBookings: 0,
    monthlyBookings: 0,
    totalVenues: 0,
    totalCourts: 0,
    activeBookings: 0,
    pendingBookings: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [revenueChartData, setRevenueChartData] = useState<any[]>([]);
  const [bookingStatsData, setBookingStatsData] = useState<any[]>([]);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      // Clean up any pending async operations
      setLoading(false);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load all dashboard data in parallel
      const [statsRes, revenueRes, bookingStatsRes, activitiesRes] =
        await Promise.all([
          ownerDashboardApi.getStats(),
          ownerDashboardApi.getRevenueChart(),
          ownerDashboardApi.getBookingStats(),
          ownerDashboardApi.getRecentActivities(),
        ]);

      // Set stats
      if (statsRes.success) {
        const apiData = statsRes.data;

        setStats({
          // Use direct values from API
          totalRevenue: apiData.totalRevenue || 0,
          totalBookings: apiData.totalBookings || 0,
          totalVenues: apiData.totalVenues || 0,
          totalCourts: apiData.totalCourts || 0,
          pendingBookings: apiData.pendingBookings || 0,

          // Map confirmedBookings to activeBookings
          activeBookings: apiData.confirmedBookings || 0,

          // Calculate estimates for monthly data
          monthlyRevenue: apiData.totalRevenue
            ? Math.floor(apiData.totalRevenue * 0.2)
            : 0,
          monthlyBookings: apiData.totalBookings
            ? Math.floor(apiData.totalBookings * 0.3)
            : 0,

          // Store additional fields for reference
          confirmedBookings: apiData.confirmedBookings || 0,
          completedBookings: apiData.completedBookings || 0,
        });
      }

      // Set revenue chart data
      if (revenueRes.success) {
        const formattedRevenueData = revenueRes.data.map((item) => ({
          month: `T${item._id.month}`,
          revenue: item.revenue,
        }));
        setRevenueChartData(formattedRevenueData);
      }

      // Set booking stats
      if (bookingStatsRes.success) {
        const statusDistribution = [
          { type: "Hoàn thành", value: 0, color: "#52c41a" },
          { type: "Đã duyệt", value: 0, color: "#1890ff" },
          { type: "Chờ duyệt", value: 0, color: "#fa8c16" },
          { type: "Đã hủy", value: 0, color: "#ff4d4f" },
          { type: "Không đến", value: 0, color: "#8c8c8c" },
        ];

        // Process booking stats data
        bookingStatsRes.data.forEach((item) => {
          const statusMap: Record<string, string> = {
            completed: "Hoàn thành",
            approved: "Đã duyệt",
            pending: "Chờ duyệt",
            cancelled: "Đã hủy",
            "no-show": "Không đến",
          };

          const statusText = statusMap[item._id.status];
          const statusItem = statusDistribution.find(
            (s) => s.type === statusText
          );
          if (statusItem) {
            statusItem.value += item.count;
          }
        });

        setBookingStatsData(statusDistribution);
      }

      // Set recent activities
      if (activitiesRes.success) {
        const formattedActivities: RecentActivity[] = activitiesRes.data
          .slice(0, 5)
          .map((booking: any) => ({
            id: booking.id || booking._id,
            type: "booking" as const,
            title: `Booking từ ${
              booking.customerInfo?.fullName || "Khách hàng"
            }`,
            description: `${booking.courtName} - ${booking.date}, ${booking.timeSlot?.start}-${booking.timeSlot?.end}`,
            time: "Vừa xong",
            status: booking.status,
          }));
        setRecentActivities(formattedActivities);
      }
    } catch {
      // Set fallback data if API fails
      setStats({
        totalRevenue: 5420000,
        monthlyRevenue: 1250000,
        totalBookings: 145,
        monthlyBookings: 32,
        totalVenues: 3,
        totalCourts: 12,
        activeBookings: 8,
        pendingBookings: 4,
      });

      setRevenueChartData([
        { month: "Tháng 1", value: 800000 },
        { month: "Tháng 2", value: 950000 },
        { month: "Tháng 3", value: 1200000 },
        { month: "Tháng 4", value: 1100000 },
        { month: "Tháng 5", value: 1350000 },
        { month: "Tháng 6", value: 1250000 },
      ]);

      setBookingStatsData([
        { type: "Hoàn thành", value: 85, color: "#52c41a" },
        { type: "Đã duyệt", value: 32, color: "#1890ff" },
        { type: "Chờ duyệt", value: 15, color: "#fa8c16" },
        { type: "Đã hủy", value: 8, color: "#ff4d4f" },
        { type: "Không đến", value: 5, color: "#8c8c8c" },
      ]);

      setRecentActivities([
        {
          id: "1",
          type: "booking",
          title: "Booking từ Nguyễn Văn A",
          description: "Sân tennis A - 2024-01-15, 10:00-12:00",
          time: "2 giờ trước",
          status: "confirmed",
        },
        {
          id: "2",
          type: "payment",
          title: "Thanh toán từ Trần Thị B",
          description: "Sân bóng đá B - 500.000 VNĐ",
          time: "3 giờ trước",
          status: "completed",
        },
        {
          id: "3",
          type: "review",
          title: "Đánh giá từ Lê Văn C",
          description: "Sân tennis C - 5 sao",
          time: "5 giờ trước",
          status: "new",
        },
      ]);

      message.warning("Không thể kết nối API. Hiển thị dữ liệu mẫu.");
    } finally {
      setLoading(false);
    }
  };

  // Mock sport booking data (if needed later, can be fetched from API)
  const sportBookingData = [
    { sport: "Bóng đá", bookings: 45, percentage: 35 },
    { sport: "Tennis", bookings: 32, percentage: 25 },
    { sport: "Cầu lông", bookings: 28, percentage: 22 },
    { sport: "Bóng rổ", bookings: 23, percentage: 18 },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "booking":
        return <CalendarOutlined style={{ color: "#1890ff" }} />;
      case "payment":
        return <DollarOutlined style={{ color: "#52c41a" }} />;
      case "review":
        return <TrophyOutlined style={{ color: "#fa8c16" }} />;
      default:
        return <BellOutlined />;
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      pending: { color: "orange", text: "Chờ xử lý" },
      success: { color: "green", text: "Thành công" },
      completed: { color: "blue", text: "Hoàn thành" },
      cancelled: { color: "red", text: "Đã hủy" },
    };

    return (
      <Tag color={statusConfig[status]?.color || "default"}>
        {statusConfig[status]?.text || status}
      </Tag>
    );
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Spin size="large" tip="Đang tải dữ liệu dashboard..." />
      </div>
    );
  }

  return (
    <div
      key="owner-dashboard"
      style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}
    >
      {/* Welcome Header */}
      <div
        style={{
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
            <HomeOutlined /> Tổng quan hệ thống
          </Title>
          <Text type="secondary">
            Theo dõi hiệu suất kinh doanh và hoạt động của các cơ sở thể thao
          </Text>
        </div>
        <Button
          onClick={() => {
            loadDashboardData();
          }}
          type="dashed"
          icon={<RiseOutlined />}
        >
          Refresh Data
        </Button>

        {stats.pendingBookings > 0 && (
          <Alert
            style={{ marginTop: "16px" }}
            message={`Bạn có ${stats.pendingBookings} booking chờ duyệt`}
            type="warning"
            action={
              <Button size="small" onClick={() => navigate("/owner/bookings")}>
                Xem ngay
              </Button>
            }
            showIcon
            closable
          />
        )}
      </div>

      {/* Key Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate("/owner/venues")}>
            <Statistic
              title="Tổng doanh thu"
              value={stats.totalRevenue}
              precision={0}
              valueStyle={{ color: "#3f8600" }}
              prefix={<DollarOutlined />}
              suffix="VNĐ"
              formatter={(value) => value?.toLocaleString()}
            />
            <Progress
              percent={75}
              showInfo={false}
              strokeColor="#3f8600"
              trailColor="#f0f0f0"
            />
            <Text type="secondary">
              <RiseOutlined style={{ color: "#3f8600" }} /> +12% so với tháng
              trước
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate("/owner/bookings")}>
            <Statistic
              title="Tổng lượt đặt"
              value={stats.totalBookings}
              valueStyle={{ color: "#1890ff" }}
              prefix={<CalendarOutlined />}
            />
            <Progress
              percent={85}
              showInfo={false}
              strokeColor="#1890ff"
              trailColor="#f0f0f0"
            />
            <Text type="secondary">
              <RiseOutlined style={{ color: "#1890ff" }} /> +8% so với tháng
              trước
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate("/owner/courts")}>
            <Statistic
              title="Tổng số sân"
              value={stats.totalCourts}
              valueStyle={{ color: "#722ed1" }}
              prefix={<FieldTimeOutlined />}
              suffix={`tại ${stats.totalVenues} cơ sở`}
            />
            <Progress
              percent={95}
              showInfo={false}
              strokeColor="#722ed1"
              trailColor="#f0f0f0"
            />
            <Text type="secondary">
              <CheckCircleOutlined style={{ color: "#52c41a" }} /> Tất cả đang
              hoạt động tốt
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate("/owner/bookings")}>
            <Statistic
              title="Chờ duyệt"
              value={stats.pendingBookings}
              valueStyle={{ color: "#fa8c16" }}
              prefix={<BellOutlined />}
            />
            {stats.pendingBookings > 0 && (
              <Progress
                percent={(stats.pendingBookings / 20) * 100}
                showInfo={false}
                strokeColor="#fa8c16"
                trailColor="#f0f0f0"
              />
            )}
            <Text type="secondary">
              <ExclamationCircleOutlined style={{ color: "#fa8c16" }} /> Cần xử
              lý trong hôm nay
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={16}>
          <Card
            title="Biểu đồ doanh thu 6 tháng gần nhất"
            extra={
              <Button
                type="link"
                icon={<ArrowRightOutlined />}
                onClick={() => navigate("/owner/bookings")}
              >
                Xem chi tiết
              </Button>
            }
          >
            {revenueChartData.length > 0 ? (
              <Line
                key="revenue-chart"
                data={revenueChartData}
                height={300}
                xField="month"
                yField="revenue"
                point={{
                  size: 5,
                  shape: "diamond",
                  style: {
                    fill: "white",
                    stroke: "#1890ff",
                    lineWidth: 2,
                  },
                }}
                smooth={true}
                color="#1890ff"
              />
            ) : (
              <div
                style={{
                  height: 300,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#8c8c8c",
                }}
              >
                <Spin tip="Đang tải biểu đồ doanh thu..." />
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Phân bố booking theo trạng thái">
            {bookingStatsData.length > 0 &&
            bookingStatsData.some((item) => item.value > 0) ? (
              <Pie
                key="booking-stats-chart"
                data={bookingStatsData.filter((item) => item.value > 0)}
                height={300}
                angleField="value"
                colorField="type"
                radius={0.8}
                label={{
                  type: "outer",
                  content: "{name} {percentage}",
                }}
              />
            ) : (
              <div
                style={{
                  height: 300,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#8c8c8c",
                }}
              >
                <Spin tip="Đang tải thống kê booking..." />
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Sports Performance & Recent Activities */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Hiệu suất theo môn thể thao">
            <Space direction="vertical" style={{ width: "100%" }}>
              {sportBookingData.map((sport, index) => (
                <div key={index}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <Text strong>{sport.sport}</Text>
                    <Badge count={sport.bookings} overflowCount={999} />
                  </div>
                  <Progress
                    percent={sport.percentage}
                    strokeColor={`hsl(${210 + index * 30}, 70%, 50%)`}
                    format={() => `${sport.percentage}%`}
                  />
                </div>
              ))}
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="Hoạt động gần đây"
            extra={
              <Button
                type="link"
                icon={<ArrowRightOutlined />}
                onClick={() => navigate("/owner/bookings")}
              >
                Xem tất cả
              </Button>
            }
          >
            <List
              itemLayout="horizontal"
              dataSource={recentActivities}
              renderItem={(item) => (
                <List.Item actions={[getStatusTag(item.status)]}>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={getActivityIcon(item.type)}
                        style={{
                          backgroundColor: "#f0f2f5",
                          border: "1px solid #d9d9d9",
                        }}
                      />
                    }
                    title={<Text strong>{item.title}</Text>}
                    description={
                      <div>
                        <div>{item.description}</div>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          {item.time}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
        <Col xs={24}>
          <Card title="Thao tác nhanh">
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={8} md={6}>
                <Button
                  block
                  type="primary"
                  icon={<HomeOutlined />}
                  onClick={() => navigate("/owner/venues")}
                >
                  Quản lý cơ sở
                </Button>
              </Col>
              <Col xs={12} sm={8} md={6}>
                <Button
                  block
                  icon={<FieldTimeOutlined />}
                  onClick={() => navigate("/owner/courts")}
                >
                  Quản lý sân
                </Button>
              </Col>
              <Col xs={12} sm={8} md={6}>
                <Button
                  block
                  icon={<CalendarOutlined />}
                  onClick={() => navigate("/owner/bookings")}
                >
                  Xem booking
                </Button>
              </Col>
              <Col xs={12} sm={8} md={6}>
                <Button
                  block
                  icon={<UserOutlined />}
                  onClick={() => navigate("/owner/user")}
                >
                  Quản lý khách hàng
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OwnerDashboard;

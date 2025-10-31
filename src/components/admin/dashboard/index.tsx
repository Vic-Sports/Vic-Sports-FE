import { ProCard, StatisticCard } from "@ant-design/pro-components";
import { Card, Row, Col, Spin, Alert, Table, Tag, Select } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  ShopOutlined,
  DollarOutlined,
  CalendarOutlined,
  TrophyOutlined,
  StarOutlined,
  RiseOutlined,
  FallOutlined
} from "@ant-design/icons";
import RcResizeObserver from "rc-resize-observer";
import { useState, useEffect } from "react";
import { getAdminStats } from "../../../services/adminApi";
import { Line, Column, Pie } from "@ant-design/charts";

const { Statistic } = StatisticCard;
const { Option } = Select;

interface AdminStats {
  totalUsers: number;
  totalCustomers: number;
  totalOwners: number;
  totalCoaches: number;
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  totalRevenueChange: number;
  totalVenues: number;
  verifiedVenues: number;
  pendingVenues: number;
  totalCourts: number;
  totalTournaments: number;
  ongoingTournaments: number;
  averageRating: number;
  totalReviews: number;
  bookingStatusDistribution: Array<{ name: string; value: number }>;
  recentBookings: Array<any>;
}

const AdminDashboard = () => {
  const [responsive, setResponsive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAdminStats();
      setStats(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(value);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi"
        description={error}
        type="error"
        showIcon
        style={{ margin: "20px" }}
      />
    );
  }

  if (!stats) return null;

  // Revenue trend indicator
  const revenueTrend = stats.totalRevenueChange >= 0 ? "up" : "down";
  const revenueTrendIcon =
    stats.totalRevenueChange >= 0 ? <RiseOutlined /> : <FallOutlined />;

  // Booking status chart config
  const bookingStatusConfig = {
    data: stats.bookingStatusDistribution,
    angleField: "value",
    colorField: "name",
    radius: 0.8,
    label: {
      type: "outer",
      content: "{name}: {percentage}"
    },
    interactions: [{ type: "element-active" }]
  };

  // Recent bookings table columns
  const recentBookingsColumns = [
    {
      title: "Booking Code",
      dataIndex: "bookingCode",
      key: "bookingCode"
    },
    {
      title: "Khách hàng",
      dataIndex: ["user", "fullName"],
      key: "user"
    },
    {
      title: "Sân",
      dataIndex: ["venue", "name"],
      key: "venue"
    },
    {
      title: "Giá",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price: number) => formatCurrency(price)
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colors: Record<string, string> = {
          pending: "orange",
          confirmed: "blue",
          completed: "green",
          cancelled: "red"
        };
        return <Tag color={colors[status] || "default"}>{status}</Tag>;
      }
    }
  ];

  return (
    <RcResizeObserver
      key="resize-observer"
      onResize={(offset) => {
        setResponsive(offset.width < 596);
      }}
    >
      <div style={{ padding: "20px" }}>
        <h2 style={{ marginBottom: "24px" }}>Tổng quan hệ thống</h2>

        {/* Main Statistics Cards */}
        <StatisticCard.Group
          direction={responsive ? "column" : "row"}
          style={{ marginBottom: "24px" }}
        >
          <StatisticCard
            statistic={{
              title: "Tổng doanh thu",
              value: formatCurrency(stats.totalRevenue),
              description: (
                <Statistic
                  title="So với tháng trước"
                  value={`${Math.abs(stats.totalRevenueChange).toFixed(2)}%`}
                  trend={revenueTrend}
                  prefix={revenueTrendIcon}
                />
              ),
              icon: (
                <DollarOutlined style={{ fontSize: 42, color: "#52c41a" }} />
              )
            }}
          />
          <StatisticCard
            statistic={{
              title: "Tổng người dùng",
              value: stats.totalUsers,
              description: `Customers: ${stats.totalCustomers} | Owners: ${stats.totalOwners} | Coaches: ${stats.totalCoaches}`,
              icon: <UserOutlined style={{ fontSize: 42, color: "#1890ff" }} />
            }}
          />
          <StatisticCard
            statistic={{
              title: "Tổng đặt sân",
              value: stats.totalBookings,
              description: `Hoàn thành: ${stats.completedBookings} | Chờ: ${stats.pendingBookings}`,
              icon: (
                <CalendarOutlined style={{ fontSize: 42, color: "#722ed1" }} />
              )
            }}
          />
          <StatisticCard
            statistic={{
              title: "Sân thể thao",
              value: stats.totalVenues,
              description: `Đã xác thực: ${stats.verifiedVenues} | Chờ: ${stats.pendingVenues}`,
              icon: <ShopOutlined style={{ fontSize: 42, color: "#fa8c16" }} />
            }}
          />
        </StatisticCard.Group>

        {/* Secondary Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tổng sân"
                value={stats.totalCourts}
                prefix={<TeamOutlined />}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Giải đấu"
                value={stats.totalTournaments}
                prefix={<TrophyOutlined />}
                suffix={`(${stats.ongoingTournaments} đang diễn ra)`}
                valueStyle={{ color: "#cf1322" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Đánh giá trung bình"
                value={stats.averageRating.toFixed(2)}
                prefix={<StarOutlined />}
                suffix={`/ 5 (${stats.totalReviews} đánh giá)`}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tỷ lệ hoàn thành"
                value={
                  stats.totalBookings > 0
                    ? (
                        (stats.completedBookings / stats.totalBookings) *
                        100
                      ).toFixed(1)
                    : 0
                }
                suffix="%"
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Charts */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} lg={16}>
            <Card title="Đặt sân gần đây" bordered={false}>
              <Table
                dataSource={stats.recentBookings}
                columns={recentBookingsColumns}
                pagination={false}
                size="small"
                rowKey="_id"
              />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Phân bố trạng thái đặt sân" bordered={false}>
              {stats.bookingStatusDistribution.length > 0 ? (
                <Pie {...bookingStatusConfig} />
              ) : (
                <p style={{ textAlign: "center", color: "#999" }}>
                  Chưa có dữ liệu
                </p>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </RcResizeObserver>
  );
};

export default AdminDashboard;

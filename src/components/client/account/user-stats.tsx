import { useCurrentApp } from "@/components/context/app.context";
import {
  Card,
  Row,
  Col,
  Avatar,
  Typography,
  Tag,
  Progress,
  Statistic
} from "antd";
import {
  TrophyOutlined,
  CalendarOutlined,
  DollarOutlined,
  UserOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

const UserStats = () => {
  const { user } = useCurrentApp();

  const getRankColor = (rank: string) => {
    switch (rank) {
      case "Diamond":
        return "#1890ff";
      case "Gold":
        return "#faad14";
      case "Silver":
        return "#d9d9d9";
      default:
        return "#cd7f32";
    }
  };

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case "Diamond":
        return "💎";
      case "Gold":
        return "🥇";
      case "Silver":
        return "🥈";
      default:
        return "🥉";
    }
  };

  const calculateNextRank = () => {
    const points = user?.rewardPoints || 0;
    if (points >= 10000) return { next: "Diamond", progress: 100 };
    if (points >= 5000)
      return { next: "Diamond", progress: (points - 5000) / 50 };
    if (points >= 1000) return { next: "Gold", progress: (points - 1000) / 40 };
    return { next: "Silver", progress: points / 10 };
  };

  const { next, progress } = calculateNextRank();

  return (
    <div style={{ padding: "20px" }}>
      <Row gutter={[24, 24]}>
        {/* Profile Overview */}
        <Col span={24}>
          <Card>
            <Row gutter={24} align="middle">
              <Col>
                <Avatar size={80} src={user?.avatar} icon={<UserOutlined />} />
              </Col>
              <Col flex="1">
                <Title level={4} style={{ margin: 0 }}>
                  {user?.fullName || "Chưa cập nhật"}
                </Title>
                <Text type="secondary">{user?.email}</Text>
                <br />
                <Tag color="blue" style={{ marginTop: 8 }}>
                  {user?.role === "customer"
                    ? "Khách hàng"
                    : user?.role === "owner"
                    ? "Chủ sân"
                    : "Admin"}
                </Tag>
                <Tag color={user?.isVerified ? "green" : "orange"}>
                  {user?.isVerified ? "Đã xác thực" : "Chưa xác thực"}
                </Tag>
              </Col>
              <Col>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "2em" }}>
                    {getRankIcon(user?.rank || "Bronze")}
                  </div>
                  <Tag
                    color={getRankColor(user?.rank || "Bronze")}
                    style={{ fontSize: "14px" }}
                  >
                    {user?.rank || "Bronze"}
                  </Tag>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Statistics */}
        <Col span={8}>
          <Card>
            <Statistic
              title="Điểm thưởng"
              value={user?.rewardPoints || 0}
              prefix={<TrophyOutlined />}
              suffix="điểm"
            />
            <Progress
              percent={Math.min(progress, 100)}
              size="small"
              style={{ marginTop: 8 }}
              format={() =>
                `${user?.rewardPoints || 0} / ${
                  next === "Diamond"
                    ? "10000"
                    : next === "Gold"
                    ? "5000"
                    : "1000"
                }`
              }
            />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Cần thêm{" "}
              {next === "Diamond"
                ? 10000 - (user?.rewardPoints || 0)
                : next === "Gold"
                ? 5000 - (user?.rewardPoints || 0)
                : 1000 - (user?.rewardPoints || 0)}{" "}
              điểm để lên {next}
            </Text>
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng lượt đặt sân"
              value={user?.totalBookings || 0}
              prefix={<CalendarOutlined />}
              suffix="lượt"
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng chi tiêu"
              value={user?.totalSpent || 0}
              prefix={<DollarOutlined />}
              suffix="VNĐ"
              formatter={(value) => `${value?.toLocaleString()}`}
            />
          </Card>
        </Col>

        {/* Additional Info */}
        <Col span={24}>
          <Card title="Thông tin bổ sung">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Số điện thoại:</Text>
                <br />
                <Text>{user?.phone || "Chưa cập nhật"}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Ngày sinh:</Text>
                <br />
                <Text>
                  {user?.dateOfBirth
                    ? new Date(user.dateOfBirth).toLocaleDateString("vi-VN")
                    : "Chưa cập nhật"}
                </Text>
              </Col>
              <Col span={12}>
                <Text strong>Giới tính:</Text>
                <br />
                <Text>
                  {user?.gender === "male"
                    ? "Nam"
                    : user?.gender === "female"
                    ? "Nữ"
                    : user?.gender === "other"
                    ? "Khác"
                    : "Chưa cập nhật"}
                </Text>
              </Col>
              <Col span={12}>
                <Text strong>Địa chỉ:</Text>
                <br />
                <Text>
                  {user?.address?.street
                    ? `${user.address.street}, ${user.address.ward}, ${user.address.district}, ${user.address.province}`
                    : "Chưa cập nhật"}
                </Text>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UserStats;

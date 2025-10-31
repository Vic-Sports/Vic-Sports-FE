import { Card, Row, Col, Select, Spin, DatePicker } from "antd";
import { Line, Column, Pie } from "@ant-design/charts";
import { useState, useEffect } from "react";
import {
  getRevenueData,
  getUserGrowthData,
  getBookingTrends,
  getTopVenues
} from "../../../services/adminApi";
import dayjs from "dayjs";

const { Option } = Select;
const { RangePicker } = DatePicker;

const FinancialReports = () => {
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">(
    "monthly"
  );

  // Data states
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [bookingTrendsData, setBookingTrendsData] = useState<any[]>([]);
  const [topVenuesData, setTopVenuesData] = useState<any[]>([]);

  useEffect(() => {
    fetchAllData();
  }, [period]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [revenue, userGrowth, bookingTrends, topVenues] = await Promise.all(
        [
          getRevenueData(period),
          getUserGrowthData(period),
          getBookingTrends(period),
          getTopVenues(10)
        ]
      );

      setRevenueData(revenue.data || []);
      setUserGrowthData(userGrowth.data || []);
      setBookingTrendsData(bookingTrends.data || []);
      setTopVenuesData(topVenues.data || []);
    } catch (error) {
      console.error("Failed to fetch financial data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Revenue Chart Config
  const revenueConfig = {
    data: revenueData.map((item) => ({
      date: item._id,
      value: item.totalRevenue
    })),
    xField: "date",
    yField: "value",
    point: {
      size: 5,
      shape: "diamond"
    },
    label: {
      style: {
        fill: "#aaa"
      }
    },
    yAxis: {
      label: {
        formatter: (v: string) => `${parseFloat(v).toLocaleString("vi-VN")} VND`
      }
    }
  };

  // User Growth Chart Config
  const userGrowthConfig = {
    data: userGrowthData.flatMap((item) => [
      { date: item._id, type: "Customers", value: item.customers },
      { date: item._id, type: "Owners", value: item.owners },
      { date: item._id, type: "Coaches", value: item.coaches }
    ]),
    xField: "date",
    yField: "value",
    seriesField: "type",
    isStack: true,
    smooth: true
  };

  // Booking Trends Chart Config
  const bookingTrendsConfig = {
    data: bookingTrendsData.map((item) => ({
      date: item._id,
      bookings: item.bookings
    })),
    xField: "date",
    yField: "bookings",
    label: {
      position: "top",
      style: {
        fill: "#000",
        opacity: 0.6
      }
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false
      }
    },
    meta: {
      date: {
        alias: "Thời gian"
      },
      bookings: {
        alias: "Số lượng đặt sân"
      }
    }
  };

  // Top Venues Chart Config
  const topVenuesConfig = {
    data: topVenuesData.map((item) => ({
      venue: item.venueName,
      revenue: item.revenue
    })),
    xField: "venue",
    yField: "revenue",
    label: {
      position: "top",
      style: {
        fill: "#000",
        opacity: 0.6
      },
      formatter: (datum: any) => `${datum.revenue.toLocaleString("vi-VN")} VND`
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: true
      }
    },
    meta: {
      venue: {
        alias: "Sân"
      },
      revenue: {
        alias: "Doanh thu"
      }
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <h2>Báo cáo tài chính</h2>
        <Select
          value={period}
          onChange={(value) => setPeriod(value)}
          style={{ width: 150 }}
        >
          <Option value="daily">Theo ngày</Option>
          <Option value="weekly">Theo tuần</Option>
          <Option value="monthly">Theo tháng</Option>
        </Select>
      </div>

      <Row gutter={[16, 16]}>
        {/* Revenue Chart */}
        <Col xs={24} lg={12}>
          <Card title="Doanh thu" bordered={false}>
            {revenueData.length > 0 ? (
              <Line {...revenueConfig} />
            ) : (
              <p style={{ textAlign: "center", color: "#999" }}>
                Chưa có dữ liệu
              </p>
            )}
          </Card>
        </Col>

        {/* User Growth Chart */}
        <Col xs={24} lg={12}>
          <Card title="Tăng trưởng người dùng" bordered={false}>
            {userGrowthData.length > 0 ? (
              <Line {...userGrowthConfig} />
            ) : (
              <p style={{ textAlign: "center", color: "#999" }}>
                Chưa có dữ liệu
              </p>
            )}
          </Card>
        </Col>

        {/* Booking Trends Chart */}
        <Col xs={24} lg={12}>
          <Card title="xu hướng đặt sân" bordered={false}>
            {bookingTrendsData.length > 0 ? (
              <Column {...bookingTrendsConfig} />
            ) : (
              <p style={{ textAlign: "center", color: "#999" }}>
                Chưa có dữ liệu
              </p>
            )}
          </Card>
        </Col>

        {/* Top Venues Chart */}
        <Col xs={24} lg={12}>
          <Card title="Top sân theo doanh thu" bordered={false}>
            {topVenuesData.length > 0 ? (
              <Column {...topVenuesConfig} />
            ) : (
              <p style={{ textAlign: "center", color: "#999" }}>
                Chưa có dữ liệu
              </p>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default FinancialReports;

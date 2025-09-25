import { ProCard, StatisticCard } from "@ant-design/pro-components";
import RcResizeObserver from "rc-resize-observer";
import { useEffect, useMemo, useState } from "react";
import { Card, Flex, Segmented, Spin, Typography } from "antd";
import { getDashboardOverviewAPI, getRevenueReportsAPI } from "@/services/api";

const { Statistic } = StatisticCard;

const imgStyle = {
  display: "block",
  width: 42,
  height: 42
};

const AdminDashboard = () => {
  const [responsive, setResponsive] = useState(false);
  const [period, setPeriod] = useState<string>("30d");
  const [loading, setLoading] = useState<boolean>(true);
  const [overview, setOverview] = useState<{
    totalUsers: number;
    totalVenues: number;
    totalBookings: number;
    totalRevenue: number;
    newUsers: number;
    newVenues: number;
    pendingApprovals: number;
    period: string;
  } | null>(null);

  const [revenueSummary, setRevenueSummary] = useState<{
    totalRevenue: number;
    totalBookings: number;
    averageBookingValue: number;
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [ov, rev] = await Promise.all([
          getDashboardOverviewAPI(period),
          getRevenueReportsAPI(period)
        ]);
        if (ov?.data?.overview) setOverview(ov.data.overview);
        if (rev?.data?.summary) setRevenueSummary(rev.data.summary);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [period]);

  const kpi = useMemo(
    () => ({
      revenue: revenueSummary?.totalRevenue ?? 0,
      bookings: revenueSummary?.totalBookings ?? 0,
      avgOrder: revenueSummary?.averageBookingValue ?? 0,
      users: overview?.totalUsers ?? 0
    }),
    [overview, revenueSummary]
  );

  return (
    <RcResizeObserver
      key="resize-observer"
      onResize={(offset) => {
        setResponsive(offset.width < 596);
      }}
    >
      <Flex align="center" justify="space-between" style={{ marginBottom: 12 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          Dashboard Overview
        </Typography.Title>
        <Segmented
          options={[
            { label: "7 ngày", value: "7d" },
            { label: "30 ngày", value: "30d" },
            { label: "90 ngày", value: "90d" }
          ]}
          value={period}
          onChange={(v) => setPeriod(v as string)}
        />
      </Flex>

      <Spin spinning={loading}>
        <StatisticCard.Group direction={responsive ? "column" : "row"}>
          <StatisticCard
            statistic={{
              title: "Tổng doanh thu",
              value: kpi.revenue,
              precision: 0,
              suffix: "đ"
            }}
          />
          <StatisticCard
            statistic={{
              title: "Số đơn hoàn tất",
              value: kpi.bookings
            }}
          />
          <StatisticCard
            statistic={{
              title: "Giá trị đơn TB",
              value: kpi.avgOrder,
              precision: 0,
              suffix: "đ"
            }}
          />
          <StatisticCard
            statistic={{
              title: "Tổng người dùng",
              value: kpi.users
            }}
          />
        </StatisticCard.Group>
      </Spin>

      <ProCard
        title="Tổng quan"
        extra={overview ? `Kỳ: ${overview.period}` : ""}
        split={responsive ? "horizontal" : "vertical"}
        headerBordered
        bordered
      >
        <ProCard split="horizontal">
          <ProCard split="horizontal">
            <ProCard split="vertical">
              <StatisticCard
                statistic={{
                  title: "Đăng ký mới",
                  value: overview?.newUsers ?? 0,
                  description: (
                    <Statistic
                      title="Tổng người dùng"
                      value={overview?.totalUsers ?? 0}
                    />
                  )
                }}
              />
              <StatisticCard
                statistic={{
                  title: "Địa điểm mới",
                  value: overview?.newVenues ?? 0,
                  description: (
                    <Statistic
                      title="Tổng sân hoạt động"
                      value={overview?.totalVenues ?? 0}
                    />
                  )
                }}
              />
            </ProCard>
            <ProCard split="vertical">
              <StatisticCard
                statistic={{
                  title: "Yêu cầu chờ duyệt",
                  value: overview?.pendingApprovals ?? 0
                }}
              />
              <StatisticCard
                statistic={{
                  title: "Tổng đơn hoàn tất",
                  value: kpi.bookings
                }}
              />
            </ProCard>
          </ProCard>
          <StatisticCard
            title="Doanh thu (minh hoạ)"
            chart={
              <img
                src="https://gw.alipayobjects.com/zos/alicdn/_dZIob2NB/zhuzhuangtu.svg"
                width="100%"
              />
            }
          />
        </ProCard>
        <StatisticCard
          title="Phân bố (minh hoạ)"
          chart={
            <img
              src="https://gw.alipayobjects.com/zos/alicdn/qoYmFMxWY/jieping2021-03-29%252520xiawu4.32.34.png"
              alt="chart"
              width="100%"
            />
          }
        />
      </ProCard>
    </RcResizeObserver>
  );
};

export default AdminDashboard;

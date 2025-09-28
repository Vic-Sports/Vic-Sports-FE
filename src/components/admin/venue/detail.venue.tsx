import { Drawer, Descriptions, Tag, List, Card } from "antd";
import { useEffect, useState } from "react";
import { getVenueCourtsAPI } from "@/services/venueApi";

interface IProps {
  open: boolean;
  onClose: () => void;
  venueId?: string;
  venueName?: string;
}

const DetailVenue = (props: IProps) => {
  const { open, onClose, venueId, venueName } = props;
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (open && venueId) {
        const res = await getVenueCourtsAPI(venueId);
        if (res && res.data) setData(res.data);
      }
    };
    fetchData();
  }, [open, venueId]);

  const venue = data?.venue;
  const courts = data?.courts || [];
  const sportTypeGroups = data?.sportTypeGroups || [];

  return (
    <Drawer
      title={`Chi tiết venue: ${venue?.name || venueName || ""}`}
      width={900}
      onClose={onClose}
      open={open}
    >
      <Descriptions bordered column={2} title="Thông tin Venue">
        <Descriptions.Item label="Tên">{venue?.name}</Descriptions.Item>
        <Descriptions.Item label="Xác thực">
          <Tag color={venue?.isVerified ? "green" : "gold"}>
            {venue?.isVerified ? "VERIFIED" : "PENDING"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Thành phố">
          {venue?.address?.city}
        </Descriptions.Item>
        <Descriptions.Item label="Quận/Huyện">
          {venue?.address?.district}
        </Descriptions.Item>
        <Descriptions.Item label="Phường/Xã">
          {venue?.address?.ward}
        </Descriptions.Item>
        <Descriptions.Item label="Đường">
          {venue?.address?.street}
        </Descriptions.Item>
        <Descriptions.Item label="Đánh giá TB">
          {venue?.ratings?.average ?? 0}
        </Descriptions.Item>
        <Descriptions.Item label="Số đánh giá">
          {venue?.ratings?.count ?? 0}
        </Descriptions.Item>
      </Descriptions>

      <div style={{ marginTop: 16, marginBottom: 8, fontWeight: 600 }}>
        Nhóm theo môn thể thao
      </div>
      <List
        grid={{ gutter: 16, column: 2 }}
        dataSource={sportTypeGroups}
        renderItem={(item: any) => (
          <List.Item>
            <Card
              title={item.sportType}
              extra={<span>{item.totalCourts} courts</span>}
            >
              <div>
                Giá: {item.minPrice} - {item.maxPrice}
              </div>
              <div>Rating TB: {item.averageRating}</div>
            </Card>
          </List.Item>
        )}
      />

      <div style={{ marginTop: 16, marginBottom: 8, fontWeight: 600 }}>
        Danh sách sân
      </div>
      <List
        bordered
        dataSource={courts}
        renderItem={(c: any) => (
          <List.Item>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%"
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{c.name}</div>
                <div style={{ opacity: 0.8 }}>{c.sportType}</div>
              </div>
              <Tag color={c.isActive ? "green" : "red"}>
                {c.isActive ? "ACTIVE" : "INACTIVE"}
              </Tag>
            </div>
          </List.Item>
        )}
      />
    </Drawer>
  );
};

export default DetailVenue;

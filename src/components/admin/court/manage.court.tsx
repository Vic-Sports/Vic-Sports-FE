import {
  Table,
  Tag,
  Button,
  Modal,
  message,
  Card,
  Space,
  Image,
  Switch
} from "antd";
import { EyeOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import type { TableProps } from "antd";
import { useState, useEffect } from "react";
import {
  getAllCourtsAPI,
  deleteCourtAPI,
  updateCourtAPI
} from "../../../services/courtApi";
import dayjs from "dayjs";

interface CourtData {
  _id: string;
  venueId: {
    _id: string;
    name: string;
    ownerId?: {
      fullName: string;
      email: string;
    };
  };
  name: string;
  sportType: string;
  courtType?: string;
  capacity: number;
  surface?: string;
  pricing: Array<{
    timeSlot: {
      start: string;
      end: string;
    };
    pricePerHour: number;
    dayType?: string;
  }>;
  isActive: boolean;
  images?: string[];
  ratings?: {
    average: number;
    count: number;
  };
  totalBookings?: number;
  totalRevenue?: number;
  createdAt: string;
}

const ManageCourtAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [courts, setCourts] = useState<CourtData[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // Modals
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<CourtData | null>(null);

  useEffect(() => {
    fetchCourts();
  }, [pagination.current, pagination.pageSize]);

  const fetchCourts = async () => {
    try {
      setLoading(true);
      const response = await getAllCourtsAPI({
        page: pagination.current,
        limit: pagination.pageSize
      });

      if (response.success) {
        const courtsData = response.data?.courts || [];
        const total = response.data?.total || 0;
        
        setCourts(courtsData);
        setPagination({
          ...pagination,
          total: total
        });
      }
    } catch (error: any) {
      message.error("Không thể tải danh sách sân");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCourt) return;

    try {
      await deleteCourtAPI(selectedCourt._id);
      message.success("Đã xóa sân thành công");
      setDeleteModalVisible(false);
      fetchCourts();
    } catch (error: any) {
      message.error("Không thể xóa sân");
    }
  };

  const handleToggleActive = async (court: CourtData, isActive: boolean) => {
    try {
      await updateCourtAPI(court._id, { isActive });
      message.success(`Đã ${isActive ? "kích hoạt" : "vô hiệu hóa"} sân`);
      fetchCourts();
    } catch (error: any) {
      message.error("Không thể cập nhật trạng thái sân");
    }
  };

  const columns: TableProps<CourtData>["columns"] = [
    {
      title: "Hình ảnh",
      key: "image",
      width: 80,
      render: (_, record) => (
        <Image
          width={60}
          height={60}
          src={record.images?.[0] || "/placeholder-court.png"}
          alt={record.name}
          style={{ objectFit: "cover", borderRadius: "4px" }}
          fallback="/placeholder-court.png"
        />
      )
    },
    {
      title: "Tên sân",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: "12px", color: "#999" }}>
            {typeof record.venueId === "object" ? record.venueId.name : "N/A"}
          </div>
        </div>
      )
    },
    {
      title: "Loại thể thao",
      dataIndex: "sportType",
      key: "sportType",
      render: (sportType: string) => {
        const colors: Record<string, string> = {
          "Bóng đá": "green",
          "Cầu lông": "blue",
          "Bóng rổ": "orange",
          "Tennis": "red",
          "Bóng chuyền": "purple"
        };
        return <Tag color={colors[sportType] || "default"}>{sportType}</Tag>;
      },
      filters: [
        { text: "Bóng đá", value: "Bóng đá" },
        { text: "Cầu lông", value: "Cầu lông" },
        { text: "Bóng rổ", value: "Bóng rổ" },
        { text: "Tennis", value: "Tennis" },
        { text: "Bóng chuyền", value: "Bóng chuyền" }
      ]
    },
    {
      title: "Loại sân",
      dataIndex: "courtType",
      key: "courtType",
      render: (type) => type || "N/A"
    },
    {
      title: "Sức chứa",
      dataIndex: "capacity",
      key: "capacity",
      render: (capacity) => `${capacity} người`
    },
    {
      title: "Giá",
      key: "pricing",
      render: (_, record) => {
        if (!record.pricing || record.pricing.length === 0) return "N/A";
        const prices = record.pricing.map((p) => p.pricePerHour);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        return minPrice === maxPrice
          ? `${minPrice.toLocaleString()}đ/h`
          : `${minPrice.toLocaleString()}đ - ${maxPrice.toLocaleString()}đ/h`;
      }
    },
    {
      title: "Đánh giá",
      key: "rating",
      render: (_, record) => {
        if (!record.ratings || record.ratings.count === 0) {
          return <span style={{ color: "#999" }}>Chưa có đánh giá</span>;
        }
        return (
          <div>
            <div>⭐ {record.ratings.average.toFixed(1)}</div>
            <div style={{ fontSize: "12px", color: "#999" }}>
              ({record.ratings.count} đánh giá)
            </div>
          </div>
        );
      }
    },
    {
      title: "Lượt đặt",
      dataIndex: "totalBookings",
      key: "totalBookings",
      render: (bookings) => bookings || 0,
      sorter: true
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean, record) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleToggleActive(record, checked)}
          checkedChildren="Hoạt động"
          unCheckedChildren="Tắt"
        />
      ),
      filters: [
        { text: "Hoạt động", value: true },
        { text: "Không hoạt động", value: false }
      ]
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY")
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedCourt(record);
              setDetailModalVisible(true);
            }}
            size="small"
          >
            Xem
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              setSelectedCourt(record);
              setDeleteModalVisible(true);
            }}
            size="small"
          >
            Xóa
          </Button>
        </Space>
      )
    }
  ];

  const handleTableChange = (newPagination: any, filters: any, sorter: any) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize
    });
  };

  return (
    <Card title="Quản lý sân">
      <Table
        columns={columns}
        dataSource={courts}
        loading={loading}
        rowKey="_id"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} sân`,
          pageSizeOptions: ["10", "20", "50", "100"]
        }}
        onChange={handleTableChange}
        scroll={{ x: 1500 }}
      />

      {/* Delete Modal */}
      <Modal
        title="Xóa sân"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>
          Bạn có chắc chắn muốn xóa sân <strong>{selectedCourt?.name}</strong>?
        </p>
        <p style={{ color: "#ff4d4f" }}>
          ⚠️ Hành động này không thể hoàn tác!
        </p>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={`Chi tiết sân: ${selectedCourt?.name}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {selectedCourt && (
          <div>
            <div style={{ marginBottom: "16px" }}>
              <strong>Hình ảnh:</strong>
              <div style={{ marginTop: "8px" }}>
                {selectedCourt.images && selectedCourt.images.length > 0 ? (
                  <Image.PreviewGroup>
                    {selectedCourt.images.map((img, idx) => (
                      <Image
                        key={idx}
                        width={100}
                        height={100}
                        src={img}
                        alt={`${selectedCourt.name} - ${idx + 1}`}
                        style={{
                          objectFit: "cover",
                          borderRadius: "4px",
                          marginRight: "8px"
                        }}
                      />
                    ))}
                  </Image.PreviewGroup>
                ) : (
                  <span style={{ color: "#999" }}>Chưa có hình ảnh</span>
                )}
              </div>
            </div>

            <div style={{ marginBottom: "8px" }}>
              <strong>Địa điểm:</strong>{" "}
              {typeof selectedCourt.venueId === "object"
                ? selectedCourt.venueId.name
                : "N/A"}
            </div>

            {typeof selectedCourt.venueId === "object" &&
              selectedCourt.venueId.ownerId && (
                <div style={{ marginBottom: "8px" }}>
                  <strong>Chủ sân:</strong>{" "}
                  {selectedCourt.venueId.ownerId.fullName} (
                  {selectedCourt.venueId.ownerId.email})
                </div>
              )}

            <div style={{ marginBottom: "8px" }}>
              <strong>Loại thể thao:</strong> {selectedCourt.sportType}
            </div>

            <div style={{ marginBottom: "8px" }}>
              <strong>Loại sân:</strong> {selectedCourt.courtType || "N/A"}
            </div>

            <div style={{ marginBottom: "8px" }}>
              <strong>Sức chứa:</strong> {selectedCourt.capacity} người
            </div>

            <div style={{ marginBottom: "8px" }}>
              <strong>Mặt sân:</strong> {selectedCourt.surface || "N/A"}
            </div>

            <div style={{ marginBottom: "8px" }}>
              <strong>Bảng giá:</strong>
              {selectedCourt.pricing && selectedCourt.pricing.length > 0 ? (
                <ul>
                  {selectedCourt.pricing.map((p, idx) => (
                    <li key={idx}>
                      {p.timeSlot.start} - {p.timeSlot.end}:{" "}
                      {p.pricePerHour.toLocaleString()}đ/h
                      {p.dayType && ` (${p.dayType})`}
                    </li>
                  ))}
                </ul>
              ) : (
                <span style={{ color: "#999" }}> Chưa có bảng giá</span>
              )}
            </div>

            <div style={{ marginBottom: "8px" }}>
              <strong>Tổng lượt đặt:</strong> {selectedCourt.totalBookings || 0}
            </div>

            <div style={{ marginBottom: "8px" }}>
              <strong>Tổng doanh thu:</strong>{" "}
              {(selectedCourt.totalRevenue || 0).toLocaleString()}đ
            </div>

            <div style={{ marginBottom: "8px" }}>
              <strong>Ngày tạo:</strong>{" "}
              {dayjs(selectedCourt.createdAt).format("DD/MM/YYYY HH:mm")}
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default ManageCourtAdmin;


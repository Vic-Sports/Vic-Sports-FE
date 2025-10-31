import { Table, Tag, Button, Modal, message, Input, Card, Space } from "antd";
import { CheckOutlined, CloseOutlined, EyeOutlined } from "@ant-design/icons";
import type { TableProps } from "antd";
import { useState, useEffect } from "react";
import {
  getAllVenues,
  approveVenue,
  rejectVenue
} from "../../../services/adminApi";
import dayjs from "dayjs";

interface VenueData {
  _id: string;
  name: string;
  ownerId: {
    fullName: string;
    email: string;
    phone?: string;
  };
  address: {
    city: string;
    district: string;
    street: string;
  };
  isVerified: boolean;
  isActive: boolean;
  moderationStatus?: string;
  verifiedAt?: string;
  verificationNotes?: string;
  totalBookings?: number;
  totalRevenue?: number;
  createdAt: string;
}

const ManageVenueAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [venues, setVenues] = useState<VenueData[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // Modals
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<VenueData | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchVenues();
  }, [pagination.current, pagination.pageSize]);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const response = await getAllVenues({
        page: pagination.current,
        limit: pagination.pageSize
      });

      if (response.statusCode === 200) {
        setVenues(response.data.result);
        setPagination({
          ...pagination,
          total: response.data.meta.total
        });
      }
    } catch (error: any) {
      message.error("Không thể tải danh sách sân");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedVenue) return;

    try {
      await approveVenue(selectedVenue._id, notes);
      message.success("Đã duyệt sân thành công");
      setApproveModalVisible(false);
      setNotes("");
      fetchVenues();
    } catch (error: any) {
      message.error("Không thể duyệt sân");
    }
  };

  const handleReject = async () => {
    if (!selectedVenue) return;

    try {
      await rejectVenue(selectedVenue._id, notes);
      message.success("Đã từ chối sân");
      setRejectModalVisible(false);
      setNotes("");
      fetchVenues();
    } catch (error: any) {
      message.error("Không thể từ chối sân");
    }
  };

  const columns: TableProps<VenueData>["columns"] = [
    {
      title: "Tên sân",
      dataIndex: "name",
      key: "name"
    },
    {
      title: "Chủ sân",
      key: "owner",
      render: (_, record) => (
        <div>
          <div>{record.ownerId?.fullName || "N/A"}</div>
          <div style={{ fontSize: "12px", color: "#999" }}>
            {record.ownerId?.email}
          </div>
        </div>
      )
    },
    {
      title: "Địa chỉ",
      key: "address",
      render: (_, record) => (
        <div>
          {record.address?.street}, {record.address?.district},{" "}
          {record.address?.city}
        </div>
      )
    },
    {
      title: "Trạng thái duyệt",
      key: "moderationStatus",
      render: (_, record) => {
        const status =
          record.moderationStatus ||
          (record.isVerified ? "approved" : "pending");
        const colors: Record<string, string> = {
          pending: "orange",
          approved: "green",
          rejected: "red"
        };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
      },
      filters: [
        { text: "Pending", value: "pending" },
        { text: "Approved", value: "approved" },
        { text: "Rejected", value: "rejected" }
      ]
    },
    {
      title: "Hoạt động",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      )
    },
    {
      title: "Đã xác thực",
      dataIndex: "isVerified",
      key: "isVerified",
      render: (isVerified: boolean) => (
        <Tag color={isVerified ? "green" : "orange"}>
          {isVerified ? "Đã xác thực" : "Chờ xác thực"}
        </Tag>
      )
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
      render: (_, record) => (
        <Space size="small">
          {!record.isVerified && (
            <>
              <Button
                type="link"
                icon={<CheckOutlined />}
                onClick={() => {
                  setSelectedVenue(record);
                  setApproveModalVisible(true);
                }}
                size="small"
              >
                Duyệt
              </Button>
              <Button
                type="link"
                danger
                icon={<CloseOutlined />}
                onClick={() => {
                  setSelectedVenue(record);
                  setRejectModalVisible(true);
                }}
                size="small"
              >
                Từ chối
              </Button>
            </>
          )}
          {record.verificationNotes && (
            <Button
              type="link"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => {
                Modal.info({
                  title: "Ghi chú xác thực",
                  content: record.verificationNotes
                });
              }}
            >
              Xem ghi chú
            </Button>
          )}
        </Space>
      )
    }
  ];

  const handleTableChange = (newPagination: any) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize
    });
  };

  return (
    <Card title="Quản lý sân thể thao">
      <Table
        columns={columns}
        dataSource={venues}
        loading={loading}
        rowKey="_id"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} sân`
        }}
        onChange={handleTableChange}
      />

      {/* Approve Modal */}
      <Modal
        title="Duyệt sân"
        open={approveModalVisible}
        onOk={handleApprove}
        onCancel={() => {
          setApproveModalVisible(false);
          setNotes("");
        }}
        okText="Duyệt"
        cancelText="Hủy"
      >
        <p>
          Bạn có chắc chắn muốn duyệt sân <strong>{selectedVenue?.name}</strong>
          ?
        </p>
        <Input.TextArea
          rows={4}
          placeholder="Ghi chú (tùy chọn)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Từ chối sân"
        open={rejectModalVisible}
        onOk={handleReject}
        onCancel={() => {
          setRejectModalVisible(false);
          setNotes("");
        }}
        okText="Từ chối"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>
          Bạn có chắc chắn muốn từ chối sân{" "}
          <strong>{selectedVenue?.name}</strong>?
        </p>
        <Input.TextArea
          rows={4}
          placeholder="Lý do từ chối"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Modal>
    </Card>
  );
};

export default ManageVenueAdmin;

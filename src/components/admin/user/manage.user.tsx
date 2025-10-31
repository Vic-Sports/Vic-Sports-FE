import {
  Space,
  Table,
  Tag,
  Button,
  Modal,
  message,
  Select,
  Input,
  Form,
  Card
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
  EyeOutlined
} from "@ant-design/icons";
import type { TableProps } from "antd";
import { useState, useEffect } from "react";
import {
  getAllUsers,
  banUser,
  unbanUser,
  updateUserByAdmin
} from "../../../services/adminApi";
import dayjs from "dayjs";

const { Option } = Select;

interface UserData {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  totalBookings?: number;
  totalSpent?: number;
  loyaltyTier?: string;
  rewardPoints?: number;
  createdAt: string;
}

const ManageUserAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState<any>({});

  // Modals
  const [banModalVisible, setBanModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [banReason, setBanReason] = useState("");
  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers({
        current: pagination.current,
        pageSize: pagination.pageSize,
        ...filters
      });

      if (response.statusCode === 200) {
        setUsers(response.data.result);
        setPagination({
          ...pagination,
          total: response.data.meta.total
        });
      }
    } catch (error: any) {
      message.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async () => {
    if (!selectedUser) return;

    try {
      await banUser(selectedUser._id, banReason);
      message.success("Đã cấm người dùng thành công");
      setBanModalVisible(false);
      setBanReason("");
      fetchUsers();
    } catch (error: any) {
      message.error("Không thể cấm người dùng");
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await unbanUser(userId);
      message.success("Đã mở khóa người dùng thành công");
      fetchUsers();
    } catch (error: any) {
      message.error("Không thể mở khóa người dùng");
    }
  };

  const handleEditUser = (user: UserData) => {
    setSelectedUser(user);
    editForm.setFieldsValue({
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      loyaltyTier: user.loyaltyTier || "Bronze",
      rewardPoints: user.rewardPoints || 0
    });
    setEditModalVisible(true);
  };

  const handleUpdateUser = async () => {
    try {
      const values = await editForm.validateFields();
      if (!selectedUser) return;

      await updateUserByAdmin(selectedUser._id, values);
      message.success("Cập nhật người dùng thành công");
      setEditModalVisible(false);
      fetchUsers();
    } catch (error: any) {
      message.error("Không thể cập nhật người dùng");
    }
  };

  const columns: TableProps<UserData>["columns"] = [
    {
      title: "Họ tên",
      dataIndex: "fullName",
      key: "fullName",
      render: (text) => text || "N/A"
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email"
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      render: (phone) => phone || "N/A"
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role: string) => {
        const colors: Record<string, string> = {
          admin: "red",
          owner: "purple",
          coach: "blue",
          customer: "green"
        };
        return (
          <Tag color={colors[role] || "default"}>{role.toUpperCase()}</Tag>
        );
      },
      filters: [
        { text: "Customer", value: "customer" },
        { text: "Owner", value: "owner" },
        { text: "Coach", value: "coach" },
        { text: "Admin", value: "admin" }
      ]
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colors: Record<string, string> = {
          ACTIVE: "green",
          INACTIVE: "orange",
          BANNED: "red"
        };
        return <Tag color={colors[status] || "default"}>{status}</Tag>;
      },
      filters: [
        { text: "Active", value: "ACTIVE" },
        { text: "Inactive", value: "INACTIVE" },
        { text: "Banned", value: "BANNED" }
      ]
    },
    {
      title: "Loyalty Tier",
      dataIndex: "loyaltyTier",
      key: "loyaltyTier",
      render: (tier: string) => {
        const colors: Record<string, string> = {
          Diamond: "purple",
          Gold: "gold",
          Silver: "silver",
          Bronze: "brown"
        };
        return <Tag color={colors[tier] || "default"}>{tier || "Bronze"}</Tag>;
      }
    },
    {
      title: "Điểm",
      dataIndex: "rewardPoints",
      key: "rewardPoints",
      render: (points) => points || 0
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
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
            size="small"
          >
            Sửa
          </Button>
          {record.status === "BANNED" ? (
            <Button
              type="link"
              icon={<UnlockOutlined />}
              onClick={() => handleUnbanUser(record._id)}
              size="small"
            >
              Mở khóa
            </Button>
          ) : (
            <Button
              type="link"
              danger
              icon={<LockOutlined />}
              onClick={() => {
                setSelectedUser(record);
                setBanModalVisible(true);
              }}
              size="small"
            >
              Cấm
            </Button>
          )}
        </Space>
      )
    }
  ];

  const handleTableChange = (newPagination: any, newFilters: any) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize
    });

    // Apply filters
    const appliedFilters: any = {};
    if (newFilters.role && newFilters.role.length > 0) {
      appliedFilters.role = newFilters.role[0];
    }
    if (newFilters.status && newFilters.status.length > 0) {
      appliedFilters.status = newFilters.status[0];
    }
    setFilters(appliedFilters);
  };

  return (
    <Card title="Quản lý người dùng">
      <Table
        columns={columns}
        dataSource={users}
        loading={loading}
        rowKey="_id"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} người dùng`
        }}
        onChange={handleTableChange}
      />

      {/* Ban User Modal */}
      <Modal
        title="Cấm người dùng"
        open={banModalVisible}
        onOk={handleBanUser}
        onCancel={() => {
          setBanModalVisible(false);
          setBanReason("");
        }}
        okText="Cấm"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>
          Bạn có chắc chắn muốn cấm người dùng{" "}
          <strong>{selectedUser?.fullName}</strong>?
        </p>
        <Input.TextArea
          rows={4}
          placeholder="Lý do cấm (tùy chọn)"
          value={banReason}
          onChange={(e) => setBanReason(e.target.value)}
        />
      </Modal>

      {/* Edit User Modal */}
      <Modal
        title="Chỉnh sửa người dùng"
        open={editModalVisible}
        onOk={handleUpdateUser}
        onCancel={() => setEditModalVisible(false)}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            label="Họ tên"
            name="fullName"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Vai trò"
            name="role"
            rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
          >
            <Select>
              <Option value="customer">Customer</Option>
              <Option value="owner">Owner</Option>
              <Option value="coach">Coach</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Trạng thái"
            name="status"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select>
              <Option value="ACTIVE">Active</Option>
              <Option value="INACTIVE">Inactive</Option>
              <Option value="BANNED">Banned</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Loyalty Tier" name="loyaltyTier">
            <Select>
              <Option value="Bronze">Bronze</Option>
              <Option value="Silver">Silver</Option>
              <Option value="Gold">Gold</Option>
              <Option value="Diamond">Diamond</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Điểm thưởng" name="rewardPoints">
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ManageUserAdmin;

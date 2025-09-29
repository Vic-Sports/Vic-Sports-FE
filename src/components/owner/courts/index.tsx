import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Tag,
  Space,
  Avatar,
  Typography,
  Tooltip,
  notification,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  InputNumber,
  Badge,
  Switch,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  ExclamationCircleOutlined,
  FieldTimeOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import type { ColumnsType } from "antd/es/table";
import {
  ownerCourtApi,
  ownerVenueApi,
  handleApiError,
} from "@/services/ownerApi";

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;
const { TextArea, Search } = Input;

// Court interface - Updated to match backend structure
interface Court {
  _id: string;
  venueId: {
    _id: string;
    id: string;
    name: string;
    address: {
      street: string;
      ward: string;
      district: string;
      city: string;
      coordinates?: {
        type: string;
        coordinates: [number, number];
      };
    };
  };
  name: string;
  sportType: string; // "football", "tennis", etc.
  courtType: string;
  capacity: number;
  surface: string;
  equipment: string[];
  images: string[];
  dimensions: {
    length: number;
    width: number;
    unit: string;
  };
  ratings: {
    average: number;
    count: number;
  };
  pricing: Array<{
    _id: string;
    timeSlot: {
      start: string;
      end: string;
    };
    pricePerHour: number;
    dayType: "weekday" | "weekend";
    isActive: boolean;
  }>;
  defaultAvailability: Array<{
    _id: string;
    dayOfWeek: number;
    timeSlots: Array<{
      _id: string;
      start: string;
      end: string;
      isAvailable: boolean;
    }>;
  }>;
  isActive: boolean;
  totalBookings: number;
  totalRevenue: number;
  description?: string;
}

// Sport type mapping
const getSportTypeDisplay = (sportType: string): string => {
  const sportMap: Record<string, string> = {
    football: "Bóng đá",
    tennis: "Tennis",
    badminton: "Cầu lông",
    basketball: "Bóng rổ",
    volleyball: "Bóng chuyền",
    table_tennis: "Bóng bàn",
    futsal: "Futsal",
  };
  return sportMap[sportType] || sportType;
};

// Get base price for display
const getCourtBasePrice = (pricing: Court["pricing"]): number => {
  if (!pricing || pricing.length === 0) return 0;
  return Math.min(...pricing.map((p) => p.pricePerHour));
};

const ManageCourts = () => {
  const [loading, setLoading] = useState(true);
  const [courts, setCourts] = useState<Court[]>([]);
  const [filteredCourts, setFilteredCourts] = useState<Court[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [isCourtModalVisible, setIsCourtModalVisible] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [form] = Form.useForm();
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);

  // Filter states
  const [sportFilter, setSportFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [venueFilter, setVenueFilter] = useState<string>("all");
  const [courtTypeFilter, setCourtTypeFilter] = useState<string>("all");
  const [searchText, setSearchText] = useState<string>("");

  // Load data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Load venues and courts in parallel
      const [venuesRes, courtsRes] = await Promise.all([
        ownerVenueApi.getVenues(),
        ownerCourtApi.getCourts(),
      ]);

      if (
        venuesRes.success &&
        venuesRes.data?.venues &&
        Array.isArray(venuesRes.data.venues)
      ) {
        setVenues(venuesRes.data.venues);
      } else if (venuesRes.success && Array.isArray(venuesRes.data)) {
        // Fallback for direct array response
        setVenues(venuesRes.data);
      } else {
        console.error(
          "Venues API response is not properly structured:",
          venuesRes
        );
        setVenues([]);
      }

      if (
        courtsRes.success &&
        courtsRes.data?.courts &&
        Array.isArray(courtsRes.data.courts)
      ) {
        setCourts(courtsRes.data.courts);
      } else {
        console.error("Courts API response courts is not an array:", courtsRes);
        setCourts([]);
      }
    } catch (error) {
      const apiError = handleApiError(error);
      setCourts([]);
      setVenues([]);
      notification.error({
        message: "Lỗi tải dữ liệu",
        description: apiError.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter courts
  useEffect(() => {
    let filtered = courts;

    // Filter by sport type
    if (sportFilter !== "all") {
      filtered = filtered.filter((court) => court.sportType === sportFilter);
    }

    // Filter by status
    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        filtered = filtered.filter((court) => court.isActive);
      } else if (statusFilter === "inactive") {
        filtered = filtered.filter((court) => !court.isActive);
      }
    }

    // Filter by venue
    if (venueFilter !== "all") {
      filtered = filtered.filter(
        (court) =>
          court.venueId._id === venueFilter || court.venueId.id === venueFilter
      );
    }

    // Filter by court type
    if (courtTypeFilter !== "all") {
      filtered = filtered.filter(
        (court) => court.courtType === courtTypeFilter
      );
    }

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(
        (court) =>
          court.name.toLowerCase().includes(searchText.toLowerCase()) ||
          (court.description &&
            court.description
              .toLowerCase()
              .includes(searchText.toLowerCase())) ||
          court.venueId.name.toLowerCase().includes(searchText.toLowerCase()) ||
          court.surface.toLowerCase().includes(searchText.toLowerCase()) ||
          getSportTypeDisplay(court.sportType)
            .toLowerCase()
            .includes(searchText.toLowerCase())
      );
    }

    setFilteredCourts(filtered);
  }, [
    courts,
    sportFilter,
    statusFilter,
    venueFilter,
    courtTypeFilter,
    searchText,
  ]);

  // Table columns
  const columns: ColumnsType<Court> = [
    {
      title: "Sân",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space>
          <Avatar
            src={record.images[0]}
            shape="square"
            size="large"
            icon={<FieldTimeOutlined />}
          />
          <div>
            <div style={{ fontWeight: 600 }}>{text}</div>
            <Text type="secondary">
              {getSportTypeDisplay(record.sportType)} - {record.courtType}
            </Text>
            <div>
              <Text type="secondary">{record.venueId.name}</Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Thông tin",
      key: "info",
      render: (_, record) => (
        <div>
          <div>
            <TeamOutlined /> {record.capacity} người
          </div>
          <div style={{ color: "#8c8c8c" }}>
            {record.dimensions.length}×{record.dimensions.width}{" "}
            {record.dimensions.unit}
          </div>
          <div style={{ color: "#8c8c8c" }}>{record.surface}</div>
          <div>
            <Text strong>
              Từ {getCourtBasePrice(record.pricing).toLocaleString()} VNĐ/giờ
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "success" : "default"}>
          {isActive ? "Hoạt động" : "Tạm dừng"}
        </Tag>
      ),
    },
    {
      title: "Thống kê",
      key: "stats",
      render: (_, record) => (
        <div>
          <div>
            <Badge count={record.totalBookings} overflowCount={99} /> lượt đặt
          </div>
          <div>
            <Text type="success">
              {record.totalRevenue.toLocaleString()} VNĐ
            </Text>
          </div>
          <div>
            ⭐ {record.ratings.average}/5 ({record.ratings.count} đánh giá)
          </div>
        </div>
      ),
    },
    {
      title: "Tiện ích",
      dataIndex: "equipment",
      key: "equipment",
      render: (equipment: string[]) => (
        <div>
          {equipment.slice(0, 2).map((item, index) => (
            <Tag key={index}>{item}</Tag>
          ))}
          {equipment.length > 2 && <Tag>+{equipment.length - 2}</Tag>}
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
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditCourt(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteCourt(record._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Handlers
  const handleAddCourt = () => {
    setEditingCourt(null);
    form.resetFields();
    setIsCourtModalVisible(true);
  };

  const handleViewDetail = (court: Court) => {
    setSelectedCourt(court);
    setDetailModalVisible(true);
  };

  const handleEditCourt = (court: Court) => {
    console.log("Editing court:", court);
    console.log("Court dimensions:", court.dimensions);

    setEditingCourt(court);

    try {
      const formValues = {
        name: court.name,
        venueId: court.venueId?._id || court.venueId?.id,
        sportType: court.sportType,
        courtType: court.courtType,
        capacity: court.capacity,
        surface: court.surface,
        equipment: Array.isArray(court.equipment)
          ? court.equipment.join(", ")
          : "",
        description: court.description || "",
        basePrice: getCourtBasePrice(court.pricing),
        // Dimensions fields with better error handling
        length: court.dimensions?.length || 0,
        width: court.dimensions?.width || 0,
        unit: court.dimensions?.unit || "m",
        isActive: court.isActive,
      };

      console.log("Form values to set:", formValues);
      form.setFieldsValue(formValues);
      setIsCourtModalVisible(true);
    } catch (error) {
      console.error("Error setting form values:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể load dữ liệu sân để chỉnh sửa",
      });
    }
  };

  const handleDeleteCourt = (courtId: string) => {
    confirm({
      title: "Xác nhận xóa sân",
      icon: <ExclamationCircleOutlined />,
      content:
        "Bạn có chắc chắn muốn xóa sân này? Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      async onOk() {
        try {
          const response = await ownerCourtApi.deleteCourt(courtId);
          if (response.success) {
            setCourts(courts.filter((c) => c._id !== courtId));
            notification.success({
              message: "Thành công",
              description: "Sân đã được xóa thành công!",
            });
          }
        } catch (error) {
          const apiError = handleApiError(error);
          notification.error({
            message: "Lỗi xóa sân",
            description: apiError.message,
          });
        }
      },
    });
  };

  const handleSaveCourt = async (values: any) => {
    try {
      const courtData = {
        name: values.name,
        venueId: values.venueId,
        sportType: values.sportType,
        courtType: values.courtType,
        capacity: values.capacity,
        surface: values.surface,
        equipment: values.equipment
          ? values.equipment.split(",").map((item: string) => item.trim())
          : [],
        description: values.description || "",
        basePrice: values.basePrice,
        dimensions: {
          length: values.length || 0,
          width: values.width || 0,
          unit: values.unit || "m",
        },
        isActive: values.isActive !== false, // Default to true
      };

      let response;
      if (editingCourt) {
        // Update existing court
        response = await ownerCourtApi.updateCourt(editingCourt._id, courtData);
        if (response.success) {
          // Reload data to get updated structure from backend
          loadInitialData();
          notification.success({
            message: "Thành công",
            description: "Thông tin sân đã được cập nhật!",
          });
        }
      } else {
        // Add new court
        response = await ownerCourtApi.createCourt(courtData);
        if (response.success) {
          // Reload courts to get updated list
          loadInitialData();
          notification.success({
            message: "Thành công",
            description: "Sân mới đã được thêm thành công!",
          });
        }
      }
      setIsCourtModalVisible(false);
    } catch (error) {
      const apiError = handleApiError(error);
      notification.error({
        message: "Lỗi lưu sân",
        description: apiError.message,
      });
    }
  };

  // Calculate statistics
  const totalCourts = courts.length;
  const activeCourts = courts.filter((c) => c.isActive).length;
  const inactiveCourts = courts.filter((c) => !c.isActive).length;
  const totalBookings = courts.reduce(
    (sum, court) => sum + (court.totalBookings || 0),
    0
  );

  // Get unique values for filter dropdowns
  const uniqueSports = [...new Set(courts.map((court) => court.sportType))];
  const uniqueCourtTypes = [...new Set(courts.map((court) => court.courtType))];

  // Clear all filters
  const clearFilters = () => {
    setSportFilter("all");
    setStatusFilter("all");
    setVenueFilter("all");
    setCourtTypeFilter("all");
    setSearchText("");
  };

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
          <FieldTimeOutlined /> Quản lý sân thể thao
        </Title>
        <Text type="secondary">
          Quản lý thông tin các sân và cơ sở vật chất
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#1890ff",
                }}
              >
                {totalCourts}
              </div>
              <div style={{ color: "#8c8c8c" }}>Tổng số sân</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#52c41a",
                }}
              >
                {activeCourts}
              </div>
              <div style={{ color: "#8c8c8c" }}>Đang hoạt động</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#fa8c16",
                }}
              >
                {inactiveCourts}
              </div>
              <div style={{ color: "#8c8c8c" }}>Tạm dừng</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#722ed1",
                }}
              >
                {totalBookings.toLocaleString()}
              </div>
              <div style={{ color: "#8c8c8c" }}>Tổng lượt đặt</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={6}>
            <Search
              placeholder="Tìm theo tên sân, mô tả, cơ sở..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "100%" }}
            />
          </Col>
          <Col xs={12} sm={4}>
            <Select
              placeholder="Môn thể thao"
              style={{ width: "100%" }}
              value={sportFilter}
              onChange={setSportFilter}
            >
              <Option value="all">Tất cả môn</Option>
              {uniqueSports.map((sport) => (
                <Option key={sport} value={sport}>
                  {getSportTypeDisplay(sport)}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={4}>
            <Select
              placeholder="Trạng thái"
              style={{ width: "100%" }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Tạm dừng</Option>
            </Select>
          </Col>
          <Col xs={12} sm={4}>
            <Select
              placeholder="Cơ sở"
              style={{ width: "100%" }}
              value={venueFilter}
              onChange={setVenueFilter}
            >
              <Option value="all">Tất cả cơ sở</Option>
              {venues.map((venue) => (
                <Option key={venue.id} value={venue.id}>
                  {venue.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={4}>
            <Select
              placeholder="Loại sân"
              style={{ width: "100%" }}
              value={courtTypeFilter}
              onChange={setCourtTypeFilter}
            >
              <Option value="all">Tất cả loại</Option>
              {uniqueCourtTypes.map((type) => (
                <Option key={type} value={type}>
                  {type}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={2}>
            <Button onClick={clearFilters} style={{ width: "100%" }}>
              Xóa bộ lọc
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Courts Management */}
      <Card
        title={`Danh sách sân thể thao (${filteredCourts.length})`}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddCourt}
          >
            Thêm sân mới
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredCourts}
          rowKey="_id"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} sân`,
          }}
        />
      </Card>

      {/* Court Modal */}
      <Modal
        title={editingCourt ? "Chỉnh sửa sân" : "Thêm sân mới"}
        open={isCourtModalVisible}
        onCancel={() => {
          setIsCourtModalVisible(false);
          form.resetFields();
          setEditingCourt(null);
        }}
        footer={null}
        width={900}
        destroyOnClose={true}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveCourt}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Tên sân"
                name="name"
                rules={[{ required: true, message: "Vui lòng nhập tên sân!" }]}
              >
                <Input placeholder="Nhập tên sân" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Cơ sở"
                name="venueId"
                rules={[{ required: true, message: "Vui lòng chọn cơ sở!" }]}
              >
                <Select placeholder="Chọn cơ sở">
                  {venues.map((venue) => (
                    <Option key={venue.id} value={venue.id}>
                      {venue.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Môn thể thao"
                name="sportType"
                rules={[
                  { required: true, message: "Vui lòng chọn môn thể thao!" },
                ]}
              >
                <Select placeholder="Chọn môn thể thao">
                  <Option value="football">Bóng đá</Option>
                  <Option value="tennis">Tennis</Option>
                  <Option value="badminton">Cầu lông</Option>
                  <Option value="basketball">Bóng rổ</Option>
                  <Option value="volleyball">Bóng chuyền</Option>
                  <Option value="table_tennis">Bóng bàn</Option>
                  <Option value="futsal">Futsal</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Loại sân"
                name="courtType"
                rules={[{ required: true, message: "Vui lòng chọn loại sân!" }]}
              >
                <Select placeholder="Chọn loại sân">
                  <Option value="ngoài trời">Ngoài trời</Option>
                  <Option value="trong nhà">Trong nhà</Option>
                  <Option value="Sân 5 người">Sân 5 người</Option>
                  <Option value="Sân 7 người">Sân 7 người</Option>
                  <Option value="Sân 11 người">Sân 11 người</Option>
                  <Option value="Sân đơn">Sân đơn</Option>
                  <Option value="Sân đôi">Sân đôi</Option>
                  <Option value="Sân tiêu chuẩn">Sân tiêu chuẩn</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Sức chứa (người)"
                name="capacity"
                rules={[{ required: true, message: "Vui lòng nhập sức chứa!" }]}
              >
                <InputNumber
                  min={1}
                  max={50}
                  placeholder="14"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Giá cơ bản (VNĐ/giờ)"
                name="basePrice"
                rules={[
                  { required: true, message: "Vui lòng nhập giá cơ bản!" },
                ]}
              >
                <InputNumber
                  min={0}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Trạng thái"
                name="isActive"
                initialValue={true}
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Hoạt động"
                  unCheckedChildren="Tạm dừng"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Dimensions Row */}
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Chiều dài"
                name="length"
                rules={[
                  { required: true, message: "Vui lòng nhập chiều dài!" },
                ]}
              >
                <InputNumber
                  min={1}
                  max={200}
                  placeholder="40"
                  style={{ width: "100%" }}
                  addonAfter="m"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Chiều rộng"
                name="width"
                rules={[
                  { required: true, message: "Vui lòng nhập chiều rộng!" },
                ]}
              >
                <InputNumber
                  min={1}
                  max={200}
                  placeholder="20"
                  style={{ width: "100%" }}
                  addonAfter="m"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Đơn vị" name="unit" initialValue="m">
                <Select style={{ width: "100%" }}>
                  <Option value="m">Mét (m)</Option>
                  <Option value="ft">Feet (ft)</Option>
                  <Option value="yard">Yard</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Mặt sân"
            name="surface"
            rules={[{ required: true, message: "Vui lòng nhập loại mặt sân!" }]}
          >
            <Select placeholder="Chọn loại mặt sân">
              <Option value="cỏ nhân tạo">Cỏ nhân tạo</Option>
              <Option value="xi măng">Xi măng</Option>
              <Option value="cỏ tự nhiên">Cỏ tự nhiên</Option>
              <Option value="bê tông">Bê tông</Option>
              <Option value="sàn gỗ">Sàn gỗ</Option>
              <Option value="nhựa PU">Nhựa PU</Option>
              <Option value="acrylic">Acrylic</Option>
              <Option value="thảm PVC">Thảm PVC</Option>
              <Option value="cứng">Cứng</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Tiện ích & Thiết bị (phân cách bằng dấu phẩy)"
            name="equipment"
          >
            <TextArea
              rows={2}
              placeholder="Lưới, Cột gôn, Đèn chiếu sáng, Điều hòa..."
            />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <TextArea rows={3} placeholder="Mô tả chi tiết về sân..." />
          </Form.Item>

          <Form.Item label="Hình ảnh">
            <Upload>
              <Button icon={<UploadOutlined />}>Tải lên hình ảnh</Button>
            </Upload>
          </Form.Item>

          <Form.Item style={{ marginTop: "24px", textAlign: "right" }}>
            <Space>
              <Button onClick={() => setIsCourtModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingCourt ? "Cập nhật" : "Thêm sân"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết sân thể thao"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              if (selectedCourt) {
                setDetailModalVisible(false);
                handleEditCourt(selectedCourt);
              }
            }}
          >
            Chỉnh sửa
          </Button>,
        ]}
        width={800}
      >
        {selectedCourt && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Title level={5}>Thông tin cơ bản</Title>
                <p>
                  <strong>Tên sân:</strong> {selectedCourt.name}
                </p>
                <p>
                  <strong>Môn thể thao:</strong>{" "}
                  {getSportTypeDisplay(selectedCourt.sportType)}
                </p>
                <p>
                  <strong>Loại sân:</strong> {selectedCourt.courtType}
                </p>
                <p>
                  <strong>Sức chứa:</strong> {selectedCourt.capacity} người
                </p>
                <p>
                  <strong>Mặt sân:</strong> {selectedCourt.surface}
                </p>
                <p>
                  <strong>Trạng thái:</strong>
                  <Tag
                    color={selectedCourt.isActive ? "success" : "default"}
                    style={{ marginLeft: 8 }}
                  >
                    {selectedCourt.isActive ? "Hoạt động" : "Tạm dừng"}
                  </Tag>
                </p>
              </Col>
              <Col span={12}>
                <Title level={5}>Cơ sở</Title>
                <p>
                  <strong>Tên cơ sở:</strong> {selectedCourt.venueId.name}
                </p>
                <p>
                  <strong>Địa chỉ:</strong>{" "}
                  {selectedCourt.venueId.address.street},{" "}
                  {selectedCourt.venueId.address.ward},{" "}
                  {selectedCourt.venueId.address.district},{" "}
                  {selectedCourt.venueId.address.city}
                </p>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Title level={5}>Kích thước</Title>
                <p>
                  <strong>Chiều dài:</strong> {selectedCourt.dimensions.length}{" "}
                  {selectedCourt.dimensions.unit}
                </p>
                <p>
                  <strong>Chiều rộng:</strong> {selectedCourt.dimensions.width}{" "}
                  {selectedCourt.dimensions.unit}
                </p>
                <p>
                  <strong>Diện tích:</strong>{" "}
                  {(
                    selectedCourt.dimensions.length *
                    selectedCourt.dimensions.width
                  ).toLocaleString()}{" "}
                  {selectedCourt.dimensions.unit}²
                </p>
              </Col>
              <Col span={12}>
                <Title level={5}>Đánh giá & Thống kê</Title>
                <p>
                  <strong>Đánh giá:</strong> {selectedCourt.ratings.average}/5 (
                  {selectedCourt.ratings.count} đánh giá)
                </p>
                <p>
                  <strong>Lượt đặt:</strong>{" "}
                  {selectedCourt.totalBookings.toLocaleString()}
                </p>
                <p>
                  <strong>Doanh thu:</strong>
                  <span style={{ color: "#52c41a", marginLeft: 8 }}>
                    {selectedCourt.totalRevenue.toLocaleString()} VNĐ
                  </span>
                </p>
              </Col>
            </Row>

            {selectedCourt.pricing && selectedCourt.pricing.length > 0 && (
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Title level={5}>Bảng giá</Title>
                  <Table
                    dataSource={selectedCourt.pricing}
                    rowKey="_id"
                    pagination={false}
                    size="small"
                    columns={[
                      {
                        title: "Khung giờ",
                        key: "timeSlot",
                        render: (_, record) =>
                          `${record.timeSlot.start} - ${record.timeSlot.end}`,
                      },
                      {
                        title: "Loại ngày",
                        dataIndex: "dayType",
                        render: (dayType) => (
                          <Tag
                            color={dayType === "weekend" ? "orange" : "blue"}
                          >
                            {dayType === "weekend"
                              ? "Cuối tuần"
                              : "Ngày thường"}
                          </Tag>
                        ),
                      },
                      {
                        title: "Giá/giờ",
                        dataIndex: "pricePerHour",
                        render: (price) => `${price.toLocaleString()} VNĐ`,
                      },
                      {
                        title: "Trạng thái",
                        dataIndex: "isActive",
                        render: (isActive) => (
                          <Tag color={isActive ? "success" : "default"}>
                            {isActive ? "Hoạt động" : "Tạm dừng"}
                          </Tag>
                        ),
                      },
                    ]}
                  />
                </Col>
              </Row>
            )}

            {selectedCourt.equipment && selectedCourt.equipment.length > 0 && (
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Title level={5}>Tiện ích & Thiết bị</Title>
                  <Space wrap>
                    {selectedCourt.equipment.map((item, index) => (
                      <Tag key={index} color="blue">
                        {item}
                      </Tag>
                    ))}
                  </Space>
                </Col>
              </Row>
            )}

            {selectedCourt.description && (
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Title level={5}>Mô tả</Title>
                  <p>{selectedCourt.description}</p>
                </Col>
              </Row>
            )}

            {selectedCourt.images && selectedCourt.images.length > 0 && (
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Title level={5}>Hình ảnh</Title>
                  <Space wrap>
                    {selectedCourt.images.slice(0, 4).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${selectedCourt.name} ${index + 1}`}
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "1px solid #d9d9d9",
                        }}
                      />
                    ))}
                    {selectedCourt.images.length > 4 && (
                      <div
                        style={{
                          width: "100px",
                          height: "100px",
                          backgroundColor: "#f5f5f5",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "8px",
                          border: "1px dashed #d9d9d9",
                          color: "#8c8c8c",
                        }}
                      >
                        +{selectedCourt.images.length - 4}
                      </div>
                    )}
                  </Space>
                </Col>
              </Row>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageCourts;

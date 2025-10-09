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
  InputNumber,
  Select,
  Upload,
  Switch,
  Rate,
  message,
  Spin,
  Image,
  Progress,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  HomeOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import type { ColumnsType } from "antd/es/table";
import { ownerVenueApi, handleApiError } from "@/services/ownerApi";
import { geocodingApi, type Coordinates } from "@/services/geocodingApi";
import { uploadFileAPI } from "@/services/api";

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;
const { TextArea, Search } = Input;

// Venue interface - Updated to match backend structure
interface Venue {
  _id: string;
  id: string;
  name: string;
  description: string;
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
  contactInfo: {
    phone: string;
    email: string;
  };
  images: string[];
  amenities?: any[];
  operatingHours?: any[];
  parking?: {
    available: boolean;
    capacity?: number;
    fee?: number;
  };
  ratings: {
    average: number;
    count: number;
  };
  totalBookings: number;
  totalRevenue: number;
  totalCourts?: number; // Optional field, may not be available from backend
  isActive: boolean;
  isVerified: boolean;
  verifiedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

const ManageVenues = () => {
  const [loading, setLoading] = useState(true);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  const [isVenueModalVisible, setIsVenueModalVisible] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [form] = Form.useForm();
  const [geocoding, setGeocoding] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  // Filter states
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [verifiedFilter, setVerifiedFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [searchText, setSearchText] = useState<string>("");

  // Image management state
  const [venueImages, setVenueImages] = useState<string[]>([]);
  const [, setUploadingImages] = useState<Set<string>>(new Set());
  const [fileList, setFileList] = useState<any[]>([]);

  // Load venues data
  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async (params?: any) => {
    try {
      setLoading(true);
      const response = await ownerVenueApi.getVenues(params);

      if (
        response.success &&
        response.data?.venues &&
        Array.isArray(response.data.venues)
      ) {
        setVenues(response.data.venues);
      } else {
        console.error("API response venues is not an array:", response);
        setVenues([]); // Set empty array as fallback
      }
    } catch (error) {
      const apiError = handleApiError(error);
      setVenues([]); // Set empty array on error
      notification.error({
        message: "Lỗi tải dữ liệu",
        description: apiError.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter venues
  useEffect(() => {
    let filtered = venues;

    // Filter by active status
    if (activeFilter !== "all") {
      filtered = filtered.filter((venue) =>
        activeFilter === "active" ? venue.isActive : !venue.isActive
      );
    }

    // Filter by verified status
    if (verifiedFilter !== "all") {
      filtered = filtered.filter((venue) =>
        verifiedFilter === "verified" ? venue.isVerified : !venue.isVerified
      );
    }

    // Filter by city
    if (cityFilter !== "all") {
      filtered = filtered.filter((venue) => venue.address.city === cityFilter);
    }

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(
        (venue) =>
          venue.name.toLowerCase().includes(searchText.toLowerCase()) ||
          venue.description.toLowerCase().includes(searchText.toLowerCase()) ||
          venue.address.district
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          (venue.address.ward &&
            venue.address.ward.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    setFilteredVenues(filtered);
  }, [venues, activeFilter, verifiedFilter, cityFilter, searchText]);

  // Table columns
  const columns: ColumnsType<Venue> = [
    {
      title: "Cơ sở",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space>
          <Avatar
            src={record.images[0]}
            shape="square"
            size="large"
            icon={<HomeOutlined />}
          />
          <div>
            <div style={{ fontWeight: 600 }}>{text}</div>
            <Text type="secondary">
              {record.address.ward && `${record.address.ward}, `}
              {record.address.district}, {record.address.city}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Liên hệ",
      key: "contact",
      render: (_, record) => (
        <div>
          <div>
            <PhoneOutlined /> {record.contactInfo.phone}
          </div>
          <div>
            <MailOutlined /> {record.contactInfo.email}
          </div>
        </div>
      ),
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      key: "rating",
      render: (rating) => (
        <Space>
          <Rate disabled defaultValue={rating} />
          <Text strong>{rating}</Text>
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Tag color={record.isActive ? "success" : "default"}>
            {record.isActive ? "Hoạt động" : "Tạm dừng"}
          </Tag>
          <Tag color={record.isVerified ? "blue" : "orange"}>
            {record.isVerified ? "Đã xác minh" : "Chờ xác minh"}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Thống kê",
      key: "stats",
      render: (_, record) => (
        <div>
          <div>
            Sân: <Text strong>{record.totalCourts || 0}</Text>
          </div>
          <div>
            Lượt đặt: <Text strong>{record.totalBookings}</Text>
          </div>
          <div>
            Doanh thu:{" "}
            <Text type="success">
              {record.totalRevenue.toLocaleString()} VNĐ
            </Text>
          </div>
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
              onClick={() => handleEditVenue(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteVenue(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Handlers
  const handleAddVenue = () => {
    setEditingVenue(null);
    setCoordinates(null); // Reset coordinates
    setVenueImages([]); // Reset images
    setFileList([]); // Reset fileList
    form.resetFields();
    setIsVenueModalVisible(true);
  };

  const handleViewDetail = (venue: Venue) => {
    setSelectedVenue(venue);
    setDetailModalVisible(true);
  };

  const handleEditVenue = (venue: Venue) => {
    setEditingVenue(venue);

    // Set coordinates if they exist
    if (venue.address.coordinates?.coordinates) {
      const [lng, lat] = venue.address.coordinates.coordinates; // GeoJSON format
      setCoordinates({ lat, lng });
    } else {
      setCoordinates(null);
    }

    form.setFieldsValue({
      ...venue,
      street: venue.address.street,
      ward: venue.address.ward,
      district: venue.address.district,
      city: venue.address.city,
      phone: venue.contactInfo.phone,
      email: venue.contactInfo.email,
      parking: {
        available: venue.parking?.available ?? false,
        capacity: venue.parking?.capacity ?? undefined,
        fee: venue.parking?.fee ?? undefined,
      },
      amenities: Array.isArray(venue.amenities)
        ? venue.amenities.map((a: any) => ({
            name: a?.name || "",
            icon: a?.icon || "",
            description: a?.description || "",
          }))
        : [],
    });

    // Set existing images
    setVenueImages(venue.images || []);

    // Set fileList for Upload component
    setFileList(
      (venue.images || []).map((url, index) => ({
        uid: `existing-${index}`,
        name: `image-${index + 1}`,
        status: "done" as const,
        url: url,
      }))
    );

    setIsVenueModalVisible(true);
  };

  const handleDeleteVenue = (venueId: string) => {
    confirm({
      title: "Xác nhận xóa cơ sở",
      icon: <ExclamationCircleOutlined />,
      content:
        "Bạn có chắc chắn muốn xóa cơ sở này? Tất cả sân thuộc cơ sở cũng sẽ bị xóa.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      async onOk() {
        try {
          const response = await ownerVenueApi.deleteVenue(venueId);
          if (response.success) {
            setVenues(
              Array.isArray(venues)
                ? venues.filter((v) => v.id !== venueId)
                : []
            );
            notification.success({
              message: "Thành công",
              description: "Cơ sở đã được xóa thành công!",
            });
          }
        } catch (error) {
          const apiError = handleApiError(error);
          notification.error({
            message: "Lỗi xóa cơ sở",
            description: apiError.message,
          });
        }
      },
    });
  };

  // Auto-geocode address when fields change
  const handleAddressChange = async () => {
    const street = form.getFieldValue("street");
    const ward = form.getFieldValue("ward");
    const district = form.getFieldValue("district");
    const city = form.getFieldValue("city");

    if (street && ward && district && city) {
      setGeocoding(true);
      const fullAddress = geocodingApi.buildAddressString(
        street,
        ward,
        district,
        city
      );

      try {
        const result = await geocodingApi.getCoordinatesFromAddress(
          fullAddress
        );
        if (result.success) {
          setCoordinates(result.coordinates);
          message.success(
            `Đã tìm thấy tọa độ: ${result.coordinates.lat}, ${result.coordinates.lng}`
          );
        } else {
          message.warning(`Không thể tìm tọa độ cho địa chỉ: ${result.error}`);
          // Set default coordinates for Vietnam (can be Ho Chi Minh City center)
          setCoordinates({ lat: 10.8231, lng: 106.6297 });
        }
        // Reset map loading when coordinates change
        setMapLoading(true);
      } catch (error) {
        console.error("Geocoding error:", error);
        message.error("Lỗi khi tìm tọa độ");
        // Set default coordinates
        setCoordinates({ lat: 10.8231, lng: 106.6297 });
      } finally {
        setGeocoding(false);
      }
    }
  };

  const handleSaveVenue = async (values: any) => {
    try {
      // Make sure we have coordinates
      if (!coordinates) {
        message.warning("Đang tìm tọa độ...");
        await handleAddressChange();

        if (!coordinates) {
          message.error("Không thể xác định tọa độ. Vui lòng thử lại sau.");
          return;
        }
      }

      const amenities = (values.amenities || [])
        .filter((a: any) => a && (a.name || a.description || a.icon))
        .map((a: any) => ({
          name: a.name || "",
          icon: a.icon || "",
          description: a.description || "",
        }));

      const venueData = {
        name: values.name,
        description: values.description,
        address: {
          street: values.street,
          ward: values.ward,
          district: values.district,
          city: values.city,
          coordinates: {
            type: "Point",
            coordinates: [coordinates.lng, coordinates.lat] as [number, number], // GeoJSON format [lng, lat]
          },
        },
        contactInfo: {
          phone: values.phone,
          email: values.email,
        },
        images: venueImages, // Include images in the save data
        parking: {
          available: values.parking?.available ?? false,
          capacity: values.parking?.capacity ?? undefined,
          fee: values.parking?.fee ?? undefined,
        },
        amenities,
        isActive: values.isActive ?? true,
      };

      let response;
      if (editingVenue) {
        // Update existing venue
        response = await ownerVenueApi.updateVenue(editingVenue.id, venueData);
        if (response.success) {
          setVenues(
            Array.isArray(venues)
              ? venues.map((v) =>
                  v.id === editingVenue.id ? { ...v, ...venueData } : v
                )
              : []
          );
          notification.success({
            message: "Thành công",
            description: "Thông tin cơ sở đã được cập nhật!",
          });
        }
      } else {
        // Add new venue
        response = await ownerVenueApi.createVenue(venueData);
        if (response.success) {
          // Reload venues to get updated list
          loadVenues();
          notification.success({
            message: "Thành công",
            description: "Cơ sở mới đã được thêm thành công!",
          });
        }
      }
      setIsVenueModalVisible(false);
      setCoordinates(null); // Reset coordinates
    } catch (error) {
      const apiError = handleApiError(error);
      notification.error({
        message: "Lỗi lưu cơ sở",
        description: apiError.message,
      });
    }
  };

  // Calculate statistics with defensive coding
  const activeVenues = Array.isArray(venues)
    ? venues.filter((v) => v.isActive).length
    : 0;
  const verifiedVenues = Array.isArray(venues)
    ? venues.filter((v) => v.isVerified).length
    : 0;
  const totalBookings = Array.isArray(venues)
    ? venues.reduce((sum, venue) => sum + (venue.totalBookings || 0), 0)
    : 0;

  // Get unique cities for filter dropdown
  const uniqueCities = Array.isArray(venues)
    ? [...new Set(venues.map((venue) => venue.address?.city).filter(Boolean))]
    : [];

  // Clear all filters
  const clearFilters = () => {
    setActiveFilter("all");
    setVerifiedFilter("all");
    setCityFilter("all");
    setSearchText("");
  };

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
          <HomeOutlined /> Quản lý cơ sở thể thao
        </Title>
        <Text type="secondary">
          Quản lý thông tin các cơ sở thể thao và địa điểm
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
                {Array.isArray(venues) ? venues.length : 0}
              </div>
              <div style={{ color: "#8c8c8c" }}>Tổng cơ sở</div>
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
                {activeVenues}
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
                  color: "#722ed1",
                }}
              >
                {verifiedVenues}
              </div>
              <div style={{ color: "#8c8c8c" }}>Đã xác minh</div>
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
                  color: "#fa8c16",
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
          <Col xs={24} sm={8}>
            <Search
              placeholder="Tìm theo tên cơ sở, mô tả, phường/quận..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "100%" }}
            />
          </Col>
          <Col xs={24} sm={5}>
            <Select
              placeholder="Trạng thái hoạt động"
              style={{ width: "100%" }}
              value={activeFilter}
              onChange={setActiveFilter}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="active">Đang hoạt động</Option>
              <Option value="inactive">Tạm dừng</Option>
            </Select>
          </Col>
          <Col xs={24} sm={5}>
            <Select
              placeholder="Trạng thái xác minh"
              style={{ width: "100%" }}
              value={verifiedFilter}
              onChange={setVerifiedFilter}
            >
              <Option value="all">Tất cả xác minh</Option>
              <Option value="verified">Đã xác minh</Option>
              <Option value="unverified">Chưa xác minh</Option>
            </Select>
          </Col>
          <Col xs={24} sm={4}>
            <Select
              placeholder="Thành phố"
              style={{ width: "100%" }}
              value={cityFilter}
              onChange={setCityFilter}
            >
              <Option value="all">Tất cả thành phố</Option>
              {uniqueCities.map((city) => (
                <Option key={city} value={city}>
                  {city}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={2}>
            <Button onClick={clearFilters} style={{ width: "100%" }}>
              Xóa bộ lọc
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Venues Management */}
      <Card
        title={`Danh sách cơ sở thể thao (${filteredVenues.length})`}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddVenue}
          >
            Thêm cơ sở mới
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredVenues}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} cơ sở`,
          }}
        />
      </Card>

      {/* Venue Modal */}
      <Modal
        title={editingVenue ? "Chỉnh sửa cơ sở" : "Thêm cơ sở mới"}
        open={isVenueModalVisible}
        onCancel={() => setIsVenueModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveVenue}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Tên cơ sở"
                name="name"
                rules={[
                  { required: true, message: "Vui lòng nhập tên cơ sở!" },
                ]}
              >
                <Input placeholder="Nhập tên cơ sở" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                ]}
              >
                <Input placeholder="028-1234-5678" />
              </Form.Item>
            </Col>
          </Row>

          {/* Amenities Section */}
          <Card size="small" style={{ marginBottom: 16 }}>
            <Title level={5} style={{ marginBottom: 12 }}>
              Tiện ích (Amenities)
            </Title>
            <Form.List name="amenities">
              {(fields, { add, remove }) => (
                <div>
                  {fields.map(({ key, name, ...restField }) => (
                    <Row
                      key={key}
                      gutter={12}
                      align="middle"
                      style={{ marginBottom: 8 }}
                    >
                      <Col xs={24} md={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "name"]}
                          label="Tên tiện ích"
                          rules={[
                            { required: true, message: "Nhập tên tiện ích" },
                          ]}
                        >
                          <Input placeholder="Wifi miễn phí" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "icon"]}
                          label="Icon"
                        >
                          <Input placeholder="fa-wifi hoặc URL icon" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={10}>
                        <Form.Item
                          {...restField}
                          name={[name, "description"]}
                          label="Mô tả"
                        >
                          <Input placeholder="Mạng wifi tốc độ cao miễn phí" />
                        </Form.Item>
                      </Col>
                      <Col
                        xs={24}
                        md={2}
                        style={{ display: "flex", alignItems: "end" }}
                      >
                        <Button danger onClick={() => remove(name)}>
                          Xóa
                        </Button>
                      </Col>
                    </Row>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                  >
                    Thêm tiện ích
                  </Button>
                </div>
              )}
            </Form.List>
          </Card>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input placeholder="info@example.com" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Thành phố"
                name="city"
                rules={[
                  { required: true, message: "Vui lòng nhập thành phố!" },
                ]}
              >
                <Input placeholder="TP. Hồ Chí Minh" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Phường/Xã"
                name="ward"
                rules={[
                  { required: true, message: "Vui lòng nhập phường/xã!" },
                ]}
              >
                <Input placeholder="Phường Mỹ An" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Quận/Huyện"
                name="district"
                rules={[
                  { required: true, message: "Vui lòng nhập quận/huyện!" },
                ]}
              >
                <Input placeholder="Ngũ Hành Sơn" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Địa chỉ cụ thể"
                name="street"
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
              >
                <Input placeholder="23 Hồ Xuân Hương" />
              </Form.Item>
            </Col>
          </Row>

          {/* Geocoding Section */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col xs={24} md={12}>
              <Button
                icon={<EnvironmentOutlined />}
                onClick={handleAddressChange}
                loading={geocoding}
                type="dashed"
                style={{ width: "100%" }}
              >
                {geocoding ? "Đang tìm tọa độ..." : "Tìm tọa độ từ địa chỉ"}
              </Button>
            </Col>
            <Col xs={24} md={12}>
              {coordinates && (
                <div
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "#f6ffed",
                    border: "1px solid #b7eb8f",
                    borderRadius: "6px",
                  }}
                >
                  <Text type="success">
                    <EnvironmentOutlined /> Tọa độ: {coordinates.lat.toFixed(6)}
                    , {coordinates.lng.toFixed(6)}
                  </Text>
                </div>
              )}
              {!coordinates && (
                <div
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "#fff2e8",
                    border: "1px solid #ffbb96",
                    borderRadius: "6px",
                  }}
                >
                  <Text type="warning">
                    Chưa có tọa độ - hãy nhập đầy đủ địa chỉ và bấm "Tìm tọa độ"
                  </Text>
                </div>
              )}
            </Col>
          </Row>

          {/* Google Maps Preview */}
          {coordinates && (
            <Row style={{ marginBottom: 16 }}>
              <Col xs={24}>
                <Card
                  size="small"
                  title={
                    <Text>
                      <EnvironmentOutlined style={{ color: "#1890ff" }} /> Xem
                      trước vị trí trên bản đồ
                    </Text>
                  }
                >
                  {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
                    <div
                      style={{
                        width: "100%",
                        height: "300px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: "1px solid #d9d9d9",
                        position: "relative",
                      }}
                    >
                      {mapLoading && (
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            backgroundColor: "rgba(255,255,255,0.9)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 10,
                            borderRadius: "8px",
                          }}
                        >
                          <Spin
                            size="large"
                            tip={
                              <Text
                                type="secondary"
                                style={{ marginTop: "8px" }}
                              >
                                Đang tải bản đồ...
                              </Text>
                            }
                          />
                        </div>
                      )}
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps/embed/v1/place?key=${
                          import.meta.env.VITE_GOOGLE_MAPS_API_KEY
                        }&q=${coordinates.lat},${
                          coordinates.lng
                        }&zoom=16&maptype=roadmap`}
                        onLoad={() => setMapLoading(false)}
                        onLoadStart={() => setMapLoading(true)}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "300px",
                        backgroundColor: "#f5f5f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        borderRadius: "8px",
                        border: "1px dashed #d9d9d9",
                      }}
                    >
                      <EnvironmentOutlined
                        style={{
                          fontSize: "48px",
                          color: "#bfbfbf",
                          marginBottom: "16px",
                        }}
                      />
                      <Text
                        type="secondary"
                        style={{ fontSize: "16px", marginBottom: "8px" }}
                      >
                        Google Maps Preview
                      </Text>
                      <Text
                        type="secondary"
                        style={{ fontSize: "14px", textAlign: "center" }}
                      >
                        Cần Google Maps API key để hiển thị bản đồ
                        <br />
                        Tọa độ: {coordinates.lat.toFixed(6)},{" "}
                        {coordinates.lng.toFixed(6)}
                      </Text>
                      <Button
                        type="link"
                        size="small"
                        onClick={() => {
                          window.open(
                            `https://www.google.com/maps/place/${coordinates.lat},${coordinates.lng}`,
                            "_blank"
                          );
                        }}
                        style={{ marginTop: "12px" }}
                      >
                        Mở trên Google Maps ↗
                      </Button>
                    </div>
                  )}
                  <div
                    style={{
                      marginTop: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 0",
                      borderTop: "1px solid #f0f0f0",
                    }}
                  >
                    <div
                      style={{
                        color: "#8c8c8c",
                        fontSize: "12px",
                        flex: 1,
                      }}
                    >
                      📍{" "}
                      {geocodingApi.buildAddressString(
                        form.getFieldValue("street") || "",
                        form.getFieldValue("ward") || "",
                        form.getFieldValue("district") || "",
                        form.getFieldValue("city") || ""
                      )}
                    </div>
                    <Space size="small">
                      <Button
                        size="small"
                        type="text"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${coordinates.lat}, ${coordinates.lng}`
                          );
                          message.success("Đã copy tọa độ vào clipboard!");
                        }}
                        title="Copy tọa độ"
                      >
                        📋
                      </Button>
                      <Button
                        size="small"
                        type="text"
                        onClick={() => {
                          window.open(
                            `https://www.google.com/maps/place/${coordinates.lat},${coordinates.lng}`,
                            "_blank"
                          );
                        }}
                        title="Mở trên Google Maps"
                      >
                        🌍
                      </Button>
                    </Space>
                  </div>
                </Card>
              </Col>
            </Row>
          )}

          <Form.Item label="Mô tả" name="description">
            <TextArea rows={4} placeholder="Mô tả về cơ sở thể thao..." />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Trạng thái hoạt động"
                name="isActive"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch
                  checkedChildren="Hoạt động"
                  unCheckedChildren="Tạm dừng"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Trạng thái xác minh"
                name="isVerified"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch
                  checkedChildren="Đã xác minh"
                  unCheckedChildren="Chưa xác minh"
                  disabled
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Hình ảnh">
                <Image.PreviewGroup>
                  <Upload
                    multiple
                    listType="picture-card"
                    fileList={fileList}
                    showUploadList={{ showPreviewIcon: false }}
                    onChange={(info) => {
                      setFileList(info.fileList);

                      if (info.file.status === "done") {
                        notification.success({
                          message: "Upload thành công",
                          description: `${info.file.name} đã được tải lên.`,
                        });
                      } else if (info.file.status === "error") {
                        notification.error({
                          message: "Upload thất bại",
                          description: `${info.file.name} upload thất bại.`,
                        });
                      }
                    }}
                    onDrop={(e) => {
                      console.log("Files dropped:", e.dataTransfer.files);
                    }}
                    beforeUpload={(file) => {
                      console.log("beforeUpload called:", file);
                      return true; // Allow upload
                    }}
                    customRequest={async ({
                      file,
                      onSuccess,
                      onError,
                      onProgress,
                    }) => {
                      const fileObj = file as any;
                      const fileId = fileObj.uid || `upload-${Date.now()}`;

                      try {
                        console.log("Starting upload for venue:", file);

                        // Add to uploading set
                        setUploadingImages((prev) => new Set(prev).add(fileId));

                        // Simulate progress for better UX
                        onProgress?.({ percent: 20 });

                        // Get current form values to extract venueId if editing
                        const venueId = editingVenue?._id || editingVenue?.id;
                        console.log("VenueId:", venueId);

                        onProgress?.({ percent: 40 });

                        const response = await uploadFileAPI(
                          file as File,
                          "venue",
                          {
                            ...(venueId && { "venue-id": venueId }),
                          }
                        );

                        onProgress?.({ percent: 80 });

                        console.log("Upload response:", response);
                        if (response?.data?.fileUploaded) {
                          // Add new image to the list
                          setVenueImages((prev) => [
                            ...prev,
                            response.data!.fileUploaded,
                          ]);

                          onProgress?.({ percent: 100 });
                          onSuccess?.(response.data);
                        } else {
                          onError?.(new Error("Upload failed"));
                        }
                      } catch (error) {
                        console.error("Upload error:", error);
                        onError?.(error as Error);
                      } finally {
                        // Remove from uploading set
                        setUploadingImages((prev) => {
                          const newSet = new Set(prev);
                          newSet.delete(fileId);
                          return newSet;
                        });
                      }
                    }}
                    onRemove={(file) => {
                      // Remove image from list
                      if (file.uid.startsWith("existing-")) {
                        const index = parseInt(
                          file.uid.replace("existing-", "")
                        );
                        // Update venueImages state
                        setVenueImages((prev) =>
                          prev.filter((_, i) => i !== index)
                        );
                        // Also update fileList to reflect the change in UI
                        setFileList((prev) =>
                          prev.filter((item) => item.uid !== file.uid)
                        );
                      } else {
                        // For newly uploaded files, just remove from fileList
                        setFileList((prev) =>
                          prev.filter((item) => item.uid !== file.uid)
                        );
                      }
                      return true;
                    }}
                    itemRender={(originNode, file) => {
                      // Check if this file is currently uploading
                      const isUploading = file.status === "uploading";

                      // For uploaded images (both existing and newly uploaded)
                      if (
                        file.status === "done" &&
                        (file.url || file.response?.fileUploaded)
                      ) {
                        const imageUrl =
                          file.url || file.response?.fileUploaded;
                        return (
                          <div style={{ position: "relative" }}>
                            <Image
                              src={imageUrl}
                              width={104}
                              height={104}
                              style={{
                                objectFit: "cover",
                                borderRadius: "8px",
                              }}
                              preview={{
                                mask: (
                                  <div
                                    style={{
                                      fontSize: "14px",
                                      color: "white",
                                      textAlign: "center",
                                    }}
                                  >
                                    <div>🔍 Xem ảnh</div>
                                  </div>
                                ),
                                destroyOnClose: true,
                                maskClassName: "custom-preview-mask",
                              }}
                            />
                            {/* Remove button */}
                            <Button
                              type="text"
                              danger
                              size="small"
                              style={{
                                position: "absolute",
                                top: "4px",
                                right: "4px",
                                backgroundColor: "rgba(0,0,0,0.5)",
                                color: "white",
                                border: "none",
                                borderRadius: "50%",
                                width: "20px",
                                height: "20px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "12px",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log(
                                  "Remove button clicked for file:",
                                  file
                                );
                                if (file.uid.startsWith("existing-")) {
                                  const index = parseInt(
                                    file.uid.replace("existing-", "")
                                  );
                                  setVenueImages((prev) => {
                                    const newImages = prev.filter(
                                      (_, i) => i !== index
                                    );
                                    console.log(
                                      "Updated venueImages:",
                                      newImages
                                    );
                                    return newImages;
                                  });
                                  setFileList((prev) => {
                                    const newFileList = prev.filter(
                                      (item) => item.uid !== file.uid
                                    );
                                    console.log(
                                      "Updated fileList:",
                                      newFileList
                                    );
                                    return newFileList;
                                  });
                                } else {
                                  setFileList((prev) => {
                                    const newFileList = prev.filter(
                                      (item) => item.uid !== file.uid
                                    );
                                    console.log(
                                      "Updated fileList:",
                                      newFileList
                                    );
                                    return newFileList;
                                  });
                                }
                              }}
                            >
                              ×
                            </Button>
                          </div>
                        );
                      }

                      // For uploading files - show loading state
                      if (isUploading) {
                        return (
                          <div
                            style={{
                              position: "relative",
                              width: 104,
                              height: 104,
                              backgroundColor: "#f5f5f5",
                              borderRadius: "8px",
                              border: "1px dashed #d9d9d9",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexDirection: "column",
                            }}
                          >
                            <Spin size="large" />
                            <div
                              style={{
                                marginTop: 8,
                                fontSize: "12px",
                                color: "#666",
                                textAlign: "center",
                              }}
                            >
                              Đang tải lên...
                            </div>
                            {file.percent !== undefined && (
                              <Progress
                                percent={Math.round(file.percent)}
                                size="small"
                                style={{
                                  width: "80px",
                                  marginTop: 4,
                                }}
                                strokeWidth={2}
                              />
                            )}
                          </div>
                        );
                      }

                      // For error state or other statuses, use original node
                      return originNode;
                    }}
                  >
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Tải lên</div>
                    </div>
                  </Upload>
                </Image.PreviewGroup>
              </Form.Item>
            </Col>
          </Row>

          {/* Parking Section */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Bãi đỗ xe"
                name={["parking", "available"]}
                valuePropName="checked"
                initialValue={false}
              >
                <Switch checkedChildren="Có" unCheckedChildren="Không" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Sức chứa (số chỗ)"
                name={["parking", "capacity"]}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const avail = getFieldValue(["parking", "available"]);
                      if (avail) {
                        if (
                          value === undefined ||
                          value === null ||
                          value === ""
                        ) {
                          return Promise.reject(
                            new Error("Vui lòng nhập sức chứa khi có bãi đỗ xe")
                          );
                        }
                        if (value < 0) {
                          return Promise.reject(
                            new Error("Sức chứa phải là số dương")
                          );
                        }
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Phí gửi (VNĐ)"
                name={["parking", "fee"]}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const avail = getFieldValue(["parking", "available"]);
                      if (avail) {
                        if (
                          value === undefined ||
                          value === null ||
                          value === ""
                        ) {
                          return Promise.reject(
                            new Error("Vui lòng nhập phí gửi khi có bãi đỗ xe")
                          );
                        }
                        if (value < 0) {
                          return Promise.reject(
                            new Error("Phí phải là số dương")
                          );
                        }
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: "24px", textAlign: "right" }}>
            <Space>
              <Button onClick={() => setIsVenueModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingVenue ? "Cập nhật" : "Thêm cơ sở"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết cơ sở thể thao"
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
              if (selectedVenue) {
                setDetailModalVisible(false);
                handleEditVenue(selectedVenue);
              }
            }}
          >
            Chỉnh sửa
          </Button>,
        ]}
        width={800}
      >
        {selectedVenue && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Title level={5}>Thông tin cơ bản</Title>
                <p>
                  <strong>Tên cơ sở:</strong> {selectedVenue.name}
                </p>
                <p>
                  <strong>Mô tả:</strong>{" "}
                  {selectedVenue.description || "Chưa có mô tả"}
                </p>
                <p>
                  <strong>Trạng thái:</strong>
                  <Tag
                    color={selectedVenue.isActive ? "success" : "default"}
                    style={{ marginLeft: 8 }}
                  >
                    {selectedVenue.isActive ? "Hoạt động" : "Tạm dừng"}
                  </Tag>
                </p>
                <p>
                  <strong>Xác minh:</strong>
                  <Tag
                    color={selectedVenue.isVerified ? "blue" : "orange"}
                    style={{ marginLeft: 8 }}
                  >
                    {selectedVenue.isVerified ? "Đã xác minh" : "Chờ xác minh"}
                  </Tag>
                </p>
              </Col>
              <Col span={12}>
                <Title level={5}>Liên hệ</Title>
                <p>
                  <strong>Điện thoại:</strong> {selectedVenue.contactInfo.phone}
                </p>
                <p>
                  <strong>Email:</strong> {selectedVenue.contactInfo.email}
                </p>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Title level={5}>Địa chỉ</Title>
                <p>
                  <strong>Địa chỉ cụ thể:</strong>{" "}
                  {selectedVenue.address.street}
                </p>
                <p>
                  <strong>Phường/Xã:</strong> {selectedVenue.address.ward}
                </p>
                <p>
                  <strong>Quận/Huyện:</strong> {selectedVenue.address.district}
                </p>
                <p>
                  <strong>Thành phố:</strong> {selectedVenue.address.city}
                </p>
                {selectedVenue.address.coordinates && (
                  <p>
                    <strong>Tọa độ:</strong>
                    <span style={{ marginLeft: 8, color: "#52c41a" }}>
                      {selectedVenue.address.coordinates.coordinates[1].toFixed(
                        6
                      )}
                      ,
                      {selectedVenue.address.coordinates.coordinates[0].toFixed(
                        6
                      )}
                    </span>
                    <Button
                      size="small"
                      type="text"
                      onClick={() => {
                        const [lng, lat] =
                          selectedVenue.address.coordinates!.coordinates;
                        navigator.clipboard.writeText(`${lat}, ${lng}`);
                        message.success("Đã copy tọa độ vào clipboard!");
                      }}
                      title="Copy tọa độ"
                    >
                      📋
                    </Button>
                    <Button
                      size="small"
                      type="text"
                      onClick={() => {
                        const [lng, lat] =
                          selectedVenue.address.coordinates!.coordinates;
                        window.open(
                          `https://www.google.com/maps/place/${lat},${lng}`,
                          "_blank"
                        );
                      }}
                      title="Mở trên Google Maps"
                    >
                      🌍
                    </Button>
                  </p>
                )}
              </Col>
              <Col span={12}>
                <Title level={5}>Thống kê</Title>
                <p>
                  <strong>Tổng số sân:</strong> {selectedVenue.totalCourts || 0}
                </p>
                {selectedVenue.parking && (
                  <p>
                    <strong>Bãi đỗ xe:</strong>{" "}
                    {selectedVenue.parking.available ? (
                      <span style={{ color: "#52c41a" }}>
                        Có
                        {selectedVenue.parking.capacity
                          ? ` - ${selectedVenue.parking.capacity} chỗ`
                          : ""}{" "}
                        {selectedVenue.parking.fee
                          ? `- ${selectedVenue.parking.fee.toLocaleString()} VNĐ`
                          : ""}
                      </span>
                    ) : (
                      <span>Không</span>
                    )}
                  </p>
                )}
                <p>
                  <strong>Lượt đặt:</strong>{" "}
                  {selectedVenue.totalBookings.toLocaleString()}
                </p>
                <p>
                  <strong>Doanh thu:</strong>
                  <span style={{ color: "#52c41a", marginLeft: 8 }}>
                    {selectedVenue.totalRevenue.toLocaleString()} VNĐ
                  </span>
                </p>
                <p>
                  <strong>Đánh giá:</strong> {selectedVenue.ratings.average}/5 (
                  {selectedVenue.ratings.count} đánh giá)
                </p>
              </Col>
            </Row>

            {selectedVenue.address.coordinates && (
              <Row style={{ marginTop: 16 }}>
                <Col span={24}>
                  <Title level={5}>Bản đồ</Title>
                  {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
                    <div
                      style={{
                        width: "100%",
                        height: "250px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: "1px solid #d9d9d9",
                      }}
                    >
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps/embed/v1/place?key=${
                          import.meta.env.VITE_GOOGLE_MAPS_API_KEY
                        }&q=${
                          selectedVenue.address.coordinates.coordinates[1]
                        },${
                          selectedVenue.address.coordinates.coordinates[0]
                        }&zoom=16&maptype=roadmap`}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        height: "120px",
                        backgroundColor: "#f5f5f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "8px",
                        border: "1px dashed #d9d9d9",
                      }}
                    >
                      <Button
                        type="link"
                        onClick={() => {
                          const [lng, lat] =
                            selectedVenue.address.coordinates!.coordinates;
                          window.open(
                            `https://www.google.com/maps/place/${lat},${lng}`,
                            "_blank"
                          );
                        }}
                      >
                        Xem trên Google Maps ↗
                      </Button>
                    </div>
                  )}
                </Col>
              </Row>
            )}

            {selectedVenue.images && selectedVenue.images.length > 0 && (
              <Row style={{ marginTop: 16 }}>
                <Col span={24}>
                  <Title level={5}>
                    Hình ảnh ({selectedVenue.images.length} ảnh)
                  </Title>
                  <Image.PreviewGroup>
                    <Space wrap>
                      {selectedVenue.images.map((image, index) => (
                        <Image
                          key={index}
                          src={image}
                          alt={`${selectedVenue.name} ${index + 1}`}
                          width={100}
                          height={100}
                          style={{
                            objectFit: "cover",
                            borderRadius: "8px",
                            border: "1px solid #d9d9d9",
                          }}
                          preview={{
                            mask: (
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "white",
                                  textAlign: "center",
                                }}
                              >
                                🔍 Xem
                              </div>
                            ),
                          }}
                        />
                      ))}
                    </Space>
                  </Image.PreviewGroup>
                </Col>
              </Row>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageVenues;

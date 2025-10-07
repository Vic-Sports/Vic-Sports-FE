import { uploadFileAPI } from "@/services/api";
import {
  handleApiError,
  ownerCourtApi,
  ownerTournamentApi,
  ownerVenueApi,
} from "@/services/ownerApi";
import type {
  Tournament,
  TournamentFormData
} from "@/types/tournament";
import {
  getTournamentFormatDisplay,
  getTournamentStatusColor,
  getTournamentStatusDisplay,
} from "@/utils/tournamentHelpers";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  DollarOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  StopOutlined,
  TeamOutlined,
  TrophyOutlined
} from "@ant-design/icons";
import type { UploadFile } from "antd";
import {
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  notification,
  Progress,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  Upload
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;
const { TextArea, Search } = Input;
const { TabPane } = Tabs;

const ManageTournaments = () => {
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [courts, setCourts] = useState<any[]>([]);
  const [isTournamentModalVisible, setIsTournamentModalVisible] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [form] = Form.useForm();
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sportFilter, setSportFilter] = useState<string>("all");
  const [venueFilter, setVenueFilter] = useState<string>("all");
  const [searchText, setSearchText] = useState<string>("");

  // Image management state
  const [tournamentImages, setTournamentImages] = useState<string[]>([]);
  const [tournamentFileList, setTournamentFileList] = useState<UploadFile[]>([]);

  // Load data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Load venues, courts, and tournaments in parallel
      const [venuesRes, courtsRes, tournamentsRes] = await Promise.all([
        ownerVenueApi.getVenues(),
        ownerCourtApi.getCourts(),
        ownerTournamentApi.getTournaments(),
      ]);

      if (venuesRes.success && venuesRes.data?.venues) {
        setVenues(venuesRes.data.venues);
      }

      if (courtsRes.success && courtsRes.data?.courts) {
        setCourts(courtsRes.data.courts);
      }

      if (tournamentsRes.success && tournamentsRes.data?.tournaments) {
        setTournaments(tournamentsRes.data.tournaments);
      }
    } catch (error) {
      const apiError = handleApiError(error);
      notification.error({
        message: "Lỗi tải dữ liệu",
        description: apiError.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter tournaments
  useEffect(() => {
    let filtered = tournaments;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((tournament) => tournament.status === statusFilter);
    }

    // Filter by sport type
    if (sportFilter !== "all") {
      filtered = filtered.filter((tournament) => tournament.sportType === sportFilter);
    }

    // Filter by venue
    if (venueFilter !== "all") {
      filtered = filtered.filter((tournament) => tournament.venueId._id === venueFilter);
    }

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(
        (tournament) =>
          tournament.name.toLowerCase().includes(searchText.toLowerCase()) ||
          (tournament.description &&
            tournament.description.toLowerCase().includes(searchText.toLowerCase())) ||
          tournament.venueId.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredTournaments(filtered);
  }, [tournaments, statusFilter, sportFilter, venueFilter, searchText]);

  // Table columns
  const columns: ColumnsType<Tournament> = [
    {
      title: "Giải đấu",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space>
          <Avatar
            src={record.gallery[0]}
            shape="square"
            size="large"
            icon={<TrophyOutlined />}
          />
          <div>
            <div style={{ fontWeight: 600 }}>{text}</div>
            <Text type="secondary">{record.venueId.name}</Text>
            <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
              {record.sportType} • {getTournamentFormatDisplay(record.tournamentType)}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Thời gian",
      key: "schedule",
      render: (_, record) => (
        <div>
          <div>
            <CalendarOutlined /> {dayjs(record.startDate).format("DD/MM/YYYY")}
          </div>
          <div>
            <ClockCircleOutlined /> {dayjs(record.endDate).format("DD/MM/YYYY")}
          </div>
          <Text type="secondary">
            Đăng ký: {dayjs(record.registrationStartDate).format("DD/MM")} - {dayjs(record.registrationEndDate).format("DD/MM")}
          </Text>
        </div>
      ),
    },
    {
      title: "Tham gia",
      key: "participants",
      render: (_, record) => (
        <div>
          <div>
            <TeamOutlined /> {record.currentParticipants}/{record.maxParticipants}
          </div>
          <Progress
            percent={Math.round((record.currentParticipants / record.maxParticipants) * 100)}
            size="small"
            strokeColor={record.currentParticipants >= record.minParticipants ? "#52c41a" : "#fa8c16"}
          />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Tối thiểu: {record.minParticipants}
          </Text>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => (
        <Tag color={getTournamentStatusColor(record.status)}>
          {getTournamentStatusDisplay(record.status)}
        </Tag>
      ),
    },
    {
      title: "Phí & Giải thưởng",
      key: "prizes",
      render: (_, record) => (
        <div>
          <div>
            <DollarOutlined /> {record.registrationFee.toLocaleString()} VNĐ
          </div>
          <div>
            <TrophyOutlined /> {record.prizePool.toLocaleString()} VNĐ
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
              onClick={() => handleEditTournament(record)}
            />
          </Tooltip>
          {record.status === "upcoming" && (
            <Tooltip title="Bắt đầu">
              <Button
                type="text"
                icon={<PlayCircleOutlined />}
                style={{ color: "#52c41a" }}
                onClick={() => handleStartTournament(record._id)}
              />
            </Tooltip>
          )}
          {record.status === "ongoing" && (
            <Tooltip title="Kết thúc">
              <Button
                type="text"
                icon={<StopOutlined />}
                style={{ color: "#fa8c16" }}
                onClick={() => handleEndTournament(record._id)}
              />
            </Tooltip>
          )}
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteTournament(record._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Handlers
  const handleAddTournament = () => {
    setEditingTournament(null);
    setTournamentImages([]);
    setTournamentFileList([]);
    form.resetFields();
    setIsTournamentModalVisible(true);
  };

  const handleViewDetail = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setDetailModalVisible(true);
  };

  const handleEditTournament = (tournament: Tournament) => {
    setEditingTournament(tournament);
    
    form.setFieldsValue({
      ...tournament,
      startDate: dayjs(tournament.startDate),
      endDate: dayjs(tournament.endDate),
      registrationStartDate: dayjs(tournament.registrationStartDate),
      registrationEndDate: dayjs(tournament.registrationEndDate),
      // Removed courtIds as it's not in the model anymore
    });

    setTournamentImages(tournament.gallery || []);
    setTournamentFileList(
      (tournament.gallery || []).map((url, index) => ({
        uid: `existing-${index}`,
        name: `image-${index + 1}`,
        status: "done" as const,
        url: url,
      }))
    );

    setIsTournamentModalVisible(true);
  };

  const handleDeleteTournament = (tournamentId: string) => {
    confirm({
      title: "Xác nhận xóa giải đấu",
      icon: <ExclamationCircleOutlined />,
      content: "Bạn có chắc chắn muốn xóa giải đấu này? Tất cả dữ liệu liên quan sẽ bị xóa.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      async onOk() {
        try {
          const response = await ownerTournamentApi.deleteTournament(tournamentId);
          if (response.success) {
            setTournaments(tournaments.filter((t) => t._id !== tournamentId));
            notification.success({
              message: "Thành công",
              description: "Giải đấu đã được xóa thành công!",
            });
          }
        } catch (error) {
          const apiError = handleApiError(error);
          notification.error({
            message: "Lỗi xóa giải đấu",
            description: apiError.message,
          });
        }
      },
    });
  };

  const handleStartTournament = async (tournamentId: string) => {
    try {
      const response = await ownerTournamentApi.startTournament(tournamentId);
      if (response.success) {
        setTournaments(
          tournaments.map((t) =>
            t._id === tournamentId ? { ...t, status: "ongoing" as const } : t
          )
        );
        notification.success({
          message: "Thành công",
          description: "Giải đấu đã được bắt đầu!",
        });
      }
    } catch (error) {
      const apiError = handleApiError(error);
      notification.error({
        message: "Lỗi bắt đầu giải đấu",
        description: apiError.message,
      });
    }
  };

  const handleEndTournament = async (tournamentId: string) => {
    try {
      const response = await ownerTournamentApi.cancelTournament(tournamentId, "Kết thúc giải đấu");
      if (response.success) {
        setTournaments(
          tournaments.map((t) =>
            t._id === tournamentId ? { ...t, status: "completed" as const } : t
          )
        );
        notification.success({
          message: "Thành công",
          description: "Giải đấu đã được kết thúc!",
        });
      }
    } catch (error) {
      const apiError = handleApiError(error);
      notification.error({
        message: "Lỗi kết thúc giải đấu",
        description: apiError.message,
      });
    }
  };

  const handleSaveTournament = async (values: TournamentFormData) => {
    try {
      const tournamentData = {
        ...values,
        startDate: dayjs(values.startDate).format("YYYY-MM-DD"),
        endDate: dayjs(values.endDate).format("YYYY-MM-DD"),
        registrationStartDate: dayjs(values.registrationStartDate).format("YYYY-MM-DD"),
        registrationEndDate: dayjs(values.registrationEndDate).format("YYYY-MM-DD"),
        images: tournamentImages,
      };

      let response;
      if (editingTournament) {
        response = await ownerTournamentApi.updateTournament(editingTournament._id, tournamentData);
        if (response.success) {
          loadInitialData();
          notification.success({
            message: "Thành công",
            description: "Thông tin giải đấu đã được cập nhật!",
          });
        }
      } else {
        response = await ownerTournamentApi.createTournament(tournamentData);
        if (response.success) {
          loadInitialData();
          notification.success({
            message: "Thành công",
            description: "Giải đấu mới đã được tạo thành công!",
          });
        }
      }
      setIsTournamentModalVisible(false);
    } catch (error) {
      const apiError = handleApiError(error);
      notification.error({
        message: "Lỗi lưu giải đấu",
        description: apiError.message,
      });
    }
  };

  // Calculate statistics
  const totalTournaments = tournaments.length;
  const activeTournaments = tournaments.filter((t) => t.status === "ongoing" || t.status === "registration_open").length;
  const upcomingTournaments = tournaments.filter((t) => t.status === "upcoming").length;
  const ongoingTournaments = tournaments.filter((t) => t.status === "ongoing").length;

  // Get unique values for filter dropdowns
  const uniqueSports = [...new Set(tournaments.map((t) => t.sportType))];

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter("all");
    setSportFilter("all");
    setVenueFilter("all");
    setSearchText("");
  };

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
          <TrophyOutlined /> Quản lý giải đấu
        </Title>
        <Text type="secondary">
          Tạo và quản lý các giải đấu thể thao
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
                {totalTournaments}
              </div>
              <div style={{ color: "#8c8c8c" }}>Tổng giải đấu</div>
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
                {activeTournaments}
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
                {upcomingTournaments}
              </div>
              <div style={{ color: "#8c8c8c" }}>Sắp diễn ra</div>
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
                {ongoingTournaments}
              </div>
              <div style={{ color: "#8c8c8c" }}>Đang diễn ra</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={6}>
            <Search
              placeholder="Tìm theo tên giải đấu..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "100%" }}
            />
          </Col>
          <Col xs={12} sm={4}>
            <Select
              placeholder="Trạng thái"
              style={{ width: "100%" }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="upcoming">Sắp diễn ra</Option>
              <Option value="registration_open">Mở đăng ký</Option>
              <Option value="ongoing">Đang diễn ra</Option>
              <Option value="completed">Hoàn thành</Option>
              <Option value="cancelled">Đã hủy</Option>
            </Select>
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
                  {sport}
                </Option>
              ))}
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
          <Col xs={12} sm={2}>
            <Button onClick={clearFilters} style={{ width: "100%" }}>
              Xóa bộ lọc
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Tournaments Management */}
      <Card
        title={`Danh sách giải đấu (${filteredTournaments.length})`}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddTournament}
          >
            Tạo giải đấu mới
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredTournaments}
          rowKey="_id"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} giải đấu`,
          }}
        />
      </Card>

      {/* Tournament Modal */}
      <Modal
        title={editingTournament ? "Chỉnh sửa giải đấu" : "Tạo giải đấu mới"}
        open={isTournamentModalVisible}
        onCancel={() => {
          setIsTournamentModalVisible(false);
          form.resetFields();
          setEditingTournament(null);
        }}
        footer={null}
        width={1000}
        destroyOnClose={true}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveTournament}>
          <Tabs defaultActiveKey="basic" type="card">
            <TabPane
              tab={
                <span>
                  <TrophyOutlined /> Thông tin cơ bản
                </span>
              }
              key="basic"
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Tên giải đấu"
                    name="name"
                    rules={[
                      { required: true, message: "Vui lòng nhập tên giải đấu!" },
                    ]}
                  >
                    <Input placeholder="Nhập tên giải đấu" />
                  </Form.Item>
                </Col>
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
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Cơ sở"
                    name="venueId"
                    rules={[
                      { required: true, message: "Vui lòng chọn cơ sở!" },
                    ]}
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
                <Col xs={24} md={6}>
                  <Form.Item
                    label="Ngày bắt đầu"
                    name="startDate"
                    rules={[
                      { required: true, message: "Vui lòng chọn ngày bắt đầu!" },
                    ]}
                  >
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item
                    label="Ngày kết thúc"
                    name="endDate"
                    rules={[
                      { required: true, message: "Vui lòng chọn ngày kết thúc!" },
                    ]}
                  >
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item
                    label="Mở đăng ký từ"
                    name="registrationStartDate"
                    rules={[
                      { required: true, message: "Vui lòng chọn ngày mở đăng ký!" },
                    ]}
                  >
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item
                    label="Đóng đăng ký"
                    name="registrationEndDate"
                    rules={[
                      { required: true, message: "Vui lòng chọn ngày đóng đăng ký!" },
                    ]}
                  >
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    label="Số người tham gia tối đa"
                    name="maxParticipants"
                    rules={[
                      { required: true, message: "Vui lòng nhập số người tham gia tối đa!" },
                    ]}
                  >
                    <InputNumber min={2} max={1000} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    label="Số người tham gia tối thiểu"
                    name="minParticipants"
                    rules={[
                      { required: true, message: "Vui lòng nhập số người tham gia tối thiểu!" },
                    ]}
                  >
                    <InputNumber min={2} max={1000} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    label="Định dạng giải đấu"
                    name="tournamentType"
                    rules={[
                      { required: true, message: "Vui lòng chọn định dạng giải đấu!" },
                    ]}
                  >
                    <Select placeholder="Chọn định dạng">
                      <Option value="single_elimination">Loại trực tiếp đơn</Option>
                      <Option value="double_elimination">Loại trực tiếp kép</Option>
                      <Option value="round_robin">Vòng tròn</Option>
                      <Option value="swiss">Thụy Sĩ</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Phí tham gia (VNĐ)"
                    name="registrationFee"
                    rules={[
                      { required: true, message: "Vui lòng nhập phí tham gia!" },
                    ]}
                  >
                    <InputNumber
                      min={0}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ""))}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Tổng giải thưởng (VNĐ)"
                    name="prizePool"
                    rules={[
                      { required: true, message: "Vui lòng nhập tổng giải thưởng!" },
                    ]}
                  >
                    <InputNumber
                      min={0}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ""))}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Mô tả" name="description">
                <TextArea rows={3} placeholder="Mô tả về giải đấu..." />
              </Form.Item>

              <Form.Item label="Quy định" name="rules">
                <TextArea rows={3} placeholder="Quy định của giải đấu..." />
              </Form.Item>

              <Form.Item label="Yêu cầu" name="requirements">
                <TextArea rows={2} placeholder="Yêu cầu tham gia..." />
              </Form.Item>

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

              <Form.Item label="Hình ảnh">
                <Image.PreviewGroup>
                  <Upload
                    multiple
                    listType="picture-card"
                    fileList={tournamentFileList}
                    showUploadList={{ showPreviewIcon: false }}
                    onChange={({ fileList: newFileList }) => {
                      setTournamentFileList(newFileList);
                    }}
                    customRequest={async ({ file, onSuccess, onError, onProgress }) => {
                      try {
                        onProgress?.({ percent: 20 });
                        
                        const response = await uploadFileAPI(
                          file as File,
                          "tournament",
                          {
                            ...(editingTournament && { "tournament-id": editingTournament._id }),
                          }
                        );

                        onProgress?.({ percent: 100 });
                        
                        if (response?.data?.fileUploaded) {
                          setTournamentImages((prev) => [
                            ...prev,
                            response.data!.fileUploaded,
                          ]);
                          onSuccess?.(response.data);
                        } else {
                          onError?.(new Error("Upload failed"));
                        }
                      } catch (error) {
                        onError?.(error as Error);
                      }
                    }}
                    onRemove={(file) => {
                      if (file.uid.startsWith("existing-")) {
                        const index = parseInt(file.uid.replace("existing-", ""));
                        setTournamentImages((prev) => prev.filter((_, i) => i !== index));
                        setTournamentFileList((prev) => prev.filter((item) => item.uid !== file.uid));
                      } else {
                        setTournamentFileList((prev) => prev.filter((item) => item.uid !== file.uid));
                      }
                      return true;
                    }}
                  >
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Tải lên</div>
                    </div>
                  </Upload>
                </Image.PreviewGroup>
              </Form.Item>
            </TabPane>
          </Tabs>

          <Divider />

          <Form.Item style={{ marginTop: "24px", textAlign: "right" }}>
            <Space>
              <Button onClick={() => setIsTournamentModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingTournament ? "Cập nhật" : "Tạo giải đấu"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết giải đấu"
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
              if (selectedTournament) {
                setDetailModalVisible(false);
                handleEditTournament(selectedTournament);
              }
            }}
          >
            Chỉnh sửa
          </Button>,
        ]}
        width={800}
      >
        {selectedTournament && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Title level={5}>Thông tin cơ bản</Title>
                <p>
                  <strong>Tên giải đấu:</strong> {selectedTournament.name}
                </p>
                <p>
                  <strong>Môn thể thao:</strong> {selectedTournament.sportType}
                </p>
                <p>
                  <strong>Định dạng:</strong> {getTournamentFormatDisplay(selectedTournament.tournamentType)}
                </p>
                <p>
                  <strong>Trạng thái:</strong>
                  <Tag
                    color={getTournamentStatusColor(selectedTournament.status)}
                    style={{ marginLeft: 8 }}
                  >
                    {getTournamentStatusDisplay(selectedTournament.status)}
                  </Tag>
                </p>
              </Col>
              <Col span={12}>
                <Title level={5}>Cơ sở & Sân</Title>
                <p>
                  <strong>Cơ sở:</strong> {selectedTournament.venueId.name}
                </p>
                <p>
                  <strong>Địa chỉ:</strong>{" "}
                  {selectedTournament.venueId.address.street},{" "}
                  {selectedTournament.venueId.address.ward},{" "}
                  {selectedTournament.venueId.address.district},{" "}
                  {selectedTournament.venueId.address.city}
                </p>
                <p>
                  <strong>Sân thi đấu:</strong> Tất cả sân tại cơ sở
                </p>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Title level={5}>Thời gian</Title>
                <p>
                  <strong>Ngày bắt đầu:</strong> {dayjs(selectedTournament.startDate).format("DD/MM/YYYY")}
                </p>
                <p>
                  <strong>Ngày kết thúc:</strong> {dayjs(selectedTournament.endDate).format("DD/MM/YYYY")}
                </p>
                <p>
                  <strong>Mở đăng ký:</strong> {dayjs(selectedTournament.registrationStartDate).format("DD/MM/YYYY")}
                </p>
                <p>
                  <strong>Đóng đăng ký:</strong> {dayjs(selectedTournament.registrationEndDate).format("DD/MM/YYYY")}
                </p>
              </Col>
              <Col span={12}>
                <Title level={5}>Tham gia & Giải thưởng</Title>
                <p>
                  <strong>Tham gia:</strong> {selectedTournament.currentParticipants}/{selectedTournament.maxParticipants}
                </p>
                <p>
                  <strong>Tối thiểu:</strong> {selectedTournament.minParticipants}
                </p>
                <p>
                  <strong>Phí tham gia:</strong> {selectedTournament.registrationFee.toLocaleString()} VNĐ
                </p>
                <p>
                  <strong>Tổng giải thưởng:</strong> {selectedTournament.prizePool.toLocaleString()} VNĐ
                </p>
              </Col>
            </Row>

            {selectedTournament.description && (
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Title level={5}>Mô tả</Title>
                  <p>{selectedTournament.description}</p>
                </Col>
              </Row>
            )}

            {selectedTournament.rules && selectedTournament.rules.length > 0 && (
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Title level={5}>Quy định</Title>
                  <ul>
                    {selectedTournament.rules.map((rule, index) => (
                      <li key={index}>{rule}</li>
                    ))}
                  </ul>
                </Col>
              </Row>
            )}

            {selectedTournament.requirements && (
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Title level={5}>Yêu cầu</Title>
                  <p>{selectedTournament.requirements}</p>
                </Col>
              </Row>
            )}

            {selectedTournament.gallery && selectedTournament.gallery.length > 0 && (
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Title level={5}>
                    Hình ảnh ({selectedTournament.gallery.length} ảnh)
                  </Title>
                  <Image.PreviewGroup>
                    <Space wrap>
                      {selectedTournament.gallery.map((image, index) => (
                        <Image
                          key={index}
                          src={image}
                          alt={`${selectedTournament.name} ${index + 1}`}
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

export default ManageTournaments;

import {
  DeleteOutlined,
  PlusOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Modal,
  notification,
  Row,
  Select,
  Space,
  Steps,
  Switch,
  Tag,
  Typography
} from 'antd';
import React, { useEffect, useState } from 'react';
import type { ITournament } from '../../services/tournamentApi';
import { tournamentApi } from '../../services/tournamentApi';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

interface TournamentRegistrationModalProps {
  visible: boolean;
  tournament: ITournament | null;
  onCancel: () => void;
  onSuccess: () => void;
}

interface TeamMember {
  userId: string;
  fullName: string;
  email: string;
  role: 'captain' | 'member' | 'substitute';
  isConfirmed: boolean;
}

const TournamentRegistrationModal: React.FC<TournamentRegistrationModalProps> = ({
  visible,
  tournament,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [registrationType, setRegistrationType] = useState<'individual' | 'team'>('individual');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (visible) {
      form.resetFields();
      setCurrentStep(0);
      // Lock registration type based on tournament.teamSize
      if (tournament?.teamSize && tournament.teamSize > 1) {
        setRegistrationType('team');
      } else {
        setRegistrationType('individual');
      }
      setTeamMembers([]);
    }
  }, [visible, form]);

  // Initialize with current user as captain
  useEffect(() => {
    if (visible && registrationType === 'team' && teamMembers.length === 0) {
      // Get current user info from localStorage or context
      const currentUser = {
        userId: localStorage.getItem('userId') || '',
        fullName: localStorage.getItem('userName') || '',
        email: localStorage.getItem('userEmail') || '',
        role: 'captain' as const,
        isConfirmed: true
      };
      setTeamMembers([currentUser]);
    }
  }, [visible, registrationType]);

  const handleRegistrationTypeChange = (type: 'individual' | 'team') => {
    // Prevent switching to an invalid type per tournament.teamSize
    if (tournament?.teamSize && tournament.teamSize > 1 && type !== 'team') {
      notification.warning({
        message: 'Không hợp lệ',
        description: 'Giải đấu này yêu cầu đăng ký theo đội.'
      });
      return;
    }
    if ((!tournament?.teamSize || tournament.teamSize === 1) && type !== 'individual') {
      notification.warning({
        message: 'Không hợp lệ',
        description: 'Giải đấu này chỉ cho phép đăng ký cá nhân.'
      });
      return;
    }
    setRegistrationType(type);
    if (type === 'individual') {
      setTeamMembers([]);
    } else {
      // Initialize with current user as captain
      const currentUser = {
        userId: localStorage.getItem('userId') || '',
        fullName: localStorage.getItem('userName') || '',
        email: localStorage.getItem('userEmail') || '',
        role: 'captain' as const,
        isConfirmed: true
      };
      setTeamMembers([currentUser]);
    }
  };

  const handleAddTeamMember = () => {
    // Enforce maximum team size if provided
    if (tournament?.teamSize && tournament.teamSize > 1 && teamMembers.length >= tournament.teamSize) {
      notification.warning({
        message: 'Vượt quá số lượng',
        description: `Đội tối đa ${tournament.teamSize} người`
      });
      return;
    }
    const newMember: TeamMember = {
      userId: '',
      fullName: '',
      email: '',
      role: 'member',
      isConfirmed: false
    };
    setTeamMembers([...teamMembers, newMember]);
  };

  const handleRemoveTeamMember = (index: number) => {
    const newMembers = teamMembers.filter((_, i) => i !== index);
    setTeamMembers(newMembers);
  };

  const handleTeamMemberChange = (index: number, field: keyof TeamMember, value: string | boolean) => {
    const newMembers = [...teamMembers];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setTeamMembers(newMembers);
  };

  const handleNext = async () => {
    try {
      if (currentStep === 0) {
        // Validate registration type and team info
        if (registrationType === 'team') {
          if (teamMembers.length < 2) {
            notification.error({
              message: 'Lỗi',
              description: 'Đội nhóm phải có ít nhất 2 thành viên'
            });
            return;
          }
          
          const hasUnconfirmedMembers = teamMembers.some(member => !member.isConfirmed);
          if (hasUnconfirmedMembers) {
            notification.error({
              message: 'Lỗi',
              description: 'Tất cả thành viên phải được xác nhận'
            });
            return;
          }
        }
      }
      
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('Validation error:', error);
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (values: any) => {
    if (!tournament) return;

    try {
      setLoading(true);

      const registrationData = {
        tournamentId: tournament._id,
        registrationType,
        teamName: registrationType === 'team' ? values.teamName : null,
        teamMembers: registrationType === 'team' ? teamMembers : [
          {
            userId: localStorage.getItem('userId') || '',
            fullName: localStorage.getItem('userName') || '',
            email: localStorage.getItem('userEmail') || '',
            role: 'captain' as const,
            isConfirmed: true
          }
        ],
        emergencyContact: {
          name: values.emergencyContactName,
          phone: values.emergencyContactPhone,
          relationship: values.emergencyContactRelationship
        },
        medicalConditions: values.medicalConditions || 'Không có',
        notes: values.notes || ''
      };

      // Call API to register
      const response = await tournamentApi.registerForTournament(registrationData);
      
      if (response.success) {
        notification.success({
          message: 'Thành công',
          description: 'Đăng ký tournament thành công!'
        });
        onSuccess();
        onCancel();
      } else {
        notification.error({
          message: 'Lỗi',
          description: response.error || 'Đăng ký thất bại'
        });
      }
    } catch (error) {
      notification.error({
        message: 'Lỗi',
        description: 'Có lỗi xảy ra khi đăng ký'
      });
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: 'Chọn loại đăng ký',
      content: (
        <div>
          <Title level={4}>Chọn loại đăng ký</Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Card
                hoverable
                className={`registration-type-card ${registrationType === 'individual' ? 'selected' : ''}`}
                onClick={() => handleRegistrationTypeChange('individual')}
                style={{
                  border: registrationType === 'individual' ? '2px solid #1890ff' : '1px solid #d9d9d9',
                  cursor: 'pointer'
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <UserOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
                  <Title level={4}>Đăng ký cá nhân</Title>
                  <Text type="secondary">
                    Tham gia tournament với tư cách cá nhân
                  </Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                hoverable
                className={`registration-type-card ${registrationType === 'team' ? 'selected' : ''}`}
                onClick={() => handleRegistrationTypeChange('team')}
                style={{
                  border: registrationType === 'team' ? '2px solid #1890ff' : '1px solid #d9d9d9',
                  cursor: 'pointer'
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <TeamOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
                  <Title level={4}>Đăng ký đội nhóm</Title>
                  <Text type="secondary">
                    Tạo đội và mời thành viên tham gia
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>

          {registrationType === 'team' && (
            <div style={{ marginTop: '24px' }}>
              <Title level={5}>Thông tin đội</Title>
              {tournament?.teamSize && tournament.teamSize > 1 && (
                <Text type="secondary">Kích thước đội tối đa: {tournament.teamSize} người</Text>
              )}
              <Form.Item
                label="Tên đội"
                name="teamName"
                rules={[{ required: true, message: 'Vui lòng nhập tên đội!' }]}
              >
                <Input placeholder="Nhập tên đội của bạn" />
              </Form.Item>

              <Title level={5}>Thành viên đội</Title>
              {teamMembers.map((member, index) => (
                <Card key={index} size="small" style={{ marginBottom: '12px' }}>
                  <Row gutter={16} align="middle">
                    <Col span={2}>
                      <Avatar icon={<UserOutlined />} />
                    </Col>
                    <Col span={6}>
                      <Input
                        placeholder="Tên thành viên"
                        value={member.fullName}
                        onChange={(e) => handleTeamMemberChange(index, 'fullName', e.target.value)}
                      />
                    </Col>
                    <Col span={6}>
                      <Input
                        placeholder="Email"
                        value={member.email}
                        onChange={(e) => handleTeamMemberChange(index, 'email', e.target.value)}
                      />
                    </Col>
                    <Col span={4}>
                      <Select
                        value={member.role}
                        onChange={(value) => handleTeamMemberChange(index, 'role', value)}
                        style={{ width: '100%' }}
                      >
                        <Option value="captain">Đội trưởng</Option>
                        <Option value="member">Thành viên</Option>
                        <Option value="substitute">Dự bị</Option>
                      </Select>
                    </Col>
                    <Col span={4}>
                      <Switch
                        checked={member.isConfirmed}
                        onChange={(checked) => handleTeamMemberChange(index, 'isConfirmed', checked)}
                        checkedChildren="Xác nhận"
                        unCheckedChildren="Chờ"
                      />
                    </Col>
                    <Col span={2}>
                      {index > 0 && (
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveTeamMember(index)}
                        />
                      )}
                    </Col>
                  </Row>
                </Card>
              ))}
              
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleAddTeamMember}
                style={{ width: '100%' }}
              >
                Thêm thành viên
              </Button>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Thông tin cá nhân',
      content: (
        <div>
          <Title level={4}>Thông tin cá nhân</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tên người liên hệ khẩn cấp"
                name="emergencyContactName"
                rules={[{ required: true, message: 'Vui lòng nhập tên người liên hệ!' }]}
              >
                <Input placeholder="Nhập tên người liên hệ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Số điện thoại"
                name="emergencyContactPhone"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại!' },
                  { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
                ]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            label="Mối quan hệ"
            name="emergencyContactRelationship"
            rules={[{ required: true, message: 'Vui lòng chọn mối quan hệ!' }]}
          >
            <Select placeholder="Chọn mối quan hệ">
              <Option value="Self">Bản thân</Option>
              <Option value="Parent">Cha/Mẹ</Option>
              <Option value="Sibling">Anh/Chị/Em</Option>
              <Option value="Spouse">Vợ/Chồng</Option>
              <Option value="Friend">Bạn bè</Option>
              <Option value="Other">Khác</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Tình trạng sức khỏe"
            name="medicalConditions"
          >
            <TextArea
              rows={3}
              placeholder="Mô tả tình trạng sức khỏe (nếu có)..."
            />
          </Form.Item>

          <Form.Item
            label="Ghi chú thêm"
            name="notes"
          >
            <TextArea
              rows={2}
              placeholder="Ghi chú thêm (tùy chọn)..."
            />
          </Form.Item>
        </div>
      )
    },
    {
      title: 'Xác nhận',
      content: (
        <div>
          <Title level={4}>Xác nhận thông tin đăng ký</Title>
          
          <Card title="Thông tin tournament" style={{ marginBottom: '16px' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>Tên giải đấu:</Text> {tournament?.name}
              </Col>
              <Col span={12}>
                <Text strong>Môn thể thao:</Text> {tournament?.sportType}
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: '8px' }}>
              <Col span={12}>
                <Text strong>Phí đăng ký:</Text> {tournament?.registrationFee?.toLocaleString()} VNĐ
              </Col>
              <Col span={12}>
                <Text strong>Ngày bắt đầu:</Text> {tournament?.startDate ? new Date(tournament.startDate).toLocaleDateString('vi-VN') : 'N/A'}
              </Col>
            </Row>
          </Card>

          <Card title="Thông tin đăng ký" style={{ marginBottom: '16px' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>Loại đăng ký:</Text>
                <Tag color={registrationType === 'team' ? 'blue' : 'green'} style={{ marginLeft: '8px' }}>
                  {registrationType === 'team' ? 'Đội nhóm' : 'Cá nhân'}
                </Tag>
              </Col>
              {registrationType === 'team' && (
                <Col span={12}>
                  <Text strong>Tên đội:</Text> {form.getFieldValue('teamName')}
                </Col>
              )}
            </Row>
            {registrationType === 'team' && (
              <div style={{ marginTop: '12px' }}>
                <Text strong>Thành viên ({teamMembers.length} người):</Text>
                <div style={{ marginTop: '8px' }}>
                  {teamMembers.map((member, index) => (
                    <Tag key={index} color={member.role === 'captain' ? 'blue' : 'default'} style={{ marginBottom: '4px' }}>
                      {member.fullName} ({member.role === 'captain' ? 'Đội trưởng' : 'Thành viên'})
                    </Tag>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Alert
            message="Lưu ý quan trọng"
            description="Sau khi đăng ký, bạn cần thanh toán phí đăng ký để được xét duyệt tham gia tournament. Vui lòng kiểm tra thông tin trước khi xác nhận."
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        </div>
      )
    }
  ];

  return (
    <Modal
      title="Đăng ký tham gia tournament"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Steps current={currentStep} style={{ marginBottom: '24px' }}>
          {steps.map((step, index) => (
            <Step key={index} title={step.title} />
          ))}
        </Steps>

        <div style={{ minHeight: '400px' }}>
          {steps[currentStep].content}
        </div>

        <Divider />

        <div style={{ textAlign: 'right' }}>
          <Space>
            {currentStep > 0 && (
              <Button onClick={handlePrev}>
                Quay lại
              </Button>
            )}
            {currentStep < steps.length - 1 ? (
              <Button type="primary" onClick={handleNext}>
                Tiếp tục
              </Button>
            ) : (
              <Button type="primary" htmlType="submit" loading={loading}>
                Xác nhận đăng ký
              </Button>
            )}
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

export default TournamentRegistrationModal;

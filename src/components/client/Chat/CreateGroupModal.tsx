import { PlusOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import {
    Avatar,
    Badge,
    Button,
    Divider,
    Form,
    Input,
    List,
    Modal,
    Space,
    Tag,
    Typography
} from 'antd';
import React, { useEffect, useState } from 'react';
import { userApi } from '../../../services/userApi';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface User {
  _id: string;
  fullName: string;
  avatar?: string;
  role: string;
  email?: string;
}

interface CreateGroupModalProps {
  open: boolean;
  onCancel: () => void;
  onCreate: (data: {
    name: string;
    description?: string;
    participantIds: string[];
  }) => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  open,
  onCancel,
  onCreate
}) => {
  const [form] = Form.useForm();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userApi.getUsers({ limit: 100 });
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user: User) => {
    if (!selectedUsers.find(u => u._id === user._id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleUserRemove = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u._id !== userId));
  };

  const handleSubmit = () => {
    form.validateFields().then(values => {
      onCreate({
        name: values.name,
        description: values.description,
        participantIds: selectedUsers.map(u => u._id)
      });
      
      // Reset form
      form.resetFields();
      setSelectedUsers([]);
      setSearchText('');
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedUsers([]);
    setSearchText('');
    onCancel();
  };

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchText.toLowerCase()) &&
    !selectedUsers.find(u => u._id === user._id)
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'red';
      case 'owner': return 'blue';
      case 'coach': return 'green';
      case 'customer': return 'default';
      default: return 'default';
    }
  };

  return (
    <Modal
      title={
        <div style={{ textAlign: 'center' }}>
          <Title level={3} style={{ margin: 0, color: '#667eea' }}>
            Tạo Nhóm Chat
          </Title>
          <Text type="secondary">Tạo nhóm chat mới với bạn bè</Text>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit}
      okText="Tạo Nhóm"
      cancelText="Hủy"
      width={700}
      okButtonProps={{
        disabled: selectedUsers.length === 0,
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 600
        }
      }}
      cancelButtonProps={{
        style: {
          borderRadius: '8px',
          fontWeight: 600
        }
      }}
      style={{
        top: 20
      }}
    >
      <div style={{ padding: '20px 0' }}>
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label={<Text strong>Tên nhóm</Text>}
            rules={[
              { required: true, message: 'Vui lòng nhập tên nhóm' },
              { min: 3, message: 'Tên nhóm phải có ít nhất 3 ký tự' }
            ]}
          >
            <Input 
              placeholder="Nhập tên nhóm chat..." 
              size="large"
              style={{ borderRadius: '12px' }}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={<Text strong>Mô tả (Tùy chọn)</Text>}
          >
            <TextArea
              placeholder="Mô tả về nhóm chat..."
              rows={3}
              maxLength={500}
              showCount
              style={{ borderRadius: '12px' }}
            />
          </Form.Item>

          <Form.Item label={<Text strong>Thêm thành viên</Text>}>
            <div className="group-members">
              {/* Selected Members */}
              <div className="selected-members" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <Title level={5} style={{ margin: 0, marginRight: '12px' }}>
                    Thành viên đã chọn
                  </Title>
                  <Badge count={selectedUsers.length} style={{ backgroundColor: '#667eea' }} />
                </div>
                
                {selectedUsers.length > 0 ? (
                  <div style={{ 
                    background: 'rgba(102, 126, 234, 0.05)', 
                    borderRadius: '12px', 
                    padding: '16px',
                    border: '2px solid rgba(102, 126, 234, 0.1)'
                  }}>
                    <List
                      size="small"
                      dataSource={selectedUsers}
                      renderItem={(user) => (
                        <List.Item
                          style={{ 
                            padding: '8px 0',
                            borderBottom: '1px solid rgba(0,0,0,0.05)'
                          }}
                          actions={[
                            <Button
                              type="text"
                              danger
                              size="small"
                              onClick={() => handleUserRemove(user._id)}
                              style={{ borderRadius: '6px' }}
                            >
                              Xóa
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <Avatar
                                src={user.avatar}
                                icon={<UserOutlined />}
                                size="small"
                                style={{ border: '2px solid #667eea' }}
                              />
                            }
                            title={
                              <Space>
                                <Text strong>{user.fullName}</Text>
                                <Tag color={getRoleColor(user.role)}>
                                  {user.role}
                                </Tag>
                              </Space>
                            }
                            description={user.email}
                          />
                        </List.Item>
                      )}
                    />
                  </div>
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px',
                    background: 'rgba(0,0,0,0.02)',
                    borderRadius: '12px',
                    border: '2px dashed rgba(0,0,0,0.1)'
                  }}>
                    <UserOutlined style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
                    <Text type="secondary" style={{ fontSize: '16px' }}>
                      Chưa có thành viên nào được chọn
                    </Text>
                  </div>
                )}
              </div>

              <Divider style={{ margin: '24px 0' }} />

              {/* Available Members */}
              <div className="available-members">
                <Title level={5} style={{ marginBottom: '16px' }}>
                  Thành viên có sẵn
                </Title>
                
                <Input
                  placeholder="Tìm kiếm người dùng..."
                  prefix={<SearchOutlined style={{ color: '#667eea' }} />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  size="large"
                  style={{ 
                    marginBottom: 16,
                    borderRadius: '12px',
                    border: '2px solid rgba(102, 126, 234, 0.1)'
                  }}
                />
                
                <div style={{ 
                  maxHeight: '300px', 
                  overflowY: 'auto',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '12px',
                  background: 'white'
                }}>
                  <List
                    size="small"
                    dataSource={filteredUsers}
                    loading={loading}
                    renderItem={(user) => (
                      <List.Item
                        style={{ 
                          padding: '12px 16px',
                          borderBottom: '1px solid rgba(0,0,0,0.05)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                        actions={[
                          <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => handleUserSelect(user)}
                            style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              border: 'none',
                              borderRadius: '6px',
                              fontWeight: 600
                            }}
                          >
                            Thêm
                          </Button>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              src={user.avatar}
                              icon={<UserOutlined />}
                              size="small"
                            />
                          }
                          title={
                            <Space>
                              <Text strong>{user.fullName}</Text>
                              <Tag color={getRoleColor(user.role)}>
                                {user.role}
                              </Tag>
                            </Space>
                          }
                          description={user.email}
                        />
                      </List.Item>
                    )}
                  />
                  
                  {filteredUsers.length === 0 && !loading && (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '40px',
                      color: '#999'
                    }}>
                      <SearchOutlined style={{ fontSize: '32px', marginBottom: '12px' }} />
                      <div>Không tìm thấy người dùng nào</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default CreateGroupModal;
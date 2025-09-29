import { MessageOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import {
    Avatar,
    Button,
    Empty,
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

interface User {
  _id: string;
  fullName: string;
  avatar?: string;
  role: string;
  email?: string;
}

interface StartDirectChatModalProps {
  open: boolean;
  onCancel: () => void;
  onStartChat: (userId: string) => void;
}

const StartDirectChatModal: React.FC<StartDirectChatModalProps> = ({
  open,
  onCancel,
  onStartChat
}) => {
  const [users, setUsers] = useState<User[]>([]);
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
      console.log('API Response:', response.data); // Debug log
      console.log('Users data:', response.data.users); // Debug log
      const usersData = response.data.users || [];
      console.log('Users count:', usersData.length); // Debug log
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = (userId: string) => {
    onStartChat(userId);
    setSearchText('');
    onCancel();
  };

  const handleCancel = () => {
    setSearchText('');
    onCancel();
  };

  const [filteredUsers, setFilteredUsers] = useState<IUser[]>([]);

  useEffect(() => {
    if (searchText) {
      const filtered = users.filter(user =>
        (user.fullName && user.fullName.toLowerCase().includes(searchText.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchText.toLowerCase()))
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [users, searchText]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'red';
      case 'owner': return 'blue';
      case 'coach': return 'green';
      case 'customer': return 'default';
      default: return 'default';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Quản trị viên';
      case 'owner': return 'Chủ sân';
      case 'coach': return 'Huấn luyện viên';
      case 'customer': return 'Khách hàng';
      default: return role;
    }
  };

  return (
    <Modal
      title={
        <div style={{ textAlign: 'center' }}>
          <Title level={3} style={{ margin: 0, color: '#667eea' }}>
            Bắt đầu chat
          </Title>
          <Text type="secondary">Chọn người dùng để bắt đầu cuộc trò chuyện</Text>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
      style={{
        top: 20
      }}
    >
      <div style={{ padding: '20px 0' }}>
        <div style={{ marginBottom: '24px' }}>
          <Input
            placeholder="Tìm kiếm theo tên hoặc email..."
            prefix={<SearchOutlined style={{ color: '#667eea' }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            size="large"
            style={{ 
              borderRadius: '12px',
              border: '2px solid rgba(102, 126, 234, 0.1)'
            }}
          />
        </div>

        <div style={{ 
          maxHeight: '400px', 
          overflowY: 'auto',
          border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: '12px',
          background: 'white'
        }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div>Đang tải danh sách người dùng...</div>
            </div>
          ) : filteredUsers.length > 0 ? (
            <List
              dataSource={filteredUsers}
              loading={loading}
              renderItem={(user) => (
                <List.Item
                  style={{ 
                    padding: '16px 20px',
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
                      icon={<MessageOutlined />}
                      onClick={() => handleStartChat(user._id)}
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 600
                      }}
                    >
                      Chat
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        src={user.avatar}
                        icon={<UserOutlined />}
                        size="large"
                        style={{ 
                          border: '3px solid rgba(102, 126, 234, 0.2)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    }
                    title={
                      <Space>
                        <Text strong style={{ fontSize: '16px' }}>
                          {user.fullName}
                        </Text>
                        <Tag color={getRoleColor(user.role)}>
                          {getRoleText(user.role)}
                        </Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <Text type="secondary" style={{ fontSize: '14px' }}>
                          {user.email}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <div style={{ padding: '40px' }}>
              <Empty
                image={<UserOutlined style={{ fontSize: '64px', color: '#ccc' }} />}
                description={
                  <div>
                    <Text type="secondary" style={{ fontSize: '16px' }}>
                      {searchText ? `Không tìm thấy người dùng nào với từ khóa "${searchText}"` : 'Không có người dùng nào'}
                    </Text>
                    {searchText && (
                      <div style={{ marginTop: '8px' }}>
                        <Text type="secondary" style={{ fontSize: '14px' }}>
                          Tổng số người dùng: {users.length}
                        </Text>
                      </div>
                    )}
                  </div>
                }
              />
            </div>
          )}
        </div>

        <div style={{ 
          marginTop: '20px', 
          padding: '16px',
          background: 'rgba(102, 126, 234, 0.05)',
          borderRadius: '12px',
          border: '1px solid rgba(102, 126, 234, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <MessageOutlined style={{ color: '#667eea', marginRight: '8px' }} />
            <Text strong style={{ color: '#667eea' }}>
              Mẹo sử dụng
            </Text>
          </div>
          <Text type="secondary" style={{ fontSize: '14px', lineHeight: '1.6' }}>
            • Tìm kiếm theo tên hoặc email để tìm người dùng nhanh chóng<br/>
            • Click "Chat" để bắt đầu cuộc trò chuyện trực tiếp<br/>
            • Bạn có thể chat với bất kỳ người dùng nào trong hệ thống
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default StartDirectChatModal;

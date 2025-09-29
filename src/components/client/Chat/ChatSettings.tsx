import {
    BellOutlined,
    EyeOutlined,
    LockOutlined,
    SoundOutlined
} from '@ant-design/icons';
import {
    Button,
    Divider,
    List,
    Modal,
    Switch,
    Typography
} from 'antd';
import React from 'react';

const { Text, Title } = Typography;

interface ChatSettingsProps {
  open: boolean;
  onCancel: () => void;
}

const ChatSettings: React.FC<ChatSettingsProps> = ({
  open,
  onCancel
}) => {
  const [settings, setSettings] = React.useState({
    notifications: true,
    sound: true,
    showOnlineStatus: true,
    showReadReceipts: true,
    blockUnknownUsers: false
  });

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // Save settings to backend
    console.log('Saving settings:', settings);
    onCancel();
  };

  return (
    <Modal
      title="Chat Settings"
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          Save
        </Button>
      ]}
      width={500}
    >
      <div className="chat-settings">
        <Title level={5}>Notifications</Title>
        <List
          dataSource={[
            {
              key: 'notifications',
              title: 'Enable Notifications',
              description: 'Receive notifications for new messages',
              icon: <BellOutlined />,
              value: settings.notifications
            },
            {
              key: 'sound',
              title: 'Sound Notifications',
              description: 'Play sound when receiving messages',
              icon: <SoundOutlined />,
              value: settings.sound
            }
          ]}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Switch
                  checked={item.value}
                  onChange={(checked) => handleSettingChange(item.key, checked)}
                />
              ]}
            >
              <List.Item.Meta
                avatar={item.icon}
                title={item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />

        <Divider />

        <Title level={5}>Privacy</Title>
        <List
          dataSource={[
            {
              key: 'showOnlineStatus',
              title: 'Show Online Status',
              description: 'Let others see when you are online',
              icon: <EyeOutlined />,
              value: settings.showOnlineStatus
            },
            {
              key: 'showReadReceipts',
              title: 'Read Receipts',
              description: 'Show when messages are read',
              icon: <EyeOutlined />,
              value: settings.showReadReceipts
            },
            {
              key: 'blockUnknownUsers',
              title: 'Block Unknown Users',
              description: 'Prevent messages from users not in your contacts',
              icon: <LockOutlined />,
              value: settings.blockUnknownUsers
            }
          ]}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Switch
                  checked={item.value}
                  onChange={(checked) => handleSettingChange(item.key, checked)}
                />
              ]}
            >
              <List.Item.Meta
                avatar={item.icon}
                title={item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </div>
    </Modal>
  );
};

export default ChatSettings;

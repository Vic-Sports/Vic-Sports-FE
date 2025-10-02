import { Modal, Tabs, Typography } from "antd";
import { UserOutlined, SettingOutlined } from "@ant-design/icons";
import UserInfo from "./user.info";
import ChangePassword from "./change.password";
import UserPreferences from "./user-preferences";
import UserStats from "./user-stats";

const { Title, Text } = Typography;

interface IProps {
  isModalOpen: boolean;
  setIsModalOpen: (v: boolean) => void;
}

const ManageAccount = (props: IProps) => {
  const { isModalOpen, setIsModalOpen } = props;

  const items = [
    {
      key: "overview",
      label: (
        <span>
          <UserOutlined />
          Tổng quan
        </span>
      ),
      children: <UserStats />
    },
    {
      key: "info",
      label: (
        <span>
          <UserOutlined />
          Thông tin cá nhân
        </span>
      ),
      children: <UserInfo />
    },
    {
      key: "preferences",
      label: (
        <span>
          <SettingOutlined />
          Sở thích & Cài đặt
        </span>
      ),
      children: <UserPreferences />
    },
    {
      key: "password",
      label: (
        <span>
          <SettingOutlined />
          Đổi mật khẩu
        </span>
      ),
      children: <ChangePassword />
    }
  ];

  return (
    <Modal
      title={
        <div style={{ textAlign: "center" }}>
          <Title level={3} style={{ margin: 0, color: "#1890ff" }}>
            Quản lý tài khoản
          </Title>
          <Text type="secondary">
            Cập nhật thông tin cá nhân và tùy chỉnh trải nghiệm
          </Text>
        </div>
      }
      open={isModalOpen}
      footer={null}
      onCancel={() => setIsModalOpen(false)}
      maskClosable={false}
      width={"80vw"}
      style={{ top: 20 }}
      styles={{ body: { padding: "24px" } }}
    >
      <Tabs
        defaultActiveKey="overview"
        items={items}
        tabPosition="left"
        size="large"
        style={{ minHeight: "60vh" }}
        tabBarStyle={{ width: "200px" }}
      />
    </Modal>
  );
};

export default ManageAccount;

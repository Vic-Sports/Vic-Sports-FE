import { logoutAPI } from "@/services/api";
import {
    AppstoreOutlined,
    BellOutlined,
    DollarCircleOutlined,
    ExceptionOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Avatar, Badge, Dropdown, Layout, Menu, Popover, Space } from "antd";
import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useCurrentApp } from "../context/app.context";

const { Content, Sider } = Layout;
type MenuItem = Required<MenuProps>["items"][number];

const LayoutAdmin = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("");

  const { user, setUser, setIsAuthenticated, isAuthenticated } =
    useCurrentApp();

  const location = useLocation();
  const navigate = useNavigate();

  const items: MenuItem[] = [
    {
      label: (
        <Link to="/admin" style={{ textDecoration: "none" }}>
          DASHBOARD
        </Link>
      ),
      key: "/admin",
      icon: <AppstoreOutlined />
    },
    {
      label: (
        <Link to="/admin/user" style={{ textDecoration: "none" }}>
          MANAGE USERS
        </Link>
      ),
      key: "/admin/user",
      icon: <UserOutlined />
    },
    {
      label: (
        <Link to="/admin/book" style={{ textDecoration: "none" }}>
          MANAGE FIELD
        </Link>
      ),
      key: "/admin/book",
      icon: <ExceptionOutlined />
    },
    {
      label: (
        <Link to="/admin/order" style={{ textDecoration: "none" }}>
          MANAGE BOOKING
        </Link>
      ),
      key: "/admin/order",
      icon: <DollarCircleOutlined />
    }
  ];

  // Fake notifications
  const [notifications] = useState([
    { id: 1, message: "Đơn đặt sân #A12 đã được xác nhận." },
    { id: 2, message: "Lịch sân C lúc 18:00 đã bị hủy." }
  ]);

  const notificationContent = (
    <ul style={{ padding: 0, margin: 0, listStyle: "none", width: 250 }}>
      {notifications.length === 0 ? (
        <li style={{ padding: "8px 0" }}>Không có thông báo</li>
      ) : (
        notifications.map((n) => (
          <li
            key={n.id}
            style={{
              padding: "8px 0",
              borderBottom: "1px solid #eee",
              fontSize: 13
            }}
          >
            {n.message}
          </li>
        ))
      )}
    </ul>
  );

  useEffect(() => {
    const active: any =
      items.find((item) => location.pathname === (item!.key as any)) ??
      "/admin";
    setActiveMenu(active.key);
  }, [location]);

  const handleLogout = async () => {
    try {
      const res = await logoutAPI();
      // Luôn logout dù API có thành công hay không
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("carts");
      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem("refresh_token");
      sessionStorage.removeItem("user");
      navigate("/");
      
      if (res.data) {
        console.log("Logout successful");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Vẫn logout ngay cả khi có lỗi
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("carts");
      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem("refresh_token");
      sessionStorage.removeItem("user");
      navigate("/");
    }
  };

  const itemsDropdown = [
    {
      label: (
        <label
          style={{ cursor: "pointer" }}
          onClick={() => alert("Quản lý tài khoản")}
        >
          Quản lý tài khoản
        </label>
      ),
      key: "account"
    },
    {
      label: (
        <Link to={"/"} style={{ textDecoration: "none" }}>
          Trang chủ
        </Link>
      ),
      key: "home"
    },
    {
      label: (
        <label style={{ cursor: "pointer" }} onClick={handleLogout}>
          Đăng xuất
        </label>
      ),
      key: "logout"
    }
  ];

  const urlAvatar = `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${
    user?.avatar
  }`;

  if (isAuthenticated === false) return <Outlet />;

  const isAdminRoute = location.pathname.includes("admin");
  if (isAuthenticated === true && isAdminRoute && user?.role === "customer") {
    return <Outlet />;
  }

  return (
    <Layout style={{ minHeight: "100vh" }} className="layout-admin">
      <Sider
        theme="dark"
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div
          style={{
            height: 32,
            margin: 16,
            textAlign: "center",
            fontWeight: "bold"
          }}
        >
          VIC SPORTS
        </div>
        <Menu
          selectedKeys={[activeMenu]}
          mode="inline"
          items={items}
          onClick={(e) => setActiveMenu(e.key)}
        />
      </Sider>

      <Layout>
        <div
          className="admin-header"
          style={{
            height: "50px",
            borderBottom: "1px solid #ebebeb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 15px"
          }}
        >
          <span>
            {React.createElement(
              collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
              {
                className: "trigger",
                onClick: () => setCollapsed(!collapsed)
              }
            )}
          </span>

          {/* Right side: Notifications + Avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* 🔔 Notification Bell */}
            <Popover
              title="Thông báo"
              content={notificationContent}
              placement="bottomRight"
              arrow={true}
            >
              <Badge count={notifications.length} size="small" showZero>
                <BellOutlined style={{ fontSize: 18, cursor: "pointer" }} />
              </Badge>
            </Popover>

            {/* 👤 Avatar Dropdown */}
            <Dropdown menu={{ items: itemsDropdown }} trigger={["click"]}>
              <Space style={{ cursor: "pointer" }}>
                <Avatar src={urlAvatar} />
                {user?.fullName}
              </Space>
            </Dropdown>
          </div>
        </div>

        <Content style={{ padding: "15px" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutAdmin;

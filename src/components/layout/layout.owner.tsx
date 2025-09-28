import React, { useEffect, useState } from "react";
import {
  AppstoreOutlined,
  ExceptionOutlined,
  UserOutlined,
  DollarCircleOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from "@ant-design/icons";
import { Layout, Menu, Dropdown, Space, Avatar } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useCurrentApp } from "../context/app.context";
import type { MenuProps } from "antd";
import { logoutAPI } from "@/services/api";

type MenuItem = Required<MenuProps>["items"][number];

const { Content, Sider } = Layout;

const LayoutOwner = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("");
  const { user, setUser, setIsAuthenticated, isAuthenticated } =
    useCurrentApp();

  const location = useLocation();
  const navigate = useNavigate();

  const items: MenuItem[] = [
    {
      label: (
        <Link style={{ textDecoration: "none" }} to="/owner">
          Dashboard
        </Link>
      ),
      key: "/owner",
      icon: <AppstoreOutlined />
    },
    {
      label: (
        <Link style={{ textDecoration: "none" }} to="/owner/user">
          Manage Users
        </Link>
      ),
      key: "/owner/user",
      icon: <UserOutlined />
    },
    {
      label: (
        <Link style={{ textDecoration: "none" }} to="/owner/venues">
          Manage Venues
        </Link>
      ),
      key: "/owner/venues",
      icon: <ExceptionOutlined />
    },
    {
      label: (
        <Link style={{ textDecoration: "none" }} to="/owner/courts">
          Manage Courts
        </Link>
      ),
      key: "/owner/courts",
      icon: <ExceptionOutlined />
    },
    {
      label: (
        <Link style={{ textDecoration: "none" }} to="/owner/bookings">
          Manage Bookings
        </Link>
      ),
      key: "/owner/bookings",
      icon: <DollarCircleOutlined />
    }
  ];

  useEffect(() => {
    const active: any =
      items.find((item) => location.pathname === (item!.key as any)) ??
      "/owner";
    setActiveMenu(active.key);
  }, [location]);

  const handleLogout = async () => {
    console.log("Logout button clicked");
    try {
      const res = await logoutAPI();
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("carts");
      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem("refresh_token");
      sessionStorage.removeItem("user");
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("carts");
      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem("refresh_token");
      sessionStorage.removeItem("user");
      window?.alert?.("Có lỗi khi đăng xuất! Dữ liệu đã được xóa cục bộ.");
      console.error("Logout error:", error);
    } finally {
      navigate("/");
    }
  };

  const itemsDropdown = [
    {
      label: (
        <Link style={{ textDecoration: "none" }} to={"/"}>
          Trang chủ
        </Link>
      ),
      key: "home"
    },
    {
      label: (
        <label style={{ cursor: "pointer" }} onClick={() => handleLogout()}>
          Đăng xuất
        </label>
      ),
      key: "logout"
    }
  ];

  const urlAvatar = `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${
    user?.avatar
  }`;

  if (isAuthenticated === false) {
    return <Outlet />;
  }

  const isOwnerRoute = location.pathname.includes("owner");
  if (isAuthenticated === true && isOwnerRoute === true) {
    const role = user?.role;
    if (role === "customer") {
      return <Outlet />;
    }
  }

  return (
    <>
      <Layout style={{ minHeight: "100vh" }} className="layout-admin">
        <Sider
          theme="light"
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
        >
          <div style={{ height: 32, margin: 16, textAlign: "center" }}>
            VIC SPORTS
          </div>
          <Menu
            // defaultSelectedKeys={[activeMenu]}
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
            <Dropdown menu={{ items: itemsDropdown }} trigger={["click"]}>
              <Space style={{ cursor: "pointer" }}>
                <Avatar src={urlAvatar} />
                {user?.fullName}
              </Space>
            </Dropdown>
          </div>
          <Content style={{ padding: "15px" }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </>
  );
};

export default LayoutOwner;

import { useState, useMemo } from "react";
import { Divider, Drawer, Avatar, Dropdown, Space, Menu } from "antd";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { useCurrentApp } from "components/context/app.context";
import { logoutAPI } from "services/api";
import ManageAccount from "../client/account";
import { Container, Nav, Navbar } from "react-bootstrap";
import { MdNightlight, MdOutlineLightMode } from "react-icons/md";
import viFlag from "../../assets/svg/language/vi.svg";
import enFlag from "../../assets/svg/language/en.svg";
import { useTranslation } from "react-i18next";
import { Dropdown as AntDropdown } from "antd";
type ThemeContextType = "dark" | "light";

const Header = () => {
  const {
    theme,
    setTheme,
    isAuthenticated,
    user,
    setUser,
    setIsAuthenticated
  } = useCurrentApp();

  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [openDrawer, setOpenDrawer] = useState(false);
  const [openManageAccount, setOpenManageAccount] = useState(false);

  const backendURL = import.meta.env.VITE_BACKEND_URL || "";
  const urlAvatar = useMemo(() => {
    return user?.avatar
      ? `${backendURL}/images/avatar/${user.avatar}`
      : undefined;
  }, [user?.avatar, backendURL]);

  const handleMode = (mode: ThemeContextType) => {
    localStorage.setItem("theme", mode);
    document.documentElement.setAttribute("data-bs-theme", mode);
    setTheme(mode);
  };

  const sportsMenu = (
    <Menu>
      <Menu.Item key="football">
        <Link
          to="/football"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          {t("sports.football")}
        </Link>
      </Menu.Item>
      <Menu.Item key="badminton">
        <Link
          to="/badminton"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          {t("sports.badminton")}
        </Link>
      </Menu.Item>
      <Menu.Item key="pickleball">
        <Link
          to="/pickleball"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          {t("sports.pickleball")}
        </Link>
      </Menu.Item>
      <Menu.Item key="volleyball">
        <Link
          to="/volleyball"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          {t("sports.volleyball")}
        </Link>
      </Menu.Item>
      <Menu.Item key="basketball">
        <Link
          to="/basketball"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          {t("sports.basketball")}
        </Link>
      </Menu.Item>
    </Menu>
  );

  const handleLogout = async () => {
    try {
      const res = await logoutAPI();
      if (res?.data) {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("access_token");
        localStorage.removeItem("carts");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const renderFlag = (language: string) => {
    return (
      <img
        style={{ height: 20, width: 20 }}
        src={language === "en" ? enFlag : viFlag}
        alt={language}
      />
    );
  };

  const menuItems = [
    ...(user?.role === "ADMIN"
      ? [
          {
            label: <Link to="/admin">Trang quản trị</Link>,
            key: "admin"
          }
        ]
      : []),
    {
      label: (
        <span
          style={{ cursor: "pointer" }}
          onClick={() => setOpenManageAccount(true)}
        >
          Quản lý tài khoản
        </span>
      ),
      key: "account"
    },
    {
      label: <Link to="/history">Lịch sử mua hàng</Link>,
      key: "history"
    },
    {
      label: (
        <span style={{ cursor: "pointer" }} onClick={handleLogout}>
          Đăng xuất
        </span>
      ),
      key: "logout"
    }
  ];

  return (
    <>
      <Navbar
        data-bs-theme={theme}
        className="custom-navbar-theme"
        expand="lg"
        style={{
          zIndex: 1,
          fontWeight: "600"
        }}
      >
        <Container className="text-uppercase">
          <Link className="navbar-brand" to="/">
            <span className="brand-green">Vic Sports</span>
          </Link>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <NavLink className="nav-link" to="/">
                {t("appHeader.home")}
              </NavLink>
              <Nav.Item>
                <Dropdown overlay={sportsMenu} trigger={["hover"]}>
                  <span className="nav-link" style={{ cursor: "pointer" }}>
                    {t("appHeader.sports")}
                  </span>
                </Dropdown>
              </Nav.Item>
              <NavLink className="nav-link" to="/">
                {t("appHeader.introduction")}
              </NavLink>
              <NavLink className="nav-link" to="/">
                {t("appHeader.policy")}
              </NavLink>
              <NavLink className="nav-link" to="/">
                {t("appHeader.term")}
              </NavLink>
              <NavLink className="nav-link" to="/">
                {t("appHeader.owner")}
              </NavLink>
            </Nav>

            <Nav className="ms-auto d-flex align-items-center gap-3">
              {/* User menu */}
              <Nav.Item>
                {!isAuthenticated || !user ? (
                  <span
                    className="nav-link"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate("/login")}
                  >
                    {t("appHeader.login")}
                  </span>
                ) : (
                  <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
                    <Space style={{ cursor: "pointer" }}>
                      <Avatar src={urlAvatar} size="small">
                        {user.fullName?.[0]}
                      </Avatar>
                      {user.fullName}
                    </Space>
                  </Dropdown>
                )}
              </Nav.Item>
              {/* Theme switch */}
              <div className="nav-link" style={{ cursor: "pointer" }}>
                {theme === "light" ? (
                  <MdOutlineLightMode
                    onClick={() => handleMode("dark")}
                    style={{ fontSize: 20 }}
                  />
                ) : (
                  <MdNightlight
                    onClick={() => handleMode("light")}
                    style={{ fontSize: 20 }}
                  />
                )}
              </div>

              {/* Language switch */}
              <AntDropdown
                overlay={
                  <div className="dropdown-menu show p-2">
                    <div
                      onClick={() => i18n.changeLanguage("en")}
                      className="dropdown-item d-flex gap-2 align-items-center"
                      style={{ cursor: "pointer" }}
                    >
                      <img
                        src={enFlag}
                        style={{ width: 20, height: 20 }}
                        alt="English"
                      />
                      <span>English</span>
                    </div>
                    <div
                      onClick={() => i18n.changeLanguage("vi")}
                      className="dropdown-item d-flex gap-2 align-items-center"
                      style={{ cursor: "pointer" }}
                    >
                      <img
                        src={viFlag}
                        style={{ width: 20, height: 20 }}
                        alt="Tiếng Việt"
                      />
                      <span>Tiếng Việt</span>
                    </div>
                  </div>
                }
                trigger={["click"]}
              >
                <div style={{ cursor: "pointer" }}>
                  {renderFlag(i18n.resolvedLanguage || "en")}
                </div>
              </AntDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Drawer
        title="Menu chức năng"
        placement="left"
        onClose={() => setOpenDrawer(false)}
        open={openDrawer}
      >
        <p onClick={() => setOpenManageAccount(true)}>Quản lý tài khoản</p>
        <Divider />
        <p onClick={handleLogout}>Đăng xuất</p>
      </Drawer>

      <ManageAccount
        isModalOpen={openManageAccount}
        setIsModalOpen={setOpenManageAccount}
      />
    </>
  );
};

export default Header;

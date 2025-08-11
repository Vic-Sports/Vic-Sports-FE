import { useState, useMemo } from "react";
import { Divider, Drawer, Avatar, Dropdown, Button } from "antd";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { useCurrentApp } from "components/context/app.context";
import { logoutAPI } from "services/api";
import ManageAccount from "../client/account";
import { Container } from "react-bootstrap";
import viFlag from "../../assets/svg/language/vi.svg";
import enFlag from "../../assets/svg/language/en.svg";
import { useTranslation } from "react-i18next";
import { FaBolt } from "react-icons/fa";

const Header = () => {
  const { isAuthenticated, user, setUser, setIsAuthenticated } =
    useCurrentApp();

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

  const languageMenuItems = [
    {
      key: "en",
      label: (
        <div
          className="d-flex gap-2 align-items-center"
          onClick={() => i18n.changeLanguage("en")}
          style={{ color: "#fff" }}
        >
          <img src={enFlag} style={{ width: 20, height: 20 }} alt="English" />
          <span>English</span>
        </div>
      )
    },
    {
      key: "vi",
      label: (
        <div
          className="d-flex gap-2 align-items-center"
          onClick={() => i18n.changeLanguage("vi")}
          style={{ color: "#fff" }}
        >
          <img
            src={viFlag}
            style={{ width: 20, height: 20 }}
            alt="Tiếng Việt"
          />
          <span>Tiếng Việt</span>
        </div>
      )
    }
  ];

  return (
    <>
      {/* Simple Header like image 2 */}
      <header
        style={{
          backgroundColor: "#000000",
          padding: "16px 0",
          position: "sticky",
          top: 0,
          zIndex: 1000
        }}
      >
        <Container>
          <div className="d-flex align-items-center justify-content-between">
            {/* Logo */}
            <Link
              to="/"
              className="d-flex align-items-center text-decoration-none"
              style={{ color: "inherit" }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  background: "linear-gradient(45deg, #0ea5e9, #d946ef)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "12px"
                }}
              >
                <FaBolt style={{ color: "white", fontSize: "20px" }} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    background:
                      "linear-gradient(45deg, #0ea5e9, #d946ef, #0ea5e9)",
                    backgroundSize: "200% 200%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    margin: 0,
                    lineHeight: 1,
                    animation: "gradient 3s ease infinite"
                  }}
                >
                  VIC SPORTS
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "rgba(255, 255, 255, 0.6)",
                    fontWeight: "500",
                    letterSpacing: "1.5px",
                    margin: 0
                  }}
                >
                  FUTURE OF SPORTS
                </div>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="d-none d-lg-flex">
              <div className="d-flex gap-1">
                <NavLink to="/" className="nav-button-wrapper">
                  {({ isActive }) => (
                    <Button
                      type="text"
                      className={`nav-button ${isActive ? "active" : ""}`}
                    >
                      {t("appHeader.home")}
                    </Button>
                  )}
                </NavLink>
                <NavLink to="/field" className="nav-button-wrapper">
                  {({ isActive }) => (
                    <Button
                      type="text"
                      className={`nav-button ${isActive ? "active" : ""}`}
                    >
                      {t("appHeader.sports")}
                    </Button>
                  )}
                </NavLink>
                <NavLink to="/introduction" className="nav-button-wrapper">
                  {({ isActive }) => (
                    <Button
                      type="text"
                      className={`nav-button ${isActive ? "active" : ""}`}
                    >
                      {t("appHeader.introduction")}
                    </Button>
                  )}
                </NavLink>
                <NavLink to="/policy" className="nav-button-wrapper">
                  {({ isActive }) => (
                    <Button
                      type="text"
                      className={`nav-button ${isActive ? "active" : ""}`}
                    >
                      {t("appHeader.policy")}
                    </Button>
                  )}
                </NavLink>
                <NavLink to="/terms" className="nav-button-wrapper">
                  {({ isActive }) => (
                    <Button
                      type="text"
                      className={`nav-button ${isActive ? "active" : ""}`}
                    >
                      {t("appHeader.term")}
                    </Button>
                  )}
                </NavLink>
                <NavLink to="/for-owners" className="nav-button-wrapper">
                  {({ isActive }) => (
                    <Button
                      type="text"
                      className={`nav-button ${isActive ? "active" : ""}`}
                    >
                      {t("appHeader.owner")}
                    </Button>
                  )}
                </NavLink>
              </div>
            </nav>

            {/* Right Side Actions */}
            <div className="d-flex align-items-center gap-3">
              {/* Language Switcher */}
              <Dropdown
                menu={{
                  items: languageMenuItems,
                  style: {
                    backgroundColor: "#000",
                    border: "1px solid rgba(255,255,255,0.1)"
                  }
                }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Button
                  className="language-button"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    border: "none",
                    borderRadius: "20px",
                    padding: "8px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "none"
                  }}
                >
                  {renderFlag(i18n.resolvedLanguage || "en")}
                </Button>
              </Dropdown>

              {/* User Profile */}
              {!isAuthenticated || !user ? (
                <Button
                  type="primary"
                  style={{
                    background: "linear-gradient(45deg, #0ea5e9, #d946ef)",
                    border: "none",
                    borderRadius: "20px",
                    padding: "8px 20px",
                    fontWeight: "600"
                  }}
                  onClick={() => navigate("/login")}
                >
                  {t("appHeader.login")}
                </Button>
              ) : (
                <Dropdown
                  menu={{
                    items: menuItems,
                    style: {
                      backgroundColor: "#000",
                      border: "1px solid rgba(255,255,255,0.1)"
                    }
                  }}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <div
                    className="d-flex align-items-center gap-2"
                    style={{ cursor: "pointer" }}
                  >
                    <Avatar src={urlAvatar} size={32}>
                      {user.fullName?.[0] || "U"}
                    </Avatar>
                    <div className="d-none d-md-block">
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "white",
                          margin: 0,
                          lineHeight: 1
                        }}
                      >
                        {user.fullName || "User Pro"}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "rgba(255, 255, 255, 0.6)",
                          margin: 0
                        }}
                      >
                        Level 15
                      </div>
                    </div>
                  </div>
                </Dropdown>
              )}
            </div>
          </div>
        </Container>
      </header>

      <Drawer
        title="Menu chức năng"
        placement="left"
        onClose={() => setOpenDrawer(false)}
        open={openDrawer}
        styles={{
          body: { backgroundColor: "#000", color: "#fff" },
          header: {
            backgroundColor: "#000",
            color: "#fff",
            borderBottom: "1px solid rgba(255,255,255,0.1)"
          }
        }}
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

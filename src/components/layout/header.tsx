import { Avatar, Button, Divider, Drawer, Dropdown } from "antd";
import { useCurrentApp } from "components/context/app.context";
import { useMemo, useState } from "react";
import { Container } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { FaBolt } from "react-icons/fa";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { logoutAPI } from "services/api";
import enFlag from "../../assets/svg/language/en.svg";
import viFlag from "../../assets/svg/language/vi.svg";
import ManageAccount from "../client/account";

const Header = () => {
  const { isAuthenticated, user, setUser, setIsAuthenticated } =
    useCurrentApp();

  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [openDrawer, setOpenDrawer] = useState(false);
  const [openManageAccount, setOpenManageAccount] = useState(false);

  const backendURL = import.meta.env.VITE_BACKEND_URL || "";
  const urlAvatar = useMemo(() => {
    if (!user?.avatar) return undefined;
    // Nếu là link Google hoặc link cloud thì dùng trực tiếp
    if (user.avatar.startsWith("http")) return user.avatar;
    // Nếu là tên file thì dùng backendURL
    return `${backendURL}/images/avatar/${user.avatar}`;
  }, [user?.avatar, backendURL]);

  // Không dùng trạng thái loading cho logout

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

  const renderFlag = (language: string) => {
    return (
      <img
        style={{ height: 20, width: 20 }}
        src={language === "en" ? enFlag : viFlag}
        alt={language}
      />
    );
  };

  // Create menu items with conditional Owner Dashboard
  const createMenuItems = () => {
    const items = [
      {
        label: (
          <div
            style={{
              cursor: "pointer",
              color: "#1a1a1a",
              padding: "8px 12px",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "16px",
              transition: "all 0.3s ease",
            }}
            onClick={() => setOpenManageAccount(true)}
          >
            {t("appHeader.profile")}
          </div>
        ),
        key: "account",
      },
    ];

    // Add Owner Dashboard if user is an owner
    if (user?.role === "owner") {
      items.push({
        label: (
          <div
            style={{
              cursor: "pointer",
              color: "#1a1a1a",
              padding: "8px 12px",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "16px",
              transition: "all 0.3s ease",
            }}
            onClick={() => navigate("/owner")}
          >
            {t("appHeader.ownerDashboard")}
          </div>
        ),
        key: "owner-dashboard",
      });
    }

    items.push(
      {
        label: (
          <div
            style={{
              cursor: "pointer",
              color: "#1a1a1a",
              padding: "8px 12px",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "16px",
              transition: "all 0.3s ease",
            }}
            onClick={() => navigate("/history")}
          >
            {t("appHeader.history")}
          </div>
        ),
        key: "history",
      },
      {
        label: (
          <div
            style={{
              cursor: "pointer",
              color: "#1a1a1a",
              padding: "8px 12px",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "16px",
              transition: "all 0.3s ease",
            }}
            onClick={handleLogout}
          >
            {t("appHeader.logout")}
          </div>
        ),
        key: "logout",
      }
    );

    return items;
  };

  const menuItems = createMenuItems();

  const languageMenuItems = [
    {
      key: "en",
      label: (
        <div
          className="d-flex gap-2 align-items-center"
          onClick={() => i18n.changeLanguage("en")}
          style={{ color: "#1a1a1a" }}
        >
          <img src={enFlag} style={{ width: 20, height: 20 }} alt="English" />
          <span>English</span>
        </div>
      ),
    },
    {
      key: "vi",
      label: (
        <div
          className="d-flex gap-2 align-items-center"
          onClick={() => i18n.changeLanguage("vi")}
          style={{ color: "#1a1a1a" }}
        >
          <img
            src={viFlag}
            style={{ width: 20, height: 20 }}
            alt="Tiếng Việt"
          />
          <span>Tiếng Việt</span>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Modern Sports Header */}
      <header
        className="header-navbar"
        style={{
          backgroundColor: "#FFFFFF",
          padding: "12px 0",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          boxShadow: "0 2px 20px rgba(0,0,0,0.08)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <Container>
          <div className="d-flex align-items-center justify-content-between">
            {/* Logo */}
            <Link
              to="/"
              className="d-flex align-items-center text-decoration-none navbar-brand"
              style={{ color: "inherit" }}
            >
              <div
                style={{
                  width: "45px",
                  height: "45px",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "15px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "15px",
                  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
                  transition: "all 0.3s ease",
                }}
              >
                <FaBolt style={{ color: "white", fontSize: "22px" }} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "26px",
                    fontWeight: "800",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    margin: 0,
                    lineHeight: 1.1,
                    letterSpacing: "-0.5px",
                  }}
                >
                  VIC SPORTS
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "rgba(26, 26, 26, 0.7)",
                    fontWeight: "600",
                    letterSpacing: "2px",
                    margin: 0,
                    textTransform: "uppercase",
                  }}
                >
                  FUTURE OF SPORTS
                </div>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="d-none d-lg-flex">
              <div className="d-flex gap-2">
                <NavLink to="/" className="nav-button-wrapper">
                  {({ isActive }) => (
                    <Button
                      type="text"
                      className={`header-nav-link ${isActive ? "active" : ""}`}
                      style={{
                        padding: "10px 20px",
                        borderRadius: "25px",
                        fontWeight: "600",
                        fontSize: "15px",
                        height: "auto",
                        border: "none",
                        background: isActive
                          ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                          : "transparent",
                        color: isActive ? "white" : "#1a1a1a",
                        transition: "all 0.3s ease",
                        boxShadow: isActive
                          ? "0 4px 15px rgba(102, 126, 234, 0.3)"
                          : "none",
                      }}
                    >
                      {t("appHeader.home")}
                    </Button>
                  )}
                </NavLink>
                <NavLink to="/venues" className="nav-button-wrapper">
                  {({ isActive }) => (
                    <Button
                      type="text"
                      className={`header-nav-link ${isActive ? "active" : ""}`}
                      style={{
                        padding: "10px 20px",
                        borderRadius: "25px",
                        fontWeight: "600",
                        fontSize: "15px",
                        height: "auto",
                        border: "none",
                        background: isActive
                          ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                          : "transparent",
                        color: isActive ? "white" : "#1a1a1a",
                        transition: "all 0.3s ease",
                        boxShadow: isActive
                          ? "0 4px 15px rgba(102, 126, 234, 0.3)"
                          : "none",
                      }}
                    >
                      {t("appHeader.venues")}
                    </Button>
                  )}
                </NavLink>
                <NavLink to="/coaches" className="nav-button-wrapper">
                  {({ isActive }) => (
                    <Button
                      type="text"
                      className={`header-nav-link ${isActive ? "active" : ""}`}
                      style={{
                        padding: "10px 20px",
                        borderRadius: "25px",
                        fontWeight: "600",
                        fontSize: "15px",
                        height: "auto",
                        border: "none",
                        background: isActive
                          ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                          : "transparent",
                        color: isActive ? "white" : "#1a1a1a",
                        transition: "all 0.3s ease",
                        boxShadow: isActive
                          ? "0 4px 15px rgba(102, 126, 234, 0.3)"
                          : "none",
                      }}
                    >
                      {t("appHeader.coaches")}
                    </Button>
                  )}
                </NavLink>
                <NavLink to="/community" className="nav-button-wrapper">
                  {({ isActive }) => (
                    <Button
                      type="text"
                      className={`header-nav-link ${isActive ? "active" : ""}`}
                      style={{
                        padding: "10px 20px",
                        borderRadius: "25px",
                        fontWeight: "600",
                        fontSize: "15px",
                        height: "auto",
                        border: "none",
                        background: isActive
                          ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                          : "transparent",
                        color: isActive ? "white" : "#1a1a1a",
                        transition: "all 0.3s ease",
                        boxShadow: isActive
                          ? "0 4px 15px rgba(102, 126, 234, 0.3)"
                          : "none",
                      }}
                    >
                      {t("appHeader.community")}
                    </Button>
                  )}
                </NavLink>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <Button
              className="d-lg-none navbar-toggler"
              type="text"
              onClick={() => setOpenDrawer(true)}
              style={{
                color: "#1a1a1a",
                fontSize: "20px",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "none",
                background: "rgba(102, 126, 234, 0.1)",
                transition: "all 0.3s ease",
              }}
            >
              ☰
            </Button>

            {/* Right Side Actions */}
            <div className="d-flex align-items-center gap-3">
              {/* Language Switcher */}
              <Dropdown
                menu={{
                  items: languageMenuItems,
                  className: "language-dropdown",
                  style: {
                    backgroundColor: "#FFFFFF",
                    border: "1px solid rgba(0,0,0,0.1)",
                    borderRadius: "15px",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                    padding: "8px",
                  },
                }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Button
                  className="language-toggle"
                  style={{
                    backgroundColor: "rgba(102, 126, 234, 0.1)",
                    border: "none",
                    borderRadius: "12px",
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "all 0.3s ease",
                    boxShadow: "none",
                  }}
                >
                  {renderFlag(i18n.resolvedLanguage || "en")}
                </Button>
              </Dropdown>

              {/* User Profile */}
              {!isAuthenticated || !user ? (
                <Button
                  type="primary"
                  className="login-btn"
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                    borderRadius: "25px",
                    padding: "12px 24px",
                    fontWeight: "700",
                    fontSize: "15px",
                    height: "auto",
                    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
                    transition: "all 0.3s ease",
                  }}
                  onClick={() => navigate("/login")}
                >
                  {t("appHeader.login")}
                </Button>
              ) : (
                <Dropdown
                  menu={{
                    items: menuItems,
                    className: "sports-dropdown-menu",
                    style: {
                      backgroundColor: "#FFFFFF",
                      border: "1px solid rgba(0,0,0,0.1)",
                      borderRadius: "15px",
                      boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                      padding: "8px",
                    },
                  }}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <div
                    className="d-flex align-items-center gap-3 user-menu"
                    style={{
                      cursor: "pointer",
                      padding: "8px 12px",
                      borderRadius: "15px",
                      background: "rgba(102, 126, 234, 0.05)",
                      transition: "all 0.3s ease",
                      border: "1px solid rgba(102, 126, 234, 0.1)",
                    }}
                  >
                    <Avatar
                      src={urlAvatar}
                      size={36}
                      style={{
                        border: "2px solid rgba(102, 126, 234, 0.2)",
                        boxShadow: "0 2px 8px rgba(102, 126, 234, 0.2)",
                      }}
                    >
                      {user.fullName?.[0] || "U"}
                    </Avatar>
                    <div className="d-none d-md-block">
                      <div
                        className="user-name"
                        style={{
                          fontSize: "15px",
                          fontWeight: "700",
                          color: "#1a1a1a",
                          margin: 0,
                          lineHeight: 1.2,
                        }}
                      >
                        {user.fullName || "User Pro"}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "rgba(26, 26, 26, 0.7)",
                          margin: 0,
                          fontWeight: "500",
                        }}
                      >
                        {user.rewardPoints || 0} VIC token
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
        title={
          <div className="d-flex align-items-center gap-3">
            <div
              style={{
                width: "35px",
                height: "35px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaBolt style={{ color: "white", fontSize: "18px" }} />
            </div>
            <span style={{ fontWeight: "700", fontSize: "18px" }}>
              {t("appHeader.menu")}
            </span>
          </div>
        }
        placement="left"
        onClose={() => setOpenDrawer(false)}
        open={openDrawer}
        styles={{
          body: {
            backgroundColor: "#FFFFFF",
            color: "#1a1a1a",
            padding: "24px",
          },
          header: {
            backgroundColor: "#FFFFFF",
            color: "#1a1a1a",
            borderBottom: "1px solid rgba(0,0,0,0.1)",
            padding: "20px 24px",
          },
        }}
      >
        <div className="d-flex flex-column gap-2">
          <NavLink
            to="/"
            className="text-decoration-none mobile-nav-item"
            style={{
              color: "#1a1a1a",
              padding: "16px 20px",
              borderRadius: "12px",
              fontWeight: "600",
              fontSize: "16px",
              transition: "all 0.3s ease",
              background: "transparent",
            }}
            onClick={() => setOpenDrawer(false)}
          >
            {t("appHeader.home")}
          </NavLink>
          <NavLink
            to="/venues"
            className="text-decoration-none mobile-nav-item"
            style={{
              color: "#1a1a1a",
              padding: "16px 20px",
              borderRadius: "12px",
              fontWeight: "600",
              fontSize: "16px",
              transition: "all 0.3s ease",
              background: "transparent",
            }}
            onClick={() => setOpenDrawer(false)}
          >
            {t("appHeader.venues")}
          </NavLink>
          <NavLink
            to="/coaches"
            className="text-decoration-none mobile-nav-item"
            style={{
              color: "#1a1a1a",
              padding: "16px 20px",
              borderRadius: "12px",
              fontWeight: "600",
              fontSize: "16px",
              transition: "all 0.3s ease",
              background: "transparent",
            }}
            onClick={() => setOpenDrawer(false)}
          >
            {t("appHeader.coaches")}
          </NavLink>
          <NavLink
            to="/community"
            className="text-decoration-none mobile-nav-item"
            style={{
              color: "#1a1a1a",
              padding: "16px 20px",
              borderRadius: "12px",
              fontWeight: "600",
              fontSize: "16px",
              transition: "all 0.3s ease",
              background: "transparent",
            }}
            onClick={() => setOpenDrawer(false)}
          >
            {t("appHeader.community")}
          </NavLink>
          <Divider
            style={{ borderColor: "rgba(0,0,0,0.1)", margin: "20px 0" }}
          />
          <div
            className="mobile-nav-item"
            style={{
              color: "#1a1a1a",
              padding: "16px 20px",
              borderRadius: "12px",
              fontWeight: "600",
              fontSize: "16px",
              transition: "all 0.3s ease",
              background: "transparent",
              cursor: "pointer",
            }}
            onClick={() => {
              setOpenManageAccount(true);
              setOpenDrawer(false);
            }}
          >
            {t("appHeader.profile")}
          </div>
          <Divider
            style={{ borderColor: "rgba(0,0,0,0.1)", margin: "20px 0" }}
          />
          <div
            className="mobile-nav-item"
            style={{
              color: "#e74c3c",
              padding: "16px 20px",
              borderRadius: "12px",
              fontWeight: "600",
              fontSize: "16px",
              transition: "all 0.3s ease",
              background: "transparent",
              cursor: "pointer",
            }}
            onClick={() => {
              setOpenDrawer(false);
              handleLogout();
            }}
          >
            {t("appHeader.logout")}
          </div>
        </div>
      </Drawer>

      <ManageAccount
        isModalOpen={openManageAccount}
        setIsModalOpen={setOpenManageAccount}
      />
    </>
  );
};

export default Header;

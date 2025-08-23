import { Button, Result } from "antd";
import { useCurrentApp } from "components/context/app.context";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaSignInAlt, FaRedo } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import "./auth.scss";

interface IProps {
  children: React.ReactNode;
}

const ProtectedRoute = (props: IProps) => {
  const location = useLocation();
  const { isAuthenticated, user } = useCurrentApp();
  const { t } = useTranslation();

  // Kiểm tra xem có đang loading không
  if (isAuthenticated === undefined) {
    return (
      <div className="auth-error-container">
        <div className="orb-3"></div>
        <Result
          status="info"
          title={t("auth.loading_title")}
          subTitle={t("auth.loading_subtitle")}
          icon={<div className="loading-spinner"></div>}
        />
      </div>
    );
  }

  // Kiểm tra xem có đăng nhập không
  if (isAuthenticated === false) {
    return (
      <div className="auth-error-container">
        <div className="orb-3"></div>
        <Result
          status="403"
          title={t("auth.unauthorized_title")}
          subTitle={t("auth.unauthorized_subtitle")}
          extra={[
            <Button type="primary" key="login" size="large">
              <Link to="/login">
                <FaSignInAlt /> {t("auth.login_button")}
              </Link>
            </Button>,
            <Button key="home" size="large">
              <Link to="/">
                <FaHome /> {t("auth.home_button")}
              </Link>
            </Button>
          ]}
        />
      </div>
    );
  }

  // Kiểm tra quyền admin
  const isAdminRoute = location.pathname.includes("admin");
  if (isAuthenticated === true && isAdminRoute === true) {
    const role = user?.role;
    if (role === "customer") {
      return (
        <div className="auth-error-container">
          <div className="orb-3"></div>
          <Result
            status="403"
            title={t("auth.forbidden_title")}
            subTitle={t("auth.forbidden_subtitle")}
            extra={[
              <Button type="primary" key="home" size="large">
                <Link to="/">
                  <FaHome /> {t("auth.home_button")}
                </Link>
              </Button>
            ]}
          />
        </div>
      );
    }
  }

  // Kiểm tra xem user có tồn tại không
  if (isAuthenticated === true && !user) {
    return (
      <div className="auth-error-container">
        <div className="orb-3"></div>
        <Result
          status="500"
          title={t("auth.user_error_title")}
          subTitle={t("auth.user_error_subtitle")}
          extra={[
            <Button type="primary" key="login" size="large">
              <Link to="/login">
                <FaSignInAlt /> {t("auth.relogin_button")}
              </Link>
            </Button>,
            <Button key="home" size="large">
              <Link to="/">
                <FaHome /> {t("auth.home_button")}
              </Link>
            </Button>
          ]}
        />
      </div>
    );
  }

  // Kiểm tra xem có lỗi network không
  if (isAuthenticated === true && user && !navigator.onLine) {
    return (
      <div className="auth-error-container">
        <div className="orb-3"></div>
        <Result
          status="warning"
          title={t("auth.network_error_title")}
          subTitle={t("auth.network_error_subtitle")}
          extra={[
            <Button
              type="primary"
              key="retry"
              size="large"
              onClick={() => window.location.reload()}
            >
              <FaRedo /> {t("auth.retry_button")}
            </Button>
          ]}
        />
      </div>
    );
  }

  return <>{props.children}</>;
};

export default ProtectedRoute;

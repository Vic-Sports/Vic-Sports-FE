// NotFoundPage.tsx - 404 Error Page
import { Button, Result } from "antd";
import { Link } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import "./auth.scss";

const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <div className="auth-error-container">
      <div className="orb-3"></div>
      <Result
        status="404"
        title={t("error.404_title") || "404"}
        subTitle={
          t("error.404_subtitle") ||
          "Sorry, the page you visited does not exist."
        }
        extra={[
          <Button type="primary" key="home" size="large">
            <Link to="/">
              <FaHome /> {t("error.back_home") || "Back Home"}
            </Link>
          </Button>
        ]}
      />
    </div>
  );
};

export default NotFoundPage;

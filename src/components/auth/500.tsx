import { Button, Result } from "antd";
import { Link } from "react-router-dom";
import { FaHome, FaRedo } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import "./auth.scss";

interface ServerErrorPageProps {
  error?: Error;
  resetError?: () => void;
}

const ServerErrorPage = ({ error, resetError }: ServerErrorPageProps) => {
  const { t } = useTranslation();

  const handleRefresh = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="auth-error-container">
      <div className="orb-3"></div>
      <Result
        status="500"
        title={t("error.500_title") || "500"}
        subTitle={t("error.500_subtitle") || "Sorry, something went wrong."}
        extra={[
          <Button
            type="primary"
            key="retry"
            size="large"
            onClick={handleRefresh}
          >
            <FaRedo /> {t("error.retry") || "Retry"}
          </Button>,
          <Button key="home" size="large">
            <Link to="/">
              <FaHome /> {t("error.back_home") || "Back Home"}
            </Link>
          </Button>
        ]}
      />

      {/* Development Error Details */}
      {process.env.NODE_ENV === "development" && error && (
        <div className="error-details">
          <details className="error-stack">
            <summary>Chi tiết lỗi (Development)</summary>
            <pre className="error-message">
              {error.name}: {error.message}
            </pre>
            <pre className="error-stack-trace">{error.stack}</pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default ServerErrorPage;

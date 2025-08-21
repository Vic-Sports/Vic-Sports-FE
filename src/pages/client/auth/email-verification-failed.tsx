import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Result, Button, message } from "antd";
import {
  CloseCircleOutlined,
  HomeOutlined,
  MailOutlined
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { resendVerificationAPI } from "@/services/api";

const EmailVerificationFailedPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [error, setError] = useState<string>("");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const handleResendVerification = async () => {
    // Prompt user for email
    const email = prompt(
      "Please enter your email address to resend verification:"
    );
    if (!email) return;

    setIsResending(true);
    try {
      const res = await resendVerificationAPI(email);
      if (res.success) {
        message.success(
          "Verification email sent successfully! Please check your inbox."
        );
      } else {
        message.error(res.message || "Failed to resend verification email");
      }
    } catch (error: any) {
      message.error("Failed to resend verification email");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="auth-error-container">
      <div className="orb-3"></div>
      <Result
        status="error"
        icon={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />}
        title={
          <span
            style={{ color: "#ff4d4f", fontSize: "24px", fontWeight: "bold" }}
          >
            Email Verification Failed
          </span>
        }
        subTitle={
          <div style={{ color: "#666", fontSize: "16px" }}>
            <p>
              <strong>Error:</strong> {error}
            </p>
            <p>This could happen if:</p>
            <ul style={{ textAlign: "left", display: "inline-block" }}>
              <li>The verification link has expired</li>
              <li>The link has already been used</li>
              <li>The link is invalid or corrupted</li>
            </ul>
          </div>
        }
        extra={[
          <Button
            type="primary"
            key="resend"
            size="large"
            icon={<MailOutlined />}
            loading={isResending}
            onClick={handleResendVerification}
          >
            Resend Verification Email
          </Button>,
          <Button
            key="home"
            size="large"
            icon={<HomeOutlined />}
            onClick={() => navigate("/")}
          >
            Go to Home
          </Button>
        ]}
      />
    </div>
  );
};

export default EmailVerificationFailedPage;

import { App, Button, Form, Input, Checkbox, Modal } from "antd";
import { Link, useNavigate } from "react-router-dom";
import "./login.scss";
import { useState, useEffect } from "react";
import type { FormProps } from "antd";
import {
  loginAPI,
  loginWithGoogleAPI,
  resendVerificationAPI
} from "@/services/api";
import { useCurrentApp } from "@/components/context/app.context";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import google from "@/assets/svg/images/google-logo.png";
import facebook from "@/assets/svg/images/facebook-logo.png";
import { useTranslation } from "react-i18next";
import loginAnimation from "@/assets/lottie/login-animation.json";
import AnimationLottie from "@/share/animation-lottie";
import { FaLock, FaEnvelope } from "react-icons/fa";

type FieldType = {
  email: string;
  password: string;
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [isSubmit, setIsSubmit] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showResendModal, setShowResendModal] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const { message, notification } = App.useApp();
  const { setIsAuthenticated, setUser } = useCurrentApp();
  const { t } = useTranslation();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      const res = await resendVerificationAPI(resendEmail);
      if (res.message) {
        message.success(
          t("login.resend_success") ||
            "Verification email sent successfully! Please check your inbox."
        );
        setShowResendModal(false);
      } else {
        message.error(
          res.message ||
            t("login.resend_error") ||
            "Failed to resend verification email"
        );
      }
    } catch {
      message.error(
        t("login.resend_error") || "Failed to resend verification email"
      );
    } finally {
      setIsResending(false);
    }
  };

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    const { email, password } = values;
    setIsSubmit(true);

    try {
      const res = await loginAPI(email, password);
      setIsSubmit(false);

      if (res?.data) {
        setIsAuthenticated(true);
        setUser(res.data.user);
        // Backend returns { token, refreshToken }
        if (res.data.token) {
          localStorage.setItem("access_token", res.data.token);
        }
        if (res.data.refreshToken) {
          localStorage.setItem("refresh_token", res.data.refreshToken);
        }
        message.success(t("login.login_success"));
        navigate("/");
      } else {
        // Handle different error types
        const errorMessage =
          res.error && Array.isArray(res.error)
            ? res.error[0]
            : res.error || res.message;

        // Check for specific error types
        if (
          errorMessage?.toLowerCase().includes("verify") ||
          errorMessage?.toLowerCase().includes("verification") ||
          errorMessage?.toLowerCase().includes("confirmed") ||
          errorMessage?.toLowerCase().includes("xác thực")
        ) {
          // Account not verified - only show modal, no notification
          setResendEmail(email);
          setShowResendModal(true);
        } else if (
          errorMessage?.toLowerCase().includes("invalid") ||
          errorMessage?.toLowerCase().includes("wrong") ||
          errorMessage?.toLowerCase().includes("incorrect") ||
          errorMessage?.toLowerCase().includes("không đúng") ||
          errorMessage?.toLowerCase().includes("sai")
        ) {
          // Invalid credentials
          notification.error({
            message: t("login.error_invalid_credentials"),
            duration: 5
          });
        } else if (
          errorMessage?.toLowerCase().includes("locked") ||
          errorMessage?.toLowerCase().includes("blocked") ||
          errorMessage?.toLowerCase().includes("suspended") ||
          errorMessage?.toLowerCase().includes("khóa")
        ) {
          // Account locked
          notification.error({
            message: t("login.error_account_locked"),
            duration: 8
          });
        } else if (
          errorMessage?.toLowerCase().includes("too many") ||
          errorMessage?.toLowerCase().includes("rate limit") ||
          errorMessage?.toLowerCase().includes("quá nhiều")
        ) {
          // Too many attempts
          notification.warning({
            message: t("login.error_too_many_attempts"),
            duration: 8
          });
        } else {
          // Generic error
          notification.error({
            message: errorMessage || t("login.error_unknown"),
            duration: 5
          });
        }
      }
    } catch (err: any) {
      setIsSubmit(false);

      // Handle network and server errors
      if (
        err.code === "NETWORK_ERROR" ||
        err.message?.includes("Network Error")
      ) {
        notification.error({
          message: t("login.error_network"),
          duration: 8
        });
      } else if (err.response?.status >= 500) {
        notification.error({
          message: t("login.error_server"),
          duration: 8
        });
      } else if (err.response?.status === 401) {
        notification.error({
          message: t("login.error_invalid_credentials"),
          duration: 5
        });
      } else if (err.response?.status === 403) {
        notification.error({
          message: t("login.error_account_locked"),
          duration: 8
        });
      } else {
        notification.error({
          message: err.message || t("login.error_unknown"),
          duration: 5
        });
      }
    }
  };

  const loginGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const { data } = await axios(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${tokenResponse?.access_token}`
          }
        }
      );
      if (data && data.email) {
        const res = await loginWithGoogleAPI("GOOGLE", data.email);
        if (res?.data) {
          setIsAuthenticated(true);
          setUser(res.data.user);
          if (res.data.token) {
            localStorage.setItem("access_token", res.data.token);
          }
          if (res.data.refreshToken) {
            localStorage.setItem("refresh_token", res.data.refreshToken);
          }
          message.success(t("login.login_success"));
          navigate("/");
        } else {
          notification.error({
            message:
              res.error && Array.isArray(res.error)
                ? res.error[0]
                : res.error || res.message,
            duration: 5
          });
        }
      }
    }
  });

  return (
    <div className="futuristic-auth">
      {/* Animated Background */}
      <div className="animated-background">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
      </div>

      <div className="auth-container">
        {/* Animation bên trái */}
        <div className="auth-left">
          <div className="animation-container">
            <AnimationLottie width="100%" animationPath={loginAnimation} />
          </div>
        </div>

        {/* Form bên phải */}
        <div className="auth-right">
          <div className="auth-content">
            <div className={`auth-header ${isVisible ? "fade-in" : ""}`}>
              <h1 className="auth-title">{t("login.login_title")}</h1>

              <p className="auth-description">{t("login.login_text")}</p>
            </div>

            <div
              className={`auth-form-container ${isVisible ? "slide-up" : ""}`}
            >
              <Form
                name="login-form"
                onFinish={onFinish}
                autoComplete="off"
                layout="vertical"
                className="futuristic-form"
              >
                <Form.Item<FieldType>
                  label={
                    <span className="form-label">
                      <FaEnvelope className="label-icon" />
                      Email
                    </span>
                  }
                  name="email"
                  rules={[
                    { required: true, message: t("login.message_email1") },
                    { type: "email", message: t("login.message_email2") }
                  ]}
                >
                  <Input
                    placeholder={t("login.placeholder_email")}
                    className="futuristic-input"
                    prefix={<FaEnvelope className="input-icon" />}
                    autoComplete="off"
                    data-lpignore="true"
                    data-form-type="other"
                  />
                </Form.Item>

                <Form.Item<FieldType>
                  label={
                    <span className="form-label">
                      <FaLock className="label-icon" />
                      {t("login.password")}
                    </span>
                  }
                  name="password"
                  rules={[
                    { required: true, message: t("login.message_password") }
                  ]}
                >
                  <Input.Password
                    placeholder="************"
                    className="futuristic-input"
                    prefix={<FaLock className="input-icon" />}
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-form-type="other"
                  />
                </Form.Item>

                <div className="auth-options">
                  <Checkbox className="futuristic-checkbox">
                    {t("login.remember")}
                  </Checkbox>
                  <Link to="/forgot-password" className="forgot-link">
                    {t("login.forgot")}
                  </Link>
                </div>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isSubmit}
                    className="auth-button primary"
                  >
                    {t("login.signin")}
                  </Button>
                </Form.Item>
              </Form>

              <div className="social-section">
                <div className="divider">
                  <span>{t("login.or")}</span>
                </div>

                <div className="social-buttons">
                  <Button
                    className="social-button google"
                    onClick={() => loginGoogle()}
                  >
                    <img src={google} alt="Google" className="social-logo" />
                    {t("login.google")}
                  </Button>

                  <Button
                    className="social-button facebook"
                    onClick={() => alert("me")}
                  >
                    <img
                      src={facebook}
                      alt="Facebook"
                      className="social-logo"
                    />
                    {t("login.facebook")}
                  </Button>
                </div>
              </div>

              <p className="auth-footer">
                {t("login.account")}
                <Link to="/register" className="auth-link">
                  {t("login.signup")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Resend Verification Modal */}
      <Modal
        title={
          <div
            style={{ textAlign: "center", fontSize: "18px", fontWeight: "600" }}
          >
            {t("login.error_account_not_verified")}
          </div>
        }
        open={showResendModal}
        onCancel={() => setShowResendModal(false)}
        width={500}
        centered
        footer={[
          <Button
            key="cancel"
            onClick={() => setShowResendModal(false)}
            size="large"
            style={{ marginRight: "8px" }}
          >
            {t("auth.cancel") || "Cancel"}
          </Button>,
          <Button
            key="resend"
            type="primary"
            loading={isResending}
            onClick={handleResendVerification}
            size="large"
          >
            {t("auth.resend") || "Resend Verification Email"}
          </Button>
        ]}
        styles={{
          header: {
            borderBottom: "1px solid #f0f0f0",
            paddingBottom: "16px"
          },
          body: {
            padding: "24px"
          },
          footer: {
            borderTop: "1px solid #f0f0f0",
            paddingTop: "16px"
          }
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "48px",
              color: "#faad14",
              marginBottom: "16px",
              display: "flex",
              justifyContent: "center"
            }}
          >
            ⚠️
          </div>
          <p
            style={{
              fontSize: "16px",
              color: "#666",
              marginBottom: "20px",
              lineHeight: "1.6"
            }}
          >
            {t("login.error_account_not_verified")}
          </p>
          <div
            style={{
              background: "#f6f8fa",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "20px",
              border: "1px solid #e1e4e8"
            }}
          >
            <p style={{ margin: "0", fontSize: "14px", color: "#586069" }}>
              <strong>Email:</strong> {resendEmail}
            </p>
          </div>
          <p
            style={{
              fontSize: "14px",
              color: "#666",
              lineHeight: "1.5"
            }}
          >
            {t("login.resend_instruction") ||
              "If you didn't receive the email, click 'Resend Verification Email' to send it again."}
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default LoginPage;

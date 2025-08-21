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
      if (res.success) {
        message.success(
          "Verification email sent successfully! Please check your inbox."
        );
        setShowResendModal(false);
      } else {
        message.error(res.message || "Failed to resend verification email");
      }
    } catch (error: any) {
      message.error("Failed to resend verification email");
    } finally {
      setIsResending(false);
    }
  };

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    const { email, password } = values;
    setIsSubmit(true);
    const res = await loginAPI(email, password);
    setIsSubmit(false);
    if (res?.data) {
      setIsAuthenticated(true);
      setUser(res.data.user);
      localStorage.setItem("access_token", res.data.access_token);
      if (res.data.refresh_token) {
        localStorage.setItem("refresh_token", res.data.refresh_token);
      }
      message.success(t("login.login_success"));
      navigate("/");
    } else {
      // Check if error is about email verification
      const errorMessage =
        res.message && Array.isArray(res.message)
          ? res.message[0]
          : res.message;

      if (errorMessage?.includes("verify your email")) {
        setResendEmail(email);
        setShowResendModal(true);
      } else {
        notification.error({
          message: t("login.login_err"),
          description: errorMessage,
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
          localStorage.setItem("access_token", res.data.access_token);
          if (res.data.refresh_token) {
            localStorage.setItem("refresh_token", res.data.refresh_token);
          }
          message.success(t("login.login_success"));
          navigate("/");
        } else {
          notification.error({
            message: t("login.login_err"),
            description:
              res.message && Array.isArray(res.message)
                ? res.message[0]
                : res.message,
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
                  <Link to="#" className="forgot-link">
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
        title="Email Verification Required"
        open={showResendModal}
        onCancel={() => setShowResendModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowResendModal(false)}>
            Cancel
          </Button>,
          <Button
            key="resend"
            type="primary"
            loading={isResending}
            onClick={handleResendVerification}
          >
            Resend Verification Email
          </Button>
        ]}
      >
        <p>
          Your email address is not verified yet. Please check your inbox for
          the verification email.
        </p>
        <p>
          Email: <strong>{resendEmail}</strong>
        </p>
        <p>
          If you didn't receive the email, click "Resend Verification Email" to
          send it again.
        </p>
      </Modal>
    </div>
  );
};

export default LoginPage;

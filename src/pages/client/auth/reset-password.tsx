import { App, Button, Form, Input } from "antd";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { useState, useEffect } from "react";
import type { FormProps } from "antd";
import { resetPasswordAPI } from "@/services/api";
import { useTranslation } from "react-i18next";
import AnimationLottie from "@/share/animation-lottie";
import { FaLock, FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import resetPasswordAnimation from "@/assets/lottie/reset-password-animation.json";

type FieldType = {
  newPassword: string;
  confirmPassword: string;
};

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmit, setIsSubmit] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const { message } = App.useApp();
  const { t } = useTranslation();

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      message.error(t("reset_password.no_token") || "Invalid reset link");
      navigate("/forgot-password");
      return;
    }
    setIsVisible(true);
  }, [token, navigate, message, t]);

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    const { newPassword, confirmPassword } = values;

    if (newPassword !== confirmPassword) {
      message.error(
        t("reset_password.password_mismatch") || "Passwords do not match"
      );
      return;
    }

    setIsSubmit(true);

    try {
      const res = await resetPasswordAPI(token!, newPassword);
      setIsSubmit(false);

      if (res?.message) {
        setShowSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        message.error(
          res.error ||
            res.message ||
            t("reset_password.error") ||
            "An error occurred"
        );
      }
    } catch (error: any) {
      setIsSubmit(false);
      message.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          t("reset_password.error") ||
          "An error occurred"
      );
    }
  };

  const handleBackToForgotPassword = () => {
    navigate("/forgot-password");
  };

  if (!token) {
    return null;
  }

  if (showSuccess) {
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
              <AnimationLottie
                animationPath={resetPasswordAnimation}
                width="100%"
              />
            </div>
          </div>

          {/* Success content bên phải */}
          <div className="auth-right">
            <div className="auth-content">
              <div className={`auth-header ${isVisible ? "fade-in" : ""}`}>
                <div className="success-icon">✅</div>
                <h1 className="auth-title">
                  {t("reset_password.success_title") ||
                    "Password Reset Successfully!"}
                </h1>
                <p className="auth-description">
                  {t("reset_password.success_message") ||
                    "Your password has been reset successfully. You will be redirected to the login page in a few seconds."}
                </p>
                <Button
                  type="primary"
                  onClick={() => navigate("/login")}
                  className="auth-button primary"
                >
                  {t("reset_password.go_to_login") || "Go to Login"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <AnimationLottie
              animationPath={resetPasswordAnimation}
              width="100%"
            />
          </div>
        </div>

        {/* Form bên phải */}
        <div className="auth-right">
          <div className="auth-content">
            <div className={`auth-header ${isVisible ? "fade-in" : ""}`}>
              <Button
                type="text"
                icon={<FaArrowLeft />}
                onClick={handleBackToForgotPassword}
                className="back-button"
              >
                {t("reset_password.back_to_forgot") ||
                  "Back to Forgot Password"}
              </Button>

              <h1 className="auth-title">
                {t("reset_password.title") || "Reset Your Password"}
              </h1>
              <p className="auth-description">
                {t("reset_password.subtitle") ||
                  "Enter your new password below to complete the reset process."}
              </p>
            </div>

            <div
              className={`auth-form-container ${isVisible ? "slide-up" : ""}`}
            >
              <Form
                name="reset-password"
                onFinish={onFinish}
                autoComplete="off"
                layout="vertical"
                className="futuristic-form"
              >
                <Form.Item<FieldType>
                  label={
                    <span className="form-label">
                      <FaLock className="label-icon" />
                      {t("reset_password.new_password_label") || "New Password"}
                    </span>
                  }
                  name="newPassword"
                  rules={[
                    {
                      required: true,
                      message:
                        t("reset_password.new_password_required") ||
                        "Please input your new password!"
                    },
                    {
                      min: 8,
                      message:
                        t("reset_password.password_min_length") ||
                        "Password must be at least 8 characters!"
                    },
                    {
                      pattern:
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                      message:
                        t("reset_password.password_pattern") ||
                        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character!"
                    }
                  ]}
                >
                  <Input.Password
                    placeholder={
                      t("reset_password.new_password_placeholder") ||
                      "Enter your new password"
                    }
                    className="futuristic-input"
                    prefix={<FaLock className="input-icon" />}
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-form-type="other"
                    visibilityToggle={{
                      visible: passwordVisible,
                      onVisibleChange: setPasswordVisible
                    }}
                    iconRender={(visible) =>
                      visible ? <FaEye /> : <FaEyeSlash />
                    }
                  />
                </Form.Item>

                <Form.Item<FieldType>
                  label={
                    <span className="form-label">
                      <FaLock className="label-icon" />
                      {t("reset_password.confirm_password_label") ||
                        "Confirm New Password"}
                    </span>
                  }
                  name="confirmPassword"
                  dependencies={["newPassword"]}
                  rules={[
                    {
                      required: true,
                      message:
                        t("reset_password.confirm_password_required") ||
                        "Please confirm your new password!"
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("newPassword") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error(
                            t("reset_password.password_mismatch") ||
                              "The two passwords do not match!"
                          )
                        );
                      }
                    })
                  ]}
                >
                  <Input.Password
                    placeholder={
                      t("reset_password.confirm_password_placeholder") ||
                      "Confirm your new password"
                    }
                    className="futuristic-input"
                    prefix={<FaLock className="input-icon" />}
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-form-type="other"
                    visibilityToggle={{
                      visible: confirmPasswordVisible,
                      onVisibleChange: setConfirmPasswordVisible
                    }}
                    iconRender={(visible) =>
                      visible ? <FaEye /> : <FaEyeSlash />
                    }
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isSubmit}
                    className="auth-button primary"
                    block
                  >
                    {isSubmit
                      ? t("reset_password.resetting") || "Resetting..."
                      : t("reset_password.submit") || "Reset Password"}
                  </Button>
                </Form.Item>
              </Form>

              <div className="auth-footer">
                <p>
                  {t("reset_password.remember_password") ||
                    "Remember your password?"}{" "}
                  <Link to="/login" className="auth-link">
                    {t("reset_password.login_here") || "Login here"}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

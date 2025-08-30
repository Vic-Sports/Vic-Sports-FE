import { App, Button, Form, Input, Modal } from "antd";
import { Link, useNavigate } from "react-router-dom";

import { useState, useEffect } from "react";
import type { FormProps } from "antd";
import { forgotPasswordAPI } from "@/services/api";
import { useTranslation } from "react-i18next";
import AnimationLottie from "@/share/animation-lottie";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";
import forgotPasswordAnimation from "@/assets/lottie/forgot-password-animation.json";

type FieldType = {
  email: string;
};

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [isSubmit, setIsSubmit] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const { message } = App.useApp();
  const { t } = useTranslation();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    const { email } = values;
    setIsSubmit(true);

    try {
      const res = await forgotPasswordAPI(email);
      setIsSubmit(false);

      if (res?.message) {
        setSubmittedEmail(email);
        setShowSuccessModal(true);
      } else {
        message.error(
          res.error ||
            res.message ||
            t("forgot_password.error") ||
            "An error occurred"
        );
      }
    } catch (error: any) {
      setIsSubmit(false);
      message.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          t("forgot_password.error") ||
          "An error occurred"
      );
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/login");
  };

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
              animationPath={forgotPasswordAnimation}
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
                onClick={handleBackToLogin}
                className="back-button"
              >
                {t("forgot_password.back_to_login") || "Back to Login"}
              </Button>

              <h1 className="auth-title">
                {t("forgot_password.title") || "Forgot Password?"}
              </h1>
              <p className="auth-description">
                {t("forgot_password.subtitle") ||
                  "Don't worry! It happens. Please enter the email address associated with your account."}
              </p>
            </div>

            <div
              className={`auth-form-container ${isVisible ? "slide-up" : ""}`}
            >
              <Form
                name="forgot-password"
                onFinish={onFinish}
                autoComplete="off"
                layout="vertical"
                className="futuristic-form"
              >
                <Form.Item<FieldType>
                  label={
                    <span className="form-label">
                      <FaEnvelope className="label-icon" />
                      {t("forgot_password.email_label") || "Email Address"}
                    </span>
                  }
                  name="email"
                  rules={[
                    {
                      required: true,
                      message:
                        t("forgot_password.email_required") ||
                        "Please input your email!"
                    },
                    {
                      type: "email",
                      message:
                        t("forgot_password.email_invalid") ||
                        "Please enter a valid email!"
                    }
                  ]}
                >
                  <Input
                    placeholder={
                      t("forgot_password.email_placeholder") ||
                      "Enter your email address"
                    }
                    className="futuristic-input"
                    prefix={<FaEnvelope className="input-icon" />}
                    autoComplete="off"
                    data-lpignore="true"
                    data-form-type="other"
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
                      ? t("forgot_password.sending") || "Sending..."
                      : t("forgot_password.submit") || "Send Reset Link"}
                  </Button>
                </Form.Item>
              </Form>

              <div className="auth-footer">
                <p>
                  {t("forgot_password.remember_password") ||
                    "Remember your password?"}{" "}
                  <Link to="/login" className="auth-link">
                    {t("forgot_password.login_here") || "Login here"}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Modal
        title={t("forgot_password.success_title") || "Check Your Email"}
        open={showSuccessModal}
        onCancel={handleCloseSuccessModal}
        footer={[
          <Button
            key="close"
            onClick={handleCloseSuccessModal}
            type="primary"
            className="auth-button primary"
          >
            {t("forgot_password.close") || "Close"}
          </Button>
        ]}
        centered
        className="success-modal"
      >
        <div className="success-content">
          <div className="success-icon">📧</div>
          <h3>{t("forgot_password.success_heading") || "Reset link sent!"}</h3>
          <p>
            {t("forgot_password.success_message") ||
              `We've sent a password reset link to ${submittedEmail}. Please check your email and follow the instructions to reset your password.`}
          </p>
          <div className="email-note">
            <p>
              <strong>{t("forgot_password.email_note") || "Note:"}</strong>{" "}
              {t("forgot_password.email_note_text") ||
                "If you don't see the email, check your spam folder or try again."}
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ForgotPasswordPage;

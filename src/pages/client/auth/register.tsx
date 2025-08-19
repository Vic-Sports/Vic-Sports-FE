import { App, Button, Form, Input } from "antd";
import { Link, useNavigate } from "react-router-dom";
import type { FormProps } from "antd";
import { useState, useEffect } from "react";
import { registerAPI } from "@/services/api";
import "./register.scss";
import { useTranslation } from "react-i18next";

import type { RuleObject } from "antd/es/form";
import AnimationLottie from "@/share/animation-lottie";
import registerAnimation from "@/assets/lottie/register-animation.json";
import { FaUser, FaEnvelope, FaLock, FaPhone, FaRocket } from "react-icons/fa";

type FieldType = {
  fullName: string;
  email: string;
  password: string;
  phone: string;
};

const RegisterPage = () => {
  const [isSubmit, setIsSubmit] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { message } = App.useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const validatePassword = (_: RuleObject, value: string): Promise<void> => {
    if (!value) {
      return Promise.reject(t("register.message_password_required"));
    }
    if (value.length < 8) {
      return Promise.reject(t("register.message_password_length"));
    }
    if (!/[A-Z]/.test(value)) {
      return Promise.reject(t("register.message_password_uppercase"));
    }
    if (!/[a-z]/.test(value)) {
      return Promise.reject(t("register.message_password_lowercase"));
    }
    if (!/[0-9]/.test(value)) {
      return Promise.reject(t("register.message_password_number"));
    }
    if (!/[@#$!%*?&]/.test(value)) {
      return Promise.reject(t("register.message_password_special"));
    }
    return Promise.resolve();
  };

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    setIsSubmit(true);
    const { email, fullName, password, phone } = values;

    // Debug logging
    console.log("Form values:", { fullName, email, password, phone });

    const res = await registerAPI(fullName, email, password, phone);
    setIsSubmit(false);

    // Debug response
    console.log("API Response:", res);

    if (res.data) {
      message.success(t("register.register_success"));
      navigate("/login");
    } else {
      message.error(res.message || "Registration failed");
    }
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
        <div className="auth-left">
          <div className="auth-content">
            <div className={`auth-header ${isVisible ? "fade-in" : ""}`}>
              <div className="auth-badge">
                <span>🚀 JOIN THE FUTURE</span>
              </div>

              <h1 className="auth-title">
                <span className="title-line-1">CREATE</span>
                <br />
                <span className="title-line-2">ACCOUNT</span>
              </h1>

              <p className="auth-description">{t("register.register_text")}</p>
            </div>

            <div
              className={`auth-form-container ${isVisible ? "slide-up" : ""}`}
            >
              <Form
                name="register-form"
                onFinish={onFinish}
                autoComplete="off"
                layout="vertical"
                className="futuristic-form"
              >
                <Form.Item<FieldType>
                  label={
                    <span className="form-label">
                      <FaUser className="label-icon" />
                      {t("register.fullname")}
                    </span>
                  }
                  name="fullName"
                  rules={[
                    { required: true, message: t("register.message_fullname") }
                  ]}
                >
                  <Input
                    placeholder={t("register.placeholder_fullname")}
                    className="futuristic-input"
                    prefix={<FaUser className="input-icon" />}
                  />
                </Form.Item>

                <Form.Item<FieldType>
                  label={
                    <span className="form-label">
                      <FaEnvelope className="label-icon" />
                      Email
                    </span>
                  }
                  name="email"
                  rules={[
                    { required: true, message: t("register.message_email1") },
                    { type: "email", message: t("register.message_email2") }
                  ]}
                >
                  <Input
                    placeholder={t("register.placeholder_email")}
                    className="futuristic-input"
                    prefix={<FaEnvelope className="input-icon" />}
                  />
                </Form.Item>

                <Form.Item<FieldType>
                  label={
                    <span className="form-label">
                      <FaLock className="label-icon" />
                      {t("register.password")}
                    </span>
                  }
                  name="password"
                  rules={[
                    { required: true, message: t("register.message_password") },
                    { validator: validatePassword }
                  ]}
                >
                  <Input.Password
                    placeholder="************"
                    className="futuristic-input"
                    prefix={<FaLock className="input-icon" />}
                  />
                </Form.Item>

                <Form.Item<FieldType>
                  label={
                    <span className="form-label">
                      <FaPhone className="label-icon" />
                      {t("register.phone")}
                    </span>
                  }
                  name="phone"
                  rules={[
                    { required: true, message: t("register.message_phone1") },
                    {
                      pattern: /^[0-9]{10}$/,
                      message: t("register.message_phone2")
                    }
                  ]}
                >
                  <Input
                    placeholder={t("register.placeholder_phone")}
                    className="futuristic-input"
                    prefix={<FaPhone className="input-icon" />}
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isSubmit}
                    className="auth-button primary"
                    icon={<FaRocket />}
                  >
                    {t("register.signup")}
                  </Button>
                </Form.Item>
              </Form>

              <p className="auth-footer">
                {t("register.already")}
                <Link to="/login" className="auth-link">
                  {t("register.login_route")}
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="animation-container">
            <AnimationLottie width="100%" animationPath={registerAnimation} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

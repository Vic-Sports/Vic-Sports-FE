import { App, Button, Form, Input, Radio } from "antd";
import { Link, useNavigate } from "react-router-dom";
import type { FormProps } from "antd";
import { useState, useEffect } from "react";
import { registerAPI } from "@/services/api";
import "./register.scss";
import { useTranslation } from "react-i18next";

import type { RuleObject } from "antd/es/form";
import AnimationLottie from "@/share/animation-lottie";
import registerAnimation from "@/assets/lottie/register-animation.json";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaRocket,
  FaAddressCard,
} from "react-icons/fa";

type FieldType = {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  role: string;
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

  const validatePhone = (_: RuleObject, value: string): Promise<void> => {
    if (!value) {
      return Promise.resolve(); // Let the required rule handle empty values
    }
    // Validate Vietnamese phone number format
    const vietnamPhoneRegex =
      /^0((3[2-9])|(5[6|8|9])|(7[0|6-9])|(8[1-5|8|9])|(9[0-9]))\d{7}$/;
    if (!vietnamPhoneRegex.test(value)) {
      return Promise.reject(t("register.message_phone_format"));
    }
    return Promise.resolve();
  };

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    setIsSubmit(true);
    const { email, fullName, password, phone, role } = values;

    // Debug logging
    console.log("Form values:", { fullName, email, password, phone, role });

    // Pass role to registerAPI
    const res = await registerAPI(fullName, email, password, phone, role);
    setIsSubmit(false);

    // Debug response
    console.log("API Response:", res);

    if (res.data) {
      message.success(
        "Registration successful! Please check your email to verify your account."
      );
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
              <h1 className="auth-title">{t("register.register_title")}</h1>

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
                    { required: true, message: t("register.message_fullname") },
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
                    { type: "email", message: t("register.message_email2") },
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
                    { validator: validatePassword },
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
                    {
                      required: true,
                      message: t("register.message_phone_required"),
                    },
                    { validator: validatePhone },
                  ]}
                >
                  <Input
                    placeholder={t("register.placeholder_phone")}
                    className="futuristic-input"
                    prefix={<FaPhone className="input-icon" />}
                  />
                </Form.Item>
                <Form.Item<FieldType>
                  label={
                    <span className="form-label">
                      <FaAddressCard className="label-icon" />
                      {t("register.role") || "Role"}
                    </span>
                  }
                  name="role"
                  initialValue="customer"
                  rules={[
                    {
                      required: true,
                      message: "Please select a role",
                    },
                  ]}
                >
                  <Radio.Group>
                    <Radio value="customer">Customer</Radio>
                    <Radio value="owner">Owner</Radio>
                  </Radio.Group>
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isSubmit}
                    className="auth-button primary"
                    icon={<FaRocket />}
                    style={{ marginTop: 15 }}
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

        {/* Animation bên phải */}
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

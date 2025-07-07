import { App, Button, Form, Input } from "antd";
import { Link, useNavigate } from "react-router-dom";
import type { FormProps } from "antd";
import { useState } from "react";
import { registerAPI } from "@/services/api";
import "./register.scss";
// import google from "@/assets/svg/images/google-logo.png";
// import facebook from "@/assets/svg/images/facebook-logo.png";
import { useTranslation } from "react-i18next";
import type { RuleObject } from "antd/es/form";

type FieldType = {
  fullName: string;
  email: string;
  password: string;
  phone: string;
};

const RegisterPage = () => {
  const [isSubmit, setIsSubmit] = useState(false);
  const { message } = App.useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();

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
    if (!/[@$!%*?&]/.test(value)) {
      return Promise.reject(t("register.message_password_special"));
    }
    return Promise.resolve();
  };

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    setIsSubmit(true);
    const { email, fullName, password, phone } = values;
    const res = await registerAPI(fullName, email, password, phone);
    setIsSubmit(false);

    if (res.data) {
      message.success(t("register.register_success"));
      navigate("/login");
    } else {
      message.error(res.message);
    }
  };

  return (
    <div className="register-container">
      <div className="register-left">
        <div className="register-box">
          <h2 className="text-large">{t("register.register_title")}</h2>
          <p className="text-normal">{t("register.register_text")}</p>
          <Form
            name="register-form"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item<FieldType>
              label={t("register.fullname")}
              name="fullName"
              rules={[
                { required: true, message: t("register.message_fullname") }
              ]}
            >
              <Input placeholder={t("register.placeholder_fullname")} />
            </Form.Item>

            <Form.Item<FieldType>
              label="Email"
              name="email"
              rules={[
                { required: true, message: t("register.message_email1") },
                { type: "email", message: t("register.message_email2") }
              ]}
            >
              <Input placeholder={t("register.placeholder_email")} />
            </Form.Item>

            <Form.Item<FieldType>
              label={t("register.password")}
              name="password"
              rules={[
                { required: true, message: t("register.message_password") },
                { validator: validatePassword }
              ]}
            >
              <Input.Password placeholder="************" />
            </Form.Item>

            <Form.Item<FieldType>
              label={t("register.phone")}
              name="phone"
              rules={[
                { required: true, message: t("register.message_phone1") },
                {
                  pattern: /^[0-9]{10}$/,
                  message: "Please enter a valid 10-digit phone number!"
                }
              ]}
            >
              <Input
                className="input"
                placeholder={t("register.placeholder_phone")}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmit}
                className="register-button"
              >
                {t("register.signup")}
              </Button>
            </Form.Item>
          </Form>

          {/* <div className="social-button">
            <img src={google} alt="google" />
            {t("register.register_google")}
          </div>

          <div className="social-button">
            <img src={facebook} alt="facebook" />
            {t("register.register_facebook")}
          </div> */}

          <p className="text-normal text-center">
            {t("register.already")}
            <Link to="/login" style={{ marginLeft: 4 }}>
              {t("register.login_route")}
            </Link>
          </p>
        </div>
      </div>

      <div className="register-right">
        <img src="/register-illustration.png" alt="register" />
      </div>
    </div>
  );
};

export default RegisterPage;

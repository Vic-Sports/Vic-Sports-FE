import { App, Button, Form, Input } from "antd";
import { Link, useNavigate } from "react-router-dom";
import type { FormProps } from "antd";
import { useState } from "react";
import { registerAPI } from "@/services/api";
import "./register.scss";
import { useTranslation } from "react-i18next";
import { useCurrentApp } from "@/components/context/app.context";
import type { RuleObject } from "antd/es/form";
import AnimationLottie from "@/share/animation-lottie";
import registerAnimation from "@/assets/lottie/register-animation.json";

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
  const { theme } = useCurrentApp();

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
    <div className={`register-container ${theme}`}>
      <div className={`register-left ${theme}`}>
        <div className="register-box">
          <h2 className={`text-large ${theme}`}>
            {t("register.register_title")}
          </h2>
          <p className={`text-normal ${theme}`}>
            {t("register.register_text")}
          </p>

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
                  message: t("register.message_phone2")
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

          <p className={`text-normal text-center ${theme}`}>
            {t("register.already")}
            <Link to="/login" style={{ marginLeft: 4 }}>
              {t("register.login_route")}
            </Link>
          </p>
        </div>
      </div>

      <div className={`register-right ${theme}`}>
        <AnimationLottie
          width="100%"
          //animation with rp => convert sang text
          // https://github.com/airbnb/lottie-web/issues/2070
          animationPath={registerAnimation}
        />
      </div>
    </div>
  );
};

export default RegisterPage;

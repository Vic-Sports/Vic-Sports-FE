import { App, Button, Form, Input } from "antd";
import { Link, useNavigate } from "react-router-dom";
import type { FormProps } from "antd";
import { useState } from "react";
import { registerAPI } from "@/services/api";
import "./register.scss";
import google from "@/assets/svg/images/google-logo.png";
import facebook from "@/assets/svg/images/facebook-logo.png";
import { useTranslation } from "react-i18next";

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

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    setIsSubmit(true);
    const { email, fullName, password, phone } = values;
    const res = await registerAPI(fullName, email, password, phone);
    setIsSubmit(false);

    if (res.data) {
      message.success(t("auth.register_success"));
      navigate("/login");
    } else {
      message.error(res.message);
    }
  };

  return (
    <div className="register-container">
      <div className="register-left">
        <div className="register-box">
          <h2 className="text-large">{t("auth.register_title")}</h2>
          <p className="text-normal">{t("auth.register_text")}</p>
          <Form
            name="register-form"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item<FieldType>
              label="Full Name"
              name="fullName"
              rules={[{ required: true, message: "Full name is required!" }]}
            >
              <Input placeholder="Enter your full name" />
            </Form.Item>

            <Form.Item<FieldType>
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Email is required!" },
                { type: "email", message: "Email is not valid!" }
              ]}
            >
              <Input placeholder="Enter your email" />
            </Form.Item>

            <Form.Item<FieldType>
              label="Password"
              name="password"
              rules={[{ required: true, message: "Password is required!" }]}
            >
              <Input.Password placeholder="************" />
            </Form.Item>

            <Form.Item<FieldType>
              label="Phone"
              name="phone"
              rules={[
                { required: true, message: "Phone number is required!" },
                {
                  pattern: /^(0[3|5|7|8|9])+([0-9]{8})$/,
                  message: "Phone number is not valid!"
                }
              ]}
            >
              <Input
                placeholder="Enter your phone number"
                inputMode="numeric"
                pattern="[0-9]*"
                onBeforeInput={(e) => {
                  // chặn ký tự không phải số
                  if (!/[0-9]/.test(e.data)) {
                    e.preventDefault();
                  }
                }}
                maxLength={10}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmit}
                className="register-button"
              >
                Sign up
              </Button>
            </Form.Item>
          </Form>

          <div className="social-button">
            <img src={google} alt="google" />
            Sign up with Google
          </div>

          <div className="social-button">
            <img src={facebook} alt="facebook" />
            Sign up with Facebook
          </div>

          <p className="text-normal text-center">
            Already have an account?
            <Link to="/login" style={{ marginLeft: 4 }}>
              Sign in here
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

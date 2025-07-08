import { App, Button, Form, Input, Checkbox } from "antd";
import { Link, useNavigate } from "react-router-dom";
import "./login.scss";
import { useState } from "react";
import type { FormProps } from "antd";
import { loginAPI, loginWithGoogleAPI } from "@/services/api";
import { useCurrentApp } from "@/components/context/app.context";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import google from "@/assets/svg/images/google-logo.png";
import facebook from "@/assets/svg/images/facebook-logo.png";
import { useTranslation } from "react-i18next";
import loginAnimation from "@/assets/lottie/login-animation.json";
import AnimationLottie from "@/share/animation-lottie";

type FieldType = {
  username: string;
  password: string;
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [isSubmit, setIsSubmit] = useState(false);
  const { message, notification } = App.useApp();
  const { theme, setIsAuthenticated, setUser } = useCurrentApp();
  const { t } = useTranslation();

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    const { username, password } = values;
    setIsSubmit(true);
    const res = await loginAPI(username, password);
    setIsSubmit(false);
    if (res?.data) {
      setIsAuthenticated(true);
      setUser(res.data.user);
      localStorage.setItem("access_token", res.data.access_token);
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
    <div className={`login-container ${theme}`}>
      <div className={`login-left ${theme}`}>
        <AnimationLottie
          width="100%"
          //animation with rp => convert sang text
          // https://github.com/airbnb/lottie-web/issues/2070
          animationPath={loginAnimation}
        />
      </div>

      <div className="login-right">
        <div className="login-box">
          <h2 className={`text-large ${theme}`}>{t("login.login_title")}</h2>
          <p className={`text-normal ${theme}`}>{t("login.login_text")}</p>

          <Form
            name="login-form"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item<FieldType>
              label="Email"
              name="username"
              rules={[
                { required: true, message: t("login.message_email1") },
                { type: "email", message: t("login.message_email2") }
              ]}
            >
              <Input placeholder={t("login.placeholder_email")} />
            </Form.Item>

            <Form.Item<FieldType>
              label={t("login.password")}
              name="password"
              rules={[{ required: true, message: t("login.message_password") }]}
            >
              <Input.Password placeholder="************" />
            </Form.Item>

            <div className="login-options">
              <Checkbox>{t("login.remember")}</Checkbox>
              <Link to="#">{t("login.forgot")}</Link>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmit}
                className="login-button"
              >
                {t("login.signin")}
              </Button>
            </Form.Item>
          </Form>

          <div
            className={`social-button ${theme}`}
            onClick={() => loginGoogle()}
          >
            <img src={google} alt="google" />
            {t("login.google")}
          </div>

          <div className={`social-button ${theme}`} onClick={() => alert("me")}>
            <img src={facebook} alt="facebook" />
            {t("login.facebook")}
          </div>

          <p className={`text-normal text-center ${theme}`}>
            {t("login.account")}
            <Link to="/register" style={{ marginLeft: 4 }}>
              {t("login.signup")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

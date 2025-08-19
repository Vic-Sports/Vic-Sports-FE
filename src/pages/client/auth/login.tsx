import { App, Button, Form, Input, Checkbox } from "antd";
import { Link, useNavigate } from "react-router-dom";
import "./login.scss";
import { useState, useEffect } from "react";
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
import {
  FaEye,
  FaLock,
  FaEnvelope,
  FaGoogle,
  FaFacebook
} from "react-icons/fa";

type FieldType = {
  username: string;
  password: string;
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [isSubmit, setIsSubmit] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { message, notification } = App.useApp();
  const { setIsAuthenticated, setUser } = useCurrentApp();
  const { t } = useTranslation();

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
                <span>🔐 SECURE ACCESS</span>
              </div>

              <h1 className="auth-title">
                <span className="title-line-1">WELCOME</span>
                <br />
                <span className="title-line-2">BACK</span>
              </h1>

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
                  name="username"
                  rules={[
                    { required: true, message: t("login.message_email1") },
                    { type: "email", message: t("login.message_email2") }
                  ]}
                >
                  <Input
                    placeholder={t("login.placeholder_email")}
                    className="futuristic-input"
                    prefix={<FaEnvelope className="input-icon" />}
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
                  <span>or continue with</span>
                </div>

                <div className="social-buttons">
                  <Button
                    className="social-button google"
                    onClick={() => loginGoogle()}
                    icon={<FaGoogle />}
                  >
                    {t("login.google")}
                  </Button>

                  <Button
                    className="social-button facebook"
                    onClick={() => alert("me")}
                    icon={<FaFacebook />}
                  >
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

        <div className="auth-right">
          <div className="animation-container">
            <AnimationLottie width="100%" animationPath={loginAnimation} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

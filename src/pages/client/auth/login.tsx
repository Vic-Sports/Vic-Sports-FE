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

type FieldType = {
  username: string;
  password: string;
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [isSubmit, setIsSubmit] = useState(false);
  const { message, notification } = App.useApp();
  const { setIsAuthenticated, setUser } = useCurrentApp();

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    const { username, password } = values;
    setIsSubmit(true);
    const res = await loginAPI(username, password);
    setIsSubmit(false);
    if (res?.data) {
      setIsAuthenticated(true);
      setUser(res.data.user);
      localStorage.setItem("access_token", res.data.access_token);
      message.success("Login successful!");
      navigate("/");
    } else {
      notification.error({
        message: "An error occurred",
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
          message.success("Login successful!");
          navigate("/");
        } else {
          notification.error({
            message: "An error occurred",
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
    <div className="login-container">
      <div className="login-left">
        <img src="/login-illustration.png" alt="login" />
      </div>

      <div className="login-right">
        <div className="login-box">
          <h2 className="text-large">WELCOME BACK</h2>
          <p className="text-normal">
            Welcome back! Please enter your details.
          </p>

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
                { required: true, message: "Email number is required!" },
                { type: "email", message: "Email is not in correct format!" }
              ]}
            >
              <Input placeholder="Enter your email" />
            </Form.Item>

            <Form.Item<FieldType>
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Password number is required!" }
              ]}
            >
              <Input.Password placeholder="************" />
            </Form.Item>

            <div className="login-options">
              <Checkbox>Remember me</Checkbox>
              <Link to="#">Forgot password</Link>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmit}
                className="login-button"
              >
                Sign in
              </Button>
            </Form.Item>
          </Form>

          <div className="social-button" onClick={() => loginGoogle()}>
            <img src={google} alt="google" />
            Sign in with Google
          </div>

          <div className="social-button">
            <img src={facebook} alt="facebook" />
            Sign in with Facebook
          </div>

          <p className="text-normal text-center">
            Don’t have an account?
            <Link to="/register" style={{ marginLeft: 4 }}>
              Sign up to free!
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

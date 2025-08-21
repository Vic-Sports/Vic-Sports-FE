import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Result, Button } from "antd";
import {
  CheckCircleOutlined,
  HomeOutlined,
  LoginOutlined
} from "@ant-design/icons";

const EmailVerifiedPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  return (
    <div className="auth-error-container">
      <div className="orb-3"></div>
      <Result
        status="success"
        icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
        title={
          <span
            style={{ color: "#52c41a", fontSize: "24px", fontWeight: "bold" }}
          >
            Email Verified Successfully!
          </span>
        }
        subTitle={
          <div style={{ color: "#666", fontSize: "16px" }}>
            <p>
              Your email {email && <strong>{email}</strong>} has been verified
              successfully.
            </p>
            <p>You can now login to your account and enjoy our services.</p>
          </div>
        }
        extra={[
          <Button
            type="primary"
            key="login"
            size="large"
            icon={<LoginOutlined />}
            onClick={() => navigate("/login")}
          >
            Go to Login
          </Button>,
          <Button
            key="home"
            size="large"
            icon={<HomeOutlined />}
            onClick={() => navigate("/")}
          >
            Go to Home
          </Button>
        ]}
      />
    </div>
  );
};

export default EmailVerifiedPage;

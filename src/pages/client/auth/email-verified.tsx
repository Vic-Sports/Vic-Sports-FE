import { useLocation, useNavigate } from "react-router-dom";
import { Card, Button, Result } from "antd";
import { CheckCircleOutlined, LoginOutlined } from "@ant-design/icons";

const EmailVerified = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, isVerified, info } = location.state || {};
  // Luôn hiển thị trang xác thực thành công, kể cả khi không có email
  const displayEmail = email ? email : "(email không xác định)";
  const displayInfo =
    info === "Email already verified" ? "Email đã được xác thực trước đó." : "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50">
      <Card className="w-full max-w-md shadow-lg">
        <Result
          status="success"
          title="Email Verified Successfully!"
          subTitle={
            <>
              {`Your email ${displayEmail} has been verified. You can now log in to your account.`}
              {displayInfo && (
                <div style={{ marginTop: 8, color: "#1890ff" }}>
                  {displayInfo}
                </div>
              )}
            </>
          }
          icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
          extra={[
            <Button
              type="primary"
              icon={<LoginOutlined />}
              onClick={() => navigate("/login")}
              key="login-btn"
            >
              Go to Login
            </Button>,
          ]}
        />
      </Card>
    </div>
  );
};

export default EmailVerified;

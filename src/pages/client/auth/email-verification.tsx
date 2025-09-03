import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Spin, Card, Typography, App } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get("token");
        if (!token) {
          throw new Error("Verification token is missing");
        }

        // The backend will handle the verification and redirect
        // We just need to show loading state briefly
        setTimeout(() => {
          setIsVerifying(false);
          // If we're still on this page after timeout, something went wrong
          navigate("/email-verification-failed", {
            state: {
              error: "Verification timeout or failed"
            }
          });
        }, 3000);
      } catch (error: any) {
        console.error("Verification error:", error);
        message.error(error.message || "Email verification failed");
        navigate("/email-verification-failed", {
          state: {
            error: error.message || "Verification failed"
          }
        });
      }
    };

    verifyEmail();
  }, [searchParams, navigate, message]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50">
        <Card className="w-full max-w-md shadow-lg">
          <div className="text-center">
            <Spin
              indicator={
                <LoadingOutlined
                  style={{ fontSize: 40, color: "#1890ff" }}
                  spin
                />
              }
              className="mb-4"
            />
            <Title level={3} className="text-gray-800">
              Verifying Your Email
            </Title>
            <Text className="text-gray-600">
              Please wait while we verify your email address...
            </Text>
          </div>
        </Card>
      </div>
    );
  }

  return null;
};

export default EmailVerification;

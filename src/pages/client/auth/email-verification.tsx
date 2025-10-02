import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Spin, Card, Typography, App } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { verifyEmailAPI } from "@/services/api";

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
        const res = await verifyEmailAPI(token);
        console.log("[Email Verification] API response:", res);
        if (res?.success && res.user?.isVerified) {
          setIsVerifying(false);
          navigate("/email-verified", {
            state: {
              email: res.user.email || "",
              isVerified: true,
            },
          });
        } else {
          setIsVerifying(false);
          console.error("[Email Verification] Fail reason:", res?.message);
          navigate("/email-verification-failed", {
            state: {
              error: res?.message || "Verification failed",
            },
          });
        }
      } catch (error: any) {
        setIsVerifying(false);
        console.error("Verification error:", error);
        message.error(error.message || "Email verification failed");
        navigate("/email-verification-failed", {
          state: {
            error: error.message || "Verification failed",
          },
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

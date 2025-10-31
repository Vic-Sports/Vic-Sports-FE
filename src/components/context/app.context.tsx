import { fetchAccountAPI } from "@/services/api";
import { ConfigProvider } from "antd";
import enUS from "antd/locale/en_US";
import { createContext, useContext, useEffect, useState } from "react";
import RingLoader from "react-spinners/RingLoader";

interface IAppContext {
  isAuthenticated: boolean;
  setIsAuthenticated: (v: boolean) => void;
  setUser: (v: IUser | null) => void;
  user: IUser | null;
  isAppLoading: boolean;
  setIsAppLoading: (v: boolean) => void;
}

const CurrentAppContext = createContext<IAppContext | null>(null);

type TProps = {
  children: React.ReactNode;
};

export const AppProvider = (props: TProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<IUser | null>(null);
  const [isAppLoading, setIsAppLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        // Kiểm tra session storage trước
        const sessionUser = sessionStorage.getItem("user");
        const sessionToken = sessionStorage.getItem("access_token");

        if (sessionUser && sessionToken) {
          // Khôi phục trạng thái từ session storage
          setUser(JSON.parse(sessionUser));
          setIsAuthenticated(true);
          setIsAppLoading(false);
          return;
        }

        // Nếu không có session, gọi API để kiểm tra
        // Chỉ gọi API khi có access_token trong localStorage
        const hasToken = localStorage.getItem("access_token");
        if (!hasToken) {
          // Không có token => user chưa login
          setIsAppLoading(false);
          return;
        }

        const res = await fetchAccountAPI();
        if (res.data) {
          setUser(res.data.user);
          setIsAuthenticated(true);
          // Lưu vào session storage
          sessionStorage.setItem("user", JSON.stringify(res.data.user));
          sessionStorage.setItem(
            "access_token",
            localStorage.getItem("access_token") || ""
          );
          sessionStorage.setItem(
            "refresh_token",
            localStorage.getItem("refresh_token") || ""
          );
        }
      } catch (error: any) {
        // 401 Unauthorized là bình thường khi user chưa login
        if (error?.response?.status === 401) {
          console.log("User not authenticated - this is normal");
        } else if (error?.code === "ECONNABORTED") {
          console.error("Request timeout - backend không phản hồi");
        } else if (error?.message === "Network Error") {
          console.error("Network error - kiểm tra kết nối backend");
        } else {
          console.error("Failed to fetch account:", error?.message || error);
        }
        // Nếu API call thất bại, đảm bảo user không được authenticate
        setIsAuthenticated(false);
        setUser(null);
        // Xóa session storage nếu có lỗi
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("refresh_token");
      } finally {
        // Đảm bảo luôn set loading = false dù API thành công hay thất bại
        setIsAppLoading(false);
      }
    };

    fetchAccount();
  }, []);

  return (
    <>
      {isAppLoading === false ? (
        <CurrentAppContext.Provider
          value={{
            isAuthenticated,
            user,
            setIsAuthenticated,
            setUser,
            isAppLoading,
            setIsAppLoading
          }}
        >
          <ConfigProvider
            locale={enUS}
            theme={{
              token: {
                colorPrimary: "#0ea5e9"
              }
            }}
          >
            {props.children}
          </ConfigProvider>
        </CurrentAppContext.Provider>
      ) : (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)"
          }}
        >
          <RingLoader size={80} color="#0ea5e9" />
        </div>
      )}
    </>
  );
};

export const useCurrentApp = () => {
  const currentAppContext = useContext(CurrentAppContext);

  if (!currentAppContext) {
    throw new Error(
      "useCurrentApp has to be used within <CurrentAppContext.Provider>"
    );
  }

  return currentAppContext;
};

import { fetchAccountAPI } from "@/services/api";
import { createContext, useContext, useEffect, useState } from "react";
import { ConfigProvider, theme as antdTheme } from "antd";
import RingLoader from "react-spinners/RingLoader";
import enUS from "antd/locale/en_US";

interface IAppContext {
  isAuthenticated: boolean;
  setIsAuthenticated: (v: boolean) => void;
  setUser: (v: IUser | null) => void;
  user: IUser | null;
  isAppLoading: boolean;
  setIsAppLoading: (v: boolean) => void;
  theme: ThemeContextType;
  setTheme: (v: ThemeContextType) => void;
}

type ThemeContextType = "dark" | "light";

const CurrentAppContext = createContext<IAppContext | null>(null);

type TProps = {
  children: React.ReactNode;
};

export const AppProvider = (props: TProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<IUser | null>(null);
  const [isAppLoading, setIsAppLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<ThemeContextType>(() => {
    return (localStorage.getItem("theme") as ThemeContextType) || "light";
  });

  useEffect(() => {
    const mode = localStorage.getItem("theme") as ThemeContextType;
    if (mode) {
      setTheme(mode);
    }
  }, []);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res = await fetchAccountAPI();
        if (res.data) {
          setUser(res.data.user);
          setIsAuthenticated(true);
        }
      } catch (error: any) {
        // 401 Unauthorized là bình thường khi user chưa login
        if (error?.response?.status === 401) {
          console.log("User not authenticated - this is normal");
        } else {
          console.error("Failed to fetch account:", error);
        }
        // Nếu API call thất bại, đảm bảo user không được authenticate
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        // Đảm bảo luôn set loading = false dù API thành công hay thất bại
        setIsAppLoading(false);
      }
    };

    fetchAccount();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const algorithm =
    theme === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm;

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
            setIsAppLoading,
            theme,
            setTheme
          }}
        >
          <ConfigProvider
            locale={enUS}
            theme={{
              algorithm,
              token: {
                colorPrimary: "#1f6feb"
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
          <RingLoader size={60} color="#1f6feb" />
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

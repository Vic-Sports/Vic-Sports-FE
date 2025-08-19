import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Layout from "@/layout";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./i18n"; //👈 phải import trước App
import { App } from "antd";
import "antd/dist/reset.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@/styles/global.scss"; // Import sau để override các CSS framework
import { AppProvider } from "components/context/app.context";
import ProtectedRoute from "@/components/auth";
// import viVN from "antd/locale/vi_VN";
import { GoogleOAuthProvider } from "@react-oauth/google";
import LayoutAdmin from "./components/layout/layout.dashboard";
import LoginPage from "./pages/client/auth/login";
import RegisterPage from "./pages/client/auth/register";
import HomePage from "./pages/client/home";
import DashBoardPage from "./pages/admin/dashboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />
      }
    ]
  },
  {
    path: "admin",
    element: <LayoutAdmin />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <DashBoardPage />
          </ProtectedRoute>
        )
      },
      {
        // path: "user",
        // element: (
        //   <ProtectedRoute>
        //     {/* <ManageUserPage /> */}
        //   </ProtectedRoute>
        // )
      }
    ]
  },
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/register",
    element: <RegisterPage />
  }
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App>
      <AppProvider>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <RouterProvider router={router} />
        </GoogleOAuthProvider>
      </AppProvider>
    </App>
  </StrictMode>
);

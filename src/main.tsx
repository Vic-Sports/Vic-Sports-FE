import ProtectedRoute from "@/components/auth";
import Layout from "@/layout";
import "@/styles/global.scss"; // Import sau để override các CSS framework
import { App } from "antd";
import "antd/dist/reset.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { AppProvider } from "components/context/app.context";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./i18n"; //👈 phải import trước App
// import viVN from "antd/locale/vi_VN";
import { GoogleOAuthProvider } from "@react-oauth/google";
import NotFoundPage from "./components/auth/404";
import ServerErrorPage from "./components/auth/500";
import LayoutAdmin from "./components/layout/layout.dashboard";
import DashBoardPage from "./pages/admin/dashboard";
import EmailVerificationFailedPage from "./pages/client/auth/email-verification-failed";
import EmailVerifiedPage from "./pages/client/auth/email-verified";
import ForgotPasswordPage from "./pages/client/auth/forgot-password";
import LoginPage from "./pages/client/auth/login";
import RegisterPage from "./pages/client/auth/register";
import ResetPasswordPage from "./pages/client/auth/reset-password";
import CourtDetailPage from "./pages/client/court-detail";
import CourtsPage from "./pages/client/courts";
import HomePage from "./pages/client/home";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: "courts",
        element: <CourtsPage />
      },
      {
        path: "courts/:venueId",
        element: <CourtDetailPage />
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
  },
  {
    path: "/email-verified",
    element: <EmailVerifiedPage />
  },
  {
    path: "/email-verification-failed",
    element: <EmailVerificationFailedPage />
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />
  },
  {
    path: "/500",
    element: <ServerErrorPage />
  },
  {
    path: "*",
    element: <NotFoundPage />
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

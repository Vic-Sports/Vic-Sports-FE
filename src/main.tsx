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

import PaymentPage from "./components/client/booking/payment";
import PaymentReturnPage from "./components/client/booking/return.url";
import PayOSReturnPage from "./components/client/booking/payos.return";
import VenueCourts from "./components/client/venue/VenueCourts";
import DashBoardPage from "./pages/admin/dashboard";
import EmailVerificationFailedPage from "./pages/client/auth/email-verification-failed";
import EmailVerifiedPage from "./pages/client/auth/email-verified";
import ForgotPasswordPage from "./pages/client/auth/forgot-password";
import LoginPage from "./pages/client/auth/login";
import RegisterPage from "./pages/client/auth/register";
import ResetPasswordPage from "./pages/client/auth/reset-password";
import BookingPage from "./pages/client/booking";
import BookingSuccessPage from "./pages/client/booking-success";
import CourtDetailPage from "./pages/client/court-detail";
import HomePage from "./pages/client/home";
import VenuesPage from "./pages/client/venues";
import EmailVerificationPage from "./pages/client/auth/email-verification";
import BookingHistory from "./pages/client/history";
import LayoutAdmin from "./components/layout/layout.admin";
import ManageUserPage from "./pages/admin/manage.user";
import ManageVenueAdminPage from "./pages/admin/manage.venue";
import LayoutOwner from "./components/layout/layout.owner";
import OwnerDashBoardPage from "./pages/owner/dashboard";
import OwnerVenuesPage from "./pages/owner/venues";
import OwnerCourtsPage from "./pages/owner/courts";
import OwnerBookingsPage from "./pages/owner/bookings";
import ManageUserOwnerPage from "./pages/owner/manage.user";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "venues",
        element: <VenuesPage />,
      },
      {
        path: "venue/:venueId",
        element: <VenueCourts />,
      },
      {
        path: "court/:courtId",
        element: <CourtDetailPage />,
      },
      {
        path: "booking",
        element: <BookingPage />,
      },
      {
        path: "booking/success",
        element: <BookingSuccessPage />,
      },
      {
        path: "payment",
        element: <PaymentPage />,
      },
      {
        path: "payment/return",
        element: <PaymentReturnPage />,
      },
      {
        path: "payment/success",
        element: <PaymentReturnPage />,
      },
      {
        path: "booking/payos-return",
        element: <PayOSReturnPage />,
      },
      {
        path: "history",
        element: <BookingHistory />,
      },
    ],
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
        ),
      },
      {
        path: "user",
        element: (
          <ProtectedRoute>
            <ManageUserPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "venues",
        element: (
          <ProtectedRoute>
            <ManageVenueAdminPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "owner",
    element: <LayoutOwner />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <OwnerDashBoardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "venues",
        element: (
          <ProtectedRoute>
            <OwnerVenuesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "courts",
        element: (
          <ProtectedRoute>
            <OwnerCourtsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "bookings",
        element: (
          <ProtectedRoute>
            <OwnerBookingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "user",
        element: (
          <ProtectedRoute>
            <ManageUserOwnerPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/email-verified",
    element: <EmailVerifiedPage />,
  },
  {
    path: "/email-verification-failed",
    element: <EmailVerificationFailedPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    path: "/auth/email-verification",
    element: <EmailVerificationPage />,
  },
  {
    path: "/500",
    element: <ServerErrorPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

createRoot(document.getElementById("root")!).render(
  // Temporarily disable StrictMode to fix chart shadow DOM issues
  // <StrictMode>
  <App>
    <AppProvider>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <RouterProvider router={router} />
      </GoogleOAuthProvider>
    </AppProvider>
  </App>
  // </StrictMode>
);
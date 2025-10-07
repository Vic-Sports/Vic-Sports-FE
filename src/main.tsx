import ProtectedRoute from "@/components/auth";
import Layout from "@/layout";
import "@/styles/global.scss"; // Import sau để override các CSS framework
import { App } from "antd";
import "antd/dist/reset.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { AppProvider } from "components/context/app.context";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./i18n"; //👈 phải import trước App
// import viVN from "antd/locale/vi_VN";
import { GoogleOAuthProvider } from "@react-oauth/google";
import NotFoundPage from "./components/auth/404";
import ServerErrorPage from "./components/auth/500";

import PaymentPage from "./components/client/booking/payment";
import PayOSReturnPage from "./components/client/booking/payos.return";
import PaymentReturnPage from "./components/client/booking/return.url";
import ChatPage from "./components/client/Chat/ChatPage";
import VenueCourts from "./components/client/venue/VenueCourts";
import LayoutAdmin from "./components/layout/layout.admin";
import LayoutOwner from "./components/layout/layout.owner";
import DashBoardPage from "./pages/admin/dashboard";
import ManageUserPage from "./pages/admin/manage.user";
import ManageVenueAdminPage from "./pages/admin/manage.venue";
import EmailVerificationPage from "./pages/client/auth/email-verification";
import EmailVerificationFailedPage from "./pages/client/auth/email-verification-failed";
import EmailVerifiedPage from "./pages/client/auth/email-verified";
import ForgotPasswordPage from "./pages/client/auth/forgot-password";
import LoginPage from "./pages/client/auth/login";
import RegisterPage from "./pages/client/auth/register";
import ResetPasswordPage from "./pages/client/auth/reset-password";
import BookingPage from "./pages/client/booking";
import BookingSuccessPage from "./pages/client/booking-success";
import CourtDetailPage from "./pages/client/court-detail";
import BookingHistory from "./pages/client/history";
import HomePage from "./pages/client/home";
import TournamentDetailPage from "./pages/client/tournament-detail";
import TournamentsListPage from "./pages/client/tournaments-list";
import VenuesPage from "./pages/client/venues";
import OwnerBookingsPage from "./pages/owner/bookings";
import OwnerCourtsPage from "./pages/owner/courts";
import OwnerDashBoardPage from "./pages/owner/dashboard";
import ManageUserOwnerPage from "./pages/owner/manage.user";
import OwnerTournamentsPage from "./pages/owner/tournaments";
import OwnerVenuesPage from "./pages/owner/venues";

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
        path: "tournaments",
        element: <TournamentsListPage />,
      },
      {
        path: "tournament/:id",
        element: <TournamentDetailPage />,
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
      {
        path: "chat",
        element: (
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        ),
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
        path: "tournaments",
        element: (
          <ProtectedRoute>
            <OwnerTournamentsPage />
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

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
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

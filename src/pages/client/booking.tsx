import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Divider,
  Steps,
  Form,
  Input,
  Radio,
  message,
  Modal,
  Spin,
  Tag,
  Space,
  Alert,
  Progress,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  TeamOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useCurrentApp } from "@/components/context/app.context";
import { fetchAccountAPI } from "@/services/api";
import { createBookingAPI, releaseBookingAPI } from "@/services/bookingApi";
import { createPayOSPayment } from "@/services/payOSApi";
import type { ICreateBookingRequest } from "@/types/payment";
import "./booking.scss";

const { Title, Text } = Typography;

// Function to handle PayOS return redirect
const checkAndRedirectPayOSReturn = (): boolean => {
  const currentUrl = window.location.href;
  const currentPath = window.location.pathname;
  const currentSearch = window.location.search;

  // Check if we're on /booking with PayOS return parameters
  if (currentPath === "/booking" && currentSearch) {
    const searchParams = new URLSearchParams(currentSearch);
    const hasPayOSParams =
      searchParams.has("code") &&
      searchParams.has("orderCode") &&
      (searchParams.has("id") || searchParams.has("status"));

    if (hasPayOSParams) {
      console.log("🔧 Detected PayOS return on wrong URL:", currentUrl);
      console.log("🔄 Redirecting to correct PayOS return URL...");

      // Build correct URL
      const correctUrl = `/booking/payos-return${currentSearch}`;

      // Use replace to avoid back button issues and redirect immediately
      window.location.replace(correctUrl);

      return true; // Indicates redirect happened
    }
  }

  return false; // No redirect needed
};

interface BookingData {
  courtIds: string[]; // Đổi từ courtId sang courtIds array
  courtNames: string; // Đổi từ courtName sang courtNames (có thể là string nối)
  date: string;
  timeSlots: Array<{
    start: string;
    end: string;
    price: number;
  }>;
  courtQuantity: number;
  totalPrice: number;
  venue: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  fee?: number;
}

const BookingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { user, isAuthenticated, setUser } = useCurrentApp();

  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  // Countdown timer state (5 minutes = 300 seconds)
  const [timeLeft, setTimeLeft] = useState(300);
  const [initialTime, setInitialTime] = useState(300); // Store initial time for progress calculation
  const [timerExpired, setTimerExpired] = useState(false);

  // Booking ID from hold process
  const [holdBookingId, setHoldBookingId] = useState<string | null>(null);

  // Back confirmation modal
  const [backConfirmVisible, setBackConfirmVisible] = useState(false);
  const [originalLocation, setOriginalLocation] = useState<string | null>(null);

  // Use ref for immediate flag check in event handlers
  const isRedirectingRef = useRef(false);

  const paymentMethods: PaymentMethod[] = [
    {
      id: "payos",
      name: "PayOS",
      icon: <CreditCardOutlined />,
      description: "Thanh toán qua PayOS (Visa, MasterCard, ATM, QR Code)",
    },
    // {
    //   id: "momo",
    //   name: "MoMo",
    //   icon: <MobileOutlined />,
    //   description: "Ví điện tử MoMo",
    //   fee: 0,
    // },
    // {
    //   id: "zalopay",
    //   name: "ZaloPay",
    //   icon: <WalletOutlined />,
    //   description: "Ví điện tử ZaloPay",
    //   fee: 0,
    // },
    // {
    //   id: "banking",
    //   name: "Chuyển khoản ngân hàng",
    //   icon: <BankOutlined />,
    //   description: "Chuyển khoản trực tiếp qua ngân hàng",
    //   fee: 0,
    // },
  ];

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimerExpired(true);
          clearInterval(timer);

          // Clear sessionStorage when timer expires
          sessionStorage.removeItem("booking_hold_info");

          // Show expiration modal
          Modal.error({
            title: "Thời gian giữ sân đã hết",
            content: "Thời gian giữ sân đã hết. Vui lòng đặt sân lại.",
            okText: "Quay lại",
            onOk: () => navigate(-1),
          });

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  // Release booking on page unload/navigation
  useEffect(() => {
    const releaseBooking = async () => {
      if (holdBookingId && !timerExpired) {
        try {
          console.log("Releasing booking on page unload:", holdBookingId);
          await releaseBookingAPI(holdBookingId);
          // Clear sessionStorage when booking is released
          sessionStorage.removeItem("booking_hold_info");
        } catch (error) {
          console.error("Failed to release booking:", error);
        }
      }
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Check ref first (most immediate), then other flags
      const isRedirecting =
        isRedirectingRef.current ||
        sessionStorage.getItem("redirecting_to_payment") === "true" ||
        (window as any).__REDIRECTING_TO_PAYMENT__;

      // Don't show warning when redirecting to payment
      if (isRedirecting) {
        console.log(
          "Skipping beforeunload warning - redirecting to payment (ref:",
          isRedirectingRef.current,
          ")"
        );
        // Don't prevent default or set returnValue
        return;
      }

      if (holdBookingId && !timerExpired) {
        // Always show confirmation but don't release booking on beforeunload
        // (we'll handle actual release in visibilitychange event)
        event.preventDefault();
        event.returnValue =
          "Bạn có chắc muốn rời khỏi trang? Việc đặt sân sẽ bị hủy.";
      }
    };

    // Handle page visibility change (covers tab close, browser close, navigation away)
    const handleVisibilityChange = () => {
      // Check immediate flag from sessionStorage
      const isRedirecting =
        sessionStorage.getItem("redirecting_to_payment") === "true";

      // Don't release booking when redirecting to payment
      if (isRedirecting) {
        console.log("Skipping booking release - redirecting to payment");
        return;
      }

      if (
        document.visibilityState === "hidden" &&
        holdBookingId &&
        !timerExpired
      ) {
        // Only release booking when page actually becomes hidden
        // This won't trigger on reload since page stays visible
        setTimeout(() => {
          const stillRedirecting =
            sessionStorage.getItem("redirecting_to_payment") === "true";
          if (document.visibilityState === "hidden" && !stillRedirecting) {
            // Still hidden after timeout, likely a real navigation away
            releaseBooking();
          }
        }, 1000);
      }
    };

    // Setup back button interception
    // Alternative approach: use hash-based detection
    const handleHashChange = () => {
      console.log("Hash change detected");
      if (holdBookingId && !timerExpired) {
        console.log("Showing modal due to hash change");
        setBackConfirmVisible(true);
      }
    };

    // Add event listeners (popstate removed as it's handled in separate useEffect)
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("hashchange", handleHashChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      // Cleanup listeners
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("hashchange", handleHashChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      // Cleanup redirect flag
      sessionStorage.removeItem("redirecting_to_payment");
      (window as any).__REDIRECTING_TO_PAYMENT__ = false;

      // Release booking when component unmounts (if not expired)
      if (holdBookingId && !timerExpired) {
        releaseBooking();
      }
    };
  }, [holdBookingId, timerExpired]);

  // Improved back button detection using router approach
  useEffect(() => {
    if (holdBookingId && !timerExpired) {
      console.log("Setting up browser back button interception");

      // Add history entry to intercept back button
      const currentPath = window.location.pathname + window.location.search;
      window.history.pushState(null, "", currentPath);

      // Listen for popstate event
      const handleBrowserBack = (event: PopStateEvent) => {
        console.log("Browser back button detected!", event);

        // Immediately push state back to prevent navigation
        window.history.pushState(null, "", currentPath);

        // Show confirmation modal
        setBackConfirmVisible(true);
      };

      window.addEventListener("popstate", handleBrowserBack);

      return () => {
        window.removeEventListener("popstate", handleBrowserBack);
      };
    }
  }, [holdBookingId, timerExpired]);

  // Format time for display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Get countdown color based on time remaining
  const getCountdownColor = () => {
    if (timeLeft <= 60) return "#ff4d4f"; // Red when <= 1 minute
    if (timeLeft <= 120) return "#fa8c16"; // Orange when <= 2 minutes
    return "#52c41a"; // Green otherwise
  };

  // Get progress percentage
  const getProgressPercent = () => {
    return ((initialTime - timeLeft) / initialTime) * 100;
  };

  useEffect(() => {
    // Track original location for navigation back
    if (!originalLocation) {
      const referrer = document.referrer;
      if (referrer && referrer !== window.location.href) {
        setOriginalLocation(referrer);
        console.log("Original location set to:", referrer);
      }
    }

    // Check current URL for PayOS return params (no debug log)

    // First check if this is a PayOS return redirected to wrong URL
    if (checkAndRedirectPayOSReturn()) {
      return; // Redirect will happen, no need to continue
    }

    const data = location.state?.bookingData as BookingData;
    const bookingId = location.state?.bookingId as string;
    const holdUntil = location.state?.holdUntil as string;

    // If no location.state (e.g., page reload), try to recover from sessionStorage
    let recoveredData = data;
    let recoveredBookingId = bookingId;
    let recoveredHoldUntil = holdUntil;

    if (!data) {
      try {
        const savedHoldInfo = sessionStorage.getItem("booking_hold_info");
        if (savedHoldInfo) {
          const holdInfo = JSON.parse(savedHoldInfo);
          const holdUntilTime = dayjs(holdInfo.holdUntil);
          const currentTime = dayjs();

          // Check if hold is still valid
          if (holdUntilTime.isAfter(currentTime)) {
            console.log("Recovering booking data from sessionStorage");
            recoveredData = holdInfo.bookingData;
            recoveredBookingId = holdInfo.bookingId;
            recoveredHoldUntil = holdInfo.holdUntil;
          } else {
            console.log("Hold has expired, clearing sessionStorage");
            sessionStorage.removeItem("booking_hold_info");
          }
        }
      } catch (error) {
        console.error("Error recovering hold info from sessionStorage:", error);
        sessionStorage.removeItem("booking_hold_info");
      }
    }

    // location.state processed (debug logs removed)

    if (recoveredData) {
      // Validate courtIds array
      if (
        !recoveredData.courtIds ||
        recoveredData.courtIds.length === 0 ||
        recoveredData.courtIds.some(
          (id) => id === null || id === undefined || id === ""
        )
      ) {
        console.error(
          "Invalid courtIds in bookingData:",
          recoveredData.courtIds
        );
        message.error("Thông tin sân không hợp lệ. Vui lòng chọn lại sân.");
        navigate(-1);
        return;
      }

      console.log("Valid bookingData, setting state:", recoveredData);
      setBookingData(recoveredData);

      // Set booking ID if available (from hold process)
      if (recoveredBookingId) {
        console.log("Setting hold booking ID:", recoveredBookingId);
        setHoldBookingId(recoveredBookingId);
      }

      // Calculate countdown time based on holdUntil
      if (recoveredHoldUntil) {
        const holdUntilTime = dayjs(recoveredHoldUntil);
        const currentTime = dayjs();
        const secondsLeft = holdUntilTime.diff(currentTime, "seconds");

        console.log(
          "Hold until:",
          recoveredHoldUntil,
          "Seconds left:",
          secondsLeft
        );

        if (secondsLeft > 0) {
          setTimeLeft(secondsLeft);
          setInitialTime(secondsLeft); // Set initial time for progress calculation
        } else {
          // Hold has already expired
          setTimeLeft(0);
          setInitialTime(300); // Default for progress calculation
          setTimerExpired(true);
          // Clear expired hold info
          sessionStorage.removeItem("booking_hold_info");
        }
      } else {
        // Fallback to 5 minutes if holdUntil is not available
        console.log("No holdUntil provided, using default 5 minutes");
        setTimeLeft(300);
        setInitialTime(300);
      }
    } else {
      message.error("Không có thông tin đặt sân");
      navigate(-1);
    }
  }, [location.state, navigate, originalLocation]);

  // Auto-fill user information if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      form.setFieldsValue({
        fullName: user.fullName || "",
        phone: user.phone || "",
        email: user.email || "",
        notes: "",
      });
      // If phone is missing in the context user, fetch full profile from backend
      if (!user.phone) {
        let mounted = true;
        (async () => {
          try {
            const res = await fetchAccountAPI();
            // fetchAccountAPI returns IBackendRes<IFetchAccount>, where IFetchAccount has `user: IUser`
            const fetchedUser = res?.data?.user;
            if (mounted && fetchedUser) {
              // Update form with fetched values (prefer fetched values)
              form.setFieldsValue({
                fullName:
                  fetchedUser.fullName || form.getFieldValue("fullName"),
                phone: fetchedUser.phone || form.getFieldValue("phone"),
                email: fetchedUser.email || form.getFieldValue("email"),
              });

              // Update global user in context and sessionStorage so other pages can use it
              try {
                if (setUser) {
                  setUser(fetchedUser);
                }
                sessionStorage.setItem("user", JSON.stringify(fetchedUser));
              } catch (e) {
                // ignore storage errors
                console.warn(
                  "Failed to update sessionStorage with fetched profile",
                  e
                );
              }
            }
          } catch (err) {
            console.warn(
              "Failed to fetch account profile on booking page:",
              err
            );
          }
        })();
        return () => {
          mounted = false;
        };
      }
    }
  }, [isAuthenticated, user, form, setUser]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const calculateTotal = () => {
    if (!bookingData) return 0;
    const selectedMethod = paymentMethods.find((m) => m.id === paymentMethod);
    const fee = selectedMethod?.fee || 0;
    return bookingData.totalPrice + fee;
  };

  const handleGoBack = () => {
    console.log(
      "Back button clicked, holdBookingId:",
      holdBookingId,
      "timerExpired:",
      timerExpired
    );

    if (holdBookingId && !timerExpired) {
      console.log(
        "Active booking hold detected, showing confirmation modal..."
      );
      setBackConfirmVisible(true);
    } else {
      console.log("No active booking hold, navigating back immediately");
      navigate(-1);
    }
  };

  const handleConfirmGoBack = async () => {
    console.log("User confirmed to leave, releasing booking and navigating...");
    setBackConfirmVisible(false);

    try {
      if (holdBookingId) {
        await releaseBookingAPI(holdBookingId);
        console.log("Booking released successfully");
        // Clear sessionStorage when booking is released
        sessionStorage.removeItem("booking_hold_info");
      }
    } catch (error) {
      console.error("Failed to release booking on back navigation:", error);
    } finally {
      console.log("Navigating back...");

      // Try different navigation approaches
      if (originalLocation) {
        console.log("Using original location:", originalLocation);
        window.location.href = originalLocation;
      } else {
        // Fallback approaches
        console.log("No original location, trying history.go(-2)");
        window.history.go(-2);

        // Double fallback with navigate
        setTimeout(() => {
          if (window.location.pathname.includes("/booking")) {
            console.log("Final fallback: navigate(-1)");
            navigate(-1);
          }
        }, 200);
      }
    }
  };

  const handleCancelGoBack = () => {
    console.log("User cancelled leaving");
    setBackConfirmVisible(false);

    // Push another state to catch the next back button press
    if (holdBookingId && !timerExpired) {
      const currentPath = window.location.pathname + window.location.search;
      window.history.pushState(null, "", currentPath);
    }
  };
  const handleNextStep = () => {
    if (currentStep === 0) {
      form
        .validateFields()
        .then(() => {
          setCurrentStep(1);
        })
        .catch((error) => {
          console.log("Validation Failed:", error);
        });
    } else if (currentStep === 1) {
      if (!paymentMethod) {
        message.warning("Vui lòng chọn phương thức thanh toán");
        return;
      }
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirmBooking = () => {
    // Set redirect flag immediately when user confirms booking
    // This prevents beforeunload alert when redirecting to payment
    isRedirectingRef.current = true;
    sessionStorage.setItem("redirecting_to_payment", "true");
    (window as any).__REDIRECTING_TO_PAYMENT__ = true;

    setConfirmModalVisible(true);
  };

  const processPayment = async () => {
    if (!bookingData) {
      message.error("Không tìm thấy thông tin đặt sân");
      setLoading(false);
      setConfirmModalVisible(false);
      return;
    }

    try {
      setLoading(true);

      // Validate form first
      await form.validateFields();
      const userInfo = form.getFieldsValue(true);
      console.log("[DEBUG] userInfo after getFieldsValue:", userInfo);

      // Minimal logging kept only for errors; removed verbose debug logs

      // Lấy thông tin khách hàng từ context nếu đã đăng nhập, ưu tiên user context
      let customerInfo;
      if (
        isAuthenticated &&
        user &&
        user.fullName &&
        user.phone &&
        user.email
      ) {
        customerInfo = {
          fullName: user.fullName,
          phone: user.phone,
          email: user.email,
          notes: userInfo.notes || "",
        };
      } else if (userInfo.fullName && userInfo.phone && userInfo.email) {
        customerInfo = userInfo;
      } else {
        message.error("Vui lòng nhập đầy đủ họ tên, số điện thoại và email");
        setLoading(false);
        setConfirmModalVisible(false);
        return;
      }

      // Step 1: Create booking request theo format BE yêu cầu (UPDATED)
      const bookingRequest: ICreateBookingRequest = {
        venueId: bookingData.venue,
        courtIds: bookingData.courtIds,
        date: bookingData.date,
        timeSlots: bookingData.timeSlots.map((slot) => ({
          startTime: slot.start, // Map start -> startTime
          endTime: slot.end, // Map end -> endTime
          price: slot.price,
        })),
        paymentMethod: paymentMethod.toLowerCase() as
          | "payos"
          | "momo"
          | "zalopay"
          | "banking",
        paymentInfo: {
          returnUrl: `${window.location.origin}/booking/payos-return`,
          cancelUrl: `${window.location.origin}/booking/payos-return`,
        },
        customerInfo: {
          fullName: customerInfo.fullName,
          email: customerInfo.email,
          phoneNumber: customerInfo.phone, // Map phone -> phoneNumber
        },
        notes: customerInfo.notes || "",
      };

      console.log("Creating booking with data:", bookingRequest);
      console.log(
        "📞 Note: Customer info will be handled by user authentication"
      );

      // Try real API to create booking
      let bookingResponse;
      try {
        bookingResponse = await createBookingAPI(bookingRequest);
      } catch (realApiError: any) {
        console.error("❌ Real API failed:", realApiError.message);
        throw new Error("Không thể tạo booking: " + realApiError.message);
      }

      // Backend response received (verbose log removed)

      if (!bookingResponse.data && !bookingResponse.booking) {
        console.error("Backend error details:", bookingResponse);
        throw new Error(bookingResponse.message || "Tạo booking thất bại");
      }

      // Handle response based on Backend format (Updated for PayOS)

      let booking: any;
      let paymentInfo: any = null;
      let bookingRef: string | undefined;

      if (bookingResponse.data) {
        const data = bookingResponse.data as any;

        if (data.booking && data.payment) {
          booking = data.booking;
          paymentInfo = data.payment;
        } else if (data.booking) {
          booking = data.booking;
        } else if (
          data.bookings &&
          Array.isArray(data.bookings) &&
          data.bookings.length > 0
        ) {
          booking = data.bookings[0];
          // Nếu có groupBookingCode thì dùng làm bookingRef
          bookingRef = data.groupBookingCode;
        } else if (typeof data === "object" && data._id) {
          booking = data;
        } else {
          throw new Error("Không nhận được thông tin booking từ server");
        }
        // Nếu chưa có bookingRef (single booking), lấy bookingCode hoặc _id
        if (!bookingRef) {
          bookingRef = booking.bookingCode || booking._id;
        }
      } else if (bookingResponse.booking) {
        booking = bookingResponse.booking;
        bookingRef = booking.bookingCode || booking._id;
      } else {
        throw new Error("Không nhận được thông tin booking từ server");
      }

      // Create booking result with customer info
      const bookingResult = {
        ...booking,
        customerInfo: {
          fullName: customerInfo.fullName,
          phone: customerInfo.phone,
          email: customerInfo.email,
        },
        paymentRef: bookingRef,
        bookingRef: bookingRef,
      };
      localStorage.setItem("currentBooking", JSON.stringify(bookingResult));

      // Step 2: Handle payment method
      if (paymentMethod === "payos") {
        try {
          // 1) Nếu BE đã tạo link PayOS trong bước tạo booking, dùng ngay link đó
          const existingPaymentUrl =
            paymentInfo?.paymentUrl ||
            paymentInfo?.checkoutUrl ||
            (booking?.checkoutUrl as string) ||
            (booking?.payosPaymentLinkId
              ? `https://pay.payos.vn/web/${booking.payosPaymentLinkId}`
              : undefined);

          const existingPaymentRef =
            paymentInfo?.paymentRef ||
            paymentInfo?.orderCode ||
            booking?.payosOrderCode;

          if (existingPaymentUrl) {
            const bookingToStore = {
              ...bookingResult,
              payosOrderCode: existingPaymentRef,
            };
            localStorage.setItem(
              "currentBooking",
              JSON.stringify(bookingToStore)
            );
            window.location.href = existingPaymentUrl;
            return;
          }

          // 2) Nếu BE chưa tạo link thì mới gọi endpoint PayOS riêng một lần
          const amount = booking?.totalPrice || calculateTotal();
          const bookingId = bookingRef || booking._id || booking.bookingId;
          if (!bookingId) {
            throw new Error(
              "Không tìm thấy mã booking để tạo thanh toán PayOS"
            );
          }

          const payosResponse = await createPayOSPayment({
            amount: amount,
            bookingId: String(bookingId),
            description: `Thanh toán đặt sân ${
              bookingResult.courtNames || ""
            } - ${dayjs(bookingResult.date).format("DD/MM/YYYY")}`,
            buyerName: customerInfo.fullName,
            buyerEmail: customerInfo.email,
            buyerPhone: customerInfo.phone,
          });

          const bookingToStore = {
            ...bookingResult,
            payosOrderCode: payosResponse.paymentRef,
          };
          localStorage.setItem(
            "currentBooking",
            JSON.stringify(bookingToStore)
          );

          // Clear booking hold info since we're proceeding with payment
          sessionStorage.removeItem("booking_hold_info");

          // Use the handlePaymentRedirection function to properly redirect
          handlePaymentRedirection(payosResponse);

          return;
        } catch (payosError: any) {
          console.error("Create/Redirect PayOS error:", payosError);
          message.error(
            payosError.message || "Không thể khởi tạo/chuyển hướng PayOS"
          );
          setLoading(false);
          setConfirmModalVisible(false);
          return;
        }
      } else {
        // Handle other payment methods (cash, banking, etc.)
        message.success("Đặt sân thành công! Vui lòng thanh toán khi đến sân.");

        // Clear sessionStorage when booking is successful
        sessionStorage.removeItem("booking_hold_info");

        // Navigate to success page
        navigate("/booking/success", {
          state: {
            booking: bookingResult,
            paymentMethod: paymentMethod,
            paymentStatus: "pending",
          },
        });

        setConfirmModalVisible(false);
        setLoading(false);
      }
    } catch (error: any) {
      console.error("Payment error:", error);

      // Reset redirect flags on error
      isRedirectingRef.current = false;
      sessionStorage.removeItem("redirecting_to_payment");
      (window as any).__REDIRECTING_TO_PAYMENT__ = false;

      // Check if it's form validation error
      if (error.errorFields && error.errorFields.length > 0) {
        message.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
        // Focus on first error field
        form.scrollToField(error.errorFields[0].name);
      } else {
        message.error(
          error.message || "Có lỗi xảy ra trong quá trình thanh toán"
        );
      }

      setLoading(false);
      setConfirmModalVisible(false);
    }
  };

  // Function to handle payment redirection
  const handlePaymentRedirection = (payosResponse: { paymentUrl: string }) => {
    // Set flags to indicate redirection
    (window as any).__REDIRECTING_TO_PAYMENT__ = true;
    sessionStorage.setItem("redirecting_to_payment", "true");
    isRedirectingRef.current = true;

    console.log("Redirecting to PayOS payment URL...");
    console.log("Payment redirect flags set:", {
      ref: isRedirectingRef.current,
      sessionStorage: sessionStorage.getItem("redirecting_to_payment"),
      window: (window as any).__REDIRECTING_TO_PAYMENT__,
    });

    // Redirect to payment URL
    window.location.replace(payosResponse.paymentUrl);
  };

  const steps = [
    {
      title: "Thông tin khách hàng",
      icon: <UserOutlined />,
    },
    {
      title: "Phương thức thanh toán",
      icon: <CreditCardOutlined />,
    },
    {
      title: "Xác nhận đặt sân",
      icon: <CheckCircleOutlined />,
    },
  ];

  // Check redirection state on component mount
  useEffect(() => {
    const isRedirecting =
      sessionStorage.getItem("redirecting_to_payment") === "true";
    if (isRedirecting) {
      console.log("Redirecting to payment page...");
      sessionStorage.removeItem("redirecting_to_payment");
    }
  }, []);

  if (!bookingData) {
    return (
      <div className="booking-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="container">
        <Card className="booking-header-card">
          <div className="booking-header">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleGoBack}
              className="back-btn"
            >
              Quay lại
            </Button>
            <Title level={2}>Đặt sân thể thao</Title>
          </div>

          <Steps
            current={currentStep}
            items={steps}
            className="booking-steps"
            direction="horizontal"
            labelPlacement="horizontal"
          />
        </Card>

        {/* Countdown Timer */}
        <Card className="countdown-timer-card" style={{ marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <WarningOutlined
                style={{ color: getCountdownColor(), fontSize: 18 }}
              />
              <div>
                <Text strong style={{ fontSize: 16 }}>
                  Thời gian giữ sân còn lại:
                </Text>
                <Text
                  strong
                  style={{
                    fontSize: 20,
                    color: getCountdownColor(),
                    marginLeft: 8,
                  }}
                >
                  {formatTime(timeLeft)}
                </Text>
              </div>
            </div>
            <div style={{ flex: 1, maxWidth: 200, marginLeft: 24 }}>
              <Progress
                percent={getProgressPercent()}
                strokeColor={getCountdownColor()}
                showInfo={false}
                size="small"
              />
            </div>
          </div>
          {timeLeft <= 120 && (
            <div style={{ marginTop: 8 }}>
              <Text type="warning" style={{ fontSize: 12 }}>
                ⚠️ Vui lòng hoàn tất đặt sân trước khi hết thời gian để không
                mất chỗ
              </Text>
            </div>
          )}
        </Card>

        <Row gutter={[24, 24]}>
          {/* Main Content */}
          <Col xs={24} lg={16}>
            <Card className="booking-form-card">
              {/* Step 1: Customer Information */}
              {currentStep === 0 && (
                <div className="step-content">
                  <div style={{ marginBottom: 16 }}>
                    <Title level={4}>Thông tin khách hàng</Title>
                    {isAuthenticated && user ? (
                      <div
                        style={{
                          padding: "8px 12px",
                          background: "#f6ffed",
                          borderRadius: "6px",
                          border: "1px solid #b7eb8f",
                          marginBottom: 16,
                        }}
                      >
                        <Text style={{ color: "#52c41a" }}>
                          ✓ Đã tự động điền thông tin từ tài khoản của bạn
                        </Text>
                      </div>
                    ) : (
                      <div
                        style={{
                          padding: "12px",
                          background: "#fff7e6",
                          borderRadius: "6px",
                          border: "1px solid #ffd591",
                          marginBottom: 16,
                        }}
                      >
                        <Text type="secondary">
                          💡 <strong>Gợi ý:</strong> Đăng nhập để tự động điền
                          thông tin và theo dõi lịch sử đặt sân{" "}
                          <Button
                            type="link"
                            size="small"
                            onClick={() =>
                              navigate("/login", {
                                state: {
                                  returnUrl: location.pathname,
                                  bookingData: bookingData,
                                },
                              })
                            }
                            style={{ padding: 0, height: "auto" }}
                          >
                            Đăng nhập ngay
                          </Button>
                        </Text>
                      </div>
                    )}
                  </div>
                  <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                      fullName: "",
                      phone: "",
                      email: "",
                      notes: "",
                    }}
                  >
                    <Row gutter={[16, 0]}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label="Họ và tên"
                          name="fullName"
                          rules={[
                            { required: true, message: "Vui lòng nhập họ tên" },
                            {
                              min: 2,
                              message: "Họ tên phải có ít nhất 2 ký tự",
                            },
                          ]}
                        >
                          <Input
                            placeholder={
                              isAuthenticated && user?.fullName
                                ? user.fullName
                                : "Nhập họ và tên"
                            }
                            prefix={<UserOutlined />}
                            disabled={loading}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label="Số điện thoại"
                          name="phone"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập số điện thoại",
                            },
                            {
                              pattern: /^[0-9]{10,11}$/,
                              message: "Số điện thoại không hợp lệ",
                            },
                          ]}
                        >
                          <Input
                            placeholder={
                              isAuthenticated && user?.phone
                                ? user.phone
                                : "Nhập số điện thoại"
                            }
                            disabled={loading}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[
                        { required: true, message: "Vui lòng nhập email" },
                        { type: "email", message: "Email không hợp lệ" },
                      ]}
                    >
                      <Input
                        placeholder={
                          isAuthenticated && user?.email
                            ? user.email
                            : "Nhập email"
                        }
                        disabled={loading}
                      />
                    </Form.Item>

                    <Form.Item label="Ghi chú (tùy chọn)" name="notes">
                      <Input.TextArea
                        rows={3}
                        placeholder="Nhập ghi chú về yêu cầu đặc biệt..."
                      />
                    </Form.Item>
                  </Form>
                </div>
              )}

              {/* Step 2: Payment Method */}
              {currentStep === 1 && (
                <div className="step-content">
                  <Title level={4}>Chọn phương thức thanh toán</Title>
                  <Radio.Group
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="payment-methods"
                  >
                    <Space
                      direction="vertical"
                      size="middle"
                      style={{ width: "100%" }}
                    >
                      {paymentMethods.map((method) => (
                        <Radio
                          key={method.id}
                          value={method.id}
                          className="payment-method-option"
                        >
                          <div className="payment-method-content">
                            <div className="payment-method-info">
                              <div className="payment-method-header">
                                <span className="payment-method-icon">
                                  {method.icon}
                                </span>
                                <span className="payment-method-name">
                                  {method.name}
                                </span>
                                {method.fee === 0 && (
                                  <Tag color="green">Miễn phí</Tag>
                                )}
                              </div>
                              <div className="payment-method-description">
                                {method.description}
                              </div>
                            </div>
                            {method.fee && method.fee > 0 && (
                              <div className="payment-method-fee">
                                +{formatCurrency(method.fee)}
                              </div>
                            )}
                          </div>
                        </Radio>
                      ))}
                    </Space>
                  </Radio.Group>
                </div>
              )}

              {/* Step 3: Confirmation */}
              {currentStep === 2 && (
                <div className="step-content">
                  <Title level={4}>Xác nhận thông tin đặt sân</Title>
                  <div className="confirmation-content">
                    <div className="confirmation-section">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: 12,
                        }}
                      >
                        <Title level={5} style={{ margin: 0 }}>
                          Thông tin khách hàng
                        </Title>
                        {isAuthenticated && user && (
                          <Tag color="green" style={{ marginLeft: 8 }}>
                            Tài khoản đã xác thực
                          </Tag>
                        )}
                      </div>
                      <div className="info-row">
                        <Text strong>Họ tên:</Text>
                        <Text>{form.getFieldValue("fullName")}</Text>
                      </div>
                      <div className="info-row">
                        <Text strong>Điện thoại:</Text>
                        <Text>{form.getFieldValue("phone")}</Text>
                      </div>
                      <div className="info-row">
                        <Text strong>Email:</Text>
                        <Text>{form.getFieldValue("email")}</Text>
                      </div>
                      {form.getFieldValue("notes") && (
                        <div className="info-row">
                          <Text strong>Ghi chú:</Text>
                          <Text>{form.getFieldValue("notes")}</Text>
                        </div>
                      )}
                    </div>

                    <Divider />

                    <div className="confirmation-section">
                      <Title level={5}>Phương thức thanh toán</Title>
                      <div className="payment-method-selected">
                        {paymentMethods.find((m) => m.id === paymentMethod) && (
                          <Space>
                            {
                              paymentMethods.find((m) => m.id === paymentMethod)
                                ?.icon
                            }
                            <Text>
                              {
                                paymentMethods.find(
                                  (m) => m.id === paymentMethod
                                )?.name
                              }
                            </Text>
                          </Space>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="step-actions">
                {currentStep > 0 && (
                  <Button onClick={handlePrevStep} disabled={timerExpired}>
                    Quay lại
                  </Button>
                )}
                {currentStep < 2 && (
                  <Button
                    type="primary"
                    onClick={handleNextStep}
                    disabled={timerExpired}
                  >
                    Tiếp tục
                  </Button>
                )}
                {currentStep === 2 && (
                  <Button
                    type="primary"
                    onClick={handleConfirmBooking}
                    className="confirm-btn"
                    disabled={timerExpired}
                  >
                    Xác nhận và thanh toán
                  </Button>
                )}
              </div>
            </Card>
          </Col>

          {/* Booking Summary */}
          <Col xs={24} lg={8}>
            <Card className="booking-summary-card" title="Thông tin đặt sân">
              {timeLeft <= 180 && (
                <Alert
                  message={`Còn ${formatTime(timeLeft)} để hoàn tất đặt sân`}
                  description="Vui lòng nhanh chóng hoàn tất các bước để không mất chỗ đã giữ"
                  type="warning"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}
              <div className="summary-content">
                <div className="court-info">
                  <Title level={5}>{bookingData.courtNames}</Title>

                  <div className="booking-details">
                    <div className="detail-item">
                      <CalendarOutlined />
                      <Text>
                        {dayjs(bookingData.date).format("DD/MM/YYYY")}
                      </Text>
                    </div>
                    <div className="detail-item">
                      <ClockCircleOutlined />
                      <Text>
                        {bookingData.timeSlots.length} khung giờ (
                        {bookingData.timeSlots
                          .map((slot) => `${slot.start}-${slot.end}`)
                          .join(", ")}
                        )
                      </Text>
                    </div>
                    <div className="detail-item">
                      <TeamOutlined />
                      <Text>{bookingData.courtQuantity} sân</Text>
                    </div>
                  </div>
                </div>

                <Divider />

                <div className="price-breakdown">
                  <div className="price-item">
                    <Text>Tổng giá thuê sân:</Text>
                    <Text strong>{formatCurrency(bookingData.totalPrice)}</Text>
                  </div>

                  {paymentMethod &&
                    paymentMethods.find((m) => m.id === paymentMethod)?.fee && (
                      <div className="price-item">
                        <Text>Phí thanh toán:</Text>
                        <Text strong>
                          {formatCurrency(
                            paymentMethods.find((m) => m.id === paymentMethod)
                              ?.fee || 0
                          )}
                        </Text>
                      </div>
                    )}

                  <Divider />

                  <div className="price-item total">
                    <Text strong>Tổng cộng:</Text>
                    <Text strong className="total-price">
                      {formatCurrency(calculateTotal())}
                    </Text>
                  </div>
                </div>

                <div className="booking-notes">
                  <Title level={5}>Lưu ý</Title>
                  <ul>
                    <li>Vui lòng có mặt trước 15 phút so với giờ đặt sân</li>
                    <li>Mang theo giấy tờ tùy thân để xác minh</li>
                    <li>Thanh toán sẽ được hoàn lại 100% nếu hủy trước 24h</li>
                    <li>Liên hệ hotline để được hỗ trợ: 1900 123 456</li>
                  </ul>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Confirmation Modal */}
        <Modal
          title="Xác nhận thanh toán"
          open={confirmModalVisible}
          onOk={processPayment}
          onCancel={() => {
            // Reset redirect flags when user cancels
            isRedirectingRef.current = false;
            sessionStorage.removeItem("redirecting_to_payment");
            (window as any).__REDIRECTING_TO_PAYMENT__ = false;
            setConfirmModalVisible(false);
          }}
          okText="Thanh toán ngay"
          cancelText="Hủy"
          confirmLoading={loading}
          className="payment-modal"
        >
          <div className="payment-confirmation">
            <div className="confirmation-amount">
              <Text>Tổng tiền cần thanh toán:</Text>
              <Title level={3} className="amount">
                {formatCurrency(calculateTotal())}
              </Title>
            </div>

            <div className="payment-info">
              <Text>
                Bạn sẽ được chuyển đến trang thanh toán của{" "}
                <strong>
                  {paymentMethods.find((m) => m.id === paymentMethod)?.name}
                </strong>{" "}
                để hoàn tất giao dịch.
              </Text>
            </div>
          </div>
        </Modal>

        {/* Back Confirmation Modal */}
        <Modal
          title="Xác nhận rời khỏi trang"
          open={backConfirmVisible}
          onOk={handleConfirmGoBack}
          onCancel={handleCancelGoBack}
          okText="Rời khỏi"
          cancelText="Ở lại"
          okType="danger"
        >
          <p>
            Bạn có chắc muốn rời khỏi trang? Việc giữ sân sẽ bị hủy và bạn sẽ
            cần đặt lại.
          </p>
        </Modal>
      </div>
    </div>
  );
};

export default BookingPage;

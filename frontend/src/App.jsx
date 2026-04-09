import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import CustomerHomePage from "./pages/customer/CustomerHomePage";
import RestaurantPage from "./pages/customer/RestaurantPage";
import MyOrdersPage from "./pages/customer/MyOrdersPage";
import OrderTrackingPage from "./pages/customer/OrderTrackingPage";
import PreferencesPage from "./pages/customer/PreferencesPage";
import OnboardingPage from "./pages/auth/OnboardingPage";
import OwnerDashboardPage from "./pages/owner/OwnerDashboardPage";
import MenuManagementPage from "./pages/owner/MenuManagementPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import "./App.css";

export default function App() {
  const CustomerRoute = ({ children }) => (
    <ProtectedRoute><RoleRoute allowedRole="CUSTOMER">{children}</RoleRoute></ProtectedRoute>
  );
  const OwnerRoute = ({ children }) => (
    <ProtectedRoute><RoleRoute allowedRole="OWNER">{children}</RoleRoute></ProtectedRoute>
  );

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password"  element={<ResetPasswordPage />} />

      {/* Customer */}
      <Route path="/customer/home"                     element={<CustomerRoute><CustomerHomePage /></CustomerRoute>} />
      <Route path="/customer/restaurant/:id"           element={<CustomerRoute><RestaurantPage /></CustomerRoute>} />
      <Route path="/customer/orders"                   element={<CustomerRoute><MyOrdersPage /></CustomerRoute>} />
      <Route path="/customer/order/:orderId"            element={<CustomerRoute><OrderTrackingPage /></CustomerRoute>} />
      <Route path="/customer/preferences"              element={<CustomerRoute><PreferencesPage /></CustomerRoute>} />
      <Route path="/onboarding"                         element={<CustomerRoute><OnboardingPage /></CustomerRoute>} />

      {/* Owner */}
      <Route path="/owner/dashboard"                   element={<OwnerRoute><OwnerDashboardPage /></OwnerRoute>} />
      <Route path="/owner/restaurant/:id/menu"         element={<OwnerRoute><MenuManagementPage /></OwnerRoute>} />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

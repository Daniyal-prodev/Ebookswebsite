import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import RootLayout from "./views/RootLayout";
import HomePage from "./views/HomePage";
import CatalogPage from "./views/CatalogPage";
import ProductPage from "./views/ProductPage";
import CartPage from "./views/CartPage";
import CheckoutPage from "./views/CheckoutPage";
import OrderSuccessPage from "./views/OrderSuccessPage";
import AboutPage from "./views/AboutPage";
import ContactPage from "./views/ContactPage";
import LoginPage from "./views/LoginPage";
import SignupPage from "./views/SignupPage";
import AccountPage from "./views/AccountPage";
import OAuthCallback from "./views/OAuthCallback";
import VerifyEmailPage from "./views/VerifyEmailPage";
import AdminLoginPage from "./views/admin/AdminLoginPage";
import AdminDashboard from "./views/admin/AdminDashboard";
import AdminProducts from "./views/admin/AdminProducts";
import AdminEditProduct from "./views/admin/AdminEditProduct";
import AdminCreateProductWizard from "./views/admin/AdminCreateProductWizard";

function ProtectedAdmin({ children }: { children: JSX.Element }) {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  if (!token) return <Navigate to="/secret-admin/login" replace />;
  return children;
}

function ProtectedCustomer({ children }: { children: JSX.Element }) {
  const token = typeof window !== "undefined" ? localStorage.getItem("customer_token") : null;
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <ProtectedCustomer><HomePage /></ProtectedCustomer> },
      { path: "catalog", element: <ProtectedCustomer><CatalogPage /></ProtectedCustomer> },
      { path: "product/:id", element: <ProtectedCustomer><ProductPage /></ProtectedCustomer> },
      { path: "about", element: <ProtectedCustomer><AboutPage /></ProtectedCustomer> },
      { path: "contact", element: <ProtectedCustomer><ContactPage /></ProtectedCustomer> },
      { path: "cart", element: <ProtectedCustomer><CartPage /></ProtectedCustomer> },
      { path: "checkout", element: <ProtectedCustomer><CheckoutPage /></ProtectedCustomer> },
      { path: "success/:orderId", element: <ProtectedCustomer><OrderSuccessPage /></ProtectedCustomer> },
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignupPage /> },
      { path: "verify", element: <VerifyEmailPage /> },
      { path: "oauth/callback/:provider", element: <OAuthCallback /> },
      { path: "account", element: <ProtectedCustomer><AccountPage /></ProtectedCustomer> },
    ],
  },
  { path: "/secret-admin/login", element: <AdminLoginPage /> },
  {
    path: "/secret-admin",
    element: <ProtectedAdmin><AdminDashboard /></ProtectedAdmin>,
    children: [
      { index: true, element: <AdminProducts /> },
      { path: "products/:id", element: <AdminEditProduct /> },
      { path: "products/new", element: <AdminCreateProductWizard /> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}

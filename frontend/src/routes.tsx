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
import AdminLoginPage from "./views/admin/AdminLoginPage";
import AdminDashboard from "./views/admin/AdminDashboard";
import AdminProducts from "./views/admin/AdminProducts";
import AdminEditProduct from "./views/admin/AdminEditProduct";

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
      { index: true, element: <HomePage /> },
      { path: "catalog", element: <CatalogPage /> },
      { path: "product/:id", element: <ProductPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "success/:orderId", element: <OrderSuccessPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignupPage /> },
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
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}

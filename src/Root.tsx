import { Outlet } from "react-router";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import CartDrawer from "./components/CartDrawer";
import CartToast from "./components/CartToast";
import AuthModal from "./components/AuthModal";
import CheckoutModal from "./components/CheckoutModal";

export default function Root() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-[#f0f2f0] font-[Outfit,sans-serif]">
          <Navbar />
          <div className="flex-1">
            <Outlet />
          </div>
          <Footer />
          <CartDrawer />
          <CartToast />
          <AuthModal />
          <CheckoutModal />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

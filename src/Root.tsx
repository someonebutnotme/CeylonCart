import { Outlet } from "react-router";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function Root() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f0f2f0] font-[Outfit,sans-serif]">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

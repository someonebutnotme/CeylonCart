import { useCart } from "../context/CartContext";

export default function CartToast() {
  const { toastMessage, setIsCartOpen } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div className="flex items-center gap-3 bg-[#1c382b] text-white px-4 py-3 rounded-xl shadow-2xl border border-[#3b7c5b]">
        <div className="w-6 h-6 rounded-full bg-[#2e7d52] flex items-center justify-center text-white text-xs font-bold">
          ✓
        </div>
        <p className="text-sm font-medium pr-2">{toastMessage}</p>
        <button
          onClick={() => setIsCartOpen(true)}
          className="text-xs bg-white text-[#1c382b] font-bold px-3 py-1.5 rounded-lg hover:bg-gray-100 transition whitespace-nowrap cursor-pointer"
        >
          View Cart
        </button>
      </div>
    </div>
  );
}

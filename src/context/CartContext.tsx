import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
} from "react";
import { CartItem, CartContextType, Product } from "../types/cart";
import {
  getSessionId,
  fetchCart,
  addToCartApi,
  updateQuantityApi,
  removeFromCartApi,
  clearCartApi,
  syncCartApi,
} from "../services/api";

const LOCAL_STORAGE_KEY = "ceyloncart_cart";

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage for instantaneous browser persistence
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("Failed to load cart from localStorage", e);
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Failed to save cart to localStorage", e);
    }
  }, [items]);

  // Initial sync with backend MongoDB
  useEffect(() => {
    const sessionId = getSessionId();
    let isMounted = true;

    async function initializeServerCart() {
      try {
        const serverItems = await fetchCart(sessionId);
        if (!isMounted) return;

        // If local storage already has items, push local state to server
        if (items.length > 0) {
          await syncCartApi(sessionId, items);
        } else if (serverItems && serverItems.length > 0) {
          // If local storage was empty (e.g., cleared browser storage), hydrate from server
          setItems(serverItems);
        }
      } catch (err) {
        console.warn("Failed to sync initial cart with MongoDB", err);
      }
    }

    initializeServerCart();
    return () => {
      isMounted = false;
    };
  }, []); // Run once on mount

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const addToCart = useCallback(
    (
      product: Product | { id?: string; _id?: string; name: string; price: number; originalPrice?: number; img: string; sizes?: string[]; colors?: string[] },
      quantity: number = 1,
      selectedSize?: string,
      selectedColor?: string
    ) => {
      const rawId = product._id || product.id || product.name;
      const variantSuffix = [selectedSize, selectedColor].filter(Boolean).join("-");
      const cartItemId = variantSuffix ? `${rawId}_${variantSuffix}` : rawId;
      const addQty = Math.max(1, Math.floor(quantity));

      setItems((prevItems) => {
        const existingIndex = prevItems.findIndex(
          (item) => item.productId === cartItemId
        );

        let newItems: CartItem[];
        if (existingIndex > -1) {
          newItems = prevItems.map((item, idx) =>
            idx === existingIndex
              ? { ...item, quantity: item.quantity + addQty }
              : item
          );
        } else {
          const newItem: CartItem = {
            productId: cartItemId,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            img: product.img,
            quantity: addQty,
            selectedSize,
            selectedColor,
          };
          newItems = [...prevItems, newItem];
        }

        return newItems;
      });

      // Background sync with MongoDB
      const sessionId = getSessionId();
      addToCartApi(
        sessionId,
        {
          productId: cartItemId,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          img: product.img,
        },
        addQty
      );

      const variantNote = [selectedSize, selectedColor].filter(Boolean).join(", ");
      showToast(
        `Added ${addQty} × "${product.name}"${variantNote ? ` (${variantNote})` : ""} to cart`
      );
    },
    [showToast]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      const newQty = Math.floor(quantity);
      if (newQty <= 0) {
        removeFromCart(productId);
        return;
      }

      setItems((prevItems) =>
        prevItems.map((item) =>
          item.productId === productId ? { ...item, quantity: newQty } : item
        )
      );

      const sessionId = getSessionId();
      updateQuantityApi(sessionId, productId, newQty);
    },
    []
  );

  const removeFromCart = useCallback((productId: string) => {
    setItems((prevItems) => {
      const itemToRemove = prevItems.find((i) => i.productId === productId);
      if (itemToRemove) {
        showToast(`Removed "${itemToRemove.name}" from cart`);
      }
      return prevItems.filter((item) => item.productId !== productId);
    });

    const sessionId = getSessionId();
    removeFromCartApi(sessionId, productId);
  }, [showToast]);

  const clearCart = useCallback(() => {
    setItems([]);
    const sessionId = getSessionId();
    clearCartApi(sessionId);
    showToast("Cart cleared");
  }, [showToast]);

  // Derived calculations
  const itemCount = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [items]
  );

  // Free shipping over Rs. 5,000, otherwise Rs. 350
  const shipping = useMemo(() => {
    if (subtotal === 0) return 0;
    return subtotal >= 5000 ? 0 : 350;
  }, [subtotal]);

  const total = useMemo(() => subtotal + shipping, [subtotal, shipping]);

  const value: CartContextType = {
    items,
    itemCount,
    subtotal,
    shipping,
    total,
    isCartOpen,
    setIsCartOpen,
    isCheckoutOpen,
    setIsCheckoutOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toastMessage,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
export default useCart;

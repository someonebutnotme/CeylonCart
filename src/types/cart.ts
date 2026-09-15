export interface Product {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  img: string;
  badge?: string;
  badgeColor?: string;
  description?: string;
  category?: string;
  stock?: number;
  sizes?: string[];
  colors?: string[];
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  img: string;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface ProductFilterParams {
  category?: string;
  search?: string;
  size?: string;
  color?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  minRating?: number | string;
  sort?: "price_asc" | "price_desc" | "rating_desc" | "newest";
}

export interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode?: string;
}

export interface Order {
  _id?: string;
  user?: string;
  userEmail: string;
  userName: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    img?: string;
    size?: string;
    color?: string;
  }>;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  total: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  createdAt?: string;
}

export interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  addToCart: (
    product: Product | { id?: string; _id?: string; name: string; price: number; originalPrice?: number; img: string; sizes?: string[]; colors?: string[] },
    quantity?: number,
    selectedSize?: string,
    selectedColor?: string
  ) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toastMessage: string | null;
}

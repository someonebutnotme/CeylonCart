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
  paymentStatus?: "Pending" | "Paid" | "Failed" | "Cancelled";
  payherePaymentId?: string;
  subtotal: number;
  shipping: number;
  total: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled" | "Paid";
  createdAt?: string;
}

export interface PayHereParams {
  sandbox: boolean;
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  amount: string;
  currency: string;
  hash: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  delivery_address: string;
  delivery_city: string;
  delivery_country: string;
}

declare global {
  interface Window {
    payhere?: {
      startPayment: (payment: PayHereParams) => void;
      onCompleted?: (orderId: string) => void;
      onDismissed?: () => void;
      onError?: (error: string) => void;
    };
  }
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

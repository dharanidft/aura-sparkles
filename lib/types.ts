export type FragranceFamily = 
  | "Floral & Romantic" 
  | "Warm & Comforting" 
  | "Fresh & Refreshing" 
  | "Calm & Relaxing" 
  | "Earthy & Woody"
  | "Rich & Resinous";

export type ProductCategory = 
  | "Candles"
  | "Scented Candles"
  | "Tea-Light Candles"
  | "Decorative Candles"
  | "Wax Sachets"
  | "Hanging Fragrance Bars"
  | "Casting Decor"
  | "Pop Art Kits"
  | "Home Fragrance"
  | "Gift Sets"
  | "Combo Offers"
  | "Seasonal Gift Collections";

export interface ScentPyramid {
  top: string[];
  heart: string[];
  base: string[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: ProductCategory;
  fragranceFamily: FragranceFamily;
  price: number;
  mrp: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  isBestseller?: boolean;
  isNewArrival?: boolean;
  isGiftReady?: boolean;
  netWeight: string;
  burnTime: string;
  jarType: string;
  waxType: string;
  description: string;
  notes: ScentPyramid;
  careInstructions: string[];
  images: string[];
  collection: 
    | "The Everyday Collection" 
    | "The Signature Fragrance Collection" 
    | "The Gifting Collection" 
    | "The Home Fragrance Collection"
    | "Tea-Light Collection"
    | "Decorative Collection"
    | "Combo Offers"
    | "Wax Sachets Collection"
    | "Casting Decor Collection"
    | "Pop Art Collection";
  /** Size variant label e.g. "80g" | "100g" | "200g" */
  sizeVariant?: string;
  /** For combos — what's inside */
  comboContents?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}

export type OrderStatus = "Pending" | "Confirmed" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
export type PaymentStatus = "Pending" | "Paid" | "Failed" | "COD";

export interface Order {
  id: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  discountCode?: string;
  shippingFee: number;
  total: number;
  shippingAddress: ShippingAddress;
  paymentMethod: "Razorpay" | "UPI" | "COD";
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
}

export interface DiscountCoupon {
  code: string;
  type: "percentage" | "flat";
  value: number;
  minOrderValue: number;
  description: string;
}

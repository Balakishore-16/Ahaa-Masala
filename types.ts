
export enum Language {
  EN = 'EN',
  TE = 'TE'
}

export type Variant = {
  id: string;
  weight: string; // e.g., "50g", "100g"
  price: number;
  stock: number;
};

export interface Product {
  id: string;
  name: string;
  nameTe?: string; // Telugu Name
  description: string;
  descriptionTe?: string;
  image: string;
  variants: Variant[];
  active: boolean;
}

export interface CartItem {
  productId: string;
  variantId: string;
  qty: number;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  maxUses: number;
  usedCount: number;
  active: boolean;
  isOneTime: boolean;
}

export interface Banner {
  id: string;
  image: string;
  alt: string;
  active: boolean;
  order: number;
}

export interface UserDetails {
  name: string;
  mobile: string;
  email: string;
  houseNo: string;
  address: string;
  landmark: string;
  city: string;
  mandal: string;
  district: string;
  pincode: string;
  state: string;
}

export type OrderStatus = 'PENDING' | 'PAYMENT_UPLOADED' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: string;
  date: string;
  items: {
    productId: string;
    productName: string;
    variant: string;
    price: number;
    qty: number;
  }[];
  subtotal: number;
  gst: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  customer: UserDetails;
  paymentMethod: 'COD' | 'UPI';
  status: OrderStatus;
  paymentScreenshot?: string; // Base64
}

export interface StoreSettings {
  gstPercent: number;
  deliveryCharge: number;
  freeDeliveryThreshold: number;
  merchantVpa: string;
  merchantName: string;
  adminUsername: string;
  adminPasswordHash: string; // Simple hash simulation
  allowCod: boolean;
}

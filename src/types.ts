export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  phone?: string;
  address?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  price: number;
  discount: number; // percentage
  stock: number;
  ingredients: string;
  createdAt: string;
}

export interface CartItem {
  id: string; // matches product ID
  name: string;
  price: number;
  priceAfterDiscount: number;
  quantity: number;
  image: string;
  stockLimit: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  deliveryAddress: string;
  deliveryPhone: string;
  products: OrderItem[];
  totalAmount: number;
  discountAmount: number;
  orderStatus: "Pending" | "Preparing" | "Out for Delivery" | "Delivered";
  paymentStatus: "Paid" | "Pending";
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  expiryDate: string;
  activeStatus: boolean;
}

export interface AiMessage {
  role: "user" | "assistant";
  text: string;
}

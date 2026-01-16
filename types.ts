// Supabase Aligned Types

export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
  CANCELED = 'canceled',
  REQUIRES_ACTION = 'requires_action'
}

export enum PaymentStatus {
  NOT_PAID = 'not_paid',
  AWAITING = 'awaiting',
  CAPTURED = 'captured',
  REFUNDED = 'refunded',
  CANCELED = 'canceled'
}

export enum FulfillmentStatus {
  NOT_FULFILLED = 'not_fulfilled',
  FULFILLED = 'fulfilled',
  SHIPPED = 'shipped',
  RETURNED = 'returned',
  CANCELED = 'canceled'
}

export interface Region {
  id: string;
  name: string;
  currency_code: string;
  tax_rate: number;
}

export interface ProductVariant {
  id: string;
  title: string;
  sku: string;
  inventory_quantity: number;
  prices: {
    currency_code: string;
    amount: number;
  }[];
}

export interface Product {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  handle: string;
  status: 'draft' | 'proposed' | 'published' | 'rejected';
  // Mapped from JSONB columns or simplified schema
  price?: number; 
  stock?: number;
  variants: ProductVariant[];
  tags?: { id: string; value: string }[];
  metadata?: Record<string, any>; 
  created_at?: string;
}

export interface LineItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  quantity: number;
  unit_price: number;
  variant: ProductVariant;
  total: number;
}

export interface Cart {
  id: string;
  items: LineItem[];
  subtotal?: number;
  total?: number;
  region_id: string;
}

export interface Address {
  first_name: string;
  last_name: string;
  address_1: string;
  city: string;
  country_code: string;
  postal_code: string;
  phone: string;
}

export interface Customer {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
}

export interface Order {
  id: string;
  display_id: number;
  status: OrderStatus;
  fulfillment_status: FulfillmentStatus;
  payment_status: PaymentStatus;
  total: number;
  currency_code: string;
  email: string;
  customer: Customer;
  shipping_address: Address;
  items: LineItem[];
  created_at: string;
  metadata?: {
    tracking_number?: string;
    shiprocket_order_id?: string;
    invoice_url?: string;
  }
}

export interface NotificationLog {
  id: string;
  order_id: string;
  channel: 'WHATSAPP' | 'EMAIL';
  template: string;
  status: 'success' | 'failed';
  created_at: string;
}
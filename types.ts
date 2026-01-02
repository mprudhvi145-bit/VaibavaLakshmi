// Official Medusa DTO Alignments

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
  PARTIALLY_REFUNDED = 'partially_refunded',
  REFUNDED = 'refunded',
  CANCELED = 'canceled',
  REQUIRES_ACTION = 'requires_action'
}

export enum FulfillmentStatus {
  NOT_FULFILLED = 'not_fulfilled',
  PARTIALLY_FULFILLED = 'partially_fulfilled',
  FULFILLED = 'fulfilled',
  PARTIALLY_SHIPPED = 'partially_shipped',
  SHIPPED = 'shipped',
  PARTIALLY_RETURNED = 'partially_returned',
  RETURNED = 'returned',
  CANCELED = 'canceled',
  REQUIRES_ACTION = 'requires_action'
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
  price?: number; // Calculated field helper
  inventory_quantity: number;
  prices: {
    currency_code: string;
    amount: number;
  }[];
}

export interface Product {
  id: string;
  title: string; // Medusa uses title, not name
  description: string;
  thumbnail: string;
  handle: string;
  status: 'draft' | 'proposed' | 'published' | 'rejected';
  variants: ProductVariant[];
  collection_id?: string;
  tags?: { id: string; value: string }[];
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
  id: string;
  first_name: string;
  last_name: string;
  address_1: string;
  city: string;
  country_code: string;
  postal_code: string;
  phone: string;
}

export interface Customer {
  id: string;
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

// Custom Interface for Logs (handled by custom plugin/service in backend)
export interface NotificationLog {
  id: string;
  order_id: string;
  channel: 'WHATSAPP' | 'EMAIL';
  template: string;
  status: 'success' | 'failed';
  created_at: string;
}

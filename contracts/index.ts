
// --- PRODUCT CONTRACTS ---

export interface ProductVariant {
  id: string;
  title: string;
  sku: string;
  inventory_quantity: number;
  prices: {
    currency_code: string;
    amount: number; // in lowest denomination (e.g. paisa)
  }[];
}

export interface ProductTag {
  id: string;
  value: string; // Format: "Key:Value"
}

export interface Product {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  handle: string;
  status: 'draft' | 'proposed' | 'published' | 'rejected';
  variants: ProductVariant[];
  tags?: ProductTag[];
  metadata?: Record<string, any>;
}

// --- CATEGORY CONTRACTS ---

export interface CategoryNode {
  id: string;
  label: string;
  slug: string;
  highlight?: boolean;
  children?: CategoryNode[];
}

// --- SEARCH CONTRACTS ---

export interface SearchRequest {
  query: string;
  filters?: Record<string, string[]>;
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'newest';
  limit?: number;
}

export interface SearchResultItem {
  product: Product;
  score: number;
  matches: string[];
}

export interface SearchResponse {
  results: Product[];
  total: number;
  facets: {
    categories: string[];
    fabrics: string[];
  };
}

// --- CART CONTRACTS ---

export interface LineItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  quantity: number;
  unit_price: number;
  total: number;
  variant: ProductVariant;
}

export interface Cart {
  id: string;
  items: LineItem[];
  subtotal: number;
  total: number;
  region_id: string;
}

// --- ORDER CONTRACTS ---
// Keep basic for now
export interface Address {
  first_name: string;
  last_name: string;
  address_1: string;
  city: string;
  postal_code: string;
  phone: string;
  country_code: string;
}

export interface Order {
  id: string;
  display_id: number;
  status: string;
  fulfillment_status: string;
  payment_status: string;
  total: number;
  email: string;
  created_at: string;
  shipping_address: Address;
  customer: { first_name: string; last_name: string; email: string };
  items: LineItem[];
  metadata?: any;
}

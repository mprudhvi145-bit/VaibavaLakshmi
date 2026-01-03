
// STRICT CONTRACT DEFINITIONS
// Backend must serve these exact shapes.

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

export interface ProductTag {
  id: string;
  value: string;
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

export interface CategoryNode {
  id: string;
  label: string;
  slug: string;
  highlight?: boolean;
  children?: CategoryNode[];
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

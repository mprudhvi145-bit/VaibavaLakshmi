import { Product, Order } from './types';

// --- 1. STRICT CATEGORY TAXONOMY (AJIO-STYLE) ---

export interface CategoryNode {
  id: string;
  label: string;
  slug: string; 
  highlight?: boolean;
  children?: CategoryNode[];
}

export const CATEGORY_HIERARCHY: CategoryNode[] = [
  {
    id: 'women',
    label: 'Women',
    slug: 'women',
    children: [
      {
        id: 'sarees',
        label: 'Sarees',
        slug: 'sarees',
        children: [
          { id: 'kanchipuram', label: 'Kanchipuram Silk', slug: 'kanchipuram-silk' },
          { id: 'banarasi', label: 'Banarasi', slug: 'banarasi' },
          { id: 'soft-silk', label: 'Soft Silk', slug: 'soft-silk' },
          { id: 'designer', label: 'Designer & Party', slug: 'designer-sarees' }
        ]
      },
      {
        id: 'women-ethnic',
        label: 'Ethnic Wear',
        slug: 'women-ethnic',
        children: [
          { id: 'lehengas', label: 'Lehengas', slug: 'lehengas' },
          { id: 'salwar', label: 'Salwar Suits', slug: 'salwar-suits' },
          { id: 'kurtis', label: 'Kurtis & Tunics', slug: 'kurtis' }
        ]
      },
      {
        id: 'women-acc',
        label: 'Accessories',
        slug: 'women-accessories',
        children: [
           { id: 'jewellery', label: 'Jewellery', slug: 'jewellery' },
           { id: 'dupatta', label: 'Dupattas', slug: 'dupattas' }
        ]
      }
    ]
  },
  {
    id: 'men',
    label: 'Men',
    slug: 'men',
    children: [
      {
        id: 'men-ethnic',
        label: 'Ethnic Wear',
        slug: 'men-ethnic',
        children: [
          { id: 'kurtas', label: 'Kurtas', slug: 'kurtas' },
          { id: 'kurta-sets', label: 'Kurta Sets', slug: 'kurta-sets' },
          { id: 'sherwanis', label: 'Sherwanis', slug: 'sherwanis' },
          { id: 'dhoti', label: 'Dhoti Sets', slug: 'dhoti-sets' }
        ]
      },
      {
        id: 'men-festive',
        label: 'Festive Wear',
        slug: 'men-festive',
        children: [] // Leaf node acting as category
      },
      {
        id: 'men-acc',
        label: 'Accessories',
        slug: 'men-accessories',
        children: []
      }
    ]
  },
  {
    id: 'kids',
    label: 'Kids',
    slug: 'kids',
    children: [
      {
        id: 'boys',
        label: 'Boys',
        slug: 'kids-boys',
        children: [
          { id: 'boys-ethnic', label: 'Ethnic Wear', slug: 'boys-ethnic' }
        ]
      },
      {
        id: 'girls',
        label: 'Girls',
        slug: 'kids-girls',
        children: [
          { id: 'girls-ethnic', label: 'Ethnic Wear', slug: 'girls-ethnic' }
        ]
      }
    ]
  },
  {
    id: 'wedding',
    label: 'Wedding',
    slug: 'wedding',
    highlight: true,
    children: [
      { id: 'bride', label: 'The Bride', slug: 'the-bride', children: [] },
      { id: 'groom', label: 'The Groom', slug: 'the-groom', children: [] },
      { id: 'muhurtham', label: 'Muhurtham Silks', slug: 'muhurtham-silks', children: [] }
    ]
  }
];

// --- 2. FILTERS & ATTRIBUTES ---

export interface FilterConfig {
  key: string;
  label: string;
  type: 'multi' | 'range';
  options?: string[];
}

export const ATTRIBUTE_DICTIONARY: Record<string, FilterConfig[]> = {
  global: [
    { key: 'Price', label: 'Price Range', type: 'range', options: ['Under ₹2,000', '₹2,000 - ₹5,000', '₹5,000 - ₹15,000', 'Above ₹15,000'] },
    { key: 'Color', label: 'Color', type: 'multi', options: ['Red', 'Pink', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Gold', 'Silver'] },
    { key: 'Occasion', label: 'Occasion', type: 'multi', options: ['Casual', 'Festive', 'Party', 'Wedding'] }
  ],
  'sarees': [
    { key: 'Fabric', label: 'Fabric', type: 'multi', options: ['Silk', 'Georgette', 'Cotton', 'Organza', 'Chiffon'] },
    { key: 'Work Type', label: 'Work Type', type: 'multi', options: ['Zari Woven', 'Embroidered', 'Printed'] }
  ],
  'kids': [
    { key: 'Age Group', label: 'Age Group', type: 'multi', options: ['2-4 Years', '4-6 Years', '6-8 Years', '8-12 Years', 'Teen'] }
  ]
};

export const SORT_OPTIONS = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'New Arrivals', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' }
];

// --- 3. MOCK DATA GENERATOR ---
// Generates 10 realistic products for every leaf category

const COLORS = ['Red', 'Pink', 'Royal Blue', 'Emerald Green', 'Mustard Yellow', 'Deep Maroon', 'Gold', 'Ivory', 'Pastel Peach', 'Midnight Black'];
const ADJECTIVES = ['Handwoven', 'Embroidered', 'Classic', 'Royal', 'Contemporary', 'Festive', 'Designer', 'Traditional', 'Elegant', 'Exclusive'];

// Helper to generate products per category logic
const generateProductsForCategory = (catSlug: string, count: number): Product[] => {
  const products: Product[] = [];
  
  // Logic to determine price range and keywords based on slug
  let basePrice = 2000;
  let keyword = 'fashion';
  let fabric = 'Cotton';
  let type = 'Wear';
  
  if (catSlug.includes('silk') || catSlug.includes('kanchipuram') || catSlug.includes('banarasi')) {
      basePrice = 12000; keyword = 'saree'; fabric = 'Pure Silk'; type = 'Saree';
  } else if (catSlug.includes('sherwani') || catSlug.includes('groom')) {
      basePrice = 15000; keyword = 'men ethnic'; fabric = 'Velvet'; type = 'Sherwani';
  } else if (catSlug.includes('lehenga') || catSlug.includes('bride')) {
      basePrice = 18000; keyword = 'lehenga'; fabric = 'Raw Silk'; type = 'Lehenga';
  } else if (catSlug.includes('kurta')) {
      basePrice = 1500; keyword = 'kurta'; fabric = 'Linen'; type = 'Kurta';
  } else if (catSlug.includes('jewellery')) {
      basePrice = 5000; keyword = 'jewellery'; fabric = 'Gold Plated'; type = 'Set';
  }

  for (let i = 0; i < count; i++) {
    const color = COLORS[i % COLORS.length];
    const adj = ADJECTIVES[i % ADJECTIVES.length];
    const price = Math.floor(basePrice + (Math.random() * basePrice * 0.5));
    
    products.push({
      id: `${catSlug}-${i}`,
      title: `${adj} ${color} ${fabric} ${type}`,
      handle: `${adj}-${color}-${type}`.toLowerCase().replace(/ /g, '-'),
      description: `Experience the luxury of ${fabric} with this ${adj.toLowerCase()} ${type}. Perfect for weddings and festive occasions. Includes intricate detailing in ${color}.`,
      thumbnail: `https://source.unsplash.com/random/500x700/?${keyword},${color}`,
      status: 'published',
      tags: [
        { id: `t-cat-${i}`, value: `Category:${catSlug}` },
        { id: `t-col-${i}`, value: `Color:${color}` },
        { id: `t-fab-${i}`, value: `Fabric:${fabric}` },
        { id: `t-occ-${i}`, value: `Occasion:${price > 10000 ? 'Wedding' : 'Festive'}` }
      ],
      metadata: { 
          'Badge': i === 0 ? 'Best Seller' : (i === 1 ? 'New Arrival' : ''),
          'Dispatch Time': '24 Hours',
          'Return Eligible': 'Yes'
      },
      variants: [{
        id: `v-${catSlug}-${i}`,
        title: 'Default',
        sku: `SKU-${catSlug.toUpperCase()}-${i}`,
        inventory_quantity: 10,
        prices: [{ currency_code: 'inr', amount: price * 100 }]
      }]
    });
  }
  return products;
};

// --- 4. GENERATE MASTER CATALOG ---
let GENERATED_CATALOG: Product[] = [];

// Recursive function to populate catalog based on hierarchy
const populateCatalog = (nodes: CategoryNode[]) => {
  nodes.forEach(node => {
    // If it has children, recurse. If it's a leaf node (or explicit like men-festive), generate items.
    if (node.children && node.children.length > 0) {
      populateCatalog(node.children);
    } 
    // Always generate products for the slug itself to ensure /category pages work
    const newItems = generateProductsForCategory(node.slug, 10);
    GENERATED_CATALOG = [...GENERATED_CATALOG, ...newItems];
  });
};

populateCatalog(CATEGORY_HIERARCHY);

export const FALLBACK_PRODUCTS = GENERATED_CATALOG;
export const FALLBACK_ORDERS: Order[] = [];

export const BRAND_ASSETS = {
  name: "Vaibava Lakshmi",
  email: "support@vaibavalakshmi.com",
  phone: "+91 98765 43210",
  address: "Hanamkonda, Warangal, Telangana 506001",
  logo_svg: `<svg viewBox="0 0 300 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M40 30C40 45 30 55 20 55C10 55 0 45 0 30C0 15 10 5 20 5C30 5 40 15 40 30Z" fill="#BE123C" opacity="0.2"/>
    <path d="M20 10C25 10 30 15 30 30C30 45 25 50 20 50C15 50 10 45 10 30C10 15 15 10 20 10Z" fill="#BE123C"/>
    <text x="50" y="40" font-family="Playfair Display" font-weight="bold" font-size="28" fill="#881337">Vaibava <tspan fill="#D97706">Lakshmi</tspan></text>
  </svg>`
};

export const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000";
export const CSV_TEMPLATES = { master: "" }; // Placeholder
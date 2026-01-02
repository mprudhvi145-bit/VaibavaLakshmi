import { Product, Order, OrderStatus, PaymentStatus, FulfillmentStatus } from './types';

// --- CATEGORY TAXONOMY ---
export const CATEGORY_HIERARCHY = [
  {
    id: 'women',
    label: 'WOMEN',
    slug: 'women',
    children: [
      {
        id: 'sarees',
        label: 'Sarees',
        slug: 'women-sarees',
        children: [
          { id: 'kanchipuram', label: 'Kanchipuram Silk', slug: 'kanchipuram-silk' },
          { id: 'banarasi', label: 'Banarasi', slug: 'banarasi' },
          { id: 'soft-silk', label: 'Soft Silk', slug: 'soft-silk' },
          { id: 'designer', label: 'Designer & Party', slug: 'designer-sarees' }
        ]
      },
      {
        id: 'ethnic',
        label: 'Ethnic Wear',
        slug: 'women-ethnic',
        children: [
          { id: 'lehengas', label: 'Lehengas', slug: 'lehengas' },
          { id: 'gowns', label: 'Indo-Western Gowns', slug: 'gowns' },
          { id: 'salwar', label: 'Salwar Suits', slug: 'salwar-suits' },
          { id: 'kurtis', label: 'Kurtis & Tunics', slug: 'kurtis' }
        ]
      }
    ]
  },
  {
    id: 'men',
    label: 'MEN',
    slug: 'men',
    children: [
      {
        id: 'wedding-men',
        label: 'Wedding Collection',
        slug: 'men-wedding',
        children: [
          { id: 'sherwani', label: 'Sherwanis', slug: 'sherwanis' },
          { id: 'bandhgala', label: 'Bandhgalas', slug: 'bandhgalas' }
        ]
      },
      {
        id: 'festive-men',
        label: 'Festive Wear',
        slug: 'men-festive',
        children: [
          { id: 'kurta-sets', label: 'Kurta Sets', slug: 'kurta-sets' },
          { id: 'waistcoats', label: 'Nehru Jackets', slug: 'nehru-jackets' },
          { id: 'dhoti', label: 'Dhoti Sets', slug: 'dhoti-sets' }
        ]
      }
    ]
  },
  {
    id: 'wedding',
    label: 'WEDDING EDIT',
    slug: 'wedding-edit',
    highlight: true,
    children: [
      {
        id: 'bride',
        label: 'The Bride',
        slug: 'bridal-collection',
        children: [
          { id: 'muhurtham', label: 'Muhurtham Silks', slug: 'muhurtham' },
          { id: 'reception', label: 'Reception Lehengas', slug: 'reception-lehengas' }
        ]
      },
      {
        id: 'groom',
        label: 'The Groom',
        slug: 'groom-collection',
        children: [
          { id: 'wedding-sherwani', label: 'Royal Sherwanis', slug: 'wedding-sherwanis' },
          { id: 'turban', label: 'Safas & Turbans', slug: 'safas' }
        ]
      }
    ]
  }
];

// --- ATTRIBUTE & FILTER GOVERNANCE ---
export interface FilterConfig {
  key: string;
  label: string;
  type: 'multi' | 'range' | 'boolean';
  options?: string[];
  mandatory?: boolean;
}

export const ATTRIBUTE_DICTIONARY: Record<string, FilterConfig[]> = {
  // Global attributes (All Categories)
  global: [
    { 
      key: 'Fabric', label: 'Fabric', type: 'multi', mandatory: true,
      options: ['Pure Silk', 'Georgette', 'Chiffon', 'Cotton', 'Organza', 'Crepe', 'Art Silk', 'Raw Silk', 'Velvet'] 
    },
    { 
      key: 'Occasion', label: 'Occasion', type: 'multi', mandatory: true,
      options: ['Bridal', 'Party', 'Festive', 'Casual', 'Office', 'Reception', 'Engagement'] 
    },
    { 
      key: 'Color', label: 'Color', type: 'multi', mandatory: true,
      options: ['Red', 'Pink', 'Gold', 'Blue', 'Green', 'Black', 'Pastel', 'Maroon', 'Mustard', 'Purple', 'Orange'] 
    },
    { 
      key: 'Work Type', label: 'Work Type', type: 'multi', 
      options: ['Zari Woven', 'Embroidered', 'Hand Painted', 'Stone Work', 'Mirror Work', 'Sequins', 'Plain'] 
    }
  ],
  // Category Specific Facets (Level 2)
  'women-sarees': [
    { key: 'Border', label: 'Border Type', type: 'multi', options: ['Big Border', 'Small Border', 'No Border', 'Temple Border', 'Zari Border'] },
    { key: 'Blouse', label: 'Blouse Type', type: 'multi', options: ['Contrast', 'Running', 'Brocade', 'Designer'] }
  ],
  'lehengas': [
    { key: 'Lehenga Type', label: 'Lehenga Style', type: 'multi', options: ['A-Line', 'Flared', 'Fish Cut', 'Panelled', 'Jacket Style'] },
    { key: 'Dupatta', label: 'Dupatta Type', type: 'multi', options: ['Single', 'Double', 'Cape'] }
  ],
  'men-wedding': [
    { key: 'Fit', label: 'Fit', type: 'multi', options: ['Regular', 'Slim', 'Royal', 'Comfort'] },
    { key: 'Sleeve', label: 'Sleeve', type: 'multi', options: ['Full Sleeve', 'Half Sleeve'] },
    { key: 'Set Type', label: 'Set Type', type: 'multi', options: ['Kurta Only', 'Kurta Pajama', '3 Piece', 'Sherwani Set'] }
  ]
};

// --- FESTIVAL COLLECTION ENGINE ---
// Rules to auto-populate collections based on tags
export const FESTIVAL_COLLECTIONS = {
  'wedding-bride': {
    tags: ['Occasion:Bridal', 'Occasion:Reception', 'Fabric:Pure Silk'],
    title: 'The Royal Bride',
    description: 'Handwoven masterpieces for your special day.'
  },
  'diwali-edit': {
    tags: ['Occasion:Festive', 'Work Type:Zari Woven', 'Work Type:Sequins'],
    title: 'Festival of Lights',
    description: 'Shine bright with our festive curation.'
  },
  'muhurtham': {
    tags: ['Occasion:Bridal', 'Color:Red', 'Color:Gold', 'Color:Yellow'],
    title: 'Muhurtham Edit',
    description: 'Auspicious colors for the sacred hour.'
  }
};

// --- OPERATOR CSV TEMPLATES (EXPANDED) ---
export const CSV_TEMPLATES = {
  master: `Handle,Title,Description,Category,Price,Stock,Image URL,Fabric,Occasion,Color,Work Type,Care Instructions,Dispatch Time,Return Eligible`,
  saree: `Handle,Title,Description,Category,Price,Stock,Image URL,Fabric,Occasion,Color,Work Type,Care Instructions,Dispatch Time,Return Eligible,Saree Length,Blouse Included,Border,Blouse`,
  lehenga: `Handle,Title,Description,Category,Price,Stock,Image URL,Fabric,Occasion,Color,Work Type,Care Instructions,Dispatch Time,Return Eligible,Lehenga Type,Dupatta,Waist Range`,
  mens: `Handle,Title,Description,Category,Price,Stock,Image URL,Fabric,Occasion,Color,Work Type,Care Instructions,Dispatch Time,Return Eligible,Fit,Sleeve,Set Type`
};

export const BRAND_ASSETS = {
  name: "Vaibava Lakshmi Shopping Mall",
  email: "support@vaibavalakshmi.com",
  phone: "+91 98765 43210",
  address: "Hanamkonda, Warangal, Telangana 506001",
  logo_svg: `<svg viewBox="0 0 300 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M40 30C40 45 30 55 20 55C10 55 0 45 0 30C0 15 10 5 20 5C30 5 40 15 40 30Z" fill="#BE123C" opacity="0.2"/>
    <path d="M20 10C25 10 30 15 30 30C30 45 25 50 20 50C15 50 10 45 10 30C10 15 15 10 20 10Z" fill="#BE123C"/>
    <text x="50" y="40" font-family="Playfair Display" font-weight="bold" font-size="28" fill="#881337">Vaibava <tspan fill="#D97706">Lakshmi</tspan></text>
  </svg>`,
  map_embed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3795.123456789!2d79.5!3d18.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sVaibavaLakshmi+Shopping+Mall!5e0!3m2!1sen!2sin!4v1234567890"
};

export const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000";

// --- FALLBACK DATA ---
export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'prod_01',
    title: 'Kanchipuram Silk Saree - Red & Gold',
    handle: 'kanchipuram-silk-saree',
    description: 'Authentic Kanchipuram silk saree with pure zari border.',
    thumbnail: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=500&auto=format&fit=crop',
    status: 'published',
    tags: [
        { id: 't1', value: 'Category:women-sarees' }, 
        { id: 't2', value: 'Fabric:Pure Silk' }, 
        { id: 't3', value: 'Occasion:Wedding' },
        { id: 't4', value: 'Color:Red' },
        { id: 't5', value: 'Work Type:Zari Woven' },
        { id: 't6', value: 'Border:Big Border' }
    ],
    metadata: {
        "Care Instructions": "Dry Clean Only",
        "Blouse Included": "Yes",
        "Saree Length": "6.3m",
        "Dispatch Time": "24 Hours",
        "Return Eligible": "No"
    },
    variants: [
      {
        id: 'var_01',
        title: 'Free Size',
        sku: 'VL-KS-001',
        inventory_quantity: 15,
        prices: [{ currency_code: 'inr', amount: 1250000 }]
      }
    ]
  },
  {
    id: 'prod_02',
    title: 'Banarasi Georgette Saree - Royal Blue',
    handle: 'banarasi-georgette',
    description: 'Lightweight Banarasi georgette with intricate floral motifs.',
    thumbnail: 'https://images.unsplash.com/photo-1583391733958-d775f977d0b9?q=80&w=500&auto=format&fit=crop',
    status: 'published',
    tags: [
        { id: 't6', value: 'Category:women-sarees' }, 
        { id: 't7', value: 'Fabric:Georgette' }, 
        { id: 't8', value: 'Occasion:Party' },
        { id: 't9', value: 'Color:Blue' },
        { id: 't10', value: 'Work Type:Embroidered' },
        { id: 't11', value: 'Blouse:Running' }
    ],
    metadata: {
        "Care Instructions": "Dry Clean Only",
        "Blouse Included": "Yes",
        "Dispatch Time": "2-3 Days",
        "Return Eligible": "Yes"
    },
    variants: [
      {
        id: 'var_02',
        title: 'Free Size',
        sku: 'VL-BG-002',
        inventory_quantity: 8,
        prices: [{ currency_code: 'inr', amount: 890000 }]
      }
    ]
  }
];

export const FALLBACK_ORDERS: Order[] = [];
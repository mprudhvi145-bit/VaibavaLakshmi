import { Product, Order, OrderStatus, PaymentStatus, FulfillmentStatus } from './types';

// --- BRAND IDENTITY EXTRACTED FROM LIVE SITE ---
export const BRAND_ASSETS = {
  name: "Vaibava Lakshmi Shopping Mall",
  email: "support@vaibavalakshmi.com",
  phone: "+91 98765 43210",
  address: "Hanamkonda, Warangal, Telangana 506001",
  // SVG Logo as a component or source
  logo_svg: `<svg viewBox="0 0 300 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M40 30C40 45 30 55 20 55C10 55 0 45 0 30C0 15 10 5 20 5C30 5 40 15 40 30Z" fill="#BE123C" opacity="0.2"/>
    <path d="M20 10C25 10 30 15 30 30C30 45 25 50 20 50C15 50 10 45 10 30C10 15 15 10 20 10Z" fill="#BE123C"/>
    <text x="50" y="40" font-family="Playfair Display" font-weight="bold" font-size="28" fill="#881337">Vaibava <tspan fill="#D97706">Lakshmi</tspan></text>
  </svg>`,
  map_embed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3795.123456789!2d79.5!3d18.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sVaibavaLakshmi+Shopping+Mall!5e0!3m2!1sen!2sin!4v1234567890"
};

// Configuration
export const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000";

// --- FALLBACK DATA FOR DEMO MODE (When Backend is Offline) ---

export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'prod_01',
    title: 'Kanchipuram Silk Saree - Red & Gold',
    handle: 'kanchipuram-silk-saree',
    description: 'Authentic Kanchipuram silk saree with pure zari border.',
    thumbnail: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=500&auto=format&fit=crop',
    status: 'published',
    tags: [{ id: 'tag_1', value: 'Sarees' }, { id: 'tag_2', value: 'Wedding' }],
    variants: [
      {
        id: 'var_01',
        title: 'Standard',
        sku: 'VL-KS-001',
        inventory_quantity: 15,
        prices: [{ currency_code: 'inr', amount: 1250000 }] // 12500.00
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
    tags: [{ id: 'tag_1', value: 'Sarees' }, { id: 'tag_3', value: 'Party Wear' }],
    variants: [
      {
        id: 'var_02',
        title: 'Standard',
        sku: 'VL-BG-002',
        inventory_quantity: 8,
        prices: [{ currency_code: 'inr', amount: 890000 }] // 8900.00
      }
    ]
  },
  {
    id: 'prod_03',
    title: 'Mens Wedding Sherwani - Cream',
    handle: 'mens-sherwani',
    description: 'Premium raw silk sherwani with hand embroidery.',
    thumbnail: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=500&auto=format&fit=crop',
    status: 'published',
    tags: [{ id: 'tag_4', value: 'Men' }, { id: 'tag_2', value: 'Wedding' }],
    variants: [
      {
        id: 'var_03',
        title: 'L',
        sku: 'VL-MS-003-L',
        inventory_quantity: 5,
        prices: [{ currency_code: 'inr', amount: 1500000 }] // 15000.00
      }
    ]
  },
  {
    id: 'prod_04',
    title: 'Designer Lehenga Choli - Pink',
    handle: 'designer-lehenga',
    description: 'Bridal pink lehenga with heavy mirror work.',
    thumbnail: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?q=80&w=500&auto=format&fit=crop',
    status: 'published',
    tags: [{ id: 'tag_5', value: 'Kids' }], // Fixing generic tag for demo
    variants: [
      {
        id: 'var_04',
        title: 'Standard',
        sku: 'VL-DL-004',
        inventory_quantity: 3,
        prices: [{ currency_code: 'inr', amount: 1850000 }] // 18500.00
      }
    ]
  }
];

export const FALLBACK_ORDERS: Order[] = [
  {
    id: 'order_01',
    display_id: 1001,
    status: OrderStatus.PENDING,
    fulfillment_status: FulfillmentStatus.NOT_FULFILLED,
    payment_status: PaymentStatus.CAPTURED,
    total: 1250000,
    currency_code: 'inr',
    email: 'priya@example.com',
    created_at: new Date().toISOString(),
    customer: {
      id: 'cus_01',
      email: 'priya@example.com',
      first_name: 'Priya',
      last_name: 'Sharma',
      phone: '+919876543210'
    },
    shipping_address: {
      id: 'addr_01',
      first_name: 'Priya',
      last_name: 'Sharma',
      address_1: '123 Jubilee Hills',
      city: 'Hyderabad',
      country_code: 'in',
      postal_code: '500033',
      phone: '+919876543210'
    },
    items: [
      {
        id: 'item_1',
        title: 'Kanchipuram Silk Saree',
        description: 'Red & Gold',
        thumbnail: FALLBACK_PRODUCTS[0].thumbnail,
        quantity: 1,
        unit_price: 1250000,
        total: 1250000,
        variant: FALLBACK_PRODUCTS[0].variants[0]
      }
    ]
  }
];
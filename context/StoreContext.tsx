import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import Medusa from "@medusajs/medusa-js";
import { BACKEND_URL, FALLBACK_ORDERS } from '../constants';
import { Product, Order, Cart, LineItem } from '../contracts'; // Using NEW Contracts
import { SearchEngine } from '../search';
import { RAW_CSV_DATA } from '../data/rawCatalog';
import { parseProductsFromCSV } from '../utils/csvHelpers';
import { validateAndImport, transformToProduct } from '../utils/csvImportWorkflow';
import { NotificationLog } from '../types';

// Initialize Medusa Client
const medusa = new Medusa({ baseUrl: BACKEND_URL, maxRetries: 0 });

interface StoreContextType {
  client: Medusa;
  products: Product[];
  cart: Cart | null;
  orders: Order[];
  notifications: NotificationLog[];
  searchEngine: SearchEngine | null; // Exposed Search Engine
  isLoading: boolean;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  
  addToCart: (variantId: string, quantity: number) => Promise<void>;
  removeFromCart: (lineId: string) => Promise<void>;
  createCart: () => Promise<void>;
  completeOrder: () => Promise<Order | null>;
  
  login: (email: string, pass: string) => Promise<boolean>;
  refreshAdminData: () => Promise<void>;
  updateOrderStatus: (orderId: string, action: 'ship' | 'cancel' | 'complete') => Promise<void>;
  generateShippingLabel: (orderId: string) => Promise<void>;
  bulkImportProducts: (csvData: any[]) => Promise<void>;
  addProduct: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Cart | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Initialize Search Engine when products change
  const searchEngine = useMemo(() => new SearchEngine(products), [products]);

  useEffect(() => {
    const initStore = async () => {
      setIsLoading(true);
      try {
        // Load initial data from RAW_CSV_DATA using legacy parser for now, 
        // ideally this should use the new validateAndImport if we passed raw string.
        // Keeping legacy parse for backward compat with rawCatalog.ts format
        const csvProducts = parseProductsFromCSV(RAW_CSV_DATA);
        
        // Cast to new Product contract if needed, but structure matches closely
        setProducts(csvProducts as unknown as Product[]);
        setIsDemoMode(true); 

        if(!cart) {
            setCart({ id: 'demo_cart', items: [], region_id: 'in', subtotal: 0, total: 0 });
        }
      } catch (e) {
        console.error("Failed to load catalog", e);
      } finally {
        setIsLoading(false);
      }
    };
    initStore();
  }, []);

  const createCart = async () => {
    if (isDemoMode) {
        setCart({ id: `demo_cart_${Date.now()}`, items: [], region_id: 'in', subtotal: 0, total: 0 });
        return;
    }
  };

  const addToCart = async (variantId: string, quantity: number) => {
    const product = products.find(p => p.variants.some(v => v.id === variantId));
    if (!product) return;
    const variant = product.variants.find(v => v.id === variantId)!;
    
    setCart(prev => {
        if (!prev) return null;
        const existing = prev.items.find(i => i.variant.id === variantId);
        const price = variant.prices[0].amount;
        
        let newItems;
        if (existing) {
            newItems = prev.items.map(i => i.variant.id === variantId ? { ...i, quantity: i.quantity + quantity, total: (i.quantity + quantity) * price } : i);
        } else {
            const newItem: LineItem = {
                id: `item_${Date.now()}`,
                title: product.title,
                description: variant.title,
                thumbnail: product.thumbnail,
                quantity,
                unit_price: price,
                total: price * quantity,
                variant
            };
            newItems = [...prev.items, newItem];
        }
        const total = newItems.reduce((acc, i) => acc + i.total, 0);
        return { ...prev, items: newItems, subtotal: total, total };
    });
  };

  const removeFromCart = async (lineId: string) => {
    setCart(prev => {
        if(!prev) return null;
        const newItems = prev.items.filter(i => i.id !== lineId);
        const total = newItems.reduce((acc, i) => acc + i.total, 0);
        return { ...prev, items: newItems, subtotal: total, total };
    });
  };

  const completeOrder = async () => {
    if (isDemoMode) {
        if(!cart) return null;
        const demoOrder: Order = {
            ...FALLBACK_ORDERS[0],
            id: `order_${Date.now()}`,
            display_id: Math.floor(Math.random() * 10000),
            items: cart.items,
            total: cart.total || 0,
            created_at: new Date().toISOString(),
            status: 'pending',
            fulfillment_status: 'not_fulfilled',
            payment_status: 'awaiting',
            email: 'customer@demo.com',
            customer: { email: 'customer@demo.com', first_name: 'Demo', last_name: 'User' },
            shipping_address: { first_name: 'Demo', last_name: 'User', address_1: '123 St', city: 'Demo City', country_code: 'in', postal_code: '500001', phone: '9999999999' }
        };
        setCart({ id: 'new_demo_cart', items: [], region_id: 'in', subtotal: 0, total: 0 });
        setOrders(prev => [demoOrder, ...prev]);
        return demoOrder;
    }
    return null;
  }

  const login = async (email: string, pass: string) => { setIsAuthenticated(true); return true; };
  const refreshAdminData = async () => {};
  const updateOrderStatus = async () => {};
  const generateShippingLabel = async () => {};
  
  // Updated Bulk Import to use new Workflow
  const bulkImportProducts = async (csvData: any[]) => {
      // NOTE: In the new flow, Products.tsx passes strict arrays.
      // But for raw CSV text import (if we enable it), we would use validateAndImport
      
      const newProds = csvData.map(d => transformToProduct(d));
      setProducts(prev => {
          const merged = [...newProds, ...prev]; // Naive merge, realistically should dedup by ID
          return merged;
      });
  };
  const addProduct = async () => {};

  return (
    <StoreContext.Provider value={{
      client: medusa,
      products,
      cart,
      orders,
      notifications,
      searchEngine,
      isLoading,
      isAuthenticated,
      isDemoMode,
      addToCart,
      removeFromCart,
      createCart,
      completeOrder,
      login,
      refreshAdminData,
      updateOrderStatus,
      generateShippingLabel,
      bulkImportProducts,
      addProduct
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
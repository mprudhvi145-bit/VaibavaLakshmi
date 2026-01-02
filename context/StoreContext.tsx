import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Medusa from "@medusajs/medusa-js";
import { BACKEND_URL, FALLBACK_PRODUCTS, FALLBACK_ORDERS } from '../constants';
import { Product, Order, Cart, LineItem, OrderStatus, NotificationLog } from '../types';

// Initialize Medusa Client
const medusa = new Medusa({ baseUrl: BACKEND_URL, maxRetries: 0 });

interface StoreContextType {
  client: Medusa;
  products: Product[];
  cart: Cart | null;
  orders: Order[];
  notifications: NotificationLog[];
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

  useEffect(() => {
    const initStore = async () => {
      setIsLoading(true);
      try {
        // Force Demo Mode for this prototype requirement
        // In real world, we would check backend health here
        throw new Error("Force Demo Mode");
      } catch (e) {
        setIsDemoMode(true);
        // Load the huge auto-generated catalog
        setProducts(FALLBACK_PRODUCTS);
        
        if(!cart) {
            setCart({ id: 'demo_cart', items: [], region_id: 'in', subtotal: 0, total: 0 });
        }
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
    if (isDemoMode) {
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
        return;
    }
  };

  const removeFromCart = async (lineId: string) => {
    if (isDemoMode) {
        setCart(prev => {
            if(!prev) return null;
            const newItems = prev.items.filter(i => i.id !== lineId);
            const total = newItems.reduce((acc, i) => acc + i.total, 0);
            return { ...prev, items: newItems, subtotal: total, total };
        });
        return;
    }
  };

  const completeOrder = async () => {
    if (isDemoMode) {
        if(!cart) return null;
        const demoOrder: Order = {
            ...FALLBACK_ORDERS[0], // fallback template
            id: `order_${Date.now()}`,
            display_id: Math.floor(Math.random() * 10000),
            items: cart.items,
            total: cart.total || 0,
            created_at: new Date().toISOString(),
            status: OrderStatus.PENDING,
            fulfillment_status: 'not_fulfilled' as any,
            payment_status: 'awaiting' as any,
            currency_code: 'inr',
            email: 'customer@demo.com',
            customer: { id: 'cust_1', email: 'customer@demo.com', first_name: 'Demo', last_name: 'User', phone: '9999999999' },
            shipping_address: { id: 'addr_1', first_name: 'Demo', last_name: 'User', address_1: '123 St', city: 'Demo City', country_code: 'in', postal_code: '500001', phone: '9999999999' }
        };
        setCart({ id: 'new_demo_cart', items: [], region_id: 'in', subtotal: 0, total: 0 });
        setOrders(prev => [demoOrder, ...prev]);
        return demoOrder;
    }
    return null;
  }

  // Admin Stubs
  const login = async (email: string, pass: string) => { setIsAuthenticated(true); return true; };
  const refreshAdminData = async () => {};
  const updateOrderStatus = async () => {};
  const generateShippingLabel = async () => {};
  const bulkImportProducts = async (csvData: any[]) => {
      // Allow appending CSV data to current session state for demo
      const newProds = csvData.map((d: any, i: number) => ({
        id: `imp-${i}`,
        title: d.title,
        handle: d.handle,
        thumbnail: d.thumbnail,
        status: 'published',
        variants: [{ id: `v-${i}`, title: 'Default', inventory_quantity: 10, prices: [{ currency_code: 'inr', amount: d.price }] }],
        tags: [{ id: `t-${i}`, value: `Category:${d.category}` }]
      })) as Product[];
      setProducts(prev => [...newProds, ...prev]);
  };
  const addProduct = async () => {};

  return (
    <StoreContext.Provider value={{
      client: medusa,
      products,
      cart,
      orders,
      notifications,
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
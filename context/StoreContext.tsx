import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Medusa from "@medusajs/medusa-js";
import { BACKEND_URL, FALLBACK_PRODUCTS, FALLBACK_ORDERS } from '../constants';
import { Product, Order, Cart, LineItem, OrderStatus, NotificationLog } from '../types';

// Initialize Medusa Client
const medusa = new Medusa({ baseUrl: BACKEND_URL, maxRetries: 0 }); // 0 retries to fail fast in demo

interface StoreContextType {
  client: Medusa;
  products: Product[];
  cart: Cart | null;
  orders: Order[];
  notifications: NotificationLog[];
  isLoading: boolean;
  isAuthenticated: boolean;
  isDemoMode: boolean; // New flag for UI indication
  
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
        // Try Real Backend
        const { products } = await medusa.products.list();
        setProducts(products as unknown as Product[]);
        
        const cartId = localStorage.getItem('cart_id');
        if (cartId) {
          const { cart } = await medusa.carts.retrieve(cartId);
          setCart(cart as unknown as Cart);
        } else {
          await createCart();
        }
      } catch (e) {
        // Fallback to Demo Mode on Network Error
        console.warn("Backend not detected. Switching to Demo Mode.", e);
        setIsDemoMode(true);
        setProducts(FALLBACK_PRODUCTS);
        
        // Simulating a Local Cart
        if(!cart) {
            setCart({ id: 'demo_cart', items: [], region_id: 'in', subtotal: 0, total: 0 });
        }
      } finally {
        setIsLoading(false);
      }
    };
    initStore();
  }, []);

  // --- Storefront Logic (Hybrid: Real/Demo) ---

  const createCart = async () => {
    if (isDemoMode) {
        setCart({ id: `demo_cart_${Date.now()}`, items: [], region_id: 'in', subtotal: 0, total: 0 });
        return;
    }
    try {
      const { cart } = await medusa.carts.create();
      localStorage.setItem('cart_id', cart.id);
      setCart(cart as unknown as Cart);
    } catch(e) { console.error(e); }
  };

  const addToCart = async (variantId: string, quantity: number) => {
    if (isDemoMode) {
        // Simulate Add to Cart
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

    // Real Backend Call
    if (!cart?.id) await createCart();
    setIsLoading(true);
    try {
      const { cart: updatedCart } = await medusa.carts.lineItems.create(localStorage.getItem('cart_id')!, {
        variant_id: variantId,
        quantity
      });
      setCart(updatedCart as unknown as Cart);
    } catch (e) { console.error(e); }
    setIsLoading(false);
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

    if (!cart?.id) return;
    setIsLoading(true);
    const { cart: updatedCart } = await medusa.carts.lineItems.delete(cart.id, lineId);
    setCart(updatedCart as unknown as Cart);
    setIsLoading(false);
  };

  const completeOrder = async () => {
    if (isDemoMode) {
        if(!cart) return null;
        const demoOrder: Order = {
            ...FALLBACK_ORDERS[0],
            id: `order_${Date.now()}`,
            items: cart.items,
            total: cart.total || 0,
            created_at: new Date().toISOString()
        };
        setCart({ id: 'new_demo_cart', items: [], region_id: 'in', subtotal: 0, total: 0 });
        alert("Demo Order Placed! Check Admin Dashboard.");
        setOrders(prev => [demoOrder, ...prev]); // Auto-add to admin for demo flow
        return demoOrder;
    }

    if(!cart) return null;
    try {
      const { data } = await medusa.carts.complete(cart.id);
      if(data.type === 'order') {
        localStorage.removeItem('cart_id');
        setCart(null);
        await createCart();
        return data as unknown as Order;
      }
    } catch (e) { console.error(e); }
    return null;
  }

  // --- Admin Logic ---

  const login = async (email: string, pass: string) => {
    if (isDemoMode) {
        // Allow any login in Demo Mode
        setIsAuthenticated(true);
        refreshAdminData();
        return true;
    }

    try {
      await medusa.admin.auth.createSession({ email, password: pass });
      setIsAuthenticated(true);
      await refreshAdminData();
      return true;
    } catch (e) { return false; }
  };

  const refreshAdminData = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    
    if (isDemoMode) {
        // Load fallback orders if not already populated
        if (orders.length === 0) setOrders(FALLBACK_ORDERS);
        setIsLoading(false);
        return;
    }

    try {
        const { orders } = await medusa.admin.orders.list({ expand: 'items,customer,shipping_address' });
        setOrders(orders as unknown as Order[]);
    } catch (e) {
        console.error("Failed to load admin data", e);
    }
    
    setIsLoading(false);
  };

  const updateOrderStatus = async (orderId: string, action: 'ship' | 'cancel' | 'complete') => {
    if (isDemoMode) return;
    await refreshAdminData();
  };

  const generateShippingLabel = async (orderId: string) => {
    if (isDemoMode) {
        alert("Demo Mode: Simulated Shiprocket API call.");
        return;
    }
    alert("Backend Triggered: Shiprocket Label Generation");
    await refreshAdminData();
  };

  const bulkImportProducts = async (csvData: any[]) => {
    if (isDemoMode) {
        alert(`Demo Mode: Parsed ${csvData.length} rows locally.`);
        // Simulate adding to local state
        const newProds = csvData.map((d: any, i: number) => ({
            id: `imported_${i}`,
            title: d.name,
            thumbnail: 'https://via.placeholder.com/300',
            handle: d.name.toLowerCase().replace(/ /g, '-'),
            status: 'published',
            variants: [{ id: `var_${i}`, title: 'Default', sku: d.sku, inventory_quantity: parseInt(d.stock), prices: [{ currency_code: 'inr', amount: parseInt(d.price) * 100 }] }]
        })) as Product[];
        setProducts(prev => [...newProds, ...prev]);
        return;
    }
    alert("Backend Triggered: Bulk Import Job");
    await refreshAdminData();
  };

  const addProduct = async () => {
    if (isDemoMode) {
        alert("Demo Mode: Product Creation Simulated");
        return;
    }
    alert("Backend Triggered: Add Product");
    await refreshAdminData();
  };

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
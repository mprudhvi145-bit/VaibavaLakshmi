import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Product, Order, Cart, LineItem } from '../types';
import { SearchEngine } from '../search';
import { RAW_CSV_DATA } from '../data/rawCatalog';
import { parseProductsFromCSV } from '../utils/csvHelpers';
import { transformToProduct } from '../utils/csvImportWorkflow';
import { CheckoutService } from '../services/checkout.service';

interface UserProfile {
    id: string;
    email: string;
    role: 'owner' | 'admin' | 'operator' | 'viewer' | 'customer';
    name?: string;
}

interface StoreContextType {
  supabase: typeof supabase;
  products: Product[];
  cart: Cart | null;
  wishlist: string[];
  orders: Order[];
  searchEngine: SearchEngine | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  user: UserProfile | null;
  isDemoMode: boolean;
  
  addToCart: (variantId: string, quantity: number) => Promise<void>;
  removeFromCart: (lineId: string) => Promise<void>;
  createCart: () => Promise<void>;
  
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  validateCart: () => Promise<any>;
  placeOrder: (checkoutData: any) => Promise<Order>;
  refreshAdminData: () => Promise<void>;
  fetchCustomerOrders: () => Promise<Order[]>;
  
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateOrderStatus: (orderId: string, action: 'ship' | 'cancel' | 'complete') => Promise<void>;
  generateShippingLabel: (orderId: string) => Promise<void>;
  bulkImportProducts: (csvData: any[]) => Promise<void>;
  addProduct: () => Promise<void>;
  trackEvent: (eventName: string, payload: any) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Cart | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const searchEngine = useMemo(() => new SearchEngine(products), [products]);

  // Initial Load
  useEffect(() => {
    const initStore = async () => {
      setIsLoading(true);
      
      // 1. Auth Check
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
          setIsAuthenticated(true);
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
            
          setUser({
              id: session.user.id,
              email: session.user.email!,
              role: (profile?.role as any) || 'customer',
              name: session.user.email!.split('@')[0]
          });
      }

      // 2. Load Cart & Wishlist
      const savedCart = localStorage.getItem('cart');
      if (savedCart) setCart(JSON.parse(savedCart));
      else setCart({ id: `cart_${Date.now()}`, items: [], region_id: 'in', subtotal: 0, total: 0 });

      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

      // 3. Load Products
      try {
        const { data: dbProducts, error } = await supabase
            .from('products')
            .select('*')
            .eq('status', 'published');

        if (!error && dbProducts && dbProducts.length > 0) {
            const mappedProducts = dbProducts.map(p => ({
                ...p,
                variants: p.variants || [],
                tags: p.tags || [],
                metadata: p.metadata || {}
            }));
            setProducts(mappedProducts);
        } else {
            // console.warn("Using Fallback CSV Data (Supabase empty or error)");
            const csvProducts = parseProductsFromCSV(RAW_CSV_DATA);
            setProducts(csvProducts);
            setIsDemoMode(true); 
        }
      } catch (e) {
        console.error("Failed to load catalog", e);
        const csvProducts = parseProductsFromCSV(RAW_CSV_DATA);
        setProducts(csvProducts);
      } finally {
        setIsLoading(false);
      }
    };
    initStore();
  }, []);

  // Sync Cart
  useEffect(() => {
      if (cart) localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Sync Wishlist
  useEffect(() => {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const login = async (email: string, pass: string) => { 
      const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass
      });

      if (error || !data.session) {
          throw new Error(error?.message || "Login failed");
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.session.user.id)
        .single();

      setUser({
          id: data.session.user.id,
          email: data.session.user.email!,
          role: (profile?.role as any) || 'customer',
          name: data.session.user.email!.split('@')[0]
      });
      setIsAuthenticated(true);
      return true;
  };

  const logout = async () => {
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      setOrders([]);
  };

  const createCart = async () => {
      setCart({ id: `cart_${Date.now()}`, items: [], region_id: 'in', subtotal: 0, total: 0 });
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
        trackEvent('add_to_cart', { productId: product.id, name: product.title, price: price/100, quantity });
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

  const toggleWishlist = (productId: string) => {
      setWishlist(prev => {
          const exists = prev.includes(productId);
          const newList = exists ? prev.filter(id => id !== productId) : [...prev, productId];
          trackEvent(exists ? 'remove_from_wishlist' : 'add_to_wishlist', { productId });
          return newList;
      });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const validateCart = async () => {
      if (!cart || cart.items.length === 0) return null;
      return await CheckoutService.validateCart(cart.items);
  };

  const placeOrder = async (checkoutData: any) => {
      setIsLoading(true);
      try {
          // Idempotency check handled by paymentId uniqueness in backend usually, 
          // but frontend should also prevent double clicks (handled in component).
          const order = await CheckoutService.placeOrder({
              ...checkoutData,
              // Associate with logged in user if available
              userId: user?.id,
              userEmail: user?.email
          });
          
          if (order) {
              setCart(null); 
              localStorage.removeItem('cart');
              createCart(); 
              trackEvent('purchase', { orderId: order.id, value: order.total/100 });
              return order;
          }
          throw new Error("Order creation failed");
      } catch (e) {
          console.error("Order placement error", e);
          trackEvent('purchase_error', { error: e.message });
          throw e;
      } finally {
          setIsLoading(false);
      }
  };

  const refreshAdminData = async () => {
      if (user?.role !== 'admin' && user?.role !== 'operator' && user?.role !== 'owner') return;
      try {
          const { data: liveOrders } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
            
          if (liveOrders) {
              setOrders(liveOrders as unknown as Order[]);
          }
      } catch (e) {
          console.error("Failed to load admin data", e);
      }
  };

  const fetchCustomerOrders = async () => {
      if (!user) return [];
      // In a real app, RLS ensures users only see their orders. 
      // Here we filter explicitly to be safe in this mock environment.
      // Note: Assuming orders table has 'email' column or 'customer->email'
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('email', user.email)
        .order('created_at', { ascending: false });
      return (data as any) || [];
  };

  const trackEvent = (eventName: string, payload: any) => {
    try {
      if (process.env.NODE_ENV === 'development') {
          console.log(`[Analytics] ${eventName}`, payload);
      }
      // Fire and forget
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: eventName,
          payload: JSON.stringify(payload),
          userId: user?.id
        })
      }).catch(() => {});
    } catch (e) {
      // Silently fail
    }
  };

  const updateOrderStatus = async () => {};
  const generateShippingLabel = async () => {};
  
  const bulkImportProducts = async (csvData: any[]) => {
      const newProds = csvData.map(d => transformToProduct(d));
      setProducts(prev => [...newProds, ...prev]);
  };
  const addProduct = async () => {};

  return (
    <StoreContext.Provider value={{
      supabase,
      products,
      cart,
      wishlist,
      orders,
      searchEngine,
      isLoading,
      isAuthenticated,
      user,
      isDemoMode,
      addToCart,
      removeFromCart,
      createCart,
      toggleWishlist,
      isInWishlist,
      validateCart,
      placeOrder,
      login,
      logout,
      refreshAdminData,
      fetchCustomerOrders,
      updateOrderStatus,
      generateShippingLabel,
      bulkImportProducts,
      addProduct,
      trackEvent
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
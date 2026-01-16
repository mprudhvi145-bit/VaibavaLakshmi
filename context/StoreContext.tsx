import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Product, Order, Cart, LineItem } from '../types'; // Updated types
import { SearchEngine } from '../search';
import { RAW_CSV_DATA } from '../data/rawCatalog';
import { parseProductsFromCSV } from '../utils/csvHelpers';
import { transformToProduct } from '../utils/csvImportWorkflow';
import { CheckoutService } from '../services/checkout.service';

interface UserProfile {
    id: string;
    email: string;
    role: 'owner' | 'admin' | 'operator' | 'viewer';
    name?: string;
}

interface StoreContextType {
  supabase: typeof supabase;
  products: Product[];
  cart: Cart | null;
  orders: Order[];
  searchEngine: SearchEngine | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  user: UserProfile | null;
  isDemoMode: boolean;
  
  addToCart: (variantId: string, quantity: number) => Promise<void>;
  removeFromCart: (lineId: string) => Promise<void>;
  createCart: () => Promise<void>;
  
  // Checkout & Orders
  validateCart: () => Promise<any>;
  placeOrder: (checkoutData: any) => Promise<Order>;
  refreshAdminData: () => Promise<void>;
  
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
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
  const [isLoading, setIsLoading] = useState(false);
  
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const searchEngine = useMemo(() => new SearchEngine(products), [products]);

  // Initial Load & Auth Check
  useEffect(() => {
    const initStore = async () => {
      setIsLoading(true);
      
      // Check for Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
          setIsAuthenticated(true);
          // Fetch role from admin_profiles
          const { data: profile } = await supabase
            .from('admin_profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
            
          setUser({
              id: session.user.id,
              email: session.user.email!,
              role: (profile?.role as any) || 'viewer',
              name: session.user.email!.split('@')[0]
          });
      }

      // Load Cart from LocalStorage
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
          setCart(JSON.parse(savedCart));
      } else {
          setCart({ id: `cart_${Date.now()}`, items: [], region_id: 'in', subtotal: 0, total: 0 });
      }

      // Load Products
      try {
        const { data: dbProducts, error } = await supabase
            .from('products')
            .select('*')
            .eq('status', 'published');

        if (dbProducts && dbProducts.length > 0) {
            // Map Supabase rows to Product interface
            const mappedProducts = dbProducts.map(p => ({
                ...p,
                variants: p.variants || [], // Assuming JSONB
                tags: p.tags || [],       // Assuming JSONB
                metadata: p.metadata || {} // Assuming JSONB
            }));
            setProducts(mappedProducts);
        } else {
            // Fallback to CSV for demo/initial state
            const csvProducts = parseProductsFromCSV(RAW_CSV_DATA);
            setProducts(csvProducts);
            setIsDemoMode(true); 
        }
      } catch (e) {
        console.error("Failed to load catalog", e);
        // Fallback
        const csvProducts = parseProductsFromCSV(RAW_CSV_DATA);
        setProducts(csvProducts);
      } finally {
        setIsLoading(false);
      }
    };
    initStore();
  }, []);

  // Sync Cart to LS
  useEffect(() => {
      if (cart) localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const login = async (email: string, pass: string) => { 
      const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass
      });

      if (error || !data.session) {
          console.error("Login failed", error);
          throw new Error(error?.message || "Login failed");
      }

      const { data: profile } = await supabase
        .from('admin_profiles')
        .select('role')
        .eq('id', data.session.user.id)
        .single();

      setUser({
          id: data.session.user.id,
          email: data.session.user.email!,
          role: (profile?.role as any) || 'admin',
          name: data.session.user.email!.split('@')[0]
      });
      setIsAuthenticated(true);
      return true;
  };

  const logout = async () => {
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
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

  const validateCart = async () => {
      if (!cart || cart.items.length === 0) return null;
      return await CheckoutService.validateCart(cart.items);
  };

  const placeOrder = async (checkoutData: any) => {
      setIsLoading(true);
      try {
          // Pass supabase client if needed, or service handles it
          const order = await CheckoutService.placeOrder(checkoutData.cart);
          if (order) {
              setCart(null); 
              localStorage.removeItem('cart');
              createCart(); 
              return order;
          }
          throw new Error("Order creation failed");
      } catch (e) {
          console.error("Order placement error", e);
          throw e;
      } finally {
          setIsLoading(false);
      }
  };

  const refreshAdminData = async () => {
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

  const updateOrderStatus = async () => {};
  const generateShippingLabel = async () => {};
  
  const bulkImportProducts = async (csvData: any[]) => {
      // Used by Admin page to update local state optimistically
      const newProds = csvData.map(d => transformToProduct(d));
      setProducts(prev => [...newProds, ...prev]);
  };
  const addProduct = async () => {};

  return (
    <StoreContext.Provider value={{
      supabase,
      products,
      cart,
      orders,
      searchEngine,
      isLoading,
      isAuthenticated,
      user,
      isDemoMode,
      addToCart,
      removeFromCart,
      createCart,
      validateCart,
      placeOrder,
      login,
      logout,
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

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import Medusa from "@medusajs/medusa-js";
import { BACKEND_URL } from '../constants';
import { Product, Order, Cart, LineItem } from '../contracts';
import { SearchEngine } from '../search';
import { RAW_CSV_DATA } from '../data/rawCatalog';
import { parseProductsFromCSV } from '../utils/csvHelpers';
import { validateAndImport, transformToProduct } from '../utils/csvImportWorkflow';
import { AdminService } from '../services/admin.service';
import { CheckoutService } from '../services/checkout.service';

const medusa = new Medusa({ baseUrl: BACKEND_URL, maxRetries: 0 });

interface UserProfile {
    id: string;
    email: string;
    role: 'owner' | 'operator' | 'viewer';
    name: string;
}

interface StoreContextType {
  client: Medusa;
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
      
      // Check for existing token
      const token = localStorage.getItem('auth_token');
      if (token) {
          const userData = await AdminService.getCurrentUser();
          if (userData) {
              setUser(userData);
              setIsAuthenticated(true);
          } else {
              localStorage.removeItem('auth_token');
          }
      }

      // Load Cart from LocalStorage
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
          setCart(JSON.parse(savedCart));
      } else {
          setCart({ id: `cart_${Date.now()}`, items: [], region_id: 'in', subtotal: 0, total: 0 });
      }

      try {
        const csvProducts = parseProductsFromCSV(RAW_CSV_DATA);
        setProducts(csvProducts as unknown as Product[]);
        setIsDemoMode(true); 
      } catch (e) {
        console.error("Failed to load catalog", e);
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
      try {
          const data = await AdminService.login(email, pass);
          if (data.token) {
              localStorage.setItem('auth_token', data.token);
              setUser(data.user);
              setIsAuthenticated(true);
              return true;
          }
          return false;
      } catch (e) {
          console.error("Login failed", e);
          throw e; 
      }
  };

  const logout = () => {
      localStorage.removeItem('auth_token');
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

  // --- CHECKOUT LOGIC ---
  const validateCart = async () => {
      if (!cart || cart.items.length === 0) return null;
      return await CheckoutService.validateCart(cart.items);
  };

  const placeOrder = async (checkoutData: any) => {
      setIsLoading(true);
      try {
          const response = await CheckoutService.placeOrder(checkoutData.cart, checkoutData.paymentId);
          if (response.success && response.order) {
              setCart(null); // Clear cart on success
              localStorage.removeItem('cart');
              createCart(); // Init new cart
              return response.order;
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
          const liveOrders = await CheckoutService.getAllOrders();
          setOrders(liveOrders);
      } catch (e) {
          console.error("Failed to load admin data", e);
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
      client: medusa,
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

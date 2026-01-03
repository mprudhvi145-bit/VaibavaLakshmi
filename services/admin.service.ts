
import axios from 'axios';
import { BACKEND_URL } from '../constants';

// Create Instance
const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  timeout: 10000,
});

// Request Interceptor to Add Token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const AdminService = {
  // --- AUTHENTICATION ---
  login: async (email: string, pass: string) => {
      const res = await api.post('/auth/login', { email, password: pass });
      return res.data; // Expected { token, user }
  },

  getCurrentUser: async () => {
      try {
          const res = await api.get('/auth/me');
          return res.data.user;
      } catch (e) {
          return null;
      }
  },

  // 1. System Health & Stats
  getHealth: async () => {
    try {
      const res = await api.get('/health');
      return res.data;
    } catch (error) {
      return { status: 'offline', uptime: 0, catalog_size: 0 };
    }
  },

  // 2. Product Management (Read-Only via API)
  getProducts: async () => {
    const res = await api.get('/products?limit=1000'); // Get all for admin
    return res.data.products;
  },

  // 3. Category Governance
  getCategories: async () => {
    const res = await api.get('/categories');
    return res.data;
  },

  // 4. Search Diagnostics
  testSearch: async (query: string) => {
    const res = await api.get(`/search?q=${query}`);
    return res.data;
  },

  // 5. CSV Import (The Write Action)
  importCatalog: async (csvText: string) => {
    const res = await api.post('/admin/import', { csvText });
    return res.data;
  },

  // 6. Order Management
  getOrders: async (status?: string) => {
      const url = status ? `/admin/orders?status=${status}` : '/admin/orders';
      const res = await api.get(url);
      return res.data;
  },

  getOrderDetails: async (id: string) => {
      const res = await api.get(`/admin/orders/${id}`);
      return res.data;
  },

  markOrderPacked: async (id: string) => {
      const res = await api.post(`/admin/orders/${id}/pack`);
      return res.data;
  },

  shipOrder: async (id: string, carrier: string, trackingNumber: string) => {
      const res = await api.post(`/admin/orders/${id}/ship`, { carrier, trackingNumber });
      return res.data;
  },

  cancelOrder: async (id: string, reason: string) => {
      const res = await api.post(`/admin/orders/${id}/cancel`, { reason });
      return res.data;
  },

  // 7. Notification Management
  getNotifications: async () => {
      const res = await api.get('/admin/notifications');
      return res.data;
  },

  retryNotification: async (id: string) => {
      const res = await api.post(`/admin/notifications/${id}/retry`);
      return res.data;
  },

  // 8. Analytics
  getAnalytics: async () => {
      const res = await api.get('/analytics/dashboard');
      return res.data;
  }
};

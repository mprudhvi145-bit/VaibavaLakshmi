import { supabase } from '../utils/supabaseClient';
import { parseProductsFromCSV } from '../utils/csvHelpers';
import { transformToProduct } from '../utils/csvImportWorkflow';

export const AdminService = {
  // --- AUTHENTICATION ---
  // Managed by StoreContext mostly, but here for utility if needed
  getCurrentUser: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
  },

  // 1. System Health & Stats
  getHealth: async () => {
    try {
      const { count, error } = await supabase.from('products').select('*', { count: 'exact', head: true });
      if (error) throw error;
      return { status: 'ok', uptime: 100, catalog_size: count || 0 };
    } catch (error) {
      return { status: 'offline', uptime: 0, catalog_size: 0 };
    }
  },

  // 2. Product Management
  getProducts: async () => {
    const { data } = await supabase.from('products').select('*').limit(1000);
    return data?.map(p => ({
        ...p,
        variants: p.variants || [],
        tags: p.tags || [],
        metadata: p.metadata || {}
    }));
  },

  // 3. Category Governance (Static for now, but could be DB)
  getCategories: async () => {
    // Keep using static constant for now as per "Preserve logic"
    // In a real app, could fetch from 'categories' table
    const { CATEGORY_HIERARCHY } = await import('../constants');
    return CATEGORY_HIERARCHY;
  },

  // 4. Search Diagnostics
  testSearch: async (query: string) => {
    // Client-side search emulation
    // In real supabase, could use textSearch()
    const { data } = await supabase.from('products').select('*').textSearch('title', query);
    return { results: data };
  },

  // 5. CSV Import (Client-Side Processing)
  importCatalog: async (csvText: string) => {
    // 1. Parse CSV to raw objects
    const rawLines = parseProductsFromCSV(csvText); // This returns Product objects from helper
    
    // 2. Transform to DB Shape
    const dbRows = rawLines.map(p => ({
        title: p.title,
        description: p.description,
        handle: p.handle,
        price: p.variants[0]?.prices[0]?.amount,
        stock: p.variants[0]?.inventory_quantity,
        image_url: p.thumbnail,
        status: 'published',
        variants: p.variants, // Store as JSONB
        tags: p.tags,         // Store as JSONB
        metadata: p.metadata  // Store as JSONB
    }));

    // 3. Upsert to Supabase
    const { data, error } = await supabase.from('products').upsert(dbRows, { onConflict: 'handle' });
    
    if (error) {
        console.error("Import failed:", error);
        throw new Error(error.message);
    }

    // 4. Audit Log
    const { data: user } = await supabase.auth.getUser();
    if (user.user) {
        await supabase.from('audit_logs').insert({
            admin_id: user.user.id,
            action: 'IMPORT_CATALOG',
            entity: 'products',
            created_at: new Date().toISOString()
        });
    }

    return { success: true, count: dbRows.length };
  },

  // 6. Order Management
  getOrders: async (status?: string) => {
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (status && status !== 'all') {
          query = query.eq('status', status);
      }
      const { data, error } = await query;
      if(error) throw error;
      return data;
  },

  getOrderDetails: async (id: string) => {
      const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
      if(error) throw error;
      return data;
  },

  markOrderPacked: async (id: string) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status: 'packed' })
        .eq('id', id)
        .select()
        .single();
      if(error) throw error;
      return data;
  },

  shipOrder: async (id: string, carrier: string, trackingNumber: string) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
            status: 'shipped',
            fulfillment_status: 'shipped',
            metadata: { tracking_number: trackingNumber, carrier } 
        })
        .eq('id', id)
        .select()
        .single();
      if(error) throw error;
      return data;
  },

  cancelOrder: async (id: string, reason: string) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status: 'canceled' })
        .eq('id', id)
        .select()
        .single();
      if(error) throw error;
      return data;
  },

  // 7. Notification Management
  getNotifications: async () => {
      // Mock or fetch from a 'notifications' table if created
      return []; 
  },

  retryNotification: async (id: string) => {
      return { success: true };
  },

  // 8. Analytics
  getAnalytics: async () => {
      // Simple aggregates from DB
      const { count: searches } = await supabase.from('audit_logs').select('*', { count: 'exact', head: true }); 
      const { count: orders } = await supabase.from('orders').select('*', { count: 'exact', head: true });
      
      return {
          overview: { searches: searches || 0, views: 0, carts: orders || 0 }, // Simplified
          topSearches: [],
          topProducts: []
      };
  }
};
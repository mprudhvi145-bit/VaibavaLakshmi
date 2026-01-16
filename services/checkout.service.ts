import { supabase } from '../utils/supabaseClient';
import { Cart } from '../types';

export const CheckoutService = {
  validateCart: async (items: any[]) => {
    // Client-side validation logic since we don't have a backend calc engine
    // Fetch latest prices from DB
    const skus = items.map(i => i.variant.sku);
    const { data: products } = await supabase.from('products').select('handle, price').in('handle', skus);
    
    let subtotal = 0;
    const validatedItems = items.map(item => {
        const prod = products?.find(p => p.handle === item.variant.sku);
        const price = prod ? (prod.price || item.unit_price) : item.unit_price;
        subtotal += price * item.quantity;
        return { ...item, unit_price: price, total: price * item.quantity };
    });

    const shipping = subtotal > 1000000 ? 0 : 15000; // Free over 10k logic
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const total = subtotal + shipping + tax;

    return { items: validatedItems, subtotal, shipping, tax, total };
  },

  createPaymentIntent: async (amount: number) => {
    // Mock payment intent
    return {
        id: `pi_${Math.random().toString(36).substr(2, 9)}`,
        amount
    };
  },

  placeOrder: async (cartData: any) => {
    // 1. Prepare Order Object
    const calculation = await CheckoutService.validateCart(cartData.items);
    
    const orderPayload = {
        email: cartData.email,
        customer: cartData.customer, // JSONB
        shipping_address: cartData.shipping_address, // JSONB
        items: calculation.items, // JSONB
        subtotal: calculation.subtotal,
        total: calculation.total,
        status: 'paid', // Assuming payment went through
        payment_status: 'captured',
        fulfillment_status: 'not_fulfilled',
        display_id: Math.floor(100000 + Math.random() * 900000), // Generate ID
        currency_code: 'inr'
    };

    // 2. Insert into Supabase
    const { data, error } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single();

    if (error) {
        console.error("Supabase Order Insert Error", error);
        throw new Error("Failed to save order");
    }

    return data;
  },

  getAllOrders: async () => {
      const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      return data;
  }
};
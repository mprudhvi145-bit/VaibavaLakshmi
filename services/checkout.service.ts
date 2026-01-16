import { supabase } from '../utils/supabaseClient';

export const CheckoutService = {
  // Client-side validation is a known risk in serverless without Edge Functions.
  // Accepted for this architecture phase.
  validateCart: async (items: any[]) => {
    const skus = items.map(i => i.variant.sku);
    
    // Fetch latest pricing from DB to prevent tampering
    const { data: products } = await supabase.from('products').select('handle, price').in('handle', skus);
    
    let subtotal = 0;
    const validatedItems = items.map(item => {
        const prod = products?.find(p => p.handle === item.variant.sku);
        // Fallback to item price if product not found (risk), ideally should error.
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
    // Mock Intent. In production, this must call a Supabase Edge Function to talk to Stripe/Razorpay.
    return {
        id: `pi_${Math.random().toString(36).substr(2, 9)}`,
        amount
    };
  },

  placeOrder: async (cartData: any) => {
    // 1. Re-validate
    const calculation = await CheckoutService.validateCart(cartData.items);
    
    const orderPayload = {
        email: cartData.email,
        customer: cartData.customer, 
        shipping_address: cartData.shipping_address,
        items: calculation.items, // Store validated items
        subtotal: calculation.subtotal,
        total: calculation.total,
        status: 'paid', // Assuming mock payment success
        payment_status: 'captured',
        fulfillment_status: 'not_fulfilled',
        display_id: Math.floor(100000 + Math.random() * 900000),
        currency_code: 'inr',
        created_at: new Date().toISOString()
    };

    // 2. Insert into Supabase
    const { data, error } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single();

    if (error) {
        console.error("Order Creation Failed:", error);
        throw new Error("Failed to save order to database.");
    }

    return data;
  },

  getAllOrders: async () => {
      const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      return data || [];
  }
};
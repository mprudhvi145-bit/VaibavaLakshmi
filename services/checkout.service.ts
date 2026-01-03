
import axios from 'axios';
import { BACKEND_URL } from '../constants';

const api = axios.create({ baseURL: `${BACKEND_URL}/api/checkout` });

export const CheckoutService = {
  validateCart: async (items: any[]) => {
    const res = await api.post('/validate', { items });
    return res.data;
  },

  createPaymentIntent: async (amount: number) => {
    const res = await api.post('/payment-intent', { amount });
    return res.data;
  },

  placeOrder: async (cart: any, paymentId: string) => {
    const res = await api.post('/place-order', { cart, paymentId });
    return res.data;
  },

  getAllOrders: async () => {
      const res = await api.get('/orders');
      return res.data;
  }
};

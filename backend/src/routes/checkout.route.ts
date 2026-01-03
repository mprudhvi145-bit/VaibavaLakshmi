
import { Router } from 'express';
import { OrderService } from '../services/order.service';
import { PaymentService } from '../services/payment.service';

const router = Router();

// GET /api/checkout/validate
// Recalculates totals based on backend prices
router.post('/validate', async (req, res) => {
  try {
    const manager = (req as any).scope.resolve("manager");
    const orderService = new OrderService({ manager });
    const result = await orderService.validateCart(req.body.items);
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// POST /api/checkout/payment-intent
// Creates a payment intent
router.post('/payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;
    const paymentService = new PaymentService();
    const intent = await paymentService.createPaymentIntent(amount);
    res.json(intent);
  } catch (e) {
    res.status(500).json({ error: 'Payment initialization failed' });
  }
});

// POST /api/checkout/place-order
// Verifies payment and creates order
router.post('/place-order', async (req, res) => {
  try {
    const { cart, paymentId } = req.body;
    const manager = (req as any).scope.resolve("manager");
    
    // 1. Verify Payment
    const paymentService = new PaymentService();
    const isPaid = await paymentService.verifyPayment(paymentId);
    
    if (!isPaid) {
        return res.status(402).json({ error: 'Payment verification failed. Please try again.' });
    }

    // 2. Create Order
    const orderService = new OrderService({ manager });
    const order = await orderService.createOrder(cart, { id: paymentId });
    
    res.json({ success: true, order });
  } catch (e) {
    console.error("Order placement failed", e);
    res.status(500).json({ error: 'Failed to place order. If you were charged, please contact support.' });
  }
});

// GET /api/checkout/orders
// Used by Admin Panel to fetch real orders
router.get('/orders', async (req, res) => {
    const manager = (req as any).scope.resolve("manager");
    const orderService = new OrderService({ manager });
    const orders = await orderService.getAllOrders();
    res.json(orders);
});

export default router;

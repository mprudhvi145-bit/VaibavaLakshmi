
import { Router } from 'express';
import multer from 'multer';
import { catalogLoader } from '../loaders/catalog.loader';
import { OrderService } from '../services/order.service';
import { NotificationService } from '../services/notification.service';
import { requireRole } from '../api/middlewares/auth';
import { UserRole } from '../models/user';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Helper to get OrderService
const getOrderService = (req: any) => {
    const manager = req.scope.resolve("manager");
    return new OrderService({ manager });
}

// Helper for NotificationService
const getNotificationService = (req: any) => {
    const manager = req.scope.resolve("manager");
    return new NotificationService({ manager });
}

// POST /api/admin/import
router.post('/import', upload.single('file') as any, (req: any, res) => {
  if (!req.file && !req.body.csvText) {
    return res.status(400).json({ error: 'No CSV file or text provided' });
  }

  const csvContent = req.file 
    ? req.file.buffer.toString('utf-8') 
    : req.body.csvText;

  const result = catalogLoader.reloadFromCSV(csvContent);

  if (result.success) {
    res.json({
      message: 'Catalog reloaded successfully',
      products_loaded: result.count
    });
  } else {
    res.status(422).json({
      error: 'Validation failed',
      details: result.errors
    });
  }
});

// --- ORDER MANAGEMENT ---

// GET /api/admin/orders
router.get('/orders', async (req, res) => {
    try {
        const service = getOrderService(req);
        const status = req.query.status as string;
        const orders = await service.getAllOrders(status);
        res.json(orders);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET /api/admin/orders/:id
router.get('/orders/:id', async (req, res) => {
    try {
        const service = getOrderService(req);
        const order = await service.getOrder(req.params.id);
        if (!order) return res.status(404).json({ error: "Order not found" });
        res.json(order);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/admin/orders/:id/pack
router.post('/orders/:id/pack', async (req: any, res) => {
    try {
        const service = getOrderService(req);
        const actorId = req.user?.id || 'SYSTEM';
        const order = await service.markAsPacked(req.params.id, actorId);
        res.json(order);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// POST /api/admin/orders/:id/ship
router.post('/orders/:id/ship', async (req: any, res) => {
    try {
        const { carrier, trackingNumber } = req.body;
        if (!carrier || !trackingNumber) return res.status(400).json({ error: "Carrier and Tracking Number required" });
        
        const service = getOrderService(req);
        const actorId = req.user?.id || 'SYSTEM';
        const order = await service.shipOrder(req.params.id, carrier, trackingNumber, actorId);
        res.json(order);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// POST /api/admin/orders/:id/cancel
router.post('/orders/:id/cancel', async (req: any, res) => {
    try {
        const { reason } = req.body;
        const service = getOrderService(req);
        const actorId = req.user?.id || 'SYSTEM';
        const order = await service.cancelOrder(req.params.id, reason || 'Manual Admin Cancel', actorId);
        res.json(order);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// --- NOTIFICATION MANAGEMENT ---

// GET /api/admin/notifications
router.get('/notifications', async (req: any, res) => {
    try {
        const service = getNotificationService(req);
        const logs = await service.getLogs();
        res.json(logs);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/admin/notifications/:id/retry
router.post('/notifications/:id/retry', async (req: any, res) => {
    try {
        const service = getNotificationService(req);
        await service.retry(req.params.id);
        res.json({ success: true });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

export default router;

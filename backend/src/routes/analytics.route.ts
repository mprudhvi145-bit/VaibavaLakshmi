
import { Router } from 'express';
import { AnalyticsService } from '../services/analytics.service';

const router = Router();

// POST /api/analytics/track
router.post('/track', async (req: any, res) => {
  try {
    const manager = req.scope.resolve("manager");
    const service = new AnalyticsService({ manager });
    const { event, payload, userId } = req.body;
    
    // Non-blocking
    service.track(event, payload, userId).catch(e => console.error("Analytics Error", e));
    
    res.json({ status: 'ok' });
  } catch (e) {
    res.status(500).json({ error: 'Failed' });
  }
});

// GET /api/analytics/dashboard
router.get('/dashboard', async (req: any, res) => {
  try {
    const manager = req.scope.resolve("manager");
    const service = new AnalyticsService({ manager });
    const stats = await service.getDashboardStats();
    res.json(stats);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;

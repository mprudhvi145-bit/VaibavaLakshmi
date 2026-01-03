
import { Router } from 'express';
import { catalogLoader } from '../loaders/catalog.loader';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    catalog_size: catalogLoader.getProducts().length,
    timestamp: new Date().toISOString()
  });
});

export default router;

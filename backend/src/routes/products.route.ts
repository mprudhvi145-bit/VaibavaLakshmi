
import { Router } from 'express';
import { productService } from '../services/product.service';

const router = Router();

// GET /api/products
router.get('/', (req, res) => {
  const filters: Record<string, string> = {};
  
  if (req.query.category) filters.category = req.query.category as string;
  if (req.query.fabric) filters.fabric = req.query.fabric as string;
  if (req.query.color) filters.color = req.query.color as string;
  
  const sort = (req.query.sort as string) || 'relevance';
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;

  const result = productService.getAll(filters, sort, limit, offset);
  res.json(result);
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const product = productService.getById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

export default router;

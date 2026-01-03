
import { Router } from 'express';
import { searchService } from '../services/search.service';

const router = Router();

// GET /api/search?q=query
router.get('/', (req, res) => {
  const query = req.query.q as string;
  if (!query) return res.json({ results: [], total: 0 });

  const response = searchService.search(query);
  res.json(response);
});

export default router;

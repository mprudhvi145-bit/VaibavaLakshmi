
import { Router } from 'express';
import { CATEGORY_HIERARCHY } from '../config/governance';

const router = Router();

// GET /api/categories
router.get('/', (req, res) => {
  res.json(CATEGORY_HIERARCHY);
});

// GET /api/categories/:slug
router.get('/:slug', (req, res) => {
  const findNode = (nodes: any[], slug: string): any => {
    for (const node of nodes) {
      if (node.slug === slug) return node;
      if (node.children) {
        const found = findNode(node.children, slug);
        if (found) return found;
      }
    }
    return null;
  };

  const category = findNode(CATEGORY_HIERARCHY, req.params.slug);
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }
  res.json(category);
});

export default router;

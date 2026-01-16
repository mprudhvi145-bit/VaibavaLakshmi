import { CATEGORY_HIERARCHY } from '../catalog/categories';
import { CategoryNode } from '../contracts';

export interface BreadcrumbPath {
  label: string;
  path: string;
}

/**
 * Validates if a category slug exists in the hierarchy.
 */
export const validateCategory = (slug: string): boolean => {
  if (!slug || slug === 'all') return true;
  return !!findCategoryNode(slug);
};

/**
 * Finds a category node by slug (Recursive).
 */
export const findCategoryNode = (slug: string): CategoryNode | null => {
  const find = (nodes: CategoryNode[]): CategoryNode | null => {
    for (const node of nodes) {
      if (node.slug === slug) return node;
      if (node.children) {
        const found = find(node.children);
        if (found) return found;
      }
    }
    return null;
  };
  return find(CATEGORY_HIERARCHY);
};

/**
 * Traverses the category tree to find the path to a specific slug.
 * Returns an array of breadcrumbs starting from Home.
 * Logs error and returns safe fallback if path is broken.
 */
export const getBreadcrumbPath = (targetSlug: string | undefined): BreadcrumbPath[] => {
  const base: BreadcrumbPath[] = [{ label: 'Home', path: '/' }];
  
  if (!targetSlug) return base;

  const hierarchyPath: CategoryNode[] = [];
  
  // Recursive path finder
  const findPath = (nodes: CategoryNode[], target: string, currentPath: CategoryNode[]): boolean => {
    for (const node of nodes) {
      currentPath.push(node);
      if (node.slug === target) return true;
      
      if (node.children && node.children.length > 0) {
        if (findPath(node.children, target, currentPath)) return true;
      }
      
      currentPath.pop();
    }
    return false;
  };

  if (findPath(CATEGORY_HIERARCHY, targetSlug, hierarchyPath)) {
    hierarchyPath.forEach(node => {
      base.push({ 
        label: node.label, 
        path: `/catalog/${node.slug}` 
      });
    });
  } else {
    // Data Integrity Violation
    console.error(`[Data Integrity] Category slug '${targetSlug}' not found in hierarchy. Rendering safe fallback.`);
    // We strictly return base (Home) to prevent broken links
    return base;
  }

  return base;
};

import { Product } from '../contracts';
import { catalogLoader } from '../loaders/catalog.loader';
import { cacheService } from './cache.service';

export class ProductService {
  
  public getAll(filters: Record<string, string>, sort: string = 'relevance', limit: number = 50, offset: number = 0): { products: Product[], total: number } {
    // 1. Check Cache for Full List (Optimization for frequent full-scans or base list)
    // Complex filters are hard to cache key, so we cache the base list generation if possible or rely on fast in-memory filtering
    // Since catalog is in-memory (CatalogLoader), filtering is fast. We'll cache the FINAL output for specific query combos if needed.
    
    const cacheKey = `products_${JSON.stringify(filters)}_${sort}_${limit}_${offset}`;
    const cached = cacheService.get<{ products: Product[], total: number }>(cacheKey);
    if (cached) return cached;

    let products = catalogLoader.getProducts();

    // 2. Filtering
    if (filters.category && filters.category !== 'all') {
      products = products.filter(p => {
        const pCat = p.tags?.find(t => t.value.startsWith('Category:'))?.value.split(':')[1] || '';
        return pCat === filters.category || pCat.includes(filters.category);
      });
    }

    ['Fabric', 'Color', 'Occasion', 'Work Type'].forEach(attr => {
      const key = attr.toLowerCase();
      if (filters[key]) {
        const allowed = filters[key].split(',').map(v => v.toLowerCase());
        products = products.filter(p => {
          const tagVal = p.tags?.find(t => t.value.toLowerCase().startsWith(`${key}:`))?.value.split(':')[1].toLowerCase();
          return tagVal && allowed.includes(tagVal);
        });
      }
    });

    const total = products.length;

    // 3. Sorting
    products.sort((a, b) => {
      const priceA = a.variants[0].prices[0].amount;
      const priceB = b.variants[0].prices[0].amount;
      
      switch (sort) {
        case 'price_asc': return priceA - priceB;
        case 'price_desc': return priceB - priceA;
        case 'newest': return b.id.localeCompare(a.id); // Simple proxy for date if created_at missing in flat obj
        default: return 0;
      }
    });

    // 4. Pagination
    const paginated = products.slice(offset, offset + limit);
    const result = { products: paginated, total };

    // Cache result for 30 seconds
    cacheService.set(cacheKey, result, 30 * 1000);

    return result;
  }

  public getById(id: string): Product | undefined {
    // ID lookups are extremely fast in memory, no strict need to cache unless expensive enrichment happens
    return catalogLoader.getProducts().find(p => p.id === id);
  }
}

export const productService = new ProductService();

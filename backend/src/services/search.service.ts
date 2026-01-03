
import { Product, SearchResponse } from '../contracts';
import { catalogLoader } from '../loaders/catalog.loader';

const WEIGHTS = {
  EXACT_TITLE: 100,
  FUZZY_TITLE: 40,
  CATEGORY_EXACT: 50,
  ATTRIBUTE: 15,
  DESCRIPTION: 5
};

export class SearchService {
  
  public search(query: string): SearchResponse {
    const products = catalogLoader.getProducts();
    if (!query) return { results: [], total: 0, facets: { categories: [], fabrics: [] } };

    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 0);
    
    const results = products.map(product => {
      let score = 0;
      const matches: string[] = [];
      
      const title = product.title.toLowerCase();
      const cat = product.tags?.find(t => t.value.startsWith('Category:'))?.value.split(':')[1].toLowerCase() || '';
      const attrs = product.tags?.map(t => t.value.toLowerCase()) || [];

      terms.forEach(term => {
        if (title.includes(term)) { score += WEIGHTS.EXACT_TITLE; matches.push('title'); }
        if (cat.includes(term)) { score += WEIGHTS.CATEGORY_EXACT; matches.push('category'); }
        
        attrs.forEach(attr => {
          if (attr.includes(term)) { score += WEIGHTS.ATTRIBUTE; matches.push('attribute'); }
        });
      });

      return { product, score, matches };
    })
    .filter(res => res.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(res => res.product);

    // Calculate Facets
    const categories = new Set<string>();
    const fabrics = new Set<string>();
    results.forEach(p => {
      p.tags?.forEach(t => {
        if (t.value.startsWith('Category:')) categories.add(t.value.split(':')[1]);
        if (t.value.startsWith('Fabric:')) fabrics.add(t.value.split(':')[1]);
      });
    });

    return {
      results: results.slice(0, 50),
      total: results.length,
      facets: {
        categories: Array.from(categories),
        fabrics: Array.from(fabrics)
      }
    };
  }
}

export const searchService = new SearchService();

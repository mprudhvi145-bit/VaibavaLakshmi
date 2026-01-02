
import { Product } from '../types';

export interface SearchResult {
  product: Product;
  score: number;
}

// 1. Sanitize: Lowercase and remove special chars
const normalize = (str: string) => str ? str.toLowerCase().replace(/[^a-z0-9\s]/g, '') : '';

export const searchProducts = (products: Product[], query: string): Product[] => {
  if (!query || query.length < 2) return [];

  const normalizedQuery = normalize(query);
  const terms = normalizedQuery.split(' ').filter(t => t.length > 1); // Ignore single letter words

  const scoredResults = products.map(product => {
    let score = 0;
    
    // Data Preparation
    const title = normalize(product.title);
    const category = normalize(product.tags?.find(t => t.value.startsWith('Category:'))?.value.split(':')[1] || '');
    const fabric = normalize(product.tags?.find(t => t.value.startsWith('Fabric:'))?.value.split(':')[1] || '');
    const color = normalize(product.tags?.find(t => t.value.startsWith('Color:'))?.value.split(':')[1] || '');
    const occasion = normalize(product.tags?.find(t => t.value.startsWith('Occasion:'))?.value.split(':')[1] || '');
    
    // --- SCORING ALGORITHM ---

    // 1. Exact Phrase Match (Highest Relevance)
    if (title.includes(normalizedQuery)) score += 50;

    // 2. Token Matching
    terms.forEach(term => {
      // Title Match
      if (title.includes(term)) score += 20;

      // Category Match (e.g., "Saree", "Lehenga")
      if (category.includes(term)) score += 25;

      // Attribute Matches (Specific user intent)
      if (fabric.includes(term)) score += 15;   // e.g. "Silk"
      if (color.includes(term)) score += 15;    // e.g. "Red"
      if (occasion.includes(term)) score += 10; // e.g. "Wedding"
      
      // Fallback
      if (normalize(product.description).includes(term)) score += 2;
    });

    // 3. Exact Category/Attribute Bonus
    // If user types exactly "Silk Saree", boost it
    if (category === normalizedQuery) score += 30;

    return { product, score };
  });

  // Filter out low scores and sort by relevance
  return scoredResults
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.product);
};

export const getSearchSuggestions = (products: Product[], query: string) => {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return { topProducts: [], categories: [], totalCount: 0 };

  const results = searchProducts(products, query);
  
  // Extract Unique Categories from Top Results
  const categories = new Set<string>();
  const fabricSuggestions = new Set<string>();

  results.forEach(p => {
    // Extract Category
    const catTag = p.tags?.find(t => t.value.startsWith('Category:'))?.value.split(':')[1];
    if (catTag) categories.add(catTag.replace(/-/g, ' ')); // Human readable
    
    // Extract Fabric (for smarter suggestions)
    const fabTag = p.tags?.find(t => t.value.startsWith('Fabric:'))?.value.split(':')[1];
    if (fabTag && fabTag.toLowerCase().includes(normalizedQuery)) fabricSuggestions.add(fabTag);
  });

  // Combine Category matches into suggestions list
  const finalCategories = Array.from(categories).slice(0, 3);
  
  // If query matches a fabric (e.g. "Silk"), suggest "Silk Saree", "Silk Kurta"
  if (fabricSuggestions.size > 0 && finalCategories.length > 0) {
      // Logic could be expanded here for complex autosuggest
  }

  return {
    topProducts: results.slice(0, 3),
    categories: finalCategories,
    totalCount: results.length
  };
};

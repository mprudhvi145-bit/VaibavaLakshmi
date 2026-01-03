
import { Product } from '../types';
import { SEARCH_CONFIG, SYNONYM_MAP } from './searchConfig';

export interface SearchResult {
  product: Product;
  score: number;
  matches: string[]; // For highlighting
}

// --- HELPER: LEVENSHTEIN DISTANCE ---
const getEditDistance = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = b[i - 1] === a[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return matrix[b.length][a.length];
};

// --- HELPER: NORMALIZE & EXPAND ---
const normalizeAndExpand = (query: string): string[] => {
  const normalized = query.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const terms = normalized.split(/\s+/).filter(t => t.length > 0);
  
  // Replace synonyms
  return terms.map(term => SYNONYM_MAP[term] || term);
};

// --- HELPER: IS FUZZY MATCH ---
const isFuzzyMatch = (target: string, term: string): boolean => {
  if (target.includes(term)) return true; // Substring match is always true

  const maxEdits = term.length > 6 ? SEARCH_CONFIG.FUZZY_THRESHOLD_LONG : 
                   term.length > 3 ? SEARCH_CONFIG.FUZZY_THRESHOLD_SHORT : 0;

  if (maxEdits === 0) return false;

  // Optimization: Check only if length difference is within tolerance
  if (Math.abs(target.length - term.length) > maxEdits) return false;

  return getEditDistance(target, term) <= maxEdits;
};

// --- MAIN SEARCH FUNCTION ---
export const searchProducts = (products: Product[], query: string): Product[] => {
  if (!query || query.length < 2) return [];

  const searchTerms = normalizeAndExpand(query);
  
  const scoredResults = products.map(product => {
    let score = 0;
    const matches: string[] = [];
    
    // Prepare Data Fields
    const title = product.title.toLowerCase();
    const category = product.tags?.find(t => t.value.startsWith('Category:'))?.value.split(':')[1]?.toLowerCase() || '';
    const attributes = product.tags?.filter(t => !t.value.startsWith('Category:')).map(t => t.value.split(':')[1]?.toLowerCase()) || [];
    const description = product.description.toLowerCase();

    searchTerms.forEach(term => {
      let termMatched = false;

      // 1. Exact Title Match
      if (title.includes(term)) {
        score += SEARCH_CONFIG.WEIGHTS.EXACT_TITLE;
        termMatched = true;
      } 
      // 2. Fuzzy Title Match
      else if (isFuzzyMatch(title, term)) {
        score += SEARCH_CONFIG.WEIGHTS.FUZZY_TITLE;
        termMatched = true;
      }

      // 3. Category Match
      if (category.includes(term)) {
        score += SEARCH_CONFIG.WEIGHTS.CATEGORY_EXACT;
        termMatched = true;
      } else if (isFuzzyMatch(category, term)) {
        score += SEARCH_CONFIG.WEIGHTS.CATEGORY_FUZZY;
        termMatched = true;
      }

      // 4. Attribute Match (Fabric, Color, Occasion)
      attributes.forEach(attr => {
        if (attr && (attr.includes(term) || isFuzzyMatch(attr, term))) {
          score += SEARCH_CONFIG.WEIGHTS.ATTRIBUTE;
          termMatched = true;
        }
      });

      // 5. Description Match (Low weight fallback)
      if (!termMatched && description.includes(term)) {
        score += SEARCH_CONFIG.WEIGHTS.DESCRIPTION;
      }
    });

    return { product, score };
  });

  return scoredResults
    .filter(res => res.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(res => res.product);
};

// --- AUTOSUGGEST ---
export const getSearchSuggestions = (products: Product[], query: string) => {
  const normalizedQuery = normalizeAndExpand(query).join(' '); // Rejoin for simple checks
  if (!normalizedQuery) return { topProducts: [], categories: [], totalCount: 0 };

  // Use the main search logic but limit results
  const results = searchProducts(products, query);

  const categories = new Set<string>();
  
  results.slice(0, 10).forEach(p => {
     const cat = p.tags?.find(t => t.value.startsWith('Category:'))?.value.split(':')[1];
     if (cat) categories.add(cat.replace(/-/g, ' '));
  });

  return {
    topProducts: results.slice(0, 3),
    categories: Array.from(categories).slice(0, 3),
    totalCount: results.length
  };
};

// --- HISTORY TRACKING ---
export const trackSearchQuery = (query: string) => {
  if (!query || query.length < 3) return;
  try {
    const raw = localStorage.getItem(SEARCH_CONFIG.STORAGE_KEY_HISTORY);
    const history: Record<string, number> = raw ? JSON.parse(raw) : {};
    
    const normalized = query.toLowerCase().trim();
    history[normalized] = (history[normalized] || 0) + 1;
    
    localStorage.setItem(SEARCH_CONFIG.STORAGE_KEY_HISTORY, JSON.stringify(history));
  } catch (e) {
    console.warn("Search tracking failed", e);
  }
};

export const getPopularSearches = (): string[] => {
  try {
    const raw = localStorage.getItem(SEARCH_CONFIG.STORAGE_KEY_HISTORY);
    if (!raw) return ['Kanchipuram Silk', 'Wedding Lehenga', 'Sherwani'];
    
    const history: Record<string, number> = JSON.parse(raw);
    return Object.entries(history)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([term]) => term);
  } catch (e) {
    return [];
  }
};

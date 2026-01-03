
import { Product } from '../contracts';
import { SYNONYM_MAP } from '../catalog/synonyms';

// Configuration
const CONFIG = {
  WEIGHTS: {
    EXACT_TITLE: 100,
    FUZZY_TITLE: 40,
    CATEGORY_EXACT: 50,
    CATEGORY_FUZZY: 20,
    ATTRIBUTE: 15,
    DESCRIPTION: 5
  },
  FUZZY_THRESHOLD_SHORT: 1,
  FUZZY_THRESHOLD_LONG: 2,
};

// --- QUERY PARSER ---
class QueryParser {
  static normalize(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  }

  static tokenize(query: string): string[] {
    const normalized = this.normalize(query);
    const terms = normalized.split(/\s+/).filter(t => t.length > 0);
    // Expand synonyms
    return terms.map(term => SYNONYM_MAP[term] || term);
  }
}

// --- SCORER ---
class Scorer {
  static getLevenshteinDistance(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const cost = b[i - 1] === a[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
      }
    }
    return matrix[b.length][a.length];
  }

  static isFuzzyMatch(target: string, term: string): boolean {
    if (target.includes(term)) return true;
    const maxEdits = term.length > 6 ? CONFIG.FUZZY_THRESHOLD_LONG : term.length > 3 ? CONFIG.FUZZY_THRESHOLD_SHORT : 0;
    if (maxEdits === 0) return false;
    if (Math.abs(target.length - term.length) > maxEdits) return false;
    return this.getLevenshteinDistance(target, term) <= maxEdits;
  }

  static scoreProduct(product: Product, terms: string[]): number {
    let score = 0;
    const title = QueryParser.normalize(product.title);
    const category = QueryParser.normalize(product.tags?.find(t => t.value.startsWith('Category:'))?.value.split(':')[1] || '');
    const attributes = product.tags?.filter(t => !t.value.startsWith('Category:')).map(t => QueryParser.normalize(t.value.split(':')[1] || '')) || [];
    const description = QueryParser.normalize(product.description);

    terms.forEach(term => {
      let termMatched = false;
      
      // Title
      if (title.includes(term)) { score += CONFIG.WEIGHTS.EXACT_TITLE; termMatched = true; }
      else if (this.isFuzzyMatch(title, term)) { score += CONFIG.WEIGHTS.FUZZY_TITLE; termMatched = true; }

      // Category
      if (category.includes(term)) { score += CONFIG.WEIGHTS.CATEGORY_EXACT; termMatched = true; }
      else if (this.isFuzzyMatch(category, term)) { score += CONFIG.WEIGHTS.CATEGORY_FUZZY; termMatched = true; }

      // Attributes
      attributes.forEach(attr => {
        if (attr && (attr.includes(term) || this.isFuzzyMatch(attr, term))) {
          score += CONFIG.WEIGHTS.ATTRIBUTE;
          termMatched = true;
        }
      });

      // Description
      if (!termMatched && description.includes(term)) { score += CONFIG.WEIGHTS.DESCRIPTION; }
    });
    return score;
  }
}

// --- SEARCH ENGINE ---
export class SearchEngine {
  private products: Product[] = [];

  constructor(products: Product[]) {
    this.products = products;
  }

  public search(query: string, limit: number = 20): Product[] {
    if (!query || query.length < 2) return [];
    
    const terms = QueryParser.tokenize(query);
    
    const results = this.products.map(product => ({
      product,
      score: Scorer.scoreProduct(product, terms)
    }));

    return results
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(r => r.product);
  }

  public getSuggestions(query: string) {
     const results = this.search(query, 10);
     const categories = new Set<string>();
     results.forEach(p => {
        const cat = p.tags?.find(t => t.value.startsWith('Category:'))?.value.split(':')[1];
        if (cat) categories.add(cat.replace(/-/g, ' '));
     });
     
     return {
       topProducts: results.slice(0, 3),
       categories: Array.from(categories).slice(0, 3),
       totalCount: results.length
     };
  }
}

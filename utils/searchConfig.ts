
// --- SEARCH CONFIGURATION & SYNONYMS ---
// Operator Guide: Update this file to tune search behavior without touching logic.

export const SEARCH_CONFIG = {
  // Index Version: Increment this when you update the CSV to force a re-cache on client browsers.
  INDEX_VERSION: 'v1.1',
  
  // Storage Keys
  STORAGE_KEY_INDEX: 'vaibava_search_index',
  STORAGE_KEY_HISTORY: 'vaibava_search_history',

  // Scoring Weights
  WEIGHTS: {
    EXACT_TITLE: 100,
    FUZZY_TITLE: 40,
    CATEGORY_EXACT: 50,
    CATEGORY_FUZZY: 20,
    ATTRIBUTE: 15, // Fabric, Color, etc.
    DESCRIPTION: 5
  },

  // Thresholds
  FUZZY_THRESHOLD_SHORT: 1, // Max typos for words length 4-6
  FUZZY_THRESHOLD_LONG: 2,  // Max typos for words length > 6
};

// --- SYNONYM DICTIONARY (INDIAN CONTEXT) ---
// Format: 'search_term': 'catalog_term'
// All keys must be lowercase.
export const SYNONYM_MAP: Record<string, string> = {
  // Fabrics
  'pattu': 'silk',
  'resham': 'silk',
  'kora': 'cotton',
  'velvette': 'velvet',
  'malmal': 'cotton',

  // Categories
  'kanjivaram': 'kanchipuram',
  'kanchi': 'kanchipuram',
  'banaras': 'banarasi',
  'benaresi': 'banarasi',
  'paithani': 'silk', // Mapping to generic if specific doesn't exist
  'suit': 'salwar',
  'churidar': 'salwar',
  'frock': 'gown',
  'gown': 'gown',

  // Occasions / Vibe
  'marriage': 'wedding',
  'shaadi': 'wedding',
  'reception': 'party',
  'function': 'festive',
  'pooja': 'festive',
  'haldi': 'yellow', // Smart mapping occasion to color
  'mehendi': 'green', // Smart mapping occasion to color

  // Common Misspellings / Variations
  'sari': 'saree',
  'sare': 'saree',
  'lehnga': 'lehenga',
  'lehanga': 'lehenga',
  'kurti': 'kurtis',
  'kurtha': 'kurta',
  'pyjama': 'pajama'
};

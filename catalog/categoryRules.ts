
export interface CategoryRule {
  slug: string;
  maxDepth: number;
  allowedFilters: string[];
  defaultSort: string;
  seoTitleTemplate: string;
  seoDescTemplate: string;
}

export const CATEGORY_RULES: Record<string, CategoryRule> = {
  'women-sarees': {
    slug: 'women-sarees',
    maxDepth: 3,
    allowedFilters: ['Fabric', 'Occasion', 'Color', 'Work Type', 'Price'],
    defaultSort: 'relevance',
    seoTitleTemplate: 'Buy {Fabric} Sarees for {Occasion} | Vaibava Lakshmi',
    seoDescTemplate: 'Explore our latest collection of {Fabric} sarees. Perfect for {Occasion} and weddings. Authentic quality assured.'
  },
  'lehengas': {
    slug: 'lehengas',
    maxDepth: 3,
    allowedFilters: ['Fabric', 'Occasion', 'Color', 'Price'],
    defaultSort: 'newest',
    seoTitleTemplate: 'Designer Lehengas for {Occasion} | Vaibava Lakshmi',
    seoDescTemplate: 'Shop stunning {Color} lehengas in {Fabric}. Exclusive bridal and festive collection.'
  },
  'sherwanis': {
    slug: 'sherwanis',
    maxDepth: 3,
    allowedFilters: ['Color', 'Fabric', 'Occasion', 'Price'],
    defaultSort: 'price_desc',
    seoTitleTemplate: 'Royal Groom Sherwanis - {Color} & Gold | Vaibava Lakshmi',
    seoDescTemplate: 'Premium wedding sherwanis for men. Velvet, Brocade and Raw Silk options available.'
  },
  'kurtas': {
    slug: 'kurtas',
    maxDepth: 3,
    allowedFilters: ['Fabric', 'Color', 'Price'],
    defaultSort: 'relevance',
    seoTitleTemplate: 'Men\'s Ethnic Kurtas - {Fabric} | Vaibava Lakshmi',
    seoDescTemplate: 'Casual and festive kurtas for men. Cotton, Linen and Silk blends.'
  },
  'default': {
    slug: 'default',
    maxDepth: 3,
    allowedFilters: ['Color', 'Price', 'Occasion'],
    defaultSort: 'relevance',
    seoTitleTemplate: '{Category} Online | Vaibava Lakshmi',
    seoDescTemplate: 'Shop the finest {Category} collection online. Best prices and worldwide shipping.'
  }
};

export const getCategoryRule = (slug: string): CategoryRule => {
  // Simple matching logic
  if (CATEGORY_RULES[slug]) return CATEGORY_RULES[slug];
  if (slug.includes('saree') || slug.includes('kanchi') || slug.includes('banarasi')) return CATEGORY_RULES['women-sarees'];
  if (slug.includes('sherwani') || slug.includes('groom')) return CATEGORY_RULES['sherwanis'];
  return CATEGORY_RULES['default'];
};

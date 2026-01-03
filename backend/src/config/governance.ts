
import { CategoryNode } from '../contracts';

export const CATEGORY_HIERARCHY: CategoryNode[] = [
  {
    id: 'women',
    label: 'Women',
    slug: 'women',
    children: [
      {
        id: 'sarees',
        label: 'Sarees',
        slug: 'women-sarees',
        children: [
          { id: 'kanchipuram', label: 'Kanchipuram Silk', slug: 'kanchipuram-silk' },
          { id: 'banarasi', label: 'Banarasi', slug: 'banarasi' },
          { id: 'soft-silk', label: 'Soft Silk', slug: 'soft-silk' },
          { id: 'designer', label: 'Designer & Party', slug: 'designer-sarees' }
        ]
      },
      {
        id: 'women-ethnic',
        label: 'Ethnic Wear',
        slug: 'women-ethnic',
        children: [
          { id: 'lehengas', label: 'Lehengas', slug: 'lehengas' },
          { id: 'salwar', label: 'Salwar Suits', slug: 'salwar-suits' },
          { id: 'kurtis', label: 'Kurtis & Tunics', slug: 'kurtis' }
        ]
      },
      {
        id: 'women-acc',
        label: 'Accessories',
        slug: 'women-accessories',
        children: [
           { id: 'jewellery', label: 'Jewellery', slug: 'jewellery' },
           { id: 'dupatta', label: 'Dupattas', slug: 'dupattas' }
        ]
      }
    ]
  },
  {
    id: 'men',
    label: 'Men',
    slug: 'men',
    children: [
      {
        id: 'men-ethnic',
        label: 'Ethnic Wear',
        slug: 'men-ethnic',
        children: [
          { id: 'kurtas', label: 'Kurtas', slug: 'kurtas' },
          { id: 'kurta-sets', label: 'Kurta Sets', slug: 'kurta-sets' },
          { id: 'sherwanis', label: 'Sherwanis', slug: 'sherwanis' },
          { id: 'dhoti', label: 'Dhoti Sets', slug: 'dhoti-sets' }
        ]
      },
      {
        id: 'men-festive',
        label: 'Festive Wear',
        slug: 'men-festive',
        children: []
      },
      {
        id: 'men-acc',
        label: 'Accessories',
        slug: 'men-accessories',
        children: []
      }
    ]
  },
  {
    id: 'kids',
    label: 'Kids',
    slug: 'kids',
    children: [
      {
        id: 'boys',
        label: 'Boys',
        slug: 'kids-boys',
        children: [
          { id: 'boys-ethnic', label: 'Ethnic Wear', slug: 'boys-ethnic' }
        ]
      },
      {
        id: 'girls',
        label: 'Girls',
        slug: 'kids-girls',
        children: [
          { id: 'girls-ethnic', label: 'Ethnic Wear', slug: 'girls-ethnic' }
        ]
      }
    ]
  },
  {
    id: 'wedding',
    label: 'Wedding',
    slug: 'wedding',
    highlight: true,
    children: [
      { id: 'bride', label: 'The Bride', slug: 'the-bride', children: [] },
      { id: 'groom', label: 'The Groom', slug: 'the-groom', children: [] },
      { id: 'muhurtham', label: 'Muhurtham Silks', slug: 'muhurtham-silks', children: [] }
    ]
  }
];

// Valid Slugs Set for O(1) Lookup
export const VALID_SLUGS = new Set<string>();
const traverse = (nodes: CategoryNode[]) => {
  nodes.forEach(n => {
    VALID_SLUGS.add(n.slug);
    if (n.children) traverse(n.children);
  });
};
traverse(CATEGORY_HIERARCHY);

// Attribute Rules
export const ATTRIBUTES = {
  FABRIC: ['Pure Silk', 'Soft Silk', 'Georgette', 'Cotton', 'Organza', 'Chiffon', 'Art Silk', 'Tissue', 'Linen', 'Velvet', 'Raw Silk'],
  OCCASION: ['Casual', 'Festive', 'Party', 'Wedding', 'Bridal', 'Engagement', 'Reception'],
  COLOR: ['Red', 'Pink', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Gold', 'Silver', 'Cream', 'Orange', 'Grey', 'Beige', 'Purple', 'Teal', 'Wine', 'Multi'],
  WORK_TYPE: ['Zari Woven', 'Embroidered', 'Printed', 'Stone Work', 'Mirror Work', 'Sequins', 'Plain']
};

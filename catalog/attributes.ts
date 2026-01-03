
export interface FilterConfig {
  key: string;
  label: string;
  type: 'multi' | 'range';
  options?: string[];
}

export const ATTRIBUTE_DICTIONARY: Record<string, FilterConfig[]> = {
  global: [
    { key: 'Price', label: 'Price Range', type: 'range', options: ['Under ₹2,000', '₹2,000 - ₹5,000', '₹5,000 - ₹15,000', 'Above ₹15,000'] },
    { key: 'Color', label: 'Color', type: 'multi', options: ['Red', 'Pink', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Gold', 'Silver', 'Cream', 'Orange', 'Grey', 'Beige', 'Purple', 'Teal', 'Wine', 'Multi'] },
    { key: 'Occasion', label: 'Occasion', type: 'multi', options: ['Casual', 'Festive', 'Party', 'Wedding', 'Bridal', 'Engagement', 'Reception'] }
  ],
  'sarees': [
    { key: 'Fabric', label: 'Fabric', type: 'multi', options: ['Pure Silk', 'Soft Silk', 'Georgette', 'Cotton', 'Organza', 'Chiffon', 'Art Silk', 'Tissue', 'Linen'] },
    { key: 'Work Type', label: 'Work Type', type: 'multi', options: ['Zari Woven', 'Embroidered', 'Printed', 'Stone Work', 'Mirror Work', 'Sequins', 'Plain'] }
  ],
  'lehengas': [
    { key: 'Fabric', label: 'Fabric', type: 'multi', options: ['Raw Silk', 'Velvet', 'Net', 'Georgette', 'Organza'] }
  ],
  'men': [
    { key: 'Fabric', label: 'Fabric', type: 'multi', options: ['Silk Blend', 'Cotton', 'Linen', 'Velvet', 'Raw Silk', 'Art Silk', 'Viscose', 'Rayon'] }
  ],
  'kids': [
    { key: 'Age Group', label: 'Age Group', type: 'multi', options: ['2-4 Years', '4-6 Years', '6-8 Years', '8-12 Years', 'Teen'] }
  ]
};


import { Product, ProductVariant } from '../types';

/**
 * Parses a CSV line handling quotes.
 * e.g., "Saree, Red", 100 -> ["Saree, Red", "100"]
 */
const parseCSVLine = (text: string): string[] => {
  const result: string[] = [];
  let cur = '';
  let inQuote = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      inQuote = !inQuote;
    } else if (char === ',' && !inQuote) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur.trim());
  return result.map(val => val.replace(/^"|"$/g, '').replace(/""/g, '"'));
};

/**
 * Converts Raw CSV String to Product Array
 */
export const parseProductsFromCSV = (csvData: string): Product[] => {
  if (!csvData) return [];

  const lines = csvData.split('\n').filter(line => line.trim() !== '');
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map(h => h.trim());
  
  // Helper to safely get value by header name
  const getValue = (row: string[], headerName: string): string => {
    const index = headers.findIndex(h => h.toLowerCase() === headerName.toLowerCase());
    return index !== -1 ? row[index] || '' : '';
  };

  const products: Product[] = lines.slice(1).map(line => {
    const row = parseCSVLine(line);
    
    // Core Data
    const id = getValue(row, 'Handle');
    const title = getValue(row, 'Title');
    const priceRaw = getValue(row, 'Price');
    const price = parseFloat(priceRaw) * 100; // Convert to cents/paisa
    const stock = parseInt(getValue(row, 'Stock')) || 0;
    const thumbnail = getValue(row, 'Image URL');
    const description = getValue(row, 'Description');
    const category = getValue(row, 'Category');

    // Attributes for Searching
    const fabric = getValue(row, 'Fabric');
    const occasion = getValue(row, 'Occasion');
    const color = getValue(row, 'Color');
    const workType = getValue(row, 'Work Type');

    // Construct Variant
    const variant: ProductVariant = {
      id: `v_${id}`,
      title: 'Default',
      sku: id,
      inventory_quantity: stock,
      prices: [{ currency_code: 'inr', amount: price }]
    };

    // Construct Tags for Filtering & Searching
    const tags = [
      { id: `t_${id}_cat`, value: `Category:${category}` },
      { id: `t_${id}_fab`, value: `Fabric:${fabric}` },
      { id: `t_${id}_occ`, value: `Occasion:${occasion}` },
      { id: `t_${id}_col`, value: `Color:${color}` },
      { id: `t_${id}_work`, value: `Work Type:${workType}` }
    ];

    // Construct Metadata
    const metadata = {
      'Dispatch Time': getValue(row, 'Dispatch Time'),
      'Return Eligible': getValue(row, 'Return Eligible'),
      'Description': description
    };

    return {
      id,
      title,
      handle: id,
      description,
      thumbnail,
      status: 'published',
      variants: [variant],
      tags,
      metadata
    };
  });

  return products;
};

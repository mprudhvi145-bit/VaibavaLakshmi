import fs from 'fs';
import path from 'path';
import { Product, ProductVariant } from '../contracts';
import { VALID_SLUGS } from '../config/governance';

// Fallback Data Path
const DATA_PATH = path.resolve('data/MOCK_CATALOG.csv');

export class CatalogLoader {
  private products: Product[] = [];

  constructor() {
    this.loadInitialData();
  }

  public getProducts(): Product[] {
    return this.products;
  }

  public reloadFromCSV(csvContent: string): { success: boolean; count: number; errors: string[] } {
    const result = this.parseCSV(csvContent);
    if (result.errors.length === 0) {
      this.products = result.data;
      console.log(`[CatalogLoader] Reloaded ${this.products.length} products from CSV.`);
      return { success: true, count: this.products.length, errors: [] };
    }
    return { success: false, count: 0, errors: result.errors };
  }

  private loadInitialData() {
    try {
      if (fs.existsSync(DATA_PATH)) {
        const content = fs.readFileSync(DATA_PATH, 'utf-8');
        const result = this.parseCSV(content);
        this.products = result.data;
        console.log(`[CatalogLoader] Initialized with ${this.products.length} products.`);
      } else {
        console.warn(`[CatalogLoader] No initial data found at ${DATA_PATH}`);
      }
    } catch (e) {
      console.error('[CatalogLoader] Failed to load initial data', e);
    }
  }

  private parseCSVLine(text: string): string[] {
    const result: string[] = [];
    let cur = '';
    let inQuote = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') inQuote = !inQuote;
      else if (char === ',' && !inQuote) {
        result.push(cur.trim());
        cur = '';
      } else cur += char;
    }
    result.push(cur.trim());
    return result.map(val => val.replace(/^"|"$/g, '').replace(/""/g, '"'));
  }

  private parseCSV(csvText: string): { data: Product[]; errors: string[] } {
    const lines = csvText.split('\n').filter(l => l.trim() !== '');
    if (lines.length < 2) return { data: [], errors: ['File empty'] };

    const headers = this.parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
    const products: Product[] = [];
    const errors: string[] = [];

    lines.slice(1).forEach((line, idx) => {
      const row = this.parseCSVLine(line);
      const getValue = (key: string) => {
        const i = headers.indexOf(key.toLowerCase());
        return i !== -1 ? row[i] : '';
      };

      const handle = getValue('Handle');
      const title = getValue('Title');
      const category = getValue('Category');
      const price = parseFloat(getValue('Price'));
      const stock = parseInt(getValue('Stock'));

      // Strict Governance Checks
      if (!handle || !title || isNaN(price)) {
        errors.push(`Row ${idx + 2}: Missing mandatory fields (Handle, Title, Price)`);
        return;
      }
      if (!VALID_SLUGS.has(category)) {
        errors.push(`Row ${idx + 2}: Invalid category '${category}'`);
        return;
      }

      const variant: ProductVariant = {
        id: `v_${handle}`,
        title: 'Default',
        sku: handle,
        inventory_quantity: isNaN(stock) ? 0 : stock,
        prices: [{ currency_code: 'inr', amount: price * 100 }] // Convert to cents
      };

      const tags = [
        { id: `t_cat_${handle}`, value: `Category:${category}` },
        { id: `t_fab_${handle}`, value: `Fabric:${getValue('Fabric')}` },
        { id: `t_occ_${handle}`, value: `Occasion:${getValue('Occasion')}` },
        { id: `t_col_${handle}`, value: `Color:${getValue('Color')}` },
        { id: `t_wrk_${handle}`, value: `Work Type:${getValue('Work Type')}` },
      ].filter(t => !t.value.endsWith(':'));

      const metadata = {
        'Dispatch Time': getValue('Dispatch Time'),
        'Return Eligible': getValue('Return Eligible'),
        'Description': getValue('Description')
      };

      products.push({
        id: handle,
        handle,
        title,
        description: getValue('Description'),
        thumbnail: getValue('Image URL'),
        status: 'published',
        variants: [variant],
        tags,
        metadata
      });
    });

    return { data: products, errors };
  }
}

// Singleton Instance
export const catalogLoader = new CatalogLoader();
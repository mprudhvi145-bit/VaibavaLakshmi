
import { VALID_CATEGORY_SLUGS } from '../catalog/categories';
import { ATTRIBUTE_DICTIONARY } from '../catalog/attributes';

export interface ValidationReport {
  validRows: any[];
  errors: string[];
  warnings: string[];
}

export const validateAndImport = (csvText: string): ValidationReport => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const validRows: any[] = [];
  
  const lines = csvText.split('\n').filter(l => l.trim() !== '');
  if (lines.length < 2) return { validRows: [], errors: ['CSV is empty'], warnings: [] };
  
  // Basic CSV Parser
  const headers = lines[0].split(',').map(h => h.trim());
  const parseLine = (text: string) => {
    // Simple regex for CSV parsing handles commas in quotes
    const matches = text.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    return matches ? matches.map(m => m.replace(/^"|"$/g, '')) : text.split(',');
  };

  lines.slice(1).forEach((line, idx) => {
    const rowNum = idx + 2;
    const values = parseLine(line);
    const row: any = {};
    headers.forEach((h, i) => row[h] = values[i]?.trim());
    
    let isRowValid = true;

    // 1. Mandatory Fields
    const required = ['Handle', 'Title', 'Category', 'Price', 'Stock'];
    required.forEach(field => {
       if (!row[field]) {
         errors.push(`Row ${rowNum}: Missing ${field}`);
         isRowValid = false;
       }
    });

    // 2. Category Governance
    if (row['Category'] && !VALID_CATEGORY_SLUGS.has(row['Category'])) {
       errors.push(`Row ${rowNum}: Invalid Category '${row['Category']}'. Check catalog/categories.ts`);
       isRowValid = false;
    }

    // 3. Attribute Governance (Soft Check - Warning)
    // Check Global Attributes
    ATTRIBUTE_DICTIONARY.global.forEach(attr => {
       if (attr.key !== 'Price' && row[attr.key]) {
          const val = row[attr.key];
          // Case insensitive check
          const allowed = attr.options?.map(o => o.toLowerCase());
          if (allowed && !allowed.includes(val.toLowerCase())) {
             warnings.push(`Row ${rowNum}: Value '${val}' for '${attr.key}' is not standard.`);
          }
       }
    });

    if (isRowValid) validRows.push(row);
  });

  return { validRows, errors, warnings };
};

export const transformToProduct = (row: any): any => {
    return {
        id: row['Handle'],
        title: row['Title'],
        handle: row['Handle'],
        thumbnail: row['Image URL'] || '',
        description: row['Description'] || '',
        status: 'published',
        variants: [{
            id: `v_${row['Handle']}`,
            title: 'Default',
            sku: row['Handle'],
            inventory_quantity: parseInt(row['Stock']),
            prices: [{ currency_code: 'inr', amount: parseFloat(row['Price']) * 100 }]
        }],
        tags: [
             { id: `t_cat`, value: `Category:${row['Category']}` },
             { id: `t_fab`, value: `Fabric:${row['Fabric']}` },
             { id: `t_occ`, value: `Occasion:${row['Occasion']}` },
             { id: `t_col`, value: `Color:${row['Color']}` },
             { id: `t_wrk`, value: `Work Type:${row['Work Type']}` },
        ].filter(t => !t.value.endsWith('undefined')),
        metadata: {
            'Dispatch Time': row['Dispatch Time'],
            'Return Eligible': row['Return Eligible']
        }
    };
};

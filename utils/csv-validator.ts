import { ATTRIBUTE_DICTIONARY, CATEGORY_HIERARCHY } from '../constants';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface CSVRow {
  [key: string]: string;
}

// Flatten Category Hierarchy for O(1) Lookup
const VALID_CATEGORIES = new Set<string>();
const traverseCategories = (cats: any[]) => {
  cats.forEach(c => {
    VALID_CATEGORIES.add(c.slug);
    if (c.children) traverseCategories(c.children);
  });
};
traverseCategories(CATEGORY_HIERARCHY);

export const validateProductRow = (row: CSVRow, rowIndex: number): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const linePrefix = `Row ${rowIndex + 1}: `;

  // 1. Mandatory Fields Check
  const requiredFields = ['Handle', 'Title', 'Category', 'Price', 'Stock', 'Image URL'];
  requiredFields.forEach(field => {
    if (!row[field] || row[field].trim() === '') {
      errors.push(`${linePrefix}Missing mandatory field '${field}'`);
    }
  });

  // 2. Category Validation
  if (row['Category'] && !VALID_CATEGORIES.has(row['Category'].trim())) {
    errors.push(`${linePrefix}Invalid Category handle '${row['Category']}'. Must match defined taxonomy.`);
  }

  // 3. Price & Stock Validation
  if (row['Price']) {
    const price = parseFloat(row['Price']);
    if (isNaN(price) || price < 0) errors.push(`${linePrefix}Price must be a positive number.`);
    // Warn if price is suspiciously low (e.g. they entered 100 instead of 10000 for paisa)
    if (price > 0 && price < 100) warnings.push(`${linePrefix}Price is very low (${price}). Ensure currency is correct.`);
  }

  if (row['Stock']) {
    const stock = parseInt(row['Stock']);
    if (isNaN(stock) || stock < 0) errors.push(`${linePrefix}Stock must be a non-negative integer.`);
  }

  // 4. Attribute Validation (Enum Checks)
  const validateEnum = (key: string, value: string | undefined, configKey: string) => {
    if (!value) return; // Skip if empty (unless mandatory, handled below)
    
    // Find config for this attribute
    // Check global first, then specific
    let config = ATTRIBUTE_DICTIONARY.global.find(c => c.key === configKey);
    
    // Logic: If we had category-specific overrides, we'd check them here based on row['Category']
    
    if (config && config.options) {
      // Split multi-values if pipe separated
      const values = value.includes('|') ? value.split('|').map(v => v.trim()) : [value.trim()];
      
      values.forEach(val => {
        // Case-insensitive match check
        const match = config?.options?.find(opt => opt.toLowerCase() === val.toLowerCase());
        if (!match) {
          errors.push(`${linePrefix}Invalid value '${val}' for '${configKey}'. Allowed: ${config?.options?.join(', ')}`);
        }
      });
    }
  };

  validateEnum('Fabric', row['Fabric'], 'Fabric');
  validateEnum('Occasion', row['Occasion'], 'Occasion');
  validateEnum('Color', row['Color'], 'Color');
  validateEnum('Work Type', row['Work Type'], 'Work Type');

  // 5. Image URL Validation
  if (row['Image URL']) {
    if (!row['Image URL'].startsWith('http')) {
      errors.push(`${linePrefix}Image URL must start with http:// or https://`);
    }
  }

  // 6. Handle Format Validation
  if (row['Handle'] && !/^[a-z0-9-]+$/.test(row['Handle'])) {
    errors.push(`${linePrefix}Handle must contain only lowercase letters, numbers, and hyphens (e.g., 'red-silk-saree').`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateBatch = (rows: CSVRow[]): { validRows: CSVRow[], report: string[] } => {
  const report: string[] = [];
  const validRows: CSVRow[] = [];

  rows.forEach((row, index) => {
    const result = validateProductRow(row, index + 1); // +1 because header is 0 index usually handled before
    if (result.isValid) {
      validRows.push(row);
      if (result.warnings.length > 0) {
        report.push(...result.warnings);
      }
    } else {
      report.push(...result.errors);
    }
  });

  return { validRows, report };
};

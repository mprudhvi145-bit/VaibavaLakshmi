/**
 * VAIBAVA LAKSHMI - PRODUCT CSV VALIDATOR
 * ---------------------------------------
 * Usage: node scripts/validate-products.js <path_to_csv>
 * 
 * This script validates product data before it touches the Medusa backend.
 * It checks for:
 * 1. Missing mandatory fields
 * 2. Invalid Category Handles (must match Taxonomy)
 * 3. Strict Attribute Values (Fabric, Occasion, etc.)
 * 4. Data types (Price, Stock)
 * 5. SEO Limits (Warnings)
 * 
 * It uses zero external dependencies.
 */

const fs = require('fs');
const path = require('path');

// --- 1. CONFIGURATION & DICTIONARY ---

const CONFIG = {
  // Allowed Taxonomy (Level 3 Handles)
  ALLOWED_CATEGORIES: new Set([
    'women', 'women-sarees', 'kanchipuram-silk', 'banarasi', 'soft-silk', 'designer-sarees',
    'women-ethnic', 'lehengas', 'gowns', 'salwar-suits', 'kurtis',
    'men', 'men-wedding', 'sherwanis', 'bandhgalas',
    'men-festive', 'kurta-sets', 'nehru-jackets', 'dhoti-sets',
    'wedding-edit', 'bridal-collection', 'muhurtham', 'reception-lehengas',
    'groom-collection', 'wedding-sherwanis', 'safas'
  ]),

  // Strict Enum Values (Case Insensitive logic applied later)
  ENUMS: {
    'Fabric': ['Pure Silk', 'Georgette', 'Chiffon', 'Cotton', 'Organza', 'Crepe', 'Art Silk', 'Raw Silk', 'Velvet'],
    'Occasion': ['Bridal', 'Party', 'Festive', 'Casual', 'Office', 'Reception', 'Engagement'],
    'Work Type': ['Zari Woven', 'Embroidered', 'Hand Painted', 'Stone Work', 'Mirror Work', 'Sequins', 'Plain'],
    'Return Eligible': ['Yes', 'No'],
    'Color': ['Red', 'Pink', 'Gold', 'Blue', 'Green', 'Black', 'Pastel', 'Maroon', 'Mustard', 'Purple', 'Orange']
  },

  // Limits
  SEO_TITLE_MAX: 70,
  SEO_DESC_MAX: 160
};

// --- 2. HELPERS ---

// ANSI Colors for Console
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

/**
 * Robust CSV Line Parser
 * Handles commas inside quotes: "Saree, Red" -> Saree, Red
 */
function parseCSVLine(text) {
  const result = [];
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
  return result.map(val => val.replace(/^"|"$/g, '').replace(/""/g, '"')); // Remove surrounding quotes and unescape
}

function isValidURL(str) {
  return str && (str.startsWith('http://') || str.startsWith('https://'));
}

// --- 3. VALIDATION LOGIC ---

function validateRow(row, rowIndex, headers) {
  const errors = [];
  const warnings = [];
  const linePrefix = `Row ${rowIndex}`;

  // Helper to get value by header name (case insensitive matching for headers)
  const getValue = (key) => {
    const headerKey = headers.find(h => h.toLowerCase() === key.toLowerCase());
    return headerKey ? row[headers.indexOf(headerKey)] : undefined;
  };

  // A. REQUIRED FIELDS
  const required = ['Title', 'Category', 'Fabric', 'Occasion', 'Price', 'Stock', 'Image URL'];
  required.forEach(field => {
    const val = getValue(field);
    if (!val) {
      errors.push({ field, msg: `Missing mandatory field.`, fix: `Enter a value for ${field}.` });
    }
  });

  // B. CATEGORY VALIDATION
  const category = getValue('Category');
  if (category && !CONFIG.ALLOWED_CATEGORIES.has(category)) {
    errors.push({ 
      field: 'Category', 
      msg: `Invalid Handle: "${category}"`, 
      fix: `Must be a valid slug from system (e.g., 'kanchipuram-silk', 'women-sarees').` 
    });
  }

  // C. ENUM VALIDATION
  Object.keys(CONFIG.ENUMS).forEach(key => {
    const val = getValue(key);
    if (val) {
      // Handle multi-values like "Silk|Cotton"
      const parts = val.includes('|') ? val.split('|') : [val];
      const allowed = CONFIG.ENUMS[key].map(v => v.toLowerCase());
      
      parts.forEach(part => {
        if (!allowed.includes(part.trim().toLowerCase())) {
          errors.push({ 
            field: key, 
            msg: `Invalid Value: "${part}"`, 
            fix: `Allowed: ${CONFIG.ENUMS[key].join(', ')}` 
          });
        }
      });
    }
  });

  // D. DATA TYPES
  const price = getValue('Price');
  if (price && (isNaN(parseFloat(price)) || parseFloat(price) <= 0)) {
    errors.push({ field: 'Price', msg: `Invalid Price: "${price}"`, fix: `Must be a number greater than 0.` });
  }

  const stock = getValue('Stock');
  if (stock && (isNaN(parseInt(stock)) || parseInt(stock) < 0)) {
    errors.push({ field: 'Stock', msg: `Invalid Stock: "${stock}"`, fix: `Must be a non-negative integer.` });
  }

  const img = getValue('Image URL');
  if (img && !isValidURL(img)) {
    errors.push({ field: 'Image URL', msg: `Invalid URL`, fix: `Must start with http:// or https://` });
  }

  // E. SEO WARNINGS
  const seoTitle = getValue('SEO Title');
  if (seoTitle && seoTitle.length > CONFIG.SEO_TITLE_MAX) {
    warnings.push({ field: 'SEO Title', msg: `Too Long (${seoTitle.length} chars)`, fix: `Keep under ${CONFIG.SEO_TITLE_MAX} characters.` });
  }
  
  const seoDesc = getValue('SEO Description');
  if (seoDesc && seoDesc.length > CONFIG.SEO_DESC_MAX) {
    warnings.push({ field: 'SEO Description', msg: `Too Long (${seoDesc.length} chars)`, fix: `Keep under ${CONFIG.SEO_DESC_MAX} characters.` });
  }

  return { errors, warnings };
}

// --- 4. MAIN EXECUTION ---

const filePath = process.argv[2];

if (!filePath) {
  console.log(`${colors.red}Error: No file provided.${colors.reset}`);
  console.log(`Usage: node scripts/validate-products.js <path_to_csv>`);
  process.exit(1);
}

try {
  console.log(`${colors.blue}${colors.bold}=== VAIBAVA LAKSHMI DATA VALIDATOR ===${colors.reset}\n`);
  console.log(`Reading file: ${filePath}...`);

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split(/\r?\n/).filter(line => line.trim() !== '');
  
  if (lines.length < 2) {
    throw new Error("CSV file is empty or missing headers.");
  }

  const headers = parseCSVLine(lines[0]);
  let errorCount = 0;
  let warningCount = 0;
  let rowCount = 0;

  console.log(`Analyzing ${lines.length - 1} products...\n`);

  // Print Header for Table
  console.log(`| ${'Row'.padEnd(5)} | ${'Field'.padEnd(15)} | ${'Issue'.padEnd(40)} | ${'Fix'.padEnd(40)} |`);
  console.log(`|${'-'.repeat(7)}+${'-'.repeat(17)}+${'-'.repeat(42)}+${'-'.repeat(42)}|`);

  lines.slice(1).forEach((line, index) => {
    rowCount++;
    const rowValues = parseCSVLine(line);
    const rowMap = rowValues; // parseCSVLine returns array, mapped by headers index
    
    const { errors, warnings } = validateRow(rowMap, index + 2, headers);

    // Print Errors
    errors.forEach(e => {
      errorCount++;
      console.log(`| ${colors.red}${(index + 2).toString().padEnd(5)}${colors.reset} | ${e.field.padEnd(15)} | ${e.msg.padEnd(40)} | ${colors.yellow}${e.fix.padEnd(40)}${colors.reset} |`);
    });

    // Print Warnings
    warnings.forEach(w => {
      warningCount++;
      console.log(`| ${colors.blue}${(index + 2).toString().padEnd(5)}${colors.reset} | ${w.field.padEnd(15)} | ${w.msg.padEnd(40)} | ${w.fix.padEnd(40)} |`);
    });
  });

  console.log(`\n${'-'.repeat(100)}`);
  
  if (errorCount > 0) {
    console.log(`\n${colors.red}${colors.bold}FAILED: Found ${errorCount} Errors and ${warningCount} Warnings.${colors.reset}`);
    console.log(`${colors.red}The CSV contains blocking errors. Do not upload to Medusa.${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`\n${colors.green}${colors.bold}SUCCESS: CSV is Safe to Import!${colors.reset}`);
    if (warningCount > 0) console.log(`${colors.yellow}(${warningCount} warnings found - review if possible)${colors.reset}`);
    process.exit(0);
  }

} catch (err) {
  console.error(`${colors.red}System Error: ${err.message}${colors.reset}`);
  process.exit(1);
}

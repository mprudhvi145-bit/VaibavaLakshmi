/**
 * STANDALONE CSV VALIDATOR SCRIPT
 * Usage: node validate_import.js <path-to-csv>
 * 
 * This script runs the same validation logic as the web admin panel.
 * Useful for operators to check files before attempting upload.
 */

const fs = require('fs');
const path = require('path');

// Mock Constants for Standalone Run
const VALID_CATEGORIES = new Set([
  'women', 'women-sarees', 'kanchipuram-silk', 'banarasi', 'soft-silk', 'designer-sarees',
  'women-ethnic', 'lehengas', 'gowns', 'salwar-suits', 'kurtis',
  'men', 'men-wedding', 'sherwanis', 'bandhgalas',
  'men-festive', 'kurta-sets', 'nehru-jackets', 'dhoti-sets',
  'wedding-edit', 'bridal-collection', 'muhurtham', 'reception-lehengas',
  'groom-collection', 'wedding-sherwanis', 'safas'
]);

const ENUMS = {
    'Fabric': ['Pure Silk', 'Georgette', 'Chiffon', 'Cotton', 'Organza', 'Crepe', 'Art Silk', 'Raw Silk', 'Velvet'],
    'Occasion': ['Bridal', 'Party', 'Festive', 'Casual', 'Office', 'Reception', 'Engagement'],
    'Color': ['Red', 'Pink', 'Gold', 'Blue', 'Green', 'Black', 'Pastel', 'Maroon', 'Mustard', 'Purple', 'Orange'],
    'Work Type': ['Zari Woven', 'Embroidered', 'Hand Painted', 'Stone Work', 'Mirror Work', 'Sequins', 'Plain']
};

function validateRow(row, index) {
    const errors = [];
    const line = `Row ${index + 1}: `;

    // 1. Mandatory
    ['Handle', 'Title', 'Category', 'Price', 'Stock'].forEach(f => {
        if(!row[f]) errors.push(`${line}Missing ${f}`);
    });

    // 2. Category
    if (row['Category'] && !VALID_CATEGORIES.has(row['Category'])) {
        errors.push(`${line}Invalid Category '${row['Category']}'`);
    }

    // 3. Enums
    Object.keys(ENUMS).forEach(key => {
        if(row[key]) {
            const val = row[key];
            const allowed = ENUMS[key].map(v => v.toLowerCase());
            if(!allowed.includes(val.toLowerCase())) {
                errors.push(`${line}Invalid ${key} '${val}'. Allowed: ${ENUMS[key].join(', ')}`);
            }
        }
    });

    // 4. Price
    if(row['Price'] && isNaN(parseFloat(row['Price']))) {
        errors.push(`${line}Price must be a number`);
    }

    return errors;
}

// Main Execution
const filePath = process.argv[2];
if (!filePath) {
    console.error("Please provide a CSV file path.");
    process.exit(1);
}

try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim() !== '');
    const headers = lines[0].split(',').map(h => h.trim());
    
    let totalErrors = 0;

    console.log("Validating...");
    
    lines.slice(1).forEach((line, idx) => {
        const cols = line.split(',');
        const row = {};
        headers.forEach((h, i) => row[h] = cols[i]?.trim());
        
        const rowErrors = validateRow(row, idx + 1);
        if(rowErrors.length > 0) {
            rowErrors.forEach(e => console.error(e));
            totalErrors += rowErrors.length;
        }
    });

    if(totalErrors === 0) {
        console.log("✅ CSV is SAFE to import.");
    } else {
        console.log(`❌ Found ${totalErrors} errors.`);
        process.exit(1);
    }

} catch (e) {
    console.error("Error reading file:", e.message);
}

# Operator Error Playbook

Use this guide when the Bulk Import tool rejects your CSV.

## Common Error Messages

### 1. "Invalid Category handle..."
**Problem:** You used a category name that doesn't exist in the system.
**Fix:** 
- Go to the Storefront > Catalog menu.
- Look at the URL (e.g., `/catalog?cat=women-sarees`).
- Copy the exact slug `women-sarees` into your CSV.
- *Don't use:* "Sarees" or "Women Sarees". Use the exact handle.

### 2. "Invalid value 'Polyester' for 'Fabric'..."
**Problem:** You tried to upload a Fabric type that isn't in our allowed list.
**Fix:** Change it to `Art Silk` or `Synthetic` if available, or ask the Admin to add 'Polyester' to the code dictionary.
**Allowed:** Pure Silk, Georgette, Chiffon, Cotton, Organza, Crepe, Art Silk, Raw Silk, Velvet.

### 3. "Price must be a positive number"
**Problem:** The price column has currency symbols (₹) or commas.
**Fix:** 
- Bad: `₹ 12,000`
- Good: `12000`
- Ensure no spaces or symbols.

### 4. "Handle must contain only lowercase..."
**Problem:** You used spaces or capital letters in the ID.
**Fix:**
- Bad: `Red Silk Saree 001`
- Good: `red-silk-saree-001`

### 5. "Missing mandatory field..."
**Problem:** A required column is empty.
**Fix:** Even if you don't have data, put a placeholder like `-` for text, or `0` for stock (though stock 0 hides the product).

## Pre-Upload Checklist
1. Did you download the **latest template**?
2. Are all Image URLs working? (Paste one in browser to check).
3. are **Category** handles exact matches?
4. Did you save as **CSV (Comma Delimited)**? Excel format (.xlsx) will fail.

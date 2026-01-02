# Operator Guide: Data & Visuals

This guide explains how to populate the store with the provided `MOCK_CATALOG.csv` and how to generate real assets using the AI prompts.

## 1. Importing the Catalog
**File Location:** `data/MOCK_CATALOG.csv`

1.  Open the **Admin Panel** > **Products**.
2.  Click **Bulk Import**.
3.  Copy the *entire content* of `data/MOCK_CATALOG.csv`.
4.  Paste it into the text area in the import modal.
5.  Click **Validate Data**.
6.  If valid, click **Import**.

*Note: The system will automatically create products, variants, and assign categories based on the 'Category' column. It uses Unsplash placeholders for now.*

## 2. Generating Product Images (AI)
The CSV contains three prompt columns hidden in metadata: `Hero Prompt`, `Detail Prompt`, `Lifestyle Prompt`.

**To create real images:**
1.  **Select a Tool:** Use Midjourney (v5+ recommended) or Stable Diffusion XL.
2.  **Copy Prompt:**
    *   Open `data/MOCK_CATALOG.csv` in Excel/Sheets.
    *   Copy the cell under `Hero Prompt` for a product.
    *   *Example:* "Authentic handwoven Kanchipuram silk featuring heavy gold zari temple borders..."
3.  **Generate:** Paste into the AI tool.
    *   *Midjourney:* `/imagine prompt: [PASTE PROMPT] --ar 3:4 --v 5.2`
4.  **Upload:**
    *   Download the best result.
    *   Upload to a host (Cloudinary, S3, or Google Drive).
    *   Update the `Image URL` column in your CSV with this new link.
    *   Re-import to update the storefront.

## 3. Managing "New Arrivals" & "Bestsellers"
The storefront automatically sorts products.
- **New Arrivals:** Based on the `created_at` date (import order).
- **Bestsellers:** You can fake this by editing a product in Admin and adding `Badge: Best Seller` to its metadata.

## 4. Troubleshooting
- **Images not showing?** Ensure the URL ends in `.jpg` or `.png` and is publicly accessible.
- **Wrong Category?** Check the `Category` column matches the slugs in `constants.ts` exactly (e.g., `kanchipuram-silk` not `Kanchipuram`).
- **Filter not working?** Ensure `Color`, `Fabric`, and `Occasion` columns are filled. The filter sidebar relies on these specific tags.

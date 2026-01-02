# One-Person Operator SOP

**Role:** Owner / Operator  
**Goal:** Run the entire store efficiently without engineering help.

---

## 1. Product Upload (Weekly)
**Tools:** CSV File, Admin Panel

1. **Prepare CSV:**
   - Use the `master` template.
   - **IMPORTANT:** Use exact category slugs (e.g., `kanchipuram-silk`, NOT "Silk Saree").
   - **Image URLs:** Must be hosted links (Drive/Dropbox/CDN).
   - **Attributes:** Fill `Fabric`, `Occasion`, `Color` columns for filters to work.

2. **Upload:**
   - Go to `Admin > Products > Bulk Import`.
   - Paste CSV data or upload file.
   - Fix any errors reported by the validator immediately.

3. **Verify:**
   - Go to `Storefront > Catalog`.
   - Filter by "New Arrivals" to see your items.
   - Check if they appear in the correct Category filters.

## 2. Order Fulfillment (Daily)
**Tools:** Admin Panel

1. **Check Orders:**
   - Go to `Admin > Orders`.
   - Filter by `Status: Pending`.

2. **Pack & Ship:**
   - Verify payment (if Prepaid) or call customer (if COD).
   - Click "Print Label" (if integrated) or manually book shipping.
   - Mark as `Fulfilled` in Admin. This triggers the "Shipped" WhatsApp/Email.

## 3. Site Management (Monthly)
**Tools:** Admin Settings

1. **Banners:**
   - The site auto-selects banners based on category names.
   - To change a banner, you (currently) need to ask dev support or update the source image URL if dynamic.
   
2. **Featured Items:**
   - Items with high stock and recent upload date appear first in "New Arrivals".
   - To boost an item, edit it in Admin and set `Metadata > Highlight: true`.

---

## 4. Safety Rules (DO NOT BREAK)
1. **Never rename Category Slugs:** The menu links rely on `women-sarees`, `men-ethnic`, etc. Changing these breaks the site navigation.
2. **Never delete the 'Default' variant:** Every product needs at least one variant to have a price.
3. **Price format:** Always use numbers (e.g., `15000`), never symbols (`₹15,000`) in CSV.

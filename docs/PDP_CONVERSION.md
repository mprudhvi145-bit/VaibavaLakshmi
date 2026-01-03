
# PDP Conversion Specification

**Objective:** Increase add-to-cart rate by minimizing friction and maximizing trust.
**Device Priority:** Mobile First.

---

## 1. Data Requirements
The PDP cannot render without:
- `product.title`
- `product.variants[0].prices`
- `product.thumbnail`
- `product.tags` (Category, Fabric, Occasion)
- `product.metadata` (Dispatch Time, Return Policy)

*Fallback:* If Dispatch/Return metadata is missing, display global defaults: "Dispatch: 2-3 Days", "Returns: 7 Days".

## 2. Layout Structure (Mobile)

### A. Above the Fold (Viewport Height < 800px)
Elements visible without scrolling:
1.  **Image Carousel:** 1:1 Aspect ratio or 3:4. Must support swipe.
2.  **Title:** H1, Serif font, max 2 lines.
3.  **Price:** Bold, prominent.
4.  **Sticky CTA:** "Add to Cart" button must be pinned to bottom of viewport or immediately visible.

### B. The "Buy Box"
Located immediately after price.
1.  **Variant Selector:** Size/Color chips. Large touch targets (min 44px).
2.  **Stock Status:**
    - Low Stock (<5): "Hurry, only X left!" (Red text)
    - In Stock: "Ready to Ship" (Green indicator)
3.  **Primary CTA:** Full width, high contrast color (Brand Primary).

### C. Trust Signal Block (Crucial)
Placed immediately below the CTA.
- Icon + Text format.
- **Authenticity:** "100% Original Silk"
- **Speed:** "Dispatches in 24 Hours"
- **Returns:** "Easy 7-Day Returns"

### D. Product Details
- **Description:** 2-3 short paragraphs.
- **Specification Table:** Key-Value pairs generated from Tags (Fabric, Work Type, Color).

## 3. Interaction Design
- **Image Zoom:** Double tap to zoom on Mobile. Hover zoom on Desktop.
- **Sticky Footer (Mobile):** When user scrolls past the Buy Box, a sticky footer appears with Price + "Add to Bag".
- **Feedback:** On "Add to Cart", show a toast/drawer. Do NOT redirect immediately. Keep user in flow.

## 4. Cross-Sell Strategy
**"Complete the Look"** section at bottom.
- Logic:
    - If Saree -> Show Jewellery.
    - If Lehenga -> Show Dupatta.
    - If Men's Kurta -> Show Mojaris/Stole.

---

## 5. SEO Rules
- **H1:** Product Title
- **Meta Title:** {Title} | Buy Online at Vaibava Lakshmi
- **Meta Description:** Buy {Title} in {Fabric}. Perfect for {Occasion}. Best prices, COD available.
- **Schema:** Product Schema with Price, Availability, and AggregateRating.

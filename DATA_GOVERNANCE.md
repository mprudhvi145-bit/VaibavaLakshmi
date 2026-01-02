# Data Governance & Taxonomy Rules

## 1. Category Hierarchy (Strict)

Operators must classify products into one of these **Level 3** slugs.

| Level 1 | Level 2 | Level 3 (Use this in CSV) |
| :--- | :--- | :--- |
| **Women** | Sarees | `kanchipuram-silk`, `banarasi`, `soft-silk`, `designer-sarees` |
| | Ethnic Wear | `lehengas`, `salwar-suits`, `kurtis` |
| | Accessories | `jewellery`, `dupattas` |
| **Men** | Ethnic Wear | `kurtas`, `kurta-sets`, `sherwanis`, `dhoti-sets` |
| | Festive | `men-festive` |
| **Kids** | Boys | `boys-ethnic` |
| | Girls | `girls-ethnic` |
| **Wedding** | Curated | `the-bride`, `the-groom`, `muhurtham-silks` |

## 2. Product Attributes (Filters)

To ensure filters work on the storefront, map these CSV columns:

- **Fabric:** Silk, Cotton, Georgette, Chiffon, Velvet, Organza.
- **Occasion:** Wedding, Party, Festive, Casual.
- **Color:** Red, Pink, Blue, Green, Yellow, Black, White, Gold.
- **Work Type:** Zari Woven, Embroidered, Printed.

## 3. SEO Standards
- **Product Title:** `{Material} {Work Type} {Category} - {Color}`
  - *Ex:* "Pure Silk Zari Woven Kanchipuram Saree - Red"
- **URL Handles:** Auto-generated from title. valid: `pure-silk-zari-saree-red`.

# Product Data Governance Strategy

## 1. Attribute Dictionary (Global)
These attributes are mapped to **Tags** in Medusa (`Key:Value`).

| Attribute Key | Type | Values (Examples) |
| :--- | :--- | :--- |
| **Category** | Filter | `Sarees`, `Lehengas`, `Men`, `Kids` |
| **Fabric** | Filter | `Silk`, `Georgette`, `Cotton`, `Organza` |
| **Occasion** | Filter | `Wedding`, `Party`, `Festive`, `Casual` |
| **Color** | Filter | `Red`, `Blue`, `Gold`, `Pastel` |
| **Work Type** | Filter | `Zari`, `Embroidered`, `Stone`, `Plain` |

## 2. Category-Specific Attributes
These can be Tags (if filtering is needed) or Metadata (if only for display).

### Sarees
- **Border**: `Big Border`, `No Border` (Tag)
- **Blouse**: `Contrast`, `Running` (Tag)
- **Saree Length**: `6.3m` (Metadata)
- **Blouse Included**: `Yes/No` (Metadata)

### Lehengas
- **Type**: `A-Line`, `Flared` (Tag)
- **Dupatta**: `Single`, `Double` (Metadata)

### Men
- **Fit**: `Regular`, `Slim` (Tag)
- **Sleeve**: `Full`, `Half` (Tag)

## 3. Medusa Data Model Mapping

| Concept | Medusa Entity | Implementation Detail |
| :--- | :--- | :--- |
| **Product Name** | `title` | Main display title. |
| **SKU / ID** | `handle` | URL Slug (e.g., `red-kanchipuram-saree`). |
| **Filters** | `tags` | Stored as `Key:Value` strings. E.g., `Fabric:Silk`. |
| **Details** | `metadata` | JSON object for product specs (Care, Dimensions). |
| **Size** | `variants` | Product Options used strictly for Size (S, M, L). |
| **Stock** | `inventory` | Managed at Variant level. |

## 4. Operator Validation Rules
When uploading via CSV, the system logic in `Products.tsx`:
1.  **Strictly matches** columns to the Attribute Dictionary.
2.  **Auto-prefixes** known columns (Fabric -> `Fabric:Value`).
3.  **Moves** unknown/detail columns to `metadata`.

**Mandatory Fields:**
- Title
- Price
- Stock
- Category (Must match one of `Sarees`, `Lehengas`, `Men`)

## 5. SEO Strategy
- **URL Pattern:** `/catalog?cat=women-sarees`
- **Filtered URL:** `/catalog?cat=women-sarees&fabric=Silk`
- **Breadcrumbs:** `Home > Women > Sarees > Kanchipuram` (Generated from Category Hierarchy).

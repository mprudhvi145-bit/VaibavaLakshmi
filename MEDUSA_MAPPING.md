# CSV to Medusa Schema Mapping

This document defines the strict contract between the Operator CSV and the Medusa Backend.

## 1. Core Fields

| CSV Column | Medusa Entity Field | Type | Required | Transformation Logic |
| :--- | :--- | :--- | :--- | :--- |
| **Handle** | `product.handle` | String | YES | Used as ID. Must be unique, lowercase, dashed (e.g., `red-silk-saree`). |
| **Title** | `product.title` | String | YES | Display name. |
| **Description** | `product.description` | String | NO | HTML allowed but plain text preferred. |
| **Category** | `product.tags` | String | YES | Value stored as `Category:{slug}`. Must match `constants.ts` taxonomy. |
| **Price** | `variant.prices[0].amount` | Float | YES | Multiplied by 100 on import to store as integer (paisa). |
| **Stock** | `variant.inventory_quantity` | Int | YES | Sets stock for the default variant. |
| **Image URL** | `product.thumbnail` | String | YES | Must be a valid http/https URL. |

## 2. Product Attributes (Faceted Search)

These are mapped to **Medusa Tags** for filtering.

| CSV Column | Medusa Tag Format | Validation Rule |
| :--- | :--- | :--- |
| **Fabric** | `Fabric:{Value}` | Must match `ATTRIBUTE_DICTIONARY.global.Fabric`. |
| **Occasion** | `Occasion:{Value}` | Must match `ATTRIBUTE_DICTIONARY.global.Occasion`. |
| **Color** | `Color:{Value}` | Must match `ATTRIBUTE_DICTIONARY.global.Color`. |
| **Work Type** | `Work Type:{Value}` | Must match `ATTRIBUTE_DICTIONARY.global.Work Type`. |

*Note: Multi-select values in CSV should be pipe-separated (e.g., `Silk|Cotton`).*

## 3. Product Specifications (Metadata)

These are stored in `product.metadata` and displayed in the PDP Specification Table.

- `Care Instructions`
- `Dispatch Time`
- `Return Eligible`
- `Saree Length`
- `Blouse Included`
- `Waist Range`

## 4. Variant Strategy
This system uses a **Simplified Flat Model**:
- 1 CSV Row = 1 Product.
- 1 Product = 1 Default Variant (Implicitly created).
- For Sarees, the variant is named "Free Size".
- For Lehengas/Men, duplicate rows logic is **NOT** supported in this strict validator. Create separate products for different styles, or use the Advanced Import tool (not in this operator view).
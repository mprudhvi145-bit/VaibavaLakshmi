# Product Data Strategy & Governance

## 1. Global Attribute Dictionary (Tags)
These attributes enable faceted search and filtering.

| Attribute | Logic | Example Values |
| :--- | :--- | :--- |
| **Category** | `Category:value` | `Sarees`, `Lehengas`, `Men`, `Kids` |
| **Fabric** | `Fabric:value` | `Silk`, `Georgette`, `Cotton`, `Organza` |
| **Occasion** | `Occasion:value` | `Wedding`, `Party`, `Festive`, `Casual` |
| **Color** | `Color:value` | `Red`, `Blue`, `Gold`, `Pastel`, `Multi` |
| **Work Type** | `Work Type:value` | `Zari`, `Embroidered`, `Stone`, `Plain` |

## 2. Category-Specific Metadata (JSON)
These attributes appear in the "Product Specifications" table on the PDP.

### Sarees
- **Border**: `Big Border`, `No Border` (Tag)
- **Blouse**: `Contrast`, `Running` (Tag)
- **Saree Length**: `6.3m` (Metadata)
- **Blouse Included**: `Yes` (Metadata)

### Lehengas
- **Type**: `A-Line`, `Flared` (Tag)
- **Dupatta**: `Single`, `Double` (Metadata)

### Men
- **Fit**: `Regular`, `Slim` (Tag)
- **Sleeve**: `Full`, `Half` (Tag)
- **Set Type**: `Kurta Only`, `Kurta Pajama` (Tag)

## 3. Search & Recommendation Logic

### Search Weighting
1.  **Title Match**: High Priority (100%)
2.  **Category Tag**: Medium Priority (80%)
3.  **Fabric Tag**: Medium Priority (60%)
4.  **Description**: Low Priority (20%)

*Example:* Searching "Red Silk Saree" matches `Color:Red` + `Fabric:Silk` + `Category:Sarees`.

### Recommendations (PDP)
- **Similar Products**: Query products with matching `Category` AND `Fabric`.
- **Complete the Look**:
    - If Saree -> Suggest Jewelry.
    - If Men's Kurta -> Suggest Mojaris (Shoes).

## 4. Festival Collection Engine
Automatic collections based on Tag Rules.

- **The Royal Bride**: `Occasion:Bridal` + `Fabric:Silk`
- **Diwali Edit**: `Occasion:Festive` + `Work Type:Zari`
- **Haldi Ceremony**: `Color:Yellow` + `Occasion:Festive`

## 5. Operator Safety Rules
- **Mandatory Fields**: Title, Price, Stock, Category, Fabric, Occasion, Color.
- **Validation**: System checks for empty mandatory columns during CSV import.
- **Defaulting**: If `SKU` is missing, auto-generate `SKU-{RANDOM}`.

## 6. Sample CSV Data (Copy & Paste to Import)

```csv
Handle,Title,Description,Category,Price,Stock,Image URL,Fabric,Occasion,Color,Work Type,Care Instructions,Dispatch Time,Return Eligible,Saree Length,Blouse Included,Border
red-kanchi-001,Royal Red Kanchipuram Saree,Handwoven pure silk with gold zari.,women-sarees,15000,5,https://source.unsplash.com/random?saree,Pure Silk,Wedding,Red,Zari Woven,Dry Clean Only,24 Hours,No,6.3m,Yes,Big Border
blue-georgette-002,Navy Blue Banarasi Georgette,Lightweight party wear saree.,women-sarees,8500,10,https://source.unsplash.com/random?blue-saree,Georgette,Party,Blue,Embroidered,Dry Clean Only,2-3 Days,Yes,6.3m,Yes,Zari Border
pink-lehenga-003,Blush Pink Bridal Lehenga,Heavy embroidery with double dupatta.,lehengas,25000,2,https://source.unsplash.com/random?lehenga,Raw Silk,Bridal,Pink,Stone Work,Dry Clean Only,7 Days,No,,,
men-kurta-004,Cream Silk Kurta Set,Classic festive wear for men.,men-festive,4500,15,https://source.unsplash.com/random?kurta,Silk,Festive,Cream,Plain,Dry Clean Only,24 Hours,Yes,,,
```
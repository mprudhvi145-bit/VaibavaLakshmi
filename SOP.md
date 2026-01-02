# Operator SOP (Standard Operating Procedure)

**Role:** Fulfillment Operator  
**Tools:** Medusa Admin Dashboard, Label Printer, Barcode Scanner

---

## 1. Morning Routine (09:00 - 10:00)

### A. Review New Orders
1. **Navigate**: Admin > Orders
2. **Filter**: Status = `Pending`
3. **Action**:
   - Check Payment Status:
     - `Captured`: Proceed to pack.
     - `Awaiting`: Call customer to confirm COD.
   - If confirmed, select order -> `Create Fulfillment`.

### B. Shipping Label Generation
1. **Navigate**: Admin > Shipping (Custom Tab)
2. **Action**: Click "Sync Orders with Shiprocket".
3. **System Process**:
   - Calls `POST /admin/custom/ship-order`.
   - Backend `ShiprocketService` creates order on Shiprocket.
   - Updates Medusa Order metadata with `shiprocket_id`.
4. **Print**: Click "Print Label" (Opens PDF from Shiprocket).

---

## 2. Inventory Management (14:00 - 15:00)

### A. Bulk Restock
1. **Navigate**: Admin > Products
2. **Action**: Click "Bulk Import".
3. **Input**: Upload CSV (`SKU`, `Stock`, `Price`).
4. **System Process**:
   - Uploads to `import-jobs` queue (Redis).
   - Background worker parses CSV.
   - Updates `product_variant` table in Postgres.
5. **Verify**: Check notification bell for "Import Complete".

---

## 3. End of Day (18:00)

### A. Handover
1. Mark all packed orders as `Shipped` in Admin.
2. **System Process**: `OrderWorkflowSubscriber` triggers WhatsApp notification `order_shipped` to customer.

### B. Exception Check
1. **Navigate**: Admin > Orders > Filter: `Requires Action`.
2. Resolve failed payments or address errors.

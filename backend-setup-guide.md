# VaibavaLakshmi Backend Setup (Medusa)

This frontend expects a standard Medusa server running on `http://localhost:9000`.

## 1. Initial Setup
```bash
npm install -g @medusajs/medusa-cli
medusa new medusa-backend --seed
cd medusa-backend
npm install axios dotenv
```

## 2. Shiprocket Service (`src/services/shiprocket.js`)
Create this file to handle logic.

```javascript
import { BaseService } from "medusa-interfaces"
import axios from "axios"

class ShiprocketService extends BaseService {
  constructor() {
    super()
    this.token = null
    this.email = process.env.SHIPROCKET_EMAIL
    this.password = process.env.SHIPROCKET_PASSWORD
  }

  async login() {
    const response = await axios.post("https://apiv2.shiprocket.in/v1/external/auth/login", {
      email: this.email,
      password: this.password
    })
    this.token = response.data.token
    return this.token
  }

  async createOrder(order) {
    if (!this.token) await this.login()
    
    // Map Medusa Order to Shiprocket Payload
    const payload = {
      order_id: order.display_id,
      order_date: order.created_at,
      pickup_location: "Primary",
      billing_customer_name: order.shipping_address.first_name,
      billing_last_name: order.shipping_address.last_name,
      billing_address: order.shipping_address.address_1,
      billing_city: order.shipping_address.city,
      billing_pincode: order.shipping_address.postal_code,
      billing_state: "Telangana", // Simplify for example
      billing_country: "India",
      billing_email: order.email,
      billing_phone: order.shipping_address.phone,
      shipping_is_billing: true,
      order_items: order.items.map(i => ({
        name: i.title,
        sku: i.variant.sku,
        units: i.quantity,
        selling_price: i.unit_price / 100
      })),
      payment_method: "Prepaid",
      sub_total: order.total / 100,
      length: 10, breadth: 10, height: 10, weight: 0.5
    }

    const res = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", 
      payload, 
      { headers: { Authorization: `Bearer ${this.token}` } }
    )
    
    return res.data
  }
}

export default ShiprocketService
```

## 3. Custom Admin Route (`src/api/admin/shiprocket/label/route.js`)
Expose the service to the frontend.

```javascript
export async function POST(req, res) {
  const { orderId } = req.body
  const shiprocketService = req.scope.resolve("shiprocketService")
  const orderService = req.scope.resolve("orderService")

  const order = await orderService.retrieve(orderId, { relations: ["items", "shipping_address"] })
  const result = await shiprocketService.createOrder(order)

  // Update order metadata with tracking
  await orderService.update(orderId, {
    metadata: {
      shiprocket_order_id: result.order_id,
      shipment_id: result.shipment_id
    }
  })

  res.json({ status: "success", data: result })
}
```

## 4. Notifications Subscriber (`src/subscribers/order-notifier.js`)
Listen for events and send WhatsApp via simple webhook.

```javascript
class OrderNotifierSubscriber {
  constructor({ eventBusService, orderService }) {
    this.orderService_ = orderService
    eventBusService.subscribe("order.placed", this.handleOrderPlaced)
  }

  handleOrderPlaced = async (data) => {
    const order = await this.orderService_.retrieve(data.id)
    // Send to WhatsApp API (e.g., Interakt/WATI)
    console.log(`Sending WhatsApp to ${order.shipping_address.phone} for Order #${order.display_id}`)
  }
}
export default OrderNotifierSubscriber
```

## 5. Dockerfile
```dockerfile
FROM node:16-alpine
WORKDIR /app/medusa
COPY package.json .
RUN npm install
COPY . .
RUN npm run build
CMD ["medusa", "start"]
```

import axios, { AxiosInstance } from "axios";
import AuditService from "./audit";

// Shim for TransactionBaseService as it's not exported correctly in this environment
class BaseService {
  protected manager_: any;
  protected transactionManager_: any;
  protected container_: any;

  constructor(container) {
    this.container_ = container;
    this.manager_ = container.manager;
  }

  withTransaction(transactionManager) {
    if (!transactionManager) {
      return this;
    }
    const cloned = new (this.constructor as any)({
      ...this.container_,
      manager: transactionManager,
    });
    cloned.transactionManager_ = transactionManager;
    cloned.manager_ = transactionManager;
    return cloned;
  }

  protected async atomicPhase_(work: (manager: any) => Promise<any>) {
    if (this.transactionManager_) {
      return work(this.transactionManager_);
    } else {
      return this.manager_.transaction(async (m) => work(m));
    }
  }
}

class ShiprocketService extends BaseService {
  private axiosClient: AxiosInstance;
  private token: string | null = null;
  private orderService: any;
  private auditService: AuditService;

  constructor(container) {
    super(container);
    this.orderService = container.orderService;
    this.auditService = container.auditService; // Dependency Injection
    this.axiosClient = axios.create({
      baseURL: "https://apiv2.shiprocket.in/v1/external",
      timeout: 10000 // 10s Timeout for safety
    });
  }

  async login(): Promise<string> {
    try {
      const response = await this.axiosClient.post("/auth/login", {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      });
      this.token = response.data.token;
      return this.token;
    } catch (error) {
      await this.auditService.logFailure("SHIPROCKET_AUTH", error, "SYSTEM");
      throw new Error("Shiprocket Login Failed: " + error.message);
    }
  }

  private async getHeaders() {
    if (!this.token) await this.login();
    return { Authorization: `Bearer ${this.token}` };
  }

  async createShipment(orderId: string): Promise<any> {
    return (this as any).atomicPhase_(async (manager) => {
      const order = await this.orderService.withTransaction(manager).retrieve(orderId, {
        relations: ["items", "shipping_address", "billing_address", "customer"],
      });

      if (!order) throw new Error("Order not found");

      // 1. Idempotency Check
      if (order.metadata?.shiprocket_order_id) {
        console.warn(`[Shiprocket] Shipment already exists for order ${order.display_id}`);
        return { 
          status: "exists", 
          shiprocket_order_id: order.metadata.shiprocket_order_id 
        };
      }

      // 2. Payload Mapping (Standard)
      const payload = {
        order_id: order.display_id,
        order_date: order.created_at,
        pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || "Primary",
        billing_customer_name: order.shipping_address.first_name,
        billing_last_name: order.shipping_address.last_name,
        billing_address: order.shipping_address.address_1,
        billing_city: order.shipping_address.city,
        billing_pincode: order.shipping_address.postal_code,
        billing_state: "Telangana",
        billing_country: "India",
        billing_email: order.email,
        billing_phone: order.shipping_address.phone,
        shipping_is_billing: true,
        order_items: order.items.map((item) => ({
          name: item.title,
          sku: item.variant.sku || "SKU-DEFAULT",
          units: item.quantity,
          selling_price: item.unit_price / 100,
        })),
        payment_method: "Prepaid",
        sub_total: order.total / 100,
        length: 30, breadth: 20, height: 5, weight: 0.5 
      };

      try {
        const headers = await this.getHeaders();
        const response = await this.axiosClient.post("/orders/create/adhoc", payload, { headers });
        
        // 3. State Update & Audit
        await this.orderService.withTransaction(manager).update(orderId, {
          metadata: {
            shiprocket_order_id: response.data.order_id,
            shiprocket_shipment_id: response.data.shipment_id,
            tracking_status: 'AWB Assigned'
          }
        });

        await this.auditService.withTransaction(manager).log(
            "SHIPMENT_CREATED", 
            "SYSTEM", 
            orderId, 
            "info", 
            { provider: "shiprocket", remote_id: response.data.order_id }
        );

        return response.data;
      } catch (error) {
        // 4. Failure Logging
        await this.auditService.withTransaction(manager).logFailure("SHIPROCKET_CREATE", error, orderId);
        throw new Error("Shiprocket Create Order Failed: " + (error.response?.data?.message || error.message));
      }
    });
  }

  async generateLabel(shipmentId: string): Promise<string> {
    try {
        const headers = await this.getHeaders();
        const response = await this.axiosClient.post("/courier/generate/awb", { shipment_id: [shipmentId] }, { headers });
        return response.data.awb_assign_status ? response.data.response.data.awb_code : null;
    } catch (e) {
        await this.auditService.logFailure("SHIPROCKET_LABEL", e, shipmentId);
        throw e;
    }
  }
}

export default ShiprocketService;
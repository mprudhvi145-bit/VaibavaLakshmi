
import { EntityManager } from "typeorm";
import { Order, OrderStatus, LineItem } from "../models/order";
import { catalogLoader } from "../loaders/catalog.loader";
import AuditService from "./audit";
import { NotificationService } from "./notification.service";

export class OrderService {
  private manager: EntityManager;
  private auditService: AuditService;
  private notificationService: NotificationService;

  constructor(container: any) {
    this.manager = container.manager;
    this.auditService = container.auditService || new AuditService({ manager: this.manager });
    this.notificationService = new NotificationService({ manager: this.manager });
  }

  // --- 1. CART VALIDATION & CALCULATION ---
  async validateCart(items: any[]) {
    let subtotal = 0;
    const validItems = [];

    for (const item of items) {
      const product = catalogLoader.getProducts().find(p => p.id === item.variant.sku); 
      
      if (!product) {
        throw new Error(`Product ${item.title} is no longer available.`);
      }

      const price = product.variants[0].prices[0].amount;
      const total = price * item.quantity;
      
      subtotal += total;
      
      validItems.push({
        ...item,
        unit_price: price,
        total: total,
        sku: product.variants[0].sku || product.id
      });
    }

    const shipping = subtotal > 1000000 ? 0 : 15000;
    const tax = Math.round(subtotal * 0.05); 
    const total = subtotal + shipping + tax;

    return { items: validItems, subtotal, shipping, tax, total };
  }

  // --- 2. ORDER CREATION ---
  async createOrder(cartPayload: any, paymentDetails: any) {
    const orderResult = await this.manager.transaction(async (transactionManager) => {
      const calculation = await this.validateCart(cartPayload.items);

      const order = transactionManager.create(Order, {
        email: cartPayload.email,
        customer: cartPayload.customer,
        shipping_address: cartPayload.shipping_address,
        subtotal: calculation.subtotal,
        shipping_total: calculation.shipping,
        tax_total: calculation.tax,
        total: calculation.total,
        status: OrderStatus.PAID, 
        payment_provider: 'simulated_gateway',
        payment_transaction_id: paymentDetails.id,
      });

      const savedOrder = await transactionManager.save(order);

      const lineItems = calculation.items.map(i => transactionManager.create(LineItem, {
        title: i.title,
        sku: i.sku,
        quantity: i.quantity,
        unit_price: i.unit_price,
        total: i.total,
        thumbnail: i.thumbnail,
        order: savedOrder
      }));

      await transactionManager.save(lineItems);
      
      // Audit
      await new AuditService({ manager: transactionManager }).log(
          "ORDER_CREATED", "SYSTEM", savedOrder.id, "info", { total: savedOrder.total }
      );

      return { ...savedOrder, items: lineItems };
    });

    // Notify (Outside Transaction to prevent blocking/rollback)
    // We use the raw order object, ensure relations if needed in future, but current payload is sufficient
    this.notificationService.notifyOrderPlaced(orderResult as any);

    return orderResult;
  }

  // --- 3. MANAGEMENT API ---

  async getAllOrders(status?: string) {
    const where = status && status !== 'all' ? { status: status as OrderStatus } : {};
    return await this.manager.find(Order, { 
      where,
      relations: ["items"], 
      order: { created_at: "DESC" } 
    });
  }

  async getOrder(id: string) {
    return await this.manager.findOne(Order, {
      where: { id },
      relations: ["items"]
    });
  }

  async markAsPacked(orderId: string, actorId: string) {
    const order = await this.getOrder(orderId);
    if (!order) throw new Error("Order not found");
    if (order.status !== OrderStatus.PAID) throw new Error(`Cannot pack order in state: ${order.status}`);

    order.status = OrderStatus.PACKED;
    await this.manager.save(order);
    
    await this.auditService.log("ORDER_PACKED", actorId, orderId, "info");
    return order;
  }

  async shipOrder(orderId: string, carrier: string, trackingNumber: string, actorId: string) {
    const order = await this.getOrder(orderId);
    if (!order) throw new Error("Order not found");
    
    if (order.status !== OrderStatus.PACKED && order.status !== OrderStatus.PAID) {
        throw new Error(`Cannot ship order in state: ${order.status}`);
    }

    order.status = OrderStatus.SHIPPED;
    order.fulfillment_provider = carrier;
    order.tracking_number = trackingNumber;
    order.shipped_at = new Date();
    
    await this.manager.save(order);
    
    await this.auditService.log("ORDER_SHIPPED", actorId, orderId, "info", { carrier, trackingNumber });
    
    // Notify
    this.notificationService.notifyOrderShipped(order);

    return order;
  }

  async cancelOrder(orderId: string, reason: string, actorId: string) {
    const order = await this.getOrder(orderId);
    if (!order) throw new Error("Order not found");
    if ([OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.CANCELED].includes(order.status)) {
        throw new Error(`Cannot cancel order in state: ${order.status}`);
    }

    order.status = OrderStatus.CANCELED;
    await this.manager.save(order);
    
    await this.auditService.log("ORDER_CANCELED", actorId, orderId, "warning", { reason });

    // Notify
    this.notificationService.notifyOrderCanceled(order, reason);

    return order;
  }
}

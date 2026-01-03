
import { EntityManager } from "typeorm";
import { NotificationLog, NotificationChannel, NotificationStatus } from "../models/notification-log";
import { Order } from "../models/order";
import { WhatsAppProvider } from "../providers/whatsapp.provider";

export class NotificationService {
  private manager: EntityManager;
  private whatsapp: WhatsAppProvider;

  constructor(container: any) {
    this.manager = container.manager;
    this.whatsapp = new WhatsAppProvider();
  }

  // --- TRIGGERS ---

  async notifyOrderPlaced(order: Order) {
    const params = [order.customer.first_name, order.display_id.toString(), (order.total / 100).toString()];
    this.dispatchSafe(order.id, order.shipping_address.phone, NotificationChannel.WHATSAPP, 'order_placed', params);
    // Add Email dispatch logic here if needed
  }

  async notifyOrderShipped(order: Order) {
    const params = [order.customer.first_name, order.display_id.toString(), order.fulfillment_provider || 'Courier', order.tracking_number || 'N/A'];
    this.dispatchSafe(order.id, order.shipping_address.phone, NotificationChannel.WHATSAPP, 'order_shipped', params);
  }

  async notifyOrderCanceled(order: Order, reason: string) {
    const params = [order.customer.first_name, order.display_id.toString()];
    this.dispatchSafe(order.id, order.shipping_address.phone, NotificationChannel.WHATSAPP, 'order_canceled', params);
  }

  // --- CORE LOGIC ---

  private async dispatchSafe(orderId: string, recipient: string, channel: NotificationChannel, templateId: string, payload: any) {
    // Non-blocking fire-and-forget wrapper
    this.dispatch(orderId, recipient, channel, templateId, payload).catch(err => {
        console.error(`[Notification] Critical Dispatch Error:`, err);
    });
  }

  async dispatch(orderId: string, recipient: string, channel: NotificationChannel, templateId: string, payload: any) {
    const log = this.manager.create(NotificationLog, {
      order_id: orderId,
      recipient,
      channel,
      template_id: templateId,
      payload,
      status: NotificationStatus.PENDING
    });
    await this.manager.save(log);

    try {
      if (channel === NotificationChannel.WHATSAPP) {
        await this.whatsapp.sendTemplate(recipient, templateId, payload);
      } else {
        // Email Stub
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      log.status = NotificationStatus.SUCCESS;
      await this.manager.save(log);
    } catch (e) {
      log.status = NotificationStatus.FAILED;
      log.error_message = e.message;
      await this.manager.save(log);
    }
  }

  async retry(logId: string) {
    const log = await this.manager.findOne(NotificationLog, { where: { id: logId } });
    if (!log) throw new Error("Log not found");

    log.retry_count += 1;
    await this.manager.save(log);
    
    // Re-dispatch using stored data
    await this.dispatch(log.order_id, log.recipient, log.channel, log.template_id, log.payload);
  }

  async getLogs() {
    return await this.manager.find(NotificationLog, { order: { created_at: "DESC" }, take: 100 });
  }
}

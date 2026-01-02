import axios from "axios";
import AuditService from "./audit";

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
}

class NotificationService extends BaseService {
  private auditService: AuditService;

  constructor(container) {
    super(container);
    this.auditService = container.auditService;
  }

  async sendWhatsApp(phone: string, templateName: string, params: string[]) {
    const url = process.env.WHATSAPP_API_URL;
    const key = process.env.WHATSAPP_API_KEY;

    if (!url || !key) {
        console.warn("WhatsApp credentials missing");
        return;
    }

    try {
      await axios.post(url, {
        phoneNumber: phone,
        template: templateName,
        params: params
      }, {
        headers: { Authorization: `Bearer ${key}` },
        timeout: 5000
      });
      
      await this.auditService.log("WHATSAPP_SENT", "SYSTEM", phone, "info", { template: templateName });
    } catch (e) {
      await this.auditService.logFailure("WHATSAPP_SEND", e, phone);
      // In a real system, we would push this to a Redis Queue for retry
    }
  }

  async sendEmail(to: string, subject: string, body: string) {
    // Email logic stub
  }
}

export default NotificationService;
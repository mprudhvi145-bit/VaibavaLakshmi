import { AuditLog } from "../models/audit-log";
import { EntityManager } from "typeorm";

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

class AuditService extends BaseService {
  constructor(container) {
    super(container);
  }

  async log(
    action: string, 
    actor_id: string, 
    resource_id: string, 
    level: "info" | "warning" | "error" | "critical" = "info", 
    metadata: any = {}
  ): Promise<AuditLog> {
    const manager = this.transactionManager_ || this.manager_;
    const auditRepo = manager.getRepository(AuditLog);
    
    const log = auditRepo.create({
      action,
      actor_id,
      resource_id,
      level,
      metadata,
      ip_address: "0.0.0.0" // In real middleware, extract from request context
    });

    return await auditRepo.save(log);
  }

  async logFailure(source: string, error: Error, resourceId: string) {
    console.error(`[${source}] Failure:`, error);
    return this.log(
      `${source}_FAILURE`, 
      "SYSTEM", 
      resourceId, 
      "error", 
      { message: error.message, stack: error.stack }
    );
  }
}

export default AuditService;
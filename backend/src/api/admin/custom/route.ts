import { Request, Response } from "express";
import ShiprocketService from "../../../services/shiprocket";
import { EntityManager } from "typeorm";

type MedusaRequest = Request & { scope: any };

// POST /admin/custom/ship-order
export async function POST(req: Request, res: Response) {
  const { order_id } = (req as any).body;
  const mReq = req as MedusaRequest;
  
  const shiprocketService: ShiprocketService = mReq.scope.resolve("shiprocketService");
  const manager: EntityManager = mReq.scope.resolve("manager");

  try {
    const result = await manager.transaction(async (transactionManager) => {
      return await (shiprocketService as any).withTransaction(transactionManager).createShipment(order_id);
    });
    
    (res as any).status(200).json({ 
      status: "success", 
      message: "Shipment created successfully", 
      data: result 
    });
  } catch (err) {
    (res as any).status(400).json({ status: "error", message: err.message });
  }
}

// POST /admin/custom/bulk-import
export async function bulkImportRoute(req: Request, res: Response) {
    const mReq = req as MedusaRequest;
    // This would typically accept a file upload or large JSON
    // And offload processing to a BullMQ/Redis job
    const jobService = mReq.scope.resolve("jobService"); // Custom service
    await jobService.create("product-import", (req as any).body?.products);
    
    (res as any).json({ status: "queued", message: "Import job started" });
}
import { Router } from "express";
import { adminRateLimit, safeModeMiddleware, rbacMiddleware } from "./middlewares/security";
import { getConfigFile } from "medusa-core-utils";
import cors from "cors";

export default (rootDirectory: string): Router | Router[] => {
  const router = Router();

  const { configModule } = getConfigFile(rootDirectory, "medusa-config") as any;
  const { projectConfig } = configModule;

  const corsOptions = {
    origin: projectConfig.admin_cors.split(","),
    credentials: true,
  };

  // 1. Health Check (Monitoring)
  router.get("/health", (req, res) => {
    res.status(200).json({ 
        status: "ok", 
        timestamp: new Date().toISOString(),
        uptime: (process as any).uptime() 
    });
  });

  // 2. Apply Security Middlewares to Admin
  router.use("/admin", cors(corsOptions));
  router.use("/admin", adminRateLimit as any);
  router.use("/admin", safeModeMiddleware);
  router.use("/admin", rbacMiddleware);

  return router;
};
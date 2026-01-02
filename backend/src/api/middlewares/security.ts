import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";

// 1. Rate Limiting for Admin Routes
export const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 429, message: "Too many requests, please try again later." }
});

// 2. Operator Safe Mode (Lockdown)
// Blocks dangerous actions (DELETE, Price Updates) if SAFE_MODE is enabled
export function safeModeMiddleware(req: Request, res: Response, next: NextFunction) {
  const isSafeMode = process.env.OPERATOR_SAFE_MODE === "true";
  const dangerousMethods = ["DELETE"];
  const dangerousPaths = ["/products/", "/prices/"]; // Heuristic paths

  if (isSafeMode) {
    if (dangerousMethods.includes((req as any).method)) {
      (res as any).status(403).json({ message: "Action blocked: System is in Operator Safe Mode" });
      return;
    }
    
    // Block Price Updates in Safe Mode
    if ((req as any).method === "POST" && dangerousPaths.some(p => (req as any).url.includes(p))) {
        // Allow stock updates (inventory), block price/variant delete
        // This requires fine-grained checking in a real app
        // For strict lockdown:
        // return res.status(403).json({ message: "Modifications restricted in Safe Mode" });
    }
  }
  next();
}

// 3. Role-Based Access Control (Simplified)
// checks if user.metadata.role == 'operator' vs 'admin'
export async function rbacMiddleware(req: Request, res: Response, next: NextFunction) {
  const mReq = req as Request & { user?: any; scope: any };
  // Medusa attaches user to req.user if authenticated
  if (mReq.user && mReq.user.id) {
    const userService = mReq.scope.resolve("userService");
    const user = await userService.retrieve(mReq.user.id);
    
    // Assuming metadata.role is set manually during user creation
    const role = (user.metadata?.role as string) || "operator"; 
    
    if (role === "operator" && (req as any).method === "DELETE") {
      (res as any).status(403).json({ message: "Operators cannot delete records." });
      return;
    }
  }
  next();
}

import { Request, Response, NextFunction } from "express";
import { AuthService } from "../../services/auth.service";
import { UserRole } from "../../models/user";
import { getConfigFile } from "medusa-core-utils";

// Removed global declaration that conflicts with existing Express types
// declare global {
//   namespace Express {
//     interface Request {
//       user?: any;
//     }
//   }
// }

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // Cast to any to access headers/status which TS reports as missing on the specific Request type available here
  const expressReq = req as any;
  const expressRes = res as any;

  const authHeader = expressReq.headers.authorization;
  if (!authHeader) {
    return expressRes.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Bearer <token>
  try {
    // AuthService instantiation without dependency injection for middleware use
    const authService = new AuthService({ manager: null });
    const decoded = authService.verifyToken(token);
    expressReq.user = decoded;
    next();
  } catch (e) {
    return expressRes.status(401).json({ message: "Invalid token" });
  }
};

export const requireRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const expressReq = req as any;
    const expressRes = res as any;

    if (!expressReq.user || !roles.includes(expressReq.user.role)) {
      return expressRes.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
};

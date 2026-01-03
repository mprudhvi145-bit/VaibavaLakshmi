
import { User, UserRole } from "../models/user";
import { compare, hash } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import { EntityManager } from "typeorm";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_do_not_use_in_prod";
const SALT_ROUNDS = 10;

export class AuthService {
  private manager: EntityManager;

  constructor(container: any) {
    this.manager = container.manager;
  }

  // Seeding the initial owner if no users exist
  async seedInitialUser() {
    const count = await this.manager.count(User);
    if (count === 0) {
      console.log("[Auth] Seeding initial OWNER account...");
      const hashedPassword = await hash("admin123", SALT_ROUNDS);
      const user = this.manager.create(User, {
        email: "admin@vaibava.com",
        password_hash: hashedPassword,
        full_name: "System Owner",
        role: UserRole.OWNER,
        is_active: true
      });
      await this.manager.save(user);
    }
  }

  async login(email: string, pass: string) {
    const user = await this.manager.findOne(User, { 
      where: { email }, 
      select: ["id", "email", "password_hash", "role", "full_name", "is_active"] 
    });

    if (!user) throw new Error("Invalid credentials");
    if (!user.is_active) throw new Error("Account disabled");

    const valid = await compare(pass, user.password_hash);
    if (!valid) throw new Error("Invalid credentials");

    // Update stats
    user.last_login_at = new Date();
    await this.manager.save(user);

    // Generate Token
    const token = sign(
      { id: user.id, role: user.role, email: user.email, name: user.full_name },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    return { token, user: { id: user.id, email: user.email, role: user.role, name: user.full_name } };
  }

  verifyToken(token: string) {
    try {
      return verify(token, JWT_SECRET);
    } catch (e) {
      throw new Error("Invalid or expired token");
    }
  }
}

import { BaseEntity, Column, Entity, Index, PrimaryColumn, CreateDateColumn, UpdateDateColumn, BeforeInsert } from "typeorm";

// Simple ID generator if ulid not available, though usually present in Medusa envs.
// Using Math.random for fallback in strict environment without dependencies list access.
function generateId() {
    return 'audit_' + Math.random().toString(36).substr(2, 9);
}

@Entity()
export class AuditLog extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at: Date;

  @Index()
  @Column()
  action: string;

  @Index()
  @Column()
  actor_id: string; // User ID or 'SYSTEM'

  @Column()
  resource_id: string; // Order ID, Product ID

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, unknown>;

  @Column({ default: "info" })
  level: "info" | "warning" | "error" | "critical";

  @Column({ nullable: true })
  ip_address: string;

  @BeforeInsert()
  private beforeInsert(): void {
    if (!this.id) {
        this.id = generateId();
    }
  }
}
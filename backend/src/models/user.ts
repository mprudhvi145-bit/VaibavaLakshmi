
import { BaseEntity, Column, Entity, PrimaryColumn, CreateDateColumn, UpdateDateColumn, BeforeInsert } from "typeorm";

export enum UserRole {
  OWNER = 'owner',
  OPERATOR = 'operator',
  VIEWER = 'viewer'
}

@Entity()
export class User extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false }) // Do not return password by default
  password_hash: string;

  @Column()
  full_name: string;

  @Column({
    type: "text", // Using text for simplicity, typically enum in postgres
    default: UserRole.VIEWER
  })
  role: UserRole;

  @Column({ default: true })
  is_active: boolean;

  @Column({ nullable: true })
  last_login_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @BeforeInsert()
  private beforeInsert(): void {
    if (!this.id) {
        this.id = 'usr_' + Math.random().toString(36).substr(2, 9);
    }
  }
}

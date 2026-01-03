
import { BaseEntity, Column, Entity, PrimaryColumn, CreateDateColumn, BeforeInsert, Index } from "typeorm";

export enum NotificationChannel {
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
  SMS = 'sms'
}

export enum NotificationStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending'
}

@Entity()
export class NotificationLog extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Index()
  @Column()
  order_id: string;

  @Column()
  recipient: string;

  @Column({ type: "text" })
  channel: NotificationChannel;

  @Column()
  template_id: string;

  @Column({ type: "jsonb", nullable: true })
  payload: any;

  @Column({ type: "text", default: NotificationStatus.PENDING })
  status: NotificationStatus;

  @Column({ type: "text", nullable: true })
  error_message: string;

  @Column({ type: "int", default: 0 })
  retry_count: number;

  @CreateDateColumn()
  created_at: Date;

  @BeforeInsert()
  private beforeInsert(): void {
    if (!this.id) {
        this.id = 'notif_' + Math.random().toString(36).substr(2, 9);
    }
  }
}

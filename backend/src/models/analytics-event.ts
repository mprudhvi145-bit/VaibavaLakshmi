
import { BaseEntity, Column, Entity, PrimaryColumn, CreateDateColumn, BeforeInsert, Index } from "typeorm";

@Entity()
export class AnalyticsEvent extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Index()
  @Column()
  event_type: string; // 'search', 'pdp_view', 'add_to_cart', 'purchase'

  @Column({ nullable: true })
  payload: string; // JSON string or simple text (e.g. search query, product id)

  @Column({ nullable: true })
  user_id: string;

  @CreateDateColumn()
  created_at: Date;

  @BeforeInsert()
  private beforeInsert(): void {
    if (!this.id) {
        this.id = 'evt_' + Math.random().toString(36).substr(2, 9);
    }
  }
}

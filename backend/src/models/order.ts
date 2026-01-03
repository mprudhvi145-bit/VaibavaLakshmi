
import { BaseEntity, Column, Entity, PrimaryColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn, BeforeInsert } from "typeorm";

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PACKED = 'packed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELED = 'canceled',
  RETURNED = 'returned'
}

@Entity()
export class Order extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  display_id: number; // Human readable short ID

  @Column({ type: "text", default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column()
  email: string;

  @Column({ type: "jsonb" })
  customer: { first_name: string; last_name: string; phone: string; };

  @Column({ type: "jsonb" })
  shipping_address: any;

  @Column({ type: "int" })
  subtotal: number;

  @Column({ type: "int" })
  shipping_total: number;

  @Column({ type: "int" })
  tax_total: number;

  @Column({ type: "int" })
  total: number;

  @Column({ nullable: true })
  payment_provider: string;

  @Column({ nullable: true })
  payment_transaction_id: string;

  // Fulfillment Fields
  @Column({ nullable: true })
  fulfillment_provider: string;

  @Column({ nullable: true })
  tracking_number: string;

  @Column({ nullable: true })
  shipped_at: Date;

  @Column({ nullable: true })
  delivered_at: Date;

  @OneToMany(() => LineItem, (item) => item.order, { cascade: true })
  items: LineItem[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @BeforeInsert()
  private beforeInsert(): void {
    if (!this.id) {
        this.id = 'ord_' + Math.random().toString(36).substr(2, 9);
    }
    if (!this.display_id) {
        this.display_id = Math.floor(100000 + Math.random() * 900000);
    }
  }
}

@Entity()
export class LineItem extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  title: string;

  @Column()
  sku: string;

  @Column({ type: "int" })
  quantity: number;

  @Column({ type: "int" })
  unit_price: number;

  @Column({ type: "int" })
  total: number;

  @Column()
  thumbnail: string;

  @Column({ type: "jsonb", nullable: true })
  metadata: any;

  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: "order_id" })
  order: Order;

  @BeforeInsert()
  private beforeInsert(): void {
    if (!this.id) {
        this.id = 'item_' + Math.random().toString(36).substr(2, 9);
    }
  }
}

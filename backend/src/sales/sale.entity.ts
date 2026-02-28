import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { SaleItem } from './sale-item.entity';
import { Customer } from '../customers/customer.entity';

@Entity()
export class Sale {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  invoiceNumber: string;

  @Column({ nullable: true })
  orderNumber: string;

  @ManyToOne(() => User)
  cashier: User;

  @ManyToOne(() => Customer, { nullable: true })
  customer: Customer;

  @OneToMany(() => SaleItem, (item) => item.sale, { cascade: true })
  items: SaleItem[];

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number;

  @Column('decimal', { precision: 10, scale: 2 })
  tax: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @CreateDateColumn()
  createdAt: Date;
}


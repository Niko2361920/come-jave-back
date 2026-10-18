import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { numericTransformer } from '../../common/numeric.transformer';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  NEQUI = 'NEQUI',
}

@Entity('orders')
@Index(['userId', 'createdAt'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Relación N:1 — muchas órdenes pertenecen a un usuario.
  // RESTRICT: un usuario con pedidos no se puede borrar de la base (los usuarios
  // se desactivan con isActive=false); así no se pierde el historial de ventas.
  @ManyToOne(() => User, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'varchar' })
  userId!: string; // FK explícita para crear sin cargar entidad completa

  // OneToMany con cascade: al guardar Order con items, TypeORM guarda los items automáticamente
  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items!: OrderItem[];

  // Total snapshot al momento de crear — no se recalcula luego
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: numericTransformer,
  })
  total!: number;

  @Index()
  @Column({
    type: 'varchar',
    default: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  @Column({ type: 'varchar', default: PaymentMethod.CASH })
  paymentMethod!: PaymentMethod;

  // Número del comprobante de Nequi; el admin lo revisa antes de marcar PAID.
  @Column({ type: 'varchar', length: 40, nullable: true })
  paymentReference!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}

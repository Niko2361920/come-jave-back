import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import type { AuthenticatedUser } from '../../auth/auth.types';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';
import { CreateOrderDto } from '../dto/create-order.dto';
import { FilterOrderDto } from '../dto/filter-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { OrderItem } from '../entities/order-item.entity';
import { Order, OrderStatus } from '../entities/order.entity';

const MAX_UNITS_PER_PRODUCT = 100;
const ORDER_RELATIONS = { items: true, user: true } as const;

@Injectable()
export class OrdersService {
  // SQLite usa una sola conexión: dos transacciones simultáneas se pisarían.
  // En ese caso las escrituras de pedidos se encolan; en Postgres no hace falta.
  private writeQueue: Promise<unknown> = Promise.resolve();

  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Crea el pedido descontando el stock de forma atómica: el UPDATE solo
   * aplica si todavía alcanza el inventario, así dos pedidos simultáneos no
   * pueden vender más de lo que hay.
   */
  async create(
    dto: CreateOrderDto,
    authUser: AuthenticatedUser,
  ): Promise<Order> {
    // Si el mismo producto llega repetido se suman las cantidades.
    const quantities = new Map<string, number>();
    for (const item of dto.items) {
      quantities.set(
        item.productId,
        (quantities.get(item.productId) ?? 0) + item.quantity,
      );
    }
    for (const [productId, quantity] of quantities) {
      if (quantity > MAX_UNITS_PER_PRODUCT) {
        throw new BadRequestException(
          `Máximo ${MAX_UNITS_PER_PRODUCT} unidades por producto (producto ${productId})`,
        );
      }
    }

    const orderId = await this.runExclusive(() =>
      this.dataSource.transaction(async (manager) => {
        const user = await this.resolveOrderOwner(manager, dto, authUser);

        const productIds = [...quantities.keys()];
        const products = await manager.findBy(Product, {
          id: In(productIds),
          isActive: true,
        });
        const productsById = new Map(products.map((p) => [p.id, p]));
        const missing = productIds.find((id) => !productsById.has(id));
        if (missing) {
          throw new NotFoundException(
            `El producto con id ${missing} no existe o está inactivo`,
          );
        }

        let totalCents = 0;
        const items: Partial<OrderItem>[] = [];

        for (const [productId, quantity] of quantities) {
          const product = productsById.get(productId)!;

          const result = await manager
            .createQueryBuilder()
            .update(Product)
            .set({ stock: () => 'stock - :quantity' })
            .where('id = :id AND stock >= :quantity', {
              id: productId,
              quantity,
            })
            .execute();
          if (!result.affected) {
            throw new BadRequestException(
              `Stock insuficiente para ${product.name}: solicitado ${quantity}`,
            );
          }

          const unitPrice = Number(product.price);
          totalCents += Math.round(unitPrice * 100) * quantity;
          items.push({ productId, quantity, unitPrice });
        }

        const order = manager.create(Order, {
          userId: user.id,
          total: totalCents / 100,
          status: OrderStatus.PENDING,
          items: items as OrderItem[],
        });
        return (await manager.save(Order, order)).id;
      }),
    );

    return this.getOrder(orderId);
  }

  // Solo admin. Ej: GET /orders?status=PENDING&userId=<uuid>
  async findAll(filter?: FilterOrderDto): Promise<Order[]> {
    const qb = this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'item')
      .leftJoinAndSelect('item.product', 'product')
      .leftJoinAndSelect('order.user', 'user');

    if (filter?.status) {
      qb.andWhere('order.status = :status', { status: filter.status });
    }
    if (filter?.userId) {
      qb.andWhere('order.userId = :userId', { userId: filter.userId });
    }

    qb.orderBy('order.createdAt', 'DESC');
    return qb.getMany();
  }

  async findOne(id: string, authUser: AuthenticatedUser): Promise<Order> {
    const order = await this.getOrder(id);
    this.assertCanAccess(order, authUser);
    return order;
  }

  async findMine(authUser: AuthenticatedUser): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { user: { email: authUser.email } },
      relations: ORDER_RELATIONS,
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(
    userId: string,
    authUser: AuthenticatedUser,
  ): Promise<Order[]> {
    if (!authUser.isAdmin) {
      const owner = await this.dataSource
        .getRepository(User)
        .findOneBy({ id: userId });
      if (!owner || owner.email !== authUser.email) {
        throw new ForbiddenException('No tienes acceso a estos pedidos');
      }
    }
    return this.ordersRepository.find({
      where: { userId },
      relations: ORDER_RELATIONS,
      order: { createdAt: 'DESC' },
    });
  }

  // Solo admin. Transiciones válidas: PENDING -> PAID y PENDING -> CANCELLED.
  async update(
    id: string,
    dto: UpdateOrderDto,
    authUser: AuthenticatedUser,
  ): Promise<Order> {
    const order = await this.getOrder(id);
    if (!dto.status || dto.status === order.status) {
      return order;
    }
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        `Solo se puede cambiar el estado desde PENDING, estado actual: ${order.status}`,
      );
    }
    if (dto.status === OrderStatus.CANCELLED) {
      return this.cancel(id, authUser); // también restaura el stock
    }
    if (dto.status === OrderStatus.PAID) {
      const result = await this.ordersRepository.update(
        { id, status: OrderStatus.PENDING },
        { status: OrderStatus.PAID },
      );
      if (!result.affected) {
        throw new ConflictException('La orden cambió de estado, reintenta');
      }
      return this.getOrder(id);
    }
    throw new BadRequestException(
      `Transición no permitida: ${order.status} -> ${dto.status}`,
    );
  }

  // Cancelar = CANCELLED + devolver el stock, todo en una transacción.
  async cancel(id: string, authUser: AuthenticatedUser): Promise<Order> {
    await this.runExclusive(() =>
      this.dataSource.transaction(async (manager) => {
        const order = await manager.findOne(Order, {
          where: { id },
          relations: ORDER_RELATIONS,
        });
        if (!order) {
          throw new NotFoundException(`La orden con id ${id} no existe`);
        }
        this.assertCanAccess(order, authUser);
        if (order.status === OrderStatus.CANCELLED) {
          throw new BadRequestException('La orden ya está cancelada');
        }
        if (order.status === OrderStatus.PAID) {
          throw new BadRequestException(
            'No se puede cancelar una orden pagada',
          );
        }

        // El UPDATE condicionado evita devolver el stock dos veces si dos
        // cancelaciones llegan a la vez.
        const result = await manager.update(
          Order,
          { id, status: OrderStatus.PENDING },
          { status: OrderStatus.CANCELLED },
        );
        if (!result.affected) {
          throw new ConflictException('La orden cambió de estado, reintenta');
        }

        for (const item of order.items) {
          await manager.increment(
            Product,
            { id: item.productId },
            'stock',
            item.quantity,
          );
        }
      }),
    );
    return this.getOrder(id);
  }

  // Solo admin. Las órdenes pagadas no se borran (son registro de ventas).
  async remove(id: string, authUser: AuthenticatedUser): Promise<void> {
    const order = await this.getOrder(id);
    if (order.status === OrderStatus.PAID) {
      throw new BadRequestException('No se puede borrar una orden pagada');
    }
    if (order.status === OrderStatus.PENDING) {
      await this.cancel(id, authUser); // devuelve el stock antes de borrar
    }
    await this.runExclusive(() =>
      this.dataSource.transaction(async (manager) => {
        await manager.delete(OrderItem, { orderId: id });
        await manager.delete(Order, { id });
      }),
    );
  }

  private async getOrder(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ORDER_RELATIONS,
    });
    if (!order) {
      throw new NotFoundException(`La orden con id ${id} no existe`);
    }
    return order;
  }

  private assertCanAccess(order: Order, authUser: AuthenticatedUser): void {
    if (!authUser.isAdmin && order.user?.email !== authUser.email) {
      throw new ForbiddenException('No tienes acceso a esta orden');
    }
  }

  private async resolveOrderOwner(
    manager: EntityManager,
    dto: CreateOrderDto,
    authUser: AuthenticatedUser,
  ): Promise<User> {
    if (dto.userId && !authUser.isAdmin) {
      throw new ForbiddenException(
        'Solo un administrador puede crear pedidos a nombre de otro usuario',
      );
    }
    const user = dto.userId
      ? await manager.findOneBy(User, { id: dto.userId, isActive: true })
      : await manager.findOneBy(User, {
          email: authUser.email,
          isActive: true,
        });
    if (!user) {
      throw new NotFoundException(
        dto.userId
          ? `El usuario con id ${dto.userId} no existe o está inactivo`
          : 'Primero debes registrar tu perfil con POST /users',
      );
    }
    return user;
  }

  private runExclusive<T>(task: () => Promise<T>): Promise<T> {
    if (this.dataSource.options.type !== 'better-sqlite3') {
      return task();
    }
    const run = this.writeQueue.then(task, task);
    this.writeQueue = run.catch(() => undefined);
    return run;
  }
}

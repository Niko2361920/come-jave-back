import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class UpdateOrderDto {
  // Solo se permite PENDING -> PAID o PENDING -> CANCELLED (ver OrdersService.update).
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}

import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { PaymentMethod } from '../entities/order.entity';

export class CreateOrderItemDto {
  @IsUUID()
  productId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  quantity!: number;
}

export class CreateOrderDto {
  // Solo lo respeta un admin que crea el pedido a nombre de otra persona.
  // Para un usuario normal el dueño siempre sale del token.
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  // Obligatorio solo cuando se paga por Nequi.
  @ValidateIf(
    (order: CreateOrderDto) => order.paymentMethod === PaymentMethod.NEQUI,
  )
  @IsString()
  @Matches(/^\d{6,20}$/, {
    message: 'paymentReference debe tener entre 6 y 20 dígitos',
  })
  paymentReference?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}

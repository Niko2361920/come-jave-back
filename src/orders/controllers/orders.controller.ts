import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminOnly, CurrentUser } from '../../auth/auth.decorators';
import type { AuthenticatedUser } from '../../auth/auth.types';
import { CreateOrderDto } from '../dto/create-order.dto';
import { FilterOrderDto } from '../dto/filter-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { OrdersService } from '../services/orders.service';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(
    @Body() dto: CreateOrderDto,
    @CurrentUser() authUser: AuthenticatedUser,
  ) {
    return this.ordersService.create(dto, authUser);
  }

  // Todos los pedidos: solo admin. Ej: GET /orders?status=PENDING
  @AdminOnly()
  @Get()
  findAll(@Query() filter: FilterOrderDto) {
    return this.ordersService.findAll(filter);
  }

  // Historial del usuario autenticado.
  // Las rutas fijas (me, user/:userId) van antes de :id.
  @Get('me')
  findMine(@CurrentUser() authUser: AuthenticatedUser) {
    return this.ordersService.findMine(authUser);
  }

  @Get('user/:userId')
  findByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @CurrentUser() authUser: AuthenticatedUser,
  ) {
    return this.ordersService.findByUser(userId, authUser);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() authUser: AuthenticatedUser,
  ) {
    return this.ordersService.findOne(id, authUser);
  }

  // Marcar como pagada (o cancelar): solo admin, porque aún no hay pasarela
  // de pago que lo confirme automáticamente.
  @AdminOnly()
  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderDto,
    @CurrentUser() authUser: AuthenticatedUser,
  ) {
    return this.ordersService.update(id, dto, authUser);
  }

  @Put(':id/cancel')
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() authUser: AuthenticatedUser,
  ) {
    return this.ordersService.cancel(id, authUser);
  }

  @AdminOnly()
  @Delete(':id')
  @HttpCode(204)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() authUser: AuthenticatedUser,
  ) {
    return this.ordersService.remove(id, authUser);
  }
}

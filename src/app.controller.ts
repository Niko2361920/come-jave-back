import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Public } from './auth/auth.decorators';

@ApiExcludeController()
@Public()
@Controller()
export class AppController {
  @Get()
  getStatus() {
    return {
      app: 'Come Jave Backend',
      status: 'online',
      version: '1.0.0',
      message: 'API lista para manejar usuarios, productos y pedidos.',
      endpoints: {
        users: '/users',
        products: '/products',
        orders: '/orders',
        health: '/health',
        docs: '/docs',
      },
    };
  }
}

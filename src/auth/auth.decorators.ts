import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthenticatedRequest, AuthenticatedUser } from './auth.types';

export const IS_PUBLIC_KEY = 'isPublic';
export const IS_ADMIN_KEY = 'isAdminOnly';

/** La ruta no exige token (si llega uno válido igual se identifica al usuario). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/** Solo administradores (correos listados en ADMIN_EMAILS). */
export const AdminOnly = () => SetMetadata(IS_ADMIN_KEY, true);

/** Inyecta el usuario autenticado que dejó el guard en la request. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.user) {
      throw new UnauthorizedException('Debes iniciar sesión');
    }
    return request.user;
  },
);

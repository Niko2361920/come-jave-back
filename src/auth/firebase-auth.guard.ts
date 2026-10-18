import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { parseList } from '../config/env.validation';
import { IS_ADMIN_KEY, IS_PUBLIC_KEY } from './auth.decorators';
import type { AuthenticatedRequest, AuthenticatedUser } from './auth.types';

/**
 * Guard global: verifica el ID token de Firebase (Authorization: Bearer ...),
 * exige correo verificado del dominio institucional y resuelve si es admin.
 *
 * Con AUTH_ENABLED=false (solo desarrollo/tests; bloqueado en producción)
 * se simula un usuario con los headers x-dev-email y x-dev-admin.
 */
@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);
  private readonly authEnabled: boolean;
  private readonly allowedDomain: string;
  private readonly adminEmails: Set<string>;
  private readonly projectId?: string;
  private firebaseApp?: App;

  constructor(
    private readonly reflector: Reflector,
    config: ConfigService,
  ) {
    this.authEnabled = config.get<string>('AUTH_ENABLED', 'true') === 'true';
    this.allowedDomain = config.get<string>(
      'ALLOWED_EMAIL_DOMAIN',
      'javerianacali.edu.co',
    );
    this.adminEmails = new Set(parseList(config.get<string>('ADMIN_EMAILS')));
    this.projectId = config.get<string>('FIREBASE_PROJECT_ID');

    if (!this.authEnabled) {
      this.logger.warn(
        'AUTH_ENABLED=false: la API acepta cualquier petición como admin. Solo para desarrollo.',
      );
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      targets,
    );
    const adminOnly = this.reflector.getAllAndOverride<boolean>(
      IS_ADMIN_KEY,
      targets,
    );
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!this.authEnabled) {
      request.user = this.devUser(request);
    } else {
      const token = this.extractBearerToken(request);
      if (token) {
        try {
          request.user = await this.verifyToken(token);
        } catch (error) {
          // En rutas públicas un token malo no bloquea; en las demás sí.
          if (!isPublic) throw error;
        }
      }
    }

    if (isPublic) return true;
    if (!request.user) {
      throw new UnauthorizedException('Debes iniciar sesión');
    }
    if (adminOnly && !request.user.isAdmin) {
      throw new ForbiddenException('Solo administradores');
    }
    return true;
  }

  private extractBearerToken(request: AuthenticatedRequest): string | null {
    const header = request.headers.authorization;
    if (!header) return null;
    const [scheme, token] = header.split(' ');
    return scheme?.toLowerCase() === 'bearer' && token ? token : null;
  }

  private async verifyToken(token: string): Promise<AuthenticatedUser> {
    let decoded;
    try {
      decoded = await getAuth(this.getFirebaseApp()).verifyIdToken(token);
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    const email = decoded.email?.trim().toLowerCase();
    if (!email || decoded.email_verified !== true) {
      throw new UnauthorizedException('El correo no está verificado');
    }

    const isAdmin = this.adminEmails.has(email);
    if (!isAdmin && !email.endsWith(`@${this.allowedDomain}`)) {
      throw new ForbiddenException(
        `Solo se permiten correos @${this.allowedDomain}`,
      );
    }

    return { uid: decoded.uid, email, isAdmin };
  }

  private getFirebaseApp(): App {
    this.firebaseApp ??=
      getApps()[0] ?? initializeApp({ projectId: this.projectId });
    return this.firebaseApp;
  }

  private devUser(request: AuthenticatedRequest): AuthenticatedUser {
    const email = String(request.headers['x-dev-email'] ?? 'dev@local')
      .trim()
      .toLowerCase();
    const isAdmin = request.headers['x-dev-admin'] !== 'false';
    return { uid: `dev-${email}`, email, isAdmin };
  }
}

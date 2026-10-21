import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { IS_ADMIN_KEY, IS_PUBLIC_KEY } from './auth.decorators';

const { verifyIdToken } = vi.hoisted(() => ({ verifyIdToken: vi.fn() }));
vi.mock('firebase-admin/app', () => ({
  getApps: () => [],
  initializeApp: () => ({}),
}));
vi.mock('firebase-admin/auth', () => ({
  getAuth: () => ({ verifyIdToken }),
}));

type Meta = { isPublic?: boolean; adminOnly?: boolean };

function buildGuard(env: Record<string, string> = {}, meta: Meta = {}) {
  const config = new ConfigService({
    AUTH_ENABLED: 'true',
    FIREBASE_PROJECT_ID: 'come-jave',
    ALLOWED_EMAIL_DOMAIN: 'javerianacali.edu.co',
    ADMIN_EMAILS: 'jefe@gmail.com',
    ...env,
  });
  const reflector = {
    getAllAndOverride: (key: string) =>
      key === IS_PUBLIC_KEY
        ? meta.isPublic
        : key === IS_ADMIN_KEY
          ? meta.adminOnly
          : undefined,
  } as unknown as Reflector;
  return new FirebaseAuthGuard(reflector, config);
}

function contextWith(headers: Record<string, string> = {}) {
  const request: Record<string, unknown> = { headers };
  const context = {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return { context, request };
}

const bearer = { authorization: 'Bearer token-123' };

describe('FirebaseAuthGuard', () => {
  beforeEach(() => {
    // Con llaves: si el callback devolviera el mock, Vitest lo ejecutaría
    // como función de limpieza al terminar cada test.
    verifyIdToken.mockReset();
  });

  it('rechaza peticiones sin token', async () => {
    const { context } = contextWith();
    await expect(buildGuard().canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('deja pasar rutas públicas sin token', async () => {
    const { context } = contextWith();
    await expect(
      buildGuard({}, { isPublic: true }).canActivate(context),
    ).resolves.toBe(true);
  });

  it('en rutas públicas un token malo no bloquea ni identifica', async () => {
    verifyIdToken.mockRejectedValue(new Error('bad'));
    const { context, request } = contextWith(bearer);
    await expect(
      buildGuard({}, { isPublic: true }).canActivate(context),
    ).resolves.toBe(true);
    expect(request.user).toBeUndefined();
  });

  it('rechaza tokens inválidos o expirados', async () => {
    verifyIdToken.mockRejectedValue(new Error('expired'));
    const { context } = contextWith(bearer);
    await expect(buildGuard().canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rechaza correos sin verificar', async () => {
    verifyIdToken.mockResolvedValue({
      uid: 'u1',
      email: 'ana@javerianacali.edu.co',
      email_verified: false,
    });
    const { context } = contextWith(bearer);
    await expect(buildGuard().canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rechaza correos de otro dominio', async () => {
    verifyIdToken.mockResolvedValue({
      uid: 'u1',
      email: 'ana@gmail.com',
      email_verified: true,
    });
    const { context } = contextWith(bearer);
    await expect(buildGuard().canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('acepta correo institucional verificado y deja el usuario en la request', async () => {
    verifyIdToken.mockResolvedValue({
      uid: 'u1',
      email: 'Ana@JaverianaCali.edu.co',
      email_verified: true,
    });
    const { context, request } = contextWith(bearer);
    await expect(buildGuard().canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual({
      uid: 'u1',
      email: 'ana@javerianacali.edu.co',
      isAdmin: false,
    });
  });

  it('los correos de ADMIN_EMAILS son admin aunque no sean del dominio', async () => {
    verifyIdToken.mockResolvedValue({
      uid: 'u2',
      email: 'jefe@gmail.com',
      email_verified: true,
    });
    const { context, request } = contextWith(bearer);
    await expect(
      buildGuard({}, { adminOnly: true }).canActivate(context),
    ).resolves.toBe(true);
    expect(request.user).toMatchObject({ isAdmin: true });
  });

  it('bloquea rutas de admin a usuarios normales', async () => {
    verifyIdToken.mockResolvedValue({
      uid: 'u1',
      email: 'ana@javerianacali.edu.co',
      email_verified: true,
    });
    const { context } = contextWith(bearer);
    await expect(
      buildGuard({}, { adminOnly: true }).canActivate(context),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('con AUTH_ENABLED=false simula un usuario por headers (solo desarrollo)', async () => {
    const guard = buildGuard({ AUTH_ENABLED: 'false' });
    const { context, request } = contextWith({
      'x-dev-email': 'Dev@X.co',
      'x-dev-admin': 'false',
    });
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual({
      uid: 'dev-dev@x.co',
      email: 'dev@x.co',
      isAdmin: false,
    });
    expect(verifyIdToken).not.toHaveBeenCalled();
  });
});

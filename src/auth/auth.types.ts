import type { Request } from 'express';

export interface AuthenticatedUser {
  uid: string;
  email: string;
  isAdmin: boolean;
}

export type AuthenticatedRequest = Request & { user?: AuthenticatedUser };

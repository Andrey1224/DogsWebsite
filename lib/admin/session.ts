import 'server-only';

import { randomUUID, createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE, DEFAULT_ADMIN_SESSION_TTL_HOURS } from '@/lib/admin/constants';

export interface AdminSessionPayload {
  sub: string;
  sessionId: string;
  expiresAt: number;
}

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET is not set. Configure it to use the admin console.');
  }
  return secret;
}

function getTtlHours(): number {
  const raw = process.env.ADMIN_SESSION_TTL_HOURS;
  const parsed = raw ? Number.parseInt(raw, 10) : DEFAULT_ADMIN_SESSION_TTL_HOURS;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_ADMIN_SESSION_TTL_HOURS;
}

function encodeSession(payload: AdminSessionPayload): string {
  const secret = getSessionSecret();
  const base = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', secret).update(base).digest('base64url');
  return `${base}.${signature}`;
}

function decodeSession(token: string | undefined): AdminSessionPayload | null {
  if (!token) return null;

  const secret = getSessionSecret();
  const [base, signature] = token.split('.');

  if (!base || !signature) return null;

  const expectedSignature = createHmac('sha256', secret).update(base).digest('base64url');

  const expected = Buffer.from(expectedSignature);
  const provided = Buffer.from(signature);

  if (expected.length !== provided.length) {
    return null;
  }

  if (!timingSafeEqual(expected, provided)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(base, 'base64url').toString('utf8'),
    ) as AdminSessionPayload;
    if (typeof payload.expiresAt !== 'number' || payload.expiresAt < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function setAdminSession(login: string): Promise<AdminSessionPayload> {
  const ttlMs = getTtlHours() * 60 * 60 * 1000;
  const payload: AdminSessionPayload = {
    sub: login,
    sessionId: randomUUID(),
    expiresAt: Date.now() + ttlMs,
  };

  const token = encodeSession(payload);
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(payload.expiresAt),
    path: '/',
  });

  return payload;
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return decodeSession(token);
}

export async function deleteAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

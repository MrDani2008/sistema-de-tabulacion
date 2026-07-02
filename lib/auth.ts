const SESSION_COOKIE = 'session-token';
const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

interface SessionPayload {
  sub: string;
  iat: number;
  exp: number;
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('Falta la variable de entorno SESSION_SECRET');
  return secret;
}

function base64UrlEncode(data: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function hmacSign(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return base64UrlEncode(new Uint8Array(signature));
}

export async function createSessionToken(usuario: string): Promise<string> {
  const header = base64UrlEncode(new TextEncoder().encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const now = Date.now();
  const payload: SessionPayload = { sub: usuario, iat: now, exp: now + EXPIRY_MS };
  const payloadEncoded = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await hmacSign(`${header}.${payloadEncoded}`, getSecret());
  return `${header}.${payloadEncoded}.${signature}`;
}

export async function validateSessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payloadEncoded, signature] = parts;
    const expectedSig = await hmacSign(`${header}.${payloadEncoded}`, getSecret());

    if (signature !== expectedSig) return null;

    const payload: SessionPayload = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadEncoded)));
    if (Date.now() > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

export async function getTokenFromRequest(req: Request): Promise<string | null> {
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  return match ? match[1] : null;
}

export async function setSessionCookie(token: string): Promise<Headers> {
  const headers = new Headers();
  headers.append(
    'Set-Cookie',
    `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${EXPIRY_MS / 1000}`
  );
  return headers;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}

export async function requireSession(req: Request): Promise<{ ok: true; payload: SessionPayload } | { ok: false; status: number; message: string }> {
  const token = await getTokenFromRequest(req);
  if (!token) return { ok: false, status: 401, message: 'No autenticado' };

  const payload = await validateSessionToken(token);
  if (!payload) return { ok: false, status: 401, message: 'Sesión expirada o inválida' };

  return { ok: true, payload };
}

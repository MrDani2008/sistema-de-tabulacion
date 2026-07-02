import { NextResponse } from 'next/server';

export function requireApiKey(headers: Headers) {
  const key = process.env.API_KEY;
  if (!key) return { ok: true };
  const provided = headers.get('x-api-key') || headers.get('authorization') || '';
  if (!provided) return { ok: false, status: 401, message: 'Falta la cabecera x-api-key' };
  if (provided !== key) return { ok: false, status: 403, message: 'Clave API inválida' };
  return { ok: true };
}

export function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

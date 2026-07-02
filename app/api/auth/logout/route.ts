import { NextRequest } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';
import { jsonResponse } from '@/lib/apiUtils';

export async function POST(_req: NextRequest) {
  const response = jsonResponse({ success: true });
  response.headers.set('Set-Cookie', clearSessionCookie());
  return response;
}

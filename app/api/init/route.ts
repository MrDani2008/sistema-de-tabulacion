import { NextRequest } from 'next/server';
import { initializeSheets } from '@/lib/sheetsInit';
import { jsonResponse, errorResponse } from '@/lib/apiUtils';

export async function POST(req: NextRequest) {
  const adminPass = req.nextUrl.searchParams.get('adminPass');
  const expected = process.env.ADMIN_PASS;

  if (!expected || adminPass !== expected) {
    return errorResponse('No autorizado', 403);
  }

  try {
    const result = await initializeSheets();
    return jsonResponse({ success: true, ...result });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al inicializar hojas');
  }
}

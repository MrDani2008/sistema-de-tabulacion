import { NextRequest } from 'next/server';
import { loadAllData } from '@/lib/tournament';
import { jsonResponse, errorResponse } from '@/lib/apiUtils';
import { requireSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await requireSession(req);
  if (!auth.ok) return errorResponse(auth.message, auth.status);
  try {
    const data = await loadAllData();
    return jsonResponse({ success: true, data });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al cargar datos');
  }
}

import { NextRequest } from 'next/server';
import { loadAllData } from '@/lib/tournament';
import { jsonResponse, errorResponse, requireApiKey } from '@/lib/apiUtils';

export async function GET(req: NextRequest) {
  const auth = requireApiKey(req.headers);
  if (!auth.ok) return errorResponse(auth.message || 'No autorizado', auth.status);
  try {
    const data = await loadAllData();
    return jsonResponse({ success: true, data });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al cargar datos');
  }
}

import { NextRequest } from 'next/server';
import { loadAllData, TabName } from '@/lib/tournament';
import { jsonResponse, errorResponse } from '@/lib/apiUtils';
import { requireSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await requireSession(req);
  if (!auth.ok) return errorResponse(auth.message, auth.status);
  try {
    const { searchParams } = new URL(req.url);
    const tabsParam = searchParams.get('tabs');
    const tabs = tabsParam ? tabsParam.split(',') as TabName[] : undefined;
    const data = await loadAllData(tabs);
    return jsonResponse({ success: true, data });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al cargar datos');
  }
}

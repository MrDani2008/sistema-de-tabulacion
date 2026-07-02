import { NextRequest } from 'next/server';
import { loadAllData, syncDebates } from '@/lib/tournament';
import { jsonResponse, errorResponse } from '@/lib/apiUtils';
import { requireSession } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  const auth = await requireSession(req);
  if (!auth.ok) return errorResponse(auth.message, auth.status);
  try {
    const body = await req.json();
    if (!Array.isArray(body.ids)) return errorResponse('ids debe ser un array', 400);
    if (typeof body.updates !== 'object' || body.updates === null) return errorResponse('updates debe ser un objeto', 400);

    const data = await loadAllData(['debates']);
    const updatedDebates = data.debates.map((debate) => {
      if (body.ids.includes(debate.id)) {
        return { ...debate, ...body.updates };
      }
      return debate;
    });

    await syncDebates(updatedDebates);
    return jsonResponse({ success: true, updated: body.ids.length });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al actualizar debates');
  }
}

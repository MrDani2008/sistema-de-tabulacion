import { NextRequest } from 'next/server';
import { loadAllData, syncDebates } from '@/lib/tournament';
import { jsonResponse, errorResponse } from '@/lib/apiUtils';
import { requireSession } from '@/lib/auth';
import { generarId } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const auth = await requireSession(req);
  if (!auth.ok) return errorResponse(auth.message, auth.status);
  try {
    const data = await loadAllData();
    return jsonResponse({ success: true, debates: data.debates });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al obtener debates');
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireSession(req);
  if (!auth.ok) return errorResponse(auth.message, auth.status);
  try {
    const body = await req.json();
    if (!body.rondaId) return errorResponse('rondaId es obligatorio', 400);
    if (!body.salaId) return errorResponse('salaId es obligatorio', 400);
    if (!body.ag || !body.ao || !body.bg || !body.bo) return errorResponse('Todos los roles (ag, ao, bg, bo) son obligatorios', 400);

    const nuevo = {
      id: generarId(),
      rondaId: body.rondaId,
      salaId: body.salaId,
      ag: body.ag,
      ao: body.ao,
      bg: body.bg,
      bo: body.bo,
      publicado: false
    };
    const data = await loadAllData();
    const debates = [nuevo, ...data.debates];
    await syncDebates(debates);
    return jsonResponse({ success: true, debate: nuevo }, 201);
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al crear debate');
  }
}

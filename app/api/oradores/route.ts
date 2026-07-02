import { NextRequest } from 'next/server';
import { loadAllData, syncOradores } from '@/lib/tournament';
import { jsonResponse, errorResponse } from '@/lib/apiUtils';
import { requireSession } from '@/lib/auth';
import { generarId } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const auth = await requireSession(req);
  if (!auth.ok) return errorResponse(auth.message, auth.status);
  try {
    const data = await loadAllData(['oradores']);
    return jsonResponse({ success: true, oradores: data.oradores });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al obtener oradores');
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireSession(req);
  if (!auth.ok) return errorResponse(auth.message, auth.status);
  try {
    const body = await req.json();
    if (!body.nombre) return errorResponse('Nombre es obligatorio', 400);
    if (!body.equipoId) return errorResponse('equipoId es obligatorio', 400);
    const nuevo = { id: generarId(), nombre: body.nombre.trim(), equipoId: body.equipoId };
    const data = await loadAllData(['oradores']);
    const oradores = [nuevo, ...data.oradores];
    await syncOradores(oradores);
    return jsonResponse({ success: true, orador: nuevo }, 201);
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al crear orador');
  }
}

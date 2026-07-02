import { NextRequest } from 'next/server';
import { loadAllData, syncEquipos, crearEquipoBase } from '@/lib/tournament';
import { jsonResponse, errorResponse } from '@/lib/apiUtils';
import { requireSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await requireSession(req);
  if (!auth.ok) return errorResponse(auth.message, auth.status);
  try {
    const data = await loadAllData(['equipos']);
    return jsonResponse({ success: true, equipos: data.equipos });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al obtener equipos');
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireSession(req);
  if (!auth.ok) return errorResponse(auth.message, auth.status);
  try {
    const body = await req.json();
    if (!body.nombre) return errorResponse('Nombre es obligatorio', 400);
    const nueva = crearEquipoBase(body.nombre, body.institucionId || '', body.oradores || '');
    const data = await loadAllData(['equipos']);
    const equipos = [nueva, ...data.equipos];
    await syncEquipos(equipos);
    return jsonResponse({ success: true, equipo: nueva }, 201);
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al crear equipo');
  }
}

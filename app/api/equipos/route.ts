import { NextRequest } from 'next/server';
import { loadAllData, syncEquipos, crearEquipoBase } from '@/lib/tournament';
import { jsonResponse, errorResponse, requireApiKey } from '@/lib/apiUtils';

export async function GET(req: NextRequest) {
  const auth = requireApiKey(req.headers);
  if (!auth.ok) return errorResponse(auth.message || 'No autorizado', auth.status);
  try {
    const data = await loadAllData();
    return jsonResponse({ success: true, equipos: data.equipos });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al obtener equipos');
  }
}

export async function POST(req: NextRequest) {
  const auth = requireApiKey(req.headers);
  if (!auth.ok) return errorResponse(auth.message || 'No autorizado', auth.status);
  try {
    const body = await req.json();
    if (!body.nombre) return errorResponse('Nombre es obligatorio', 400);
    const nueva = crearEquipoBase(body.nombre, body.institucionId || '', body.oradores || '');
    const data = await loadAllData();
    const equipos = [nueva, ...data.equipos];
    await syncEquipos(equipos);
    return jsonResponse({ success: true, equipo: nueva }, 201);
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al crear equipo');
  }
}

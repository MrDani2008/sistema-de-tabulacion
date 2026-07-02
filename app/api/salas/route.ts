import { NextRequest } from 'next/server';
import { loadAllData, syncSalas } from '@/lib/tournament';
import { jsonResponse, errorResponse, requireApiKey } from '@/lib/apiUtils';
import { generarId } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const auth = requireApiKey(req.headers);
  if (!auth.ok) return errorResponse(auth.message || 'No autorizado', auth.status);
  try {
    const data = await loadAllData();
    return jsonResponse({ success: true, salas: data.salas });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al obtener salas');
  }
}

export async function POST(req: NextRequest) {
  const auth = requireApiKey(req.headers);
  if (!auth.ok) return errorResponse(auth.message || 'No autorizado', auth.status);
  try {
    const body = await req.json();
    if (!body.nombre) return errorResponse('Nombre es obligatorio', 400);
    const nueva = { id: generarId(), nombre: body.nombre.trim() };
    const data = await loadAllData();
    const salas = [nueva, ...data.salas];
    await syncSalas(salas);
    return jsonResponse({ success: true, sala: nueva }, 201);
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al crear sala');
  }
}

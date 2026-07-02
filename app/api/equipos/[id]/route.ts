import { NextRequest } from 'next/server';
import { loadAllData, syncEquipos } from '@/lib/tournament';
import { jsonResponse, errorResponse, requireApiKey } from '@/lib/apiUtils';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireApiKey(req.headers);
  if (!auth.ok) return errorResponse(auth.message || 'No autorizado', auth.status);
  try {
    const { id } = params;
    const data = await loadAllData();
    const equipo = data.equipos.find((e) => e.id === id);
    if (!equipo) return errorResponse('Equipo no encontrado', 404);
    return jsonResponse({ success: true, equipo });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al obtener equipo');
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireApiKey(req.headers);
  if (!auth.ok) return errorResponse(auth.message || 'No autorizado', auth.status);
  try {
    const { id } = params;
    const body = await req.json();
    const data = await loadAllData();
    const equipos = data.equipos.map((e) => (e.id === id ? { ...e, ...body } : e));
    const exists = equipos.some((e) => e.id === id);
    if (!exists) return errorResponse('Equipo no encontrado', 404);
    await syncEquipos(equipos);
    return jsonResponse({ success: true });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al actualizar equipo');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireApiKey(req.headers);
  if (!auth.ok) return errorResponse(auth.message || 'No autorizado', auth.status);
  try {
    const { id } = params;
    const data = await loadAllData();
    const equipos = data.equipos.filter((e) => e.id !== id);
    await syncEquipos(equipos);
    return jsonResponse({ success: true });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al eliminar equipo');
  }
}

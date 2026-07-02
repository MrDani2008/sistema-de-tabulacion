import { NextRequest } from 'next/server';
import { loadAllData, syncEquipos } from '@/lib/tournament';
import { jsonResponse, errorResponse } from '@/lib/apiUtils';
import { requireSession } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireSession(req);
  if (!auth.ok) return errorResponse(auth.message, auth.status);
  try {
    const { id } = params;
    const data = await loadAllData(['equipos']);
    const equipo = data.equipos.find((e) => e.id === id);
    if (!equipo) return errorResponse('Equipo no encontrado', 404);
    return jsonResponse({ success: true, equipo });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al obtener equipo');
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireSession(req);
  if (!auth.ok) return errorResponse(auth.message, auth.status);
  try {
    const { id } = params;
    const body = await req.json();
    const data = await loadAllData(['equipos']);
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
  const auth = await requireSession(req);
  if (!auth.ok) return errorResponse(auth.message, auth.status);
  try {
    const { id } = params;
    const data = await loadAllData(['equipos']);
    const equipos = data.equipos.filter((e) => e.id !== id);
    await syncEquipos(equipos);
    return jsonResponse({ success: true });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al eliminar equipo');
  }
}

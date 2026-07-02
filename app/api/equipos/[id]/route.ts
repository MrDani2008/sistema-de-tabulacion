import { NextRequest } from 'next/server';
import { loadAllData, syncEquipos, syncOradores } from '@/lib/tournament';
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
    const data = await loadAllData(['equipos', 'debates', 'rondas', 'oradores']);
    const equipo = data.equipos.find((e) => e.id === id);
    if (!equipo) return errorResponse('Equipo no encontrado', 404);

    const debateEnUso = data.debates.some((d) => d.ag === id || d.ao === id || d.bg === id || d.bo === id);
    if (debateEnUso) {
      return errorResponse('No se puede eliminar el equipo porque está asignado a un debate', 400);
    }

    const equiposFiltrados = data.equipos.filter((e) => e.id !== id);
    const oradoresFiltrados = data.oradores.filter((o) => o.equipoId !== id);

    await syncEquipos(equiposFiltrados);
    await syncOradores(oradoresFiltrados);
    return jsonResponse({ success: true });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al eliminar equipo');
  }
}

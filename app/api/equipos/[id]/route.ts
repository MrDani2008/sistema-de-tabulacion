import { NextRequest } from 'next/server';
import { loadAllData, syncEquipos, syncOradores, syncDebates } from '@/lib/tournament';
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
    const data = await loadAllData(['equipos', 'debates', 'oradores']);
    const equipo = data.equipos.find((e) => e.id === id);
    if (!equipo) return errorResponse('Equipo no encontrado', 404);

    const equiposFiltrados = data.equipos.filter((e) => e.id !== id);
    const oradoresFiltrados = data.oradores.filter((o) => o.equipoId !== id);

    const debatesActualizados = data.debates.map((debate) => {
      const positions = [debate.ag, debate.ao, debate.bg, debate.bo];
      const wasAssigned = positions.includes(id);
      if (!wasAssigned) return debate;

      const cleared = {
        ...debate,
        ag: debate.ag === id ? '' : debate.ag,
        ao: debate.ao === id ? '' : debate.ao,
        bg: debate.bg === id ? '' : debate.bg,
        bo: debate.bo === id ? '' : debate.bo
      };
      const remainingTeams = [cleared.ag, cleared.ao, cleared.bg, cleared.bo].filter(Boolean).length;
      cleared.incompleto = remainingTeams < 4;
      return cleared;
    });

    await syncEquipos(equiposFiltrados);
    await syncOradores(oradoresFiltrados);
    await syncDebates(debatesActualizados);
    return jsonResponse({ success: true });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al eliminar equipo');
  }
}

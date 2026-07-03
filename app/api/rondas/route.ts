import { NextRequest } from 'next/server';
import { loadAllData, syncRondas, syncDebates, crearRondaBase, generarPairingsParaRonda } from '@/lib/tournament';
import { jsonResponse, errorResponse } from '@/lib/apiUtils';
import { requireSession } from '@/lib/auth';
import { generarId } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const auth = await requireSession(req);
  if (!auth.ok) return errorResponse(auth.message, auth.status);
  try {
    const data = await loadAllData(['rondas']);
    return jsonResponse({ success: true, rondas: data.rondas });
  } catch (error: any) {
    return errorResponse(error?.error || 'Error al obtener rondas');
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireSession(req);
  if (!auth.ok) return errorResponse(auth.message, auth.status);
  try {
    const body = await req.json();
    if (!body.nombre) return errorResponse('Nombre es obligatorio', 400);
    if (!body.numero) return errorResponse('Número es obligatorio', 400);

    const data = await loadAllData(['rondas', 'equipos', 'salas', 'debates']);

    if (body.salaId) {
      const salaAbierta = data.rondas.some(
        (r) => r.estado === 'abierta' && r.id !== body.id && data.debates.some((d) => d.rondaId === r.id && d.salaId === body.salaId)
      );
      if (salaAbierta) {
        return errorResponse('Esta sala ya tiene una ronda abierta. Seleccione otra sala o cierre la ronda existente.', 400);
      }
    }

    const nueva = crearRondaBase(body.nombre, body.numero, body.fecha || new Date().toISOString());
    const rondas = [nueva, ...data.rondas];
    await syncRondas(rondas);

    if (body.debates && Array.isArray(body.debates) && body.debates.length > 0) {
      const newDebates = body.debates.map((d: any) => ({
        id: generarId(),
        rondaId: nueva.id,
        salaId: d.salaId || '',
        ag: d.ag || '',
        ao: d.ao || '',
        bg: d.bg || '',
        bo: d.bo || '',
        publicado: false,
        incompleto: false
      }));
      const allDebates = [...data.debates, ...newDebates];
      await syncDebates(allDebates);
      return jsonResponse({ success: true, ronda: nueva, debatesCreados: newDebates.length }, 201);
    }

    if (body.generarPairings) {
      const debates = generarPairingsParaRonda(nueva.id, data.equipos, data.salas);
      if (debates.length > 0) {
        const allDebates = [...data.debates, ...debates];
        await syncDebates(allDebates);
      }
      return jsonResponse({ success: true, ronda: nueva, pairingsGenerados: debates?.length || 0 }, 201);
    }

    return jsonResponse({ success: true, ronda: nueva }, 201);
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al crear ronda');
  }
}

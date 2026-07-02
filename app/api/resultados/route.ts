import { NextRequest } from 'next/server';
import { loadAllData, syncResultados } from '@/lib/tournament';
import { jsonResponse, errorResponse, requireApiKey } from '@/lib/apiUtils';
import { generarId } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const auth = requireApiKey(req.headers);
  if (!auth.ok) return errorResponse(auth.message || 'No autorizado', auth.status);
  try {
    const data = await loadAllData();
    return jsonResponse({ success: true, resultados: data.resultados });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al obtener resultados');
  }
}

export async function POST(req: NextRequest) {
  const auth = requireApiKey(req.headers);
  if (!auth.ok) return errorResponse(auth.message || 'No autorizado', auth.status);
  try {
    const body = await req.json();
    if (!body.debateId) return errorResponse('debateId es obligatorio', 400);
    if (!body.equipoId) return errorResponse('equipoId es obligatorio', 400);
    if (body.puntuacion === undefined) return errorResponse('puntuacion es obligatoria', 400);

    const nuevo = {
      id: generarId(),
      debateId: body.debateId,
      equipoId: body.equipoId,
      puntuacion: Number(body.puntuacion),
      speakerScores: body.speakerScores || [],
      comentarios: body.comentarios || '',
      confirmado: false
    };
    const data = await loadAllData();
    const resultados = [nuevo, ...data.resultados];
    await syncResultados(resultados);
    return jsonResponse({ success: true, resultado: nuevo }, 201);
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al crear resultado');
  }
}

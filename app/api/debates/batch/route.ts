import { NextRequest } from 'next/server';
import { loadAllData, syncDebates, syncResultados } from '@/lib/tournament';
import { jsonResponse, errorResponse } from '@/lib/apiUtils';
import { requireSession } from '@/lib/auth';
import { generarId } from '@/lib/utils';

export async function PUT(req: NextRequest) {
  const auth = await requireSession(req);
  if (!auth.ok) return errorResponse(auth.message, auth.status);
  try {
    const body = await req.json();
    if (!Array.isArray(body.ids)) return errorResponse('ids debe ser un array', 400);
    if (typeof body.updates !== 'object' || body.updates === null) return errorResponse('updates debe ser un objeto', 400);

    const isPublishing = body.updates.publicado === true;
    const data = await loadAllData(['debates', 'resultados', 'equipos']);

    const debatesToPublish = isPublishing
      ? data.debates.filter((d) => body.ids.includes(d.id) && !d.publicado)
      : [];

    const updatedDebates = data.debates.map((debate) => {
      if (body.ids.includes(debate.id)) {
        return { ...debate, ...body.updates };
      }
      return debate;
    });

    await syncDebates(updatedDebates);

    if (isPublishing && debatesToPublish.length > 0) {
      const existingResultados = data.resultados;
      const newResultados = [...existingResultados];

      for (const debate of debatesToPublish) {
        const teamIds = [debate.ag, debate.ao, debate.bg, debate.bo].filter(Boolean);
        const uniqueTeamIds = [...new Set(teamIds)];

        for (const equipoId of uniqueTeamIds) {
          const alreadyExists = existingResultados.some(
            (r) => r.debateId === debate.id && r.equipoId === equipoId
          );
          if (alreadyExists) continue;

          newResultados.push({
            id: generarId(),
            debateId: debate.id,
            equipoId,
            puntuacion: 0,
            speakerScores: [],
            comentarios: '',
            confirmado: false
          });
        }
      }

      await syncResultados(newResultados);
    }

    return jsonResponse({ success: true, updated: body.ids.length });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al actualizar debates');
  }
}

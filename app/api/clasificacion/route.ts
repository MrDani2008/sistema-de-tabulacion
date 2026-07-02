import { NextRequest } from 'next/server';
import { loadAllData, calcularClasificaciones, syncRankingEquipos, syncRankingOradores } from '@/lib/tournament';
import { jsonResponse, errorResponse } from '@/lib/apiUtils';
import { requireSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await requireSession(req);
  if (!auth.ok) return errorResponse(auth.message, auth.status);
  try {
    const data = await loadAllData();
    const rankings = calcularClasificaciones(data);
    return jsonResponse({ success: true, rankingEquipos: rankings.rankingEquipos, rankingOradores: rankings.rankingOradores });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al obtener clasificación');
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireSession(req);
  if (!auth.ok) return errorResponse(auth.message, auth.status);
  try {
    const data = await loadAllData();
    const rankings = calcularClasificaciones(data);
    await syncRankingEquipos(rankings.rankingEquipos);
    await syncRankingOradores(rankings.rankingOradores);
    return jsonResponse({ success: true, rankingEquipos: rankings.rankingEquipos, rankingOradores: rankings.rankingOradores });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al recalcular clasificación');
  }
}

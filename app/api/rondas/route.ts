import { NextRequest } from 'next/server';
import { loadAllData, syncRondas, syncDebates, crearRondaBase, generarPairingsParaRonda } from '@/lib/tournament';
import { jsonResponse, errorResponse, requireApiKey } from '@/lib/apiUtils';

export async function GET(req: NextRequest) {
  const auth = requireApiKey(req.headers);
  if (!auth.ok) return errorResponse(auth.message || 'No autorizado', auth.status);
  try {
    const data = await loadAllData();
    return jsonResponse({ success: true, rondas: data.rondas });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al obtener rondas');
  }
}

export async function POST(req: NextRequest) {
  const auth = requireApiKey(req.headers);
  if (!auth.ok) return errorResponse(auth.message || 'No autorizado', auth.status);
  try {
    const body = await req.json();
    if (!body.nombre) return errorResponse('Nombre es obligatorio', 400);
    if (!body.numero) return errorResponse('Número es obligatorio', 400);

    const data = await loadAllData();
    const nueva = crearRondaBase(body.nombre, body.numero, body.fecha || new Date().toISOString());
    const rondas = [nueva, ...data.rondas];
    await syncRondas(rondas);

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

import { NextRequest } from 'next/server';
import { loadAllData, syncRondas } from '@/lib/tournament';
import { jsonResponse, errorResponse } from '@/lib/apiUtils';
import { requireSession } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireSession(req);
  if (!auth.ok) return errorResponse(auth.message, auth.status);
  try {
    const { id } = params;
    const data = await loadAllData(['rondas']);
    const ronda = data.rondas.find((r) => r.id === id);
    if (!ronda) return errorResponse('Ronda no encontrada', 404);
    return jsonResponse({ success: true, ronda });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al obtener ronda');
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireSession(req);
  if (!auth.ok) return errorResponse(auth.message, auth.status);
  try {
    const { id } = params;
    const body = await req.json();
    const data = await loadAllData(['rondas']);
    const rondas = data.rondas.map((r) => (r.id === id ? { ...r, ...body } : r));
    const exists = rondas.some((r) => r.id === id);
    if (!exists) return errorResponse('Ronda no encontrada', 404);
    await syncRondas(rondas);
    return jsonResponse({ success: true });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al actualizar ronda');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireSession(req);
  if (!auth.ok) return errorResponse(auth.message, auth.status);
  try {
    const { id } = params;
    const data = await loadAllData(['rondas']);
    const rondas = data.rondas.filter((r) => r.id !== id);
    await syncRondas(rondas);
    return jsonResponse({ success: true });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al eliminar ronda');
  }
}

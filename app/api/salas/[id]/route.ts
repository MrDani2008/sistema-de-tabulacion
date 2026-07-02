import { NextRequest } from 'next/server';
import { loadAllData, syncSalas } from '@/lib/tournament';
import { jsonResponse, errorResponse } from '@/lib/apiUtils';
import { requireSession } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireSession(req);
  if (!auth.ok) return errorResponse(auth.message, auth.status);
  try {
    const { id } = params;
    const data = await loadAllData(['salas']);
    const sala = data.salas.find((s) => s.id === id);
    if (!sala) return errorResponse('Sala no encontrada', 404);
    return jsonResponse({ success: true, sala });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al obtener sala');
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireSession(req);
  if (!auth.ok) return errorResponse(auth.message, auth.status);
  try {
    const { id } = params;
    const body = await req.json();
    const data = await loadAllData(['salas']);
    const salas = data.salas.map((s) => (s.id === id ? { ...s, ...body } : s));
    const exists = salas.some((s) => s.id === id);
    if (!exists) return errorResponse('Sala no encontrada', 404);
    await syncSalas(salas);
    return jsonResponse({ success: true });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al actualizar sala');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireSession(req);
  if (!auth.ok) return errorResponse(auth.message, auth.status);
  try {
    const { id } = params;
    const data = await loadAllData(['salas']);
    const salas = data.salas.filter((s) => s.id !== id);
    await syncSalas(salas);
    return jsonResponse({ success: true });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al eliminar sala');
  }
}

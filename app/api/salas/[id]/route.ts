import { NextRequest } from 'next/server';
import { loadAllData, syncSalas } from '@/lib/tournament';
import { jsonResponse, errorResponse, requireApiKey } from '@/lib/apiUtils';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireApiKey(req.headers);
  if (!auth.ok) return errorResponse(auth.message || 'No autorizado', auth.status);
  try {
    const { id } = params;
    const data = await loadAllData();
    const sala = data.salas.find((s) => s.id === id);
    if (!sala) return errorResponse('Sala no encontrada', 404);
    return jsonResponse({ success: true, sala });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al obtener sala');
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireApiKey(req.headers);
  if (!auth.ok) return errorResponse(auth.message || 'No autorizado', auth.status);
  try {
    const { id } = params;
    const body = await req.json();
    const data = await loadAllData();
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
  const auth = requireApiKey(req.headers);
  if (!auth.ok) return errorResponse(auth.message || 'No autorizado', auth.status);
  try {
    const { id } = params;
    const data = await loadAllData();
    const salas = data.salas.filter((s) => s.id !== id);
    await syncSalas(salas);
    return jsonResponse({ success: true });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al eliminar sala');
  }
}

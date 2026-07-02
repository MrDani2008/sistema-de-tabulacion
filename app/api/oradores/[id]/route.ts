import { NextRequest } from 'next/server';
import { loadAllData, syncOradores } from '@/lib/tournament';
import { jsonResponse, errorResponse } from '@/lib/apiUtils';
import { requireSession } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireSession(req);
  if (!auth.ok) return errorResponse(auth.message, auth.status);
  try {
    const { id } = params;
    const data = await loadAllData();
    const orador = data.oradores.find((o) => o.id === id);
    if (!orador) return errorResponse('Orador no encontrado', 404);
    return jsonResponse({ success: true, orador });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al obtener orador');
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireSession(req);
  if (!auth.ok) return errorResponse(auth.message, auth.status);
  try {
    const { id } = params;
    const body = await req.json();
    const data = await loadAllData();
    const oradores = data.oradores.map((o) => (o.id === id ? { ...o, ...body } : o));
    const exists = oradores.some((o) => o.id === id);
    if (!exists) return errorResponse('Orador no encontrado', 404);
    await syncOradores(oradores);
    return jsonResponse({ success: true });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al actualizar orador');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireSession(req);
  if (!auth.ok) return errorResponse(auth.message, auth.status);
  try {
    const { id } = params;
    const data = await loadAllData();
    const oradores = data.oradores.filter((o) => o.id !== id);
    await syncOradores(oradores);
    return jsonResponse({ success: true });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al eliminar orador');
  }
}

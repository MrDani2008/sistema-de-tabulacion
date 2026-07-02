import { NextRequest } from 'next/server';
import { loadAllData, syncDebates } from '@/lib/tournament';
import { jsonResponse, errorResponse, requireApiKey } from '@/lib/apiUtils';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireApiKey(req.headers);
  if (!auth.ok) return errorResponse(auth.message || 'No autorizado', auth.status);
  try {
    const { id } = params;
    const data = await loadAllData();
    const debate = data.debates.find((d) => d.id === id);
    if (!debate) return errorResponse('Debate no encontrado', 404);
    return jsonResponse({ success: true, debate });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al obtener debate');
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireApiKey(req.headers);
  if (!auth.ok) return errorResponse(auth.message || 'No autorizado', auth.status);
  try {
    const { id } = params;
    const body = await req.json();
    const data = await loadAllData();
    const debates = data.debates.map((d) => (d.id === id ? { ...d, ...body } : d));
    const exists = debates.some((d) => d.id === id);
    if (!exists) return errorResponse('Debate no encontrado', 404);
    await syncDebates(debates);
    return jsonResponse({ success: true });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al actualizar debate');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireApiKey(req.headers);
  if (!auth.ok) return errorResponse(auth.message || 'No autorizado', auth.status);
  try {
    const { id } = params;
    const data = await loadAllData();
    const debates = data.debates.filter((d) => d.id !== id);
    await syncDebates(debates);
    return jsonResponse({ success: true });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al eliminar debate');
  }
}

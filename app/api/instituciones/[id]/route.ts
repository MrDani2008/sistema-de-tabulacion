import { NextRequest } from 'next/server';
import { loadAllData, syncInstituciones } from '@/lib/tournament';
import { jsonResponse, errorResponse, requireApiKey } from '@/lib/apiUtils';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireApiKey(req.headers);
  if (!auth.ok) return errorResponse(auth.message || 'No autorizado', auth.status);
  try {
    const { id } = params;
    const data = await loadAllData();
    const institucion = data.instituciones.find((i) => i.id === id);
    if (!institucion) return errorResponse('Institución no encontrada', 404);
    return jsonResponse({ success: true, institucion });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al obtener institución');
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireApiKey(req.headers);
  if (!auth.ok) return errorResponse(auth.message || 'No autorizado', auth.status);
  try {
    const { id } = params;
    const body = await req.json();
    const data = await loadAllData();
    const instituciones = data.instituciones.map((i) => (i.id === id ? { ...i, ...body } : i));
    const exists = instituciones.some((i) => i.id === id);
    if (!exists) return errorResponse('Institución no encontrada', 404);
    await syncInstituciones(instituciones);
    return jsonResponse({ success: true });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al actualizar institución');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireApiKey(req.headers);
  if (!auth.ok) return errorResponse(auth.message || 'No autorizado', auth.status);
  try {
    const { id } = params;
    const data = await loadAllData();
    const instituciones = data.instituciones.filter((i) => i.id !== id);
    await syncInstituciones(instituciones);
    return jsonResponse({ success: true });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al eliminar institución');
  }
}

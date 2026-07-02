import { NextRequest } from 'next/server';
import { loadAllData, syncResultados } from '@/lib/tournament';
import { jsonResponse, errorResponse } from '@/lib/apiUtils';
import { requireSession } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireSession(req);
  if (!auth.ok) return errorResponse(auth.message, auth.status);
  try {
    const { id } = params;
    const data = await loadAllData(['resultados']);
    const resultado = data.resultados.find((r) => r.id === id);
    if (!resultado) return errorResponse('Resultado no encontrado', 404);
    return jsonResponse({ success: true, resultado });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al obtener resultado');
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireSession(req);
  if (!auth.ok) return errorResponse(auth.message, auth.status);
  try {
    const { id } = params;
    const body = await req.json();
    const data = await loadAllData(['resultados']);
    const resultados = data.resultados.map((r) => (r.id === id ? { ...r, ...body } : r));
    const exists = resultados.some((r) => r.id === id);
    if (!exists) return errorResponse('Resultado no encontrado', 404);
    await syncResultados(resultados);
    return jsonResponse({ success: true });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al actualizar resultado');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireSession(req);
  if (!auth.ok) return errorResponse(auth.message, auth.status);
  try {
    const { id } = params;
    const data = await loadAllData(['resultados']);
    const resultados = data.resultados.filter((r) => r.id !== id);
    await syncResultados(resultados);
    return jsonResponse({ success: true });
  } catch (error: any) {
    return errorResponse(error?.message || 'Error al eliminar resultado');
  }
}

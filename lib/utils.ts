import { PosicionBP } from './types';

export function generarId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

export function mantenerUnico<T>(lista: T[]): T[] {
  return Array.from(new Set(lista));
}

export function posicionesDeEquipo(equipoId: string, debate: { ag: string; ao: string; bg: string; bo: string }) {
  const posiciones: PosicionBP[] = [];
  if (debate.ag === equipoId) posiciones.push('AG');
  if (debate.ao === equipoId) posiciones.push('AO');
  if (debate.bg === equipoId) posiciones.push('BG');
  if (debate.bo === equipoId) posiciones.push('BO');
  return posiciones;
}

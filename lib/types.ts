export type PosicionBP = 'AG' | 'AO' | 'BG' | 'BO';
export const posicionesBP: PosicionBP[] = ['AG', 'AO', 'BG', 'BO'];
export type RoundState = 'abierta' | 'cerrada';

export interface Equipo {
  id: string;
  nombre: string;
  institucionId: string;
  oradores: string[];
  creadoEn: string;
}

export interface Institucion {
  id: string;
  nombre: string;
}

export interface Orador {
  id: string;
  nombre: string;
  equipoId: string;
}

export interface Sala {
  id: string;
  nombre: string;
}

export interface Ronda {
  id: string;
  nombre: string;
  numero: number;
  estado: RoundState;
  fecha: string;
  abiertaEn: string;
}

export interface Debate {
  id: string;
  rondaId: string;
  salaId: string;
  ag: string;
  ao: string;
  bg: string;
  bo: string;
  publicado: boolean;
}

export interface SpeakerScore {
  oradorId: string;
  puntuacion: number;
}

export interface Resultado {
  id: string;
  debateId: string;
  equipoId: string;
  puntuacion: number;
  speakerScores: SpeakerScore[];
  comentarios: string;
  confirmado: boolean;
}

export interface RankingEquipo {
  equipoId: string;
  nombreEquipo: string;
  puntos: number;
  victorias: number;
  total: number;
  rondasJugadas: number;
}

export interface RankingOrador {
  oradorId: string;
  nombreOrador: string;
  equipoId: string;
  puntos: number;
  debates: number;
}

export interface TournamentData {
  equipos: Equipo[];
  instituciones: Institucion[];
  oradores: Orador[];
  salas: Sala[];
  rondas: Ronda[];
  debates: Debate[];
  resultados: Resultado[];
  rankingEquipos: RankingEquipo[];
  rankingOradores: RankingOrador[];
}

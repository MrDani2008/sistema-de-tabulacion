import { generarId } from './utils';
import { writeSheetObjects, readSheetObjects } from './googleSheets';
import {
  Debate,
  Equipo,
  Institucion,
  Orador,
  Ronda,
  Resultado,
  Sala,
  TournamentData,
  RankingEquipo,
  RankingOrador,
  posicionesBP
} from './types';

function parseBoolean(value: string | boolean): boolean {
  return value === true || String(value).toLowerCase() === 'true';
}

export async function loadAllData(): Promise<TournamentData> {
  const equiposRaw = await readSheetObjects<Equipo>('Equipos');
  const institucionesRaw = await readSheetObjects<Institucion>('Instituciones');
  const oradoresRaw = await readSheetObjects<Orador>('Oradores');
  const salasRaw = await readSheetObjects<Sala>('Salas');
  const rondasRaw = await readSheetObjects<Ronda>('Rondas');
  const debatesRaw = await readSheetObjects<Debate>('Debates');
  const resultadosRaw = await readSheetObjects<Resultado>('Resultados');
  const rankingEquiposRaw = await readSheetObjects<RankingEquipo>('ClasificacionGeneral');
  const rankingOradoresRaw = await readSheetObjects<RankingOrador>('ClasificacionOradores');

  const equipos = equiposRaw.map((item) => ({
    ...item,
    oradores: item.oradores ? String(item.oradores).split(',').map((value) => value.trim()).filter(Boolean) : [],
    creadoEn: item.creadoEn || new Date().toISOString()
  }));

  const resultados = resultadosRaw.map((item) => ({
    ...item,
    puntuacion: Number(item.puntuacion || 0),
    speakerScores: item.speakerScores ? JSON.parse(String(item.speakerScores)) : [],
    confirmado: parseBoolean(item.confirmado)
  }));

  const debates = debatesRaw.map((item) => ({
    ...item,
    publicado: parseBoolean(item.publicado)
  }));

  const rankingEquipos = rankingEquiposRaw.map((item) => ({
    ...item,
    puntos: Number(item.puntos || 0),
    victorias: Number(item.victorias || 0),
    total: Number(item.total || 0),
    rondasJugadas: Number(item.rondasJugadas || 0)
  }));

  const rankingOradores = rankingOradoresRaw.map((item) => ({
    ...item,
    puntos: Number(item.puntos || 0),
    debates: Number(item.debates || 0)
  }));

  return {
    equipos,
    instituciones: institucionesRaw,
    oradores: oradoresRaw,
    salas: salasRaw,
    rondas: rondasRaw.map((item) => ({
      ...item,
      numero: Number(item.numero || 0),
      estado: item.estado || 'abierta',
      fecha: item.fecha || new Date().toISOString(),
      abiertaEn: item.abiertaEn || ''
    })),
    debates,
    resultados,
    rankingEquipos,
    rankingOradores
  };
}

export async function syncEquipos(equipos: Equipo[]) {
  await writeSheetObjects('Equipos', equipos.map((equipo) => ({
    ...equipo,
    oradores: equipo.oradores.join(', ')
  })), ['id', 'nombre', 'institucionId', 'oradores', 'creadoEn']);
}

export async function syncInstituciones(instituciones: Institucion[]) {
  await writeSheetObjects('Instituciones', instituciones, ['id', 'nombre']);
}

export async function syncSalas(salas: Sala[]) {
  await writeSheetObjects('Salas', salas, ['id', 'nombre']);
}

export async function syncRondas(rondas: Ronda[]) {
  await writeSheetObjects('Rondas', rondas, ['id', 'nombre', 'numero', 'estado', 'fecha', 'abiertaEn']);
}

export async function syncDebates(debates: Debate[]) {
  await writeSheetObjects('Debates', debates.map((debate) => ({
    ...debate,
    publicado: debate.publicado ? 'true' : 'false'
  })), ['id', 'rondaId', 'salaId', 'ag', 'ao', 'bg', 'bo', 'publicado']);
}

export async function syncResultados(resultados: Resultado[]) {
  await writeSheetObjects('Resultados', resultados.map((resultado) => ({
    ...resultado,
    speakerScores: JSON.stringify(resultado.speakerScores),
    confirmado: resultado.confirmado ? 'true' : 'false'
  })), ['id', 'debateId', 'equipoId', 'puntuacion', 'speakerScores', 'comentarios', 'confirmado']);
}

export async function syncRankingEquipos(ranking: RankingEquipo[]) {
  await writeSheetObjects('ClasificacionGeneral', ranking, ['equipoId', 'nombreEquipo', 'puntos', 'victorias', 'total', 'rondasJugadas']);
}

export async function syncRankingOradores(ranking: RankingOrador[]) {
  await writeSheetObjects('ClasificacionOradores', ranking, ['oradorId', 'nombreOrador', 'equipoId', 'puntos', 'debates']);
}

export function crearEquipoBase(name: string, institutionId: string, oradoresText: string): Equipo {
  return {
    id: generarId(),
    nombre: name.trim(),
    institucionId: institutionId,
    oradores: oradoresText.split(',').map((speaker) => speaker.trim()).filter(Boolean),
    creadoEn: new Date().toISOString()
  };
}

export function crearRondaBase(nombre: string, numero: number, fecha: string): Ronda {
  return {
    id: generarId(),
    nombre: nombre.trim(),
    numero,
    fecha,
    estado: 'abierta',
    abiertaEn: new Date().toISOString()
  };
}

export function generarPairingsParaRonda(rondaId: string, equipos: Equipo[], salas: Sala[]): Debate[] {
  const teams = [...equipos].slice(0, 12);
  const debates: Debate[] = [];

  if (teams.length < 4 || salas.length === 0) {
    return debates;
  }

  const orden: string[] = teams.map((equipo) => equipo.id);

  for (let i = 0; i < 3; i += 1) {
    const slice = orden.slice(i * 4, i * 4 + 4);
    if (slice.length < 4) break;
    debates.push({
      id: generarId(),
      rondaId,
      salaId: salas[Math.min(i, salas.length - 1)].id,
      ag: slice[0],
      ao: slice[1],
      bg: slice[2],
      bo: slice[3],
      publicado: false
    });
  }

  return debates;
}

export function calcularClasificaciones(data: TournamentData): { rankingEquipos: RankingEquipo[]; rankingOradores: RankingOrador[] } {
  const equipoMap = new Map(data.equipos.map((equipo) => [equipo.id, equipo]));
  const oradorMap = new Map(data.oradores.map((orador) => [orador.id, orador]));
  const debateResultados = new Map<string, Resultado[]>();

  for (const resultado of data.resultados.filter((r) => r.confirmado)) {
    if (!debateResultados.has(resultado.debateId)) debateResultados.set(resultado.debateId, []);
    debateResultados.get(resultado.debateId)?.push(resultado);
  }

  const rankingEquipos = data.equipos.map((equipo) => ({
    equipoId: equipo.id,
    nombreEquipo: equipo.nombre,
    puntos: 0,
    victorias: 0,
    total: 0,
    rondasJugadas: 0
  }));

  const rankingOradores = data.oradores.map((orador) => ({
    oradorId: orador.id,
    nombreOrador: orador.nombre,
    equipoId: orador.equipoId,
    puntos: 0,
    debates: 0
  }));

  const rankingEquipoMap = new Map(rankingEquipos.map((item) => [item.equipoId, item]));
  const rankingOradorMap = new Map(rankingOradores.map((item) => [item.oradorId, item]));

  for (const [debateId, resultados] of debateResultados.entries()) {
    const ordenados = [...resultados].sort((a, b) => b.puntuacion - a.puntuacion);
    const maxScore = ordenados[0]?.puntuacion ?? 0;

    ordenados.forEach((resultado, index) => {
      const equipoRank = rankingEquipoMap.get(resultado.equipoId);
      if (!equipoRank) return;
      equipoRank.puntos += resultado.puntuacion;
      equipoRank.total += resultado.puntuacion;
      equipoRank.rondasJugadas += 1;
      if (index < 2) equipoRank.victorias += 1;
    });

    for (const resultado of resultados) {
      const oradores = data.equipos.find((equipo) => equipo.id === resultado.equipoId)?.oradores || [];
      oradores.forEach((nombreOrador) => {
        const orador = data.oradores.find((item) => item.nombre === nombreOrador && item.equipoId === resultado.equipoId);
        if (!orador) return;
        const oradorRank = rankingOradorMap.get(orador.id);
        if (!oradorRank) return;
        oradorRank.puntos += resultado.puntuacion / Math.max(oradores.length, 1);
        oradorRank.debates += 1;
      });
    }
  }

  const rankingEquipoList = [...rankingEquipoMap.values()].sort((a, b) => b.puntos - a.puntos || b.victorias - a.victorias);
  const rankingOradorList = [...rankingOradorMap.values()].sort((a, b) => b.puntos - a.puntos || b.debates - a.debates);

  return { rankingEquipos: rankingEquipoList, rankingOradores: rankingOradorList };
}

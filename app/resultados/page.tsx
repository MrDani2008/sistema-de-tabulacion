'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { withAuth } from '@/lib/withAuth';

interface ScoreForm {
  puntuacion: number;
  speakerScores: { oradorId: string; nombre: string; puntuacion: number }[];
  comentarios: string;
}

function ResultadosPageInner() {
  const router = useRouter();
  const [debates, setDebates] = useState<any[]>([]);
  const [equipos, setEquipos] = useState<any[]>([]);
  const [oradores, setOradores] = useState<any[]>([]);
  const [resultados, setResultados] = useState<any[]>([]);
  const [rondas, setRondas] = useState<any[]>([]);
  const [salas, setSalas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingDebateId, setEditingDebateId] = useState<string | null>(null);
  const [scoreForms, setScoreForms] = useState<Record<string, ScoreForm>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/tournament?tabs=debates,equipos,oradores,resultados,rondas,salas', { credentials: 'include' });
        if (res.status === 401) { router.replace('/login'); return; }
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Error al cargar resultados');
        setDebates(json.data.debates || []);
        setEquipos(json.data.equipos || []);
        setOradores(json.data.oradores || []);
        setResultados(json.data.resultados || []);
        setRondas(json.data.rondas || []);
        setSalas(json.data.salas || []);
      } catch (err: any) {
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  function getEquipoNombre(equipoId: string) {
    return equipos.find((e) => e.id === equipoId)?.nombre || equipoId;
  }

  function getSalaNombre(salaId: string) {
    return salas.find((s) => s.id === salaId)?.nombre || 'Sin sala';
  }

  function getRondaNombre(rondaId: string) {
    return rondas.find((r) => r.id === rondaId)?.nombre || 'Sin ronda';
  }

  function getOradoresForEquipo(equipoId: string) {
    const equipo = equipos.find((e) => e.id === equipoId);
    if (!equipo) return [];
    return oradores.filter((o) => o.equipoId === equipoId);
  }

  function getResultado(debateId: string, equipoId: string) {
    return resultados.find((r) => r.debateId === debateId && r.equipoId === equipoId);
  }

  function startEditing(debateId: string) {
    const teamIds = getDebateTeamIds(debateId);
    const forms: Record<string, ScoreForm> = {};
    for (const equipoId of teamIds) {
      const existing = getResultado(debateId, equipoId);
      const oradoresEquipo = getOradoresForEquipo(equipoId);
      forms[equipoId] = {
        puntuacion: existing?.puntuacion || 0,
        speakerScores: oradoresEquipo.map((o) => {
          const existingScore = existing?.speakerScores?.find((s: any) => s.oradorId === o.id);
          return { oradorId: o.id, nombre: o.nombre, puntuacion: existingScore?.puntuacion || 0 };
        }),
        comentarios: existing?.comentarios || ''
      };
    }
    setEditingDebateId(debateId);
    setScoreForms(forms);
    setValidationError(null);
  }

  function cancelEditing() {
    setEditingDebateId(null);
    setScoreForms({});
    setValidationError(null);
  }

  function getDebateTeamIds(debateId: string) {
    const debate = debates.find((d) => d.id === debateId);
    if (!debate) return [];
    return [debate.ag, debate.ao, debate.bg, debate.bo].filter(Boolean);
  }

  function updateScoreForm(equipoId: string, field: string, value: any) {
    setScoreForms((prev) => ({
      ...prev,
      [equipoId]: { ...prev[equipoId], [field]: value }
    }));
  }

  function updateSpeakerScore(equipoId: string, oradorId: string, puntuacion: number) {
    setScoreForms((prev) => ({
      ...prev,
      [equipoId]: {
        ...prev[equipoId],
        speakerScores: prev[equipoId].speakerScores.map((s) =>
          s.oradorId === oradorId ? { ...s, puntuacion } : s
        )
      }
    }));
  }

  function validateForms(): string | null {
    for (const [equipoId, form] of Object.entries(scoreForms)) {
      if (form.puntuacion < 0) return `La puntuación de ${getEquipoNombre(equipoId)} no puede ser negativa`;
      for (const speaker of form.speakerScores) {
        if (speaker.puntuacion < 0) return `La puntuación del orador ${speaker.nombre} no puede ser negativa`;
      }
    }
    return null;
  }

  async function saveDebateScores(debateId: string) {
    const validationErr = validateForms();
    if (validationErr) {
      setValidationError(validationErr);
      return;
    }
    setSavingId(debateId);
    setValidationError(null);
    try {
      for (const [equipoId, form] of Object.entries(scoreForms)) {
        const existing = getResultado(debateId, equipoId);
        const payload = {
          debateId,
          equipoId,
          puntuacion: form.puntuacion,
          speakerScores: form.speakerScores.map((s) => ({ oradorId: s.oradorId, puntuacion: s.puntuacion })),
          comentarios: form.comentarios,
          confirmado: true
        };

        if (existing) {
          const res = await fetch(`/api/resultados/${existing.id}`, {
            method: 'PUT',
            headers: { 'content-type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
          });
          if (res.status === 401) { router.replace('/login'); return; }
          if (!res.ok) {
            const json = await res.json();
            throw new Error(json?.error || 'Error al guardar resultado');
          }
        } else {
          const res = await fetch('/api/resultados', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
          });
          if (res.status === 401) { router.replace('/login'); return; }
          if (!res.ok) {
            const json = await res.json();
            throw new Error(json?.error || 'Error al crear resultado');
          }
        }
      }

      await fetch('/api/clasificacion', { method: 'POST', credentials: 'include' });

      const refreshRes = await fetch('/api/tournament?tabs=resultados', { credentials: 'include' });
      const refreshJson = await refreshRes.json();
      setResultados(refreshJson.data.resultados || []);
      cancelEditing();
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setSavingId(null);
    }
  }

  const publishedDebates = debates.filter((d) => d.publicado && !d.incompleto);

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Resultados</p>
        <h2 className="mt-4 text-3xl font-bold text-slate-900">Ingresar y confirmar resultados</h2>
        <p className="mt-4 text-slate-600">Capture puntajes de equipos y oradores, luego confirme para actualizar el ranking.</p>
      </div>

      {loading && <p className="text-slate-500">Cargando resultados...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {publishedDebates.length === 0 && !loading && (
        <div className="card">
          <p className="text-slate-500">No hay debates publicados para calificar. Publique emparejamientos desde la pestaña de Rondas.</p>
        </div>
      )}

      {publishedDebates.map((debate) => {
        const isEditing = editingDebateId === debate.id;
        const isSaving = savingId === debate.id;
        const teamIds = getDebateTeamIds(debate.id);

        return (
          <div key={debate.id} className="card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {getRondaNombre(debate.rondaId)} — {getSalaNombre(debate.salaId)}
                </h3>
                <p className="text-sm text-slate-500">
                  AG: {getEquipoNombre(debate.ag)} | AO: {getEquipoNombre(debate.ao)} | BG: {getEquipoNombre(debate.bg)} | BO: {getEquipoNombre(debate.bo)}
                </p>
              </div>
              {!isEditing ? (
                <button className="button-primary" onClick={() => startEditing(debate.id)}>
                  Calificar
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700"
                    disabled={isSaving}
                    onClick={() => saveDebateScores(debate.id)}
                  >
                    {isSaving ? 'Guardando...' : 'Guardar y confirmar'}
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg font-medium bg-slate-100 text-slate-700 hover:bg-slate-200"
                    disabled={isSaving}
                    onClick={cancelEditing}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            {isEditing && (
              <div className="mt-4 space-y-4">
                {validationError && <p className="text-sm text-red-600">{validationError}</p>}
                {teamIds.map((equipoId) => {
                  const form = scoreForms[equipoId];
                  if (!form) return null;
                  return (
                    <div key={equipoId} className="rounded-lg border border-slate-200 p-4">
                      <h4 className="font-medium text-slate-900">{getEquipoNombre(equipoId)}</h4>
                      <div className="mt-3 grid gap-3 sm:grid-cols-[auto_1fr] items-start">
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Puntuación del equipo</label>
                          <input
                            type="number"
                            title={`Puntuación de ${getEquipoNombre(equipoId)}`}
                            className="input w-24 mt-1"
                            value={form.puntuacion}
                            min={0}
                            onChange={(e) => updateScoreForm(equipoId, 'puntuacion', Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Puntuaciones por orador</label>
                          <div className="mt-1 space-y-1">
                            {form.speakerScores.map((speaker) => (
                              <div key={speaker.oradorId} className="flex items-center gap-2">
                                <span className="text-sm text-slate-600 w-40 truncate">{speaker.nombre}</span>
                                <input
                                  type="number"
                                  title={`Puntuación de ${speaker.nombre}`}
                                  className="input w-20"
                                  value={speaker.puntuacion}
                                  min={0}
                                  onChange={(e) => updateSpeakerScore(equipoId, speaker.oradorId, Number(e.target.value))}
                                />
                              </div>
                            ))}
                            {form.speakerScores.length === 0 && (
                              <p className="text-sm text-slate-400">Sin oradores registrados para este equipo</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-slate-700">Comentarios del juez (opcional)</label>
                        <textarea
                          className="textarea mt-1"
                          rows={2}
                          value={form.comentarios}
                          onChange={(e) => updateScoreForm(equipoId, 'comentarios', e.target.value)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!isEditing && (
              <div className="mt-3">
                {teamIds.map((equipoId) => {
                  const resultado = getResultado(debate.id, equipoId);
                  return (
                    <div key={equipoId} className="flex items-center gap-3 text-sm py-1">
                      <span className="text-slate-600">{getEquipoNombre(equipoId)}</span>
                      <span className="text-slate-400">—</span>
                      {resultado?.confirmado ? (
                        <span className="text-green-600">{resultado.puntuacion} pts (confirmado)</span>
                      ) : resultado ? (
                        <span className="text-amber-600">{resultado.puntuacion} pts (pendiente)</span>
                      ) : (
                        <span className="text-slate-400">Sin calificar</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}

const ResultadosPage = withAuth(ResultadosPageInner);
export default ResultadosPage;

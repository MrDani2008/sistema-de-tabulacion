'use client';

import { useState, useEffect } from 'react';

interface ScoreForm {
  puntuacion: number;
  speakerScores: { oradorId: string; nombre: string; puntuacion: number }[];
  comentarios: string;
}

interface DebateScoringFormProps {
  debate: any;
  equipos: any[];
  oradores: any[];
  resultados: any[];
  router: any;
  onSaved: () => void;
}

export default function DebateScoringForm({ debate, equipos, oradores, resultados, router, onSaved }: DebateScoringFormProps) {
  const [scoreForms, setScoreForms] = useState<Record<string, ScoreForm>>({});
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const teamIds = [debate.ag, debate.ao, debate.bg, debate.bo].filter(Boolean);
    const forms: Record<string, ScoreForm> = {};
    for (const equipoId of teamIds) {
      const existing = resultados.find((r) => r.debateId === debate.id && r.equipoId === equipoId);
      const oradoresEquipo = oradores.filter((o) => o.equipoId === equipoId);
      forms[equipoId] = {
        puntuacion: existing?.puntuacion || 0,
        speakerScores: oradoresEquipo.map((o) => {
          const existingScore = existing?.speakerScores?.find((s: any) => s.oradorId === o.id);
          return { oradorId: o.id, nombre: o.nombre, puntuacion: existingScore?.puntuacion || 0 };
        }),
        comentarios: existing?.comentarios || ''
      };
    }
    setScoreForms(forms);
    setValidationError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debate.id]);

  function getEquipoNombre(equipoId: string) {
    return equipos.find((e) => e.id === equipoId)?.nombre || equipoId;
  }

  function getDebateTeamIds() {
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

  async function handleSave() {
    const validationErr = validateForms();
    if (validationErr) {
      setValidationError(validationErr);
      return;
    }
    setSaving(true);
    setValidationError(null);
    try {
      for (const [equipoId, form] of Object.entries(scoreForms)) {
        const existing = resultados.find((r) => r.debateId === debate.id && r.equipoId === equipoId);
        const payload = {
          debateId: debate.id,
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
      onSaved();
    } catch (err: any) {
      setValidationError(err.message || 'Error desconocido');
    } finally {
      setSaving(false);
    }
  }

  const teamIds = getDebateTeamIds();

  return (
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
      <div className="flex gap-2">
        <button
          className="px-4 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700"
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? 'Guardando...' : 'Guardar y confirmar'}
        </button>
        <button
          className="px-4 py-2 rounded-lg font-medium bg-slate-100 text-slate-700 hover:bg-slate-200"
          disabled={saving}
          onClick={() => { setScoreForms({}); setValidationError(null); onSaved(); }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

export function getScoringStatus(debate: any, resultados: any[]) {
  const teamIds = [debate.ag, debate.ao, debate.bg, debate.bo].filter(Boolean);
  const debateResultados = resultados.filter((r) => r.debateId === debate.id);
  const confirmed = debateResultados.filter((r) => r.confirmado);
  if (confirmed.length === teamIds.length && teamIds.length > 0) return 'confirmado';
  if (debateResultados.length > 0) return 'parcial';
  return 'pendiente';
}

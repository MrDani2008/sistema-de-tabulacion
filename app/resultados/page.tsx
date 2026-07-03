'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { withAuth } from '@/lib/withAuth';
import DebateScoringForm, { getScoringStatus } from '@/app/components/DebateScoringForm';

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

  async function refreshData() {
    const refreshRes = await fetch('/api/tournament?tabs=resultados', { credentials: 'include' });
    const refreshJson = await refreshRes.json();
    setResultados(refreshJson.data.resultados || []);
    setEditingDebateId(null);
  }

  function getEquipoNombre(equipoId: string) {
    return equipos.find((e) => e.id === equipoId)?.nombre || equipoId;
  }

  function getSalaNombre(salaId: string) {
    return salas.find((s) => s.id === salaId)?.nombre || 'Sin sala';
  }

  function getRondaNombre(rondaId: string) {
    return rondas.find((r) => r.id === rondaId)?.nombre || 'Sin ronda';
  }

  function getResultado(debateId: string, equipoId: string) {
    return resultados.find((r) => r.debateId === debateId && r.equipoId === equipoId);
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
        const teamIds = [debate.ag, debate.ao, debate.bg, debate.bo].filter(Boolean);
        const status = getScoringStatus(debate, resultados);

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
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  status === 'confirmado' ? 'bg-green-100 text-green-700' :
                  status === 'parcial' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-500'
                }`}>
                  {status === 'confirmado' ? 'Confirmado' : status === 'parcial' ? 'Parcial' : 'Pendiente'}
                </span>
                {!isEditing ? (
                  <button className="button-primary" onClick={() => setEditingDebateId(debate.id)}>
                    Calificar
                  </button>
                ) : null}
              </div>
            </div>

            {isEditing && (
              <DebateScoringForm
                debate={debate}
                equipos={equipos}
                oradores={oradores}
                resultados={resultados}
                router={router}
                onSaved={refreshData}
              />
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

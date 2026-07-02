'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { withAuth } from '@/lib/withAuth';

function ResultadosPageInner() {
  const router = useRouter();
  const [resultados, setResultados] = useState<any[]>([]);
  const [debates, setDebates] = useState<any[]>([]);
  const [equipos, setEquipos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [rRes, dRes, eRes] = await Promise.all([
          fetch('/api/resultados', { credentials: 'include' }),
          fetch('/api/debates', { credentials: 'include' }),
          fetch('/api/equipos', { credentials: 'include' })
        ]);
        if (rRes.status === 401) { router.replace('/login'); return; }
        const rJson = await rRes.json();
        const dJson = await dRes.json();
        const eJson = await eRes.json();
        if (!rRes.ok) throw new Error(rJson?.error || 'Error al cargar resultados');
        setResultados(rJson.resultados || []);
        setDebates(dJson.debates || []);
        setEquipos(eJson.equipos || []);
      } catch (err: any) {
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  function getDebateLabel(debateId: string) {
    const debate = debates.find((d) => d.id === debateId);
    if (!debate) return debateId;
    const sala = debate.salaId;
    return `Debate ${sala}`;
  }

  function getEquipoNombre(equipoId: string) {
    return equipos.find((e) => e.id === equipoId)?.nombre || equipoId;
  }

  async function actualizarPuntuacion(id: string, valor: number) {
    setResultados((prev) => prev.map((item) => (item.id === id ? { ...item, puntuacion: valor } : item)));
  }

  async function confirmarResultado(id: string) {
    try {
      const resultado = resultados.find((r) => r.id === id);
      if (!resultado) return;
      const res = await fetch(`/api/resultados/${id}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ puntuacion: resultado.puntuacion, confirmado: true })
      });
      if (res.status === 401) { router.replace('/login'); return; }
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json?.error || 'Error al confirmar');
      }
      setResultados((prev) => prev.map((item) => (item.id === id ? { ...item, confirmado: true } : item)));
    } catch (err: any) {
      setError(err.message || 'Error al confirmar resultado');
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Resultados</p>
        <h2 className="mt-4 text-3xl font-bold text-slate-900">Ingresar y confirmar resultados</h2>
        <p className="mt-4 text-slate-600">Capture puntajes de equipos y confirme resultados para actualizar el ranking.</p>
      </div>

      <div className="card">
        {loading && <p>Cargando resultados...</p>}
        {error && <p className="text-red-600">{error}</p>}
        <div className="table-container">
          <table className="table-base">
            <thead>
              <tr>
                <th>Debate</th>
                <th>Equipo</th>
                <th>Puntuación</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((resultado) => (
                <tr key={resultado.id}>
                  <td>{getDebateLabel(resultado.debateId)}</td>
                  <td>{getEquipoNombre(resultado.equipoId)}</td>
                  <td>
                    <input
                      type="number"
                      title="Puntuación del equipo"
                      aria-label={`Puntuación para ${getEquipoNombre(resultado.equipoId)}`}
                      className="input w-24"
                      value={resultado.puntuacion}
                      onChange={(event) => actualizarPuntuacion(resultado.id, Number(event.target.value))}
                      disabled={resultado.confirmado}
                    />
                  </td>
                  <td>{resultado.confirmado ? 'Confirmado' : 'Pendiente'}</td>
                  <td>
                    {!resultado.confirmado && (
                      <button className="button-primary" onClick={() => confirmarResultado(resultado.id)}>
                        Confirmar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

const ResultadosPage = withAuth(ResultadosPageInner);
export default ResultadosPage;

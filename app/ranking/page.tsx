'use client';

import { useState, useEffect } from 'react';

const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

export default function RankingPage() {
  const [rankingEquipos, setRankingEquipos] = useState<any[]>([]);
  const [rankingOradores, setRankingOradores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'equipos' | 'oradores'>('equipos');

  const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/tournament', { headers: { 'x-api-key': API_KEY } });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Error al cargar ranking');
        setRankingEquipos(json.data?.rankingEquipos || []);
        setRankingOradores(json.data?.rankingOradores || []);
      } catch (err: any) {
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [API_KEY]);

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Ranking General</p>
        <h2 className="mt-4 text-3xl font-bold text-slate-900">Clasificaciones</h2>
        <p className="mt-4 text-slate-600">Revise la clasificación automática actualizada según resultados confirmados.</p>
      </div>

      <div className="flex gap-2">
        <button
          className={`px-4 py-2 rounded-lg font-medium ${tab === 'equipos' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
          onClick={() => setTab('equipos')}
        >
          Equipos
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium ${tab === 'oradores' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
          onClick={() => setTab('oradores')}
        >
          Oradores
        </button>
      </div>

      {loading && <p>Cargando ranking...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {tab === 'equipos' && (
        <div className="card">
          <div className="table-container">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Posición</th>
                  <th>Equipo</th>
                  <th>Puntos</th>
                  <th>Victorias</th>
                  <th>Rondas</th>
                </tr>
              </thead>
              <tbody>
                {rankingEquipos.map((fila, index) => (
                  <tr key={fila.equipoId}>
                    <td>{index + 1}</td>
                    <td>{fila.nombreEquipo}</td>
                    <td>{fila.puntos}</td>
                    <td>{fila.victorias}</td>
                    <td>{fila.rondasJugadas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'oradores' && (
        <div className="card">
          <div className="table-container">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Posición</th>
                  <th>Orador</th>
                  <th>Puntos</th>
                  <th>Debates</th>
                </tr>
              </thead>
              <tbody>
                {rankingOradores.map((fila, index) => (
                  <tr key={fila.oradorId}>
                    <td>{index + 1}</td>
                    <td>{fila.nombreOrador}</td>
                    <td>{fila.puntos}</td>
                    <td>{fila.debates}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

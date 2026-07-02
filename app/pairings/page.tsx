'use client';

import { useState, useEffect } from 'react';

const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

export default function PairingsPage() {
  const [debates, setDebates] = useState<any[]>([]);
  const [salas, setSalas] = useState<any[]>([]);
  const [equipos, setEquipos] = useState<any[]>([]);
  const [rondas, setRondas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [dRes, sRes, eRes, rRes] = await Promise.all([
          fetch('/api/debates', { headers: { 'x-api-key': API_KEY } }),
          fetch('/api/salas', { headers: { 'x-api-key': API_KEY } }),
          fetch('/api/equipos', { headers: { 'x-api-key': API_KEY } }),
          fetch('/api/rondas', { headers: { 'x-api-key': API_KEY } })
        ]);
        const dJson = await dRes.json();
        const sJson = await sRes.json();
        const eJson = await eRes.json();
        const rJson = await rRes.json();
        if (!dRes.ok) throw new Error(dJson?.error || 'Error al cargar debates');
        setDebates(dJson.debates || []);
        setSalas(sJson.salas || []);
        setEquipos(eJson.equipos || []);
        setRondas(rJson.rondas || []);
      } catch (err: any) {
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [API_KEY]);

  function getSalaNombre(salaId: string) {
    return salas.find((s) => s.id === salaId)?.nombre || 'Sin sala';
  }

  function getEquipoNombre(equipoId: string) {
    return equipos.find((e) => e.id === equipoId)?.nombre || equipoId;
  }

  function getRondaNombre(rondaId: string) {
    return rondas.find((r) => r.id === rondaId)?.nombre || 'Sin ronda';
  }

  async function publicarEmparejamientos() {
    try {
      for (const debate of debates) {
        if (!debate.publicado) {
          await fetch(`/api/debates/${debate.id}`, {
            method: 'PUT',
            headers: { 'content-type': 'application/json', 'x-api-key': API_KEY },
            body: JSON.stringify({ publicado: true })
          });
        }
      }
      setDebates((prev) => prev.map((d) => ({ ...d, publicado: true })));
    } catch (err: any) {
      setError(err.message || 'Error al publicar');
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Pairings</p>
        <h2 className="mt-4 text-3xl font-bold text-slate-900">Emparejamientos de debates</h2>
        <p className="mt-4 text-slate-600">Revise y ajuste el reparto de equipos en las posiciones AG, AO, BG y BO por sala.</p>
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Emparejamientos por sala</h3>
            <p className="mt-2 text-slate-600">Asegúrese de que cada debate tenga cuatro equipos distintos y una sala asignada.</p>
          </div>
          <button className="button-primary" onClick={publicarEmparejamientos}>Publicar emparejamientos</button>
        </div>

        {loading && <p className="mt-4">Cargando emparejamientos...</p>}
        {error && <p className="mt-4 text-red-600">{error}</p>}

        <div className="mt-6 table-container">
          <table className="table-base">
            <thead>
              <tr>
                <th>Ronda</th>
                <th>Sala</th>
                <th>AG</th>
                <th>AO</th>
                <th>BG</th>
                <th>BO</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {debates.map((debate) => (
                <tr key={debate.id}>
                  <td>{getRondaNombre(debate.rondaId)}</td>
                  <td>{getSalaNombre(debate.salaId)}</td>
                  <td>{getEquipoNombre(debate.ag)}</td>
                  <td>{getEquipoNombre(debate.ao)}</td>
                  <td>{getEquipoNombre(debate.bg)}</td>
                  <td>{getEquipoNombre(debate.bo)}</td>
                  <td>{debate.publicado ? 'Publicado' : 'Borrador'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

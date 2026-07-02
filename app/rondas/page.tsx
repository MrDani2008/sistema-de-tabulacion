'use client';

import { useState, useEffect } from 'react';

const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

export default function RondasPage() {
  const [rondas, setRondas] = useState<any[]>([]);
  const [debates, setDebates] = useState<any[]>([]);
  const [salas, setSalas] = useState<any[]>([]);
  const [nombre, setNombre] = useState('');
  const [numero, setNumero] = useState(1);
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [generarPairings, setGenerarPairings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [rRes, dRes, sRes] = await Promise.all([
          fetch('/api/rondas', { headers: { 'x-api-key': API_KEY } }),
          fetch('/api/debates', { headers: { 'x-api-key': API_KEY } }),
          fetch('/api/salas', { headers: { 'x-api-key': API_KEY } })
        ]);
        const rJson = await rRes.json();
        const dJson = await dRes.json();
        const sJson = await sRes.json();
        if (!rRes.ok) throw new Error(rJson?.error || 'Error al cargar rondas');
        setRondas(rJson.rondas || []);
        setDebates(dJson.debates || []);
        setSalas(sJson.salas || []);
      } catch (err: any) {
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [API_KEY]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!nombre.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/rondas', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': API_KEY },
        body: JSON.stringify({
          nombre,
          numero,
          fecha: new Date(fecha).toISOString(),
          generarPairings
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Error creando ronda');
      setRondas((prev) => [json.ronda, ...prev]);
      if (json.pairingsGenerados > 0) {
        const dRes = await fetch('/api/debates', { headers: { 'x-api-key': API_KEY } });
        const dJson = await dRes.json();
        setDebates(dJson.debates || []);
      }
      setNombre('');
      setNumero(numero + 1);
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  function getSalaNombre(salaId: string) {
    return salas.find((s) => s.id === salaId)?.nombre || 'Sin sala';
  }

  function getEquipoNombre(equipoId: string) {
    return equipoId;
  }

  const rondasConDebates = rondas.map((ronda) => ({
    ...ronda,
    debates: debates.filter((d) => d.rondaId === ronda.id)
  }));

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Rondas</p>
        <h2 className="mt-4 text-3xl font-bold text-slate-900">Crear y gestionar rondas</h2>
        <p className="mt-4 text-slate-600">Cree rondas BP y genere emparejamientos con posiciones AG, AO, BG y BO.</p>
      </div>

      {loading && <p className="text-slate-500">Cargando...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="card">
          <h3 className="text-xl font-semibold text-slate-900">Rondas existentes</h3>
          <div className="mt-6 table-container">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Número</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {rondasConDebates.map((ronda) => (
                  <tr key={ronda.id}>
                    <td>{ronda.nombre}</td>
                    <td>{ronda.numero}</td>
                    <td>{ronda.estado}</td>
                    <td>{new Date(ronda.fecha).toLocaleDateString('es-ES')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold text-slate-900">Nueva ronda</h3>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="ronda-nombre" className="mb-2 block text-sm font-medium text-slate-700">Nombre de la ronda</label>
              <input
                id="ronda-nombre"
                title="Nombre de la ronda"
                placeholder="Ej. Ronda 1"
                className="input"
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
              />
            </div>
            <div>
              <label htmlFor="ronda-numero" className="mb-2 block text-sm font-medium text-slate-700">Número</label>
              <input
                id="ronda-numero"
                title="Número de la ronda"
                placeholder="1"
                className="input"
                type="number"
                value={numero}
                onChange={(event) => setNumero(Number(event.target.value))}
              />
            </div>
            <div>
              <label htmlFor="ronda-fecha" className="mb-2 block text-sm font-medium text-slate-700">Fecha</label>
              <input
                id="ronda-fecha"
                title="Fecha de la ronda"
                className="input"
                type="date"
                value={fecha}
                onChange={(event) => setFecha(event.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="ronda-pairings"
                type="checkbox"
                checked={generarPairings}
                onChange={(event) => setGenerarPairings(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              <label htmlFor="ronda-pairings" className="text-sm font-medium text-slate-700">Generar emparejamientos automáticamente</label>
            </div>
            <button type="submit" className="button-primary w-full" disabled={loading}>Crear ronda</button>
          </form>
        </div>
      </div>

      {debates.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-semibold text-slate-900">Emparejamientos</h3>
          <div className="mt-6 table-container">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Sala</th>
                  <th>AG</th>
                  <th>AO</th>
                  <th>BG</th>
                  <th>BO</th>
                  <th>Publicado</th>
                </tr>
              </thead>
              <tbody>
                {debates.map((debate) => (
                  <tr key={debate.id}>
                    <td>{getSalaNombre(debate.salaId)}</td>
                    <td>{getEquipoNombre(debate.ag)}</td>
                    <td>{getEquipoNombre(debate.ao)}</td>
                    <td>{getEquipoNombre(debate.bg)}</td>
                    <td>{getEquipoNombre(debate.bo)}</td>
                    <td>{debate.publicado ? 'Sí' : 'No'}</td>
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

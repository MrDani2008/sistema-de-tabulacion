'use client';

import { useState, useEffect } from 'react';

const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

export default function InstitucionesPage() {
  const [instituciones, setInstituciones] = useState<any[]>([]);
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/instituciones', { headers: { 'x-api-key': API_KEY } });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Error al cargar instituciones');
        setInstituciones(json.instituciones || []);
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
      const res = await fetch('/api/instituciones', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': API_KEY },
        body: JSON.stringify({ nombre })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Error creando institución');
      setInstituciones((prev) => [json.institucion, ...prev]);
      setNombre('');
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Instituciones</p>
        <h2 className="mt-4 text-3xl font-bold text-slate-900">Gestionar instituciones</h2>
        <p className="mt-4 text-slate-600">Agregue todas las instituciones participantes para asignarlas a los equipos.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="card">
          <h3 className="text-xl font-semibold text-slate-900">Instituciones registradas</h3>
          <div className="mt-6 table-container">
            {loading && <p>Cargando instituciones...</p>}
            {error && <p className="text-red-600">{error}</p>}
            <table className="table-base">
              <thead>
                <tr>
                  <th>Nombre</th>
                </tr>
              </thead>
              <tbody>
                {instituciones.map((item) => (
                  <tr key={item.id}>
                    <td>{item.nombre}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold text-slate-900">Nueva institución</h3>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="institucion-nombre" className="mb-2 block text-sm font-medium text-slate-700">Nombre de la institución</label>
              <input
                id="institucion-nombre"
                title="Nombre de la institución"
                placeholder="Ej. Universidad Modelo"
                className="input"
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
              />
            </div>
            <button type="submit" className="button-primary w-full" disabled={loading}>Agregar institución</button>
          </form>
        </div>
      </div>
    </section>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { withAuth } from '@/lib/withAuth';

function SalasPageInner() {
  const router = useRouter();
  const [salas, setSalas] = useState<any[]>([]);
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/salas', { credentials: 'include' });
        if (res.status === 401) { router.replace('/login'); return; }
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Error al cargar salas');
        setSalas(json.salas || []);
      } catch (err: any) {
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!nombre.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/salas', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nombre })
      });
      if (res.status === 401) { router.replace('/login'); return; }
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Error creando sala');
      setSalas((prev) => [json.sala, ...prev]);
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
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Salas</p>
        <h2 className="mt-4 text-3xl font-bold text-slate-900">Configurar salas de debate</h2>
        <p className="mt-4 text-slate-600">Defina hasta tres salas físicas para asignar debates durante las rondas.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="card">
          <h3 className="text-xl font-semibold text-slate-900">Salas disponibles</h3>
          <div className="mt-6 table-container">
            {loading && <p>Cargando salas...</p>}
            {error && <p className="text-red-600">{error}</p>}
            <table className="table-base">
              <thead>
                <tr>
                  <th>Nombre</th>
                </tr>
              </thead>
              <tbody>
                {salas.map((sala) => (
                  <tr key={sala.id}>
                    <td>{sala.nombre}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold text-slate-900">Agregar sala</h3>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="sala-nombre" className="mb-2 block text-sm font-medium text-slate-700">Nombre de la sala</label>
              <input
                id="sala-nombre"
                title="Nombre de la sala"
                placeholder="Ej. Sala A"
                className="input"
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
              />
            </div>
            <button type="submit" className="button-primary w-full" disabled={loading}>Crear sala</button>
          </form>
        </div>
      </div>
    </section>
  );
}

const SalasPage = withAuth(SalasPageInner);
export default SalasPage;

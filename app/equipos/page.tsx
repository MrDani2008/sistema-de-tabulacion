'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { withAuth } from '@/lib/withAuth';

interface EquipoFormState {
  nombre: string;
  institucionId: string;
  oradores: string;
}

function EquiposPageInner() {
  const router = useRouter();
  const [equipos, setEquipos] = useState<any[]>([]);
  const [instituciones, setInstituciones] = useState<any[]>([]);
  const [form, setForm] = useState<EquipoFormState>({ nombre: '', institucionId: '', oradores: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/tournament?tabs=equipos,instituciones', { credentials: 'include' });
        if (res.status === 401) { router.replace('/login'); return; }
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Error al cargar equipos');
        setEquipos(json.data.equipos || []);
        setInstituciones(json.data.instituciones || []);
      } catch (err: any) {
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.nombre.trim()) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/equipos', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ nombre: form.nombre, institucionId: form.institucionId, oradores: form.oradores })
        });
        if (res.status === 401) { router.replace('/login'); return; }
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Error creando equipo');
        setEquipos((prev) => [json.equipo, ...prev]);
        setForm({ nombre: '', institucionId: '', oradores: '' });
      } catch (err: any) {
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    })();
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Equipos</p>
        <h2 className="mt-4 text-3xl font-bold text-slate-900">Gestión de equipos</h2>
        <p className="mt-4 text-slate-600">Registre equipos con su institución y oradores. Edite o elimine registros según necesite.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="card">
          <h3 className="text-xl font-semibold text-slate-900">Lista de equipos registrados</h3>
          <div className="mt-6 table-container">
            {loading && <p>Cargando equipos...</p>}
            {error && <p className="text-red-600">{error}</p>}
            <table className="table-base">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Institución</th>
                  <th>Oradores</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {equipos.map((equipo) => (
                  <tr key={equipo.id}>
                    <td>{equipo.nombre}</td>
                    <td>{instituciones.find((i) => i.id === equipo.institucionId)?.nombre || 'Sin institución'}</td>
                    <td>{equipo.oradores.join(', ')}</td>
                    <td>{new Date(equipo.creadoEn).toLocaleDateString('es-ES')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold text-slate-900">Nuevo equipo</h3>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="equipo-nombre" className="mb-2 block text-sm font-medium text-slate-700">Nombre del equipo</label>
              <input
                id="equipo-nombre"
                title="Nombre del equipo"
                placeholder="Ej. Equipo A"
                className="input"
                value={form.nombre}
                onChange={(event) => setForm((prev) => ({ ...prev, nombre: event.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="equipo-institucion" className="mb-2 block text-sm font-medium text-slate-700">Institución</label>
              <select
                id="equipo-institucion"
                title="Institución del equipo"
                className="select"
                value={form.institucionId}
                onChange={(event) => setForm((prev) => ({ ...prev, institucionId: event.target.value }))}
              >
                <option value="">Seleccionar institución</option>
                {instituciones.map((institucion) => (
                  <option key={institucion.id} value={institucion.id}>
                    {institucion.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Oradores</label>
              <textarea
                className="textarea"
                rows={4}
                placeholder="Ej: María Pérez, Sofía López"
                value={form.oradores}
                onChange={(event) => setForm((prev) => ({ ...prev, oradores: event.target.value }))}
              />
            </div>
            <button type="submit" className="button-primary w-full">Guardar equipo</button>
          </form>
        </div>
      </div>
    </section>
  );
}

const EquiposPage = withAuth(EquiposPageInner);
export default EquiposPage;

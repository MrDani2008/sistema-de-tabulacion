'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { withAuth } from '@/lib/withAuth';

function RondasPageInner() {
  const router = useRouter();
  const [rondas, setRondas] = useState<any[]>([]);
  const [debates, setDebates] = useState<any[]>([]);
  const [salas, setSalas] = useState<any[]>([]);
  const [equipos, setEquipos] = useState<any[]>([]);
  const [nombre, setNombre] = useState('');
  const [numero, setNumero] = useState(1);
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [generarPairings, setGenerarPairings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ ag: string; ao: string; bg: string; bo: string }>({ ag: '', ao: '', bg: '', bo: '' });
  const [editError, setEditError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/tournament?tabs=rondas,debates,salas,equipos', { credentials: 'include' });
        if (res.status === 401) { router.replace('/login'); return; }
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Error al cargar rondas');
        setRondas(json.data.rondas || []);
        setDebates(json.data.debates || []);
        setSalas(json.data.salas || []);
        setEquipos(json.data.equipos || []);
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
      const res = await fetch('/api/rondas', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          nombre,
          numero,
          fecha: new Date(fecha).toISOString(),
          generarPairings
        })
      });
      if (res.status === 401) { router.replace('/login'); return; }
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Error creando ronda');
      setRondas((prev) => [json.ronda, ...prev]);
      if (json.pairingsGenerados > 0) {
        const dRes = await fetch('/api/tournament?tabs=debates,salas,equipos,rondas', { credentials: 'include' });
        const dJson = await dRes.json();
        setDebates(dJson.data.debates || []);
        setSalas(dJson.data.salas || []);
        setEquipos(dJson.data.equipos || []);
        setRondas(dJson.data.rondas || []);
      }
      setNombre('');
      setNumero(numero + 1);
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  function startEditing(debate: any) {
    setEditingId(debate.id);
    setEditForm({ ag: debate.ag || '', ao: debate.ao || '', bg: debate.bg || '', bo: debate.bo || '' });
    setEditError(null);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditForm({ ag: '', ao: '', bg: '', bo: '' });
    setEditError(null);
  }

  function getValidationError(form: { ag: string; ao: string; bg: string; bo: string }): string | null {
    const positions = [form.ag, form.ao, form.bg, form.bo];
    const filled = positions.filter(Boolean);
    if (filled.length < 4) return 'Todos los roles (AG, AO, BG, BO) son obligatorios';
    const unique = new Set(filled);
    if (unique.size < 4) return 'No puede haber equipos repetidos en el mismo debate';
    return null;
  }

  async function saveEditing(debateId: string) {
    const validationError = getValidationError(editForm);
    if (validationError) {
      setEditError(validationError);
      return;
    }
    setSavingId(debateId);
    setEditError(null);
    try {
      const res = await fetch(`/api/debates/${debateId}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editForm)
      });
      if (res.status === 401) { router.replace('/login'); return; }
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Error al guardar debate');
      setDebates((prev) => prev.map((d) => (d.id === debateId ? { ...d, ...editForm, incompleto: false } : d)));
      cancelEditing();
    } catch (err: any) {
      setEditError(err.message || 'Error desconocido');
    } finally {
      setSavingId(null);
    }
  }

  function getSalaNombre(salaId: string) {
    return salas.find((s) => s.id === salaId)?.nombre || 'Sin sala';
  }

  function getEquipoNombre(equipoId: string) {
    if (!equipoId) return '—';
    return equipos.find((e) => e.id === equipoId)?.nombre || equipoId;
  }

  function getRondaNombre(rondaId: string) {
    return rondas.find((r) => r.id === rondaId)?.nombre || 'Sin ronda';
  }

  function getUsedTeamIds(excludeDebateId: string) {
    const used = new Set<string>();
    for (const debate of debates) {
      if (debate.id === excludeDebateId) continue;
      [debate.ag, debate.ao, debate.bg, debate.bo].forEach((id) => {
        if (id) used.add(id);
      });
    }
    return used;
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
        <p className="mt-4 text-slate-600">Cree rondas BP y asigne equipos manualmente a cada posición de debate.</p>
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
          <p className="mt-2 text-sm text-slate-600">Asigne los equipos a cada posición (AG, AO, BG, BO) por debate.</p>
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
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {debates.map((debate) => {
                  const isEditing = editingId === debate.id;
                  const isSaving = savingId === debate.id;
                  const usedTeamIds = getUsedTeamIds(debate.id);

                  if (isEditing) {
                    return (
                      <tr key={debate.id}>
                        <td>{getRondaNombre(debate.rondaId)}</td>
                        <td>{getSalaNombre(debate.salaId)}</td>
                        {(['ag', 'ao', 'bg', 'bo'] as const).map((pos) => (
                          <td key={pos}>
                            <select
                              title={pos.toUpperCase()}
                              className="select text-sm"
                              value={editForm[pos]}
                              onChange={(e) => setEditForm((prev) => ({ ...prev, [pos]: e.target.value }))}
                            >
                              <option value="">Seleccionar</option>
                              {equipos.map((eq) => (
                                <option key={eq.id} value={eq.id}>{eq.nombre}</option>
                              ))}
                            </select>
                          </td>
                        ))}
                        <td>
                          {debate.incompleto && <span className="text-amber-600 text-xs">Incompleto</span>}
                        </td>
                        <td className="whitespace-nowrap">
                          <button
                            className="text-sm text-green-600 hover:text-green-800 mr-2"
                            disabled={isSaving}
                            onClick={() => saveEditing(debate.id)}
                          >
                            {isSaving ? 'Guardando...' : 'Guardar'}
                          </button>
                          <button
                            className="text-sm text-slate-500 hover:text-slate-700"
                            disabled={isSaving}
                            onClick={cancelEditing}
                          >
                            Cancelar
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={debate.id} className={debate.incompleto ? 'bg-amber-50' : ''}>
                      <td>{getRondaNombre(debate.rondaId)}</td>
                      <td>{getSalaNombre(debate.salaId)}</td>
                      <td>{getEquipoNombre(debate.ag)}</td>
                      <td>{getEquipoNombre(debate.ao)}</td>
                      <td>{getEquipoNombre(debate.bg)}</td>
                      <td>{getEquipoNombre(debate.bo)}</td>
                      <td>
                        {debate.incompleto ? (
                          <span className="text-amber-600">Incompleto</span>
                        ) : debate.publicado ? (
                          'Publicado'
                        ) : (
                          'Borrador'
                        )}
                      </td>
                      <td>
                        <button
                          className="text-sm text-slate-600 hover:text-slate-900"
                          onClick={() => startEditing(debate)}
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {editError && <p className="mt-2 text-sm text-red-600">{editError}</p>}
          </div>
        </div>
      )}
    </section>
  );
}

const RondasPage = withAuth(RondasPageInner);
export default RondasPage;

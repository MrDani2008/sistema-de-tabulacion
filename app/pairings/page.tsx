'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { withAuth } from '@/lib/withAuth';

function PairingsPageInner() {
  const router = useRouter();
  const [debates, setDebates] = useState<any[]>([]);
  const [salas, setSalas] = useState<any[]>([]);
  const [equipos, setEquipos] = useState<any[]>([]);
  const [rondas, setRondas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/tournament?tabs=debates,salas,equipos,rondas', { credentials: 'include' });
        if (res.status === 401) { router.replace('/login'); return; }
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Error al cargar emparejamientos');
        setDebates(json.data.debates || []);
        setSalas(json.data.salas || []);
        setEquipos(json.data.equipos || []);
        setRondas(json.data.rondas || []);
      } catch (err: any) {
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

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
      const unpublishedIds = debates.filter((d) => !d.publicado).map((d) => d.id);
      if (unpublishedIds.length > 0) {
        const res = await fetch('/api/debates/batch', {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ ids: unpublishedIds, updates: { publicado: true } })
        });
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json?.error || 'Error al publicar');
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
                    <td>
                      {debate.incompleto ? (
                        <span className="text-amber-600">Incompleto</span>
                      ) : debate.publicado ? (
                        'Publicado'
                      ) : (
                        'Borrador'
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

const PairingsPage = withAuth(PairingsPageInner);
export default PairingsPage;

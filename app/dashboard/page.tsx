import { formatearFecha } from '@/lib/utils';

export default function DashboardPage() {
  const ahora = formatearFecha(new Date().toISOString());

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Dashboard</p>
        <h2 className="mt-4 text-3xl font-bold text-slate-900">Resumen del torneo</h2>
        <p className="mt-4 text-slate-600">Revise el estado actual del torneo, los próximos debates y los resultados confirmados.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <article className="card">
          <h3 className="text-lg font-semibold text-slate-900">Última sincronización</h3>
          <p className="mt-4 text-slate-600">{ahora}</p>
        </article>
        <article className="card">
          <h3 className="text-lg font-semibold text-slate-900">Salas disponibles</h3>
          <p className="mt-4 text-slate-600">3 salas físicas para debates.</p>
        </article>
        <article className="card">
          <h3 className="text-lg font-semibold text-slate-900">Formato</h3>
          <p className="mt-4 text-slate-600">British Parliamentary (AG, AO, BG, BO).</p>
        </article>
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold text-slate-900">Notas para organización</h3>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-600">
          <li>Registre equipos e instituciones antes de crear rondas.</li>
          <li>Cada ronda puede usar hasta 3 debates con 4 equipos por sala.</li>
          <li>Confirme los resultados para actualizar las clasificaciones automáticamente.</li>
        </ul>
      </div>
    </section>
  );
}

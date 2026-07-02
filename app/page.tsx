import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Bienvenido</p>
        <h2 className="mt-4 text-3xl font-bold text-slate-900">Gestión de torneos British Parliamentary</h2>
        <p className="mt-4 max-w-3xl text-slate-600">
          Administre inscripciones, rondas, emparejamientos y resultados con sincronización automática a Google Sheets. Diseñado para staff de torneos y tabulación en tiempo real.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-xl font-semibold text-slate-900">Registro de equipos</h3>
          <p className="mt-3 text-slate-600">Cree, edite y elimine equipos. Asigne instituciones y oradores para cada equipo.</p>
          <Link href="/equipos" className="button-primary mt-6 inline-block">Ir a Equipos</Link>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold text-slate-900">Rondas y emparejamientos</h3>
          <p className="mt-3 text-slate-600">Cree rondas, asigne equipos a debates y organice las salas disponibles.</p>
          <Link href="/rondas" className="button-primary mt-6 inline-block">Ir a Rondas</Link>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold text-slate-900">Resultados y clasificación</h3>
          <p className="mt-3 text-slate-600">Ingrese resultados de debates y publique clasificaciones automáticas para equipos y oradores.</p>
          <Link href="/resultados" className="button-primary mt-6 inline-block">Ir a Resultados</Link>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold text-slate-900">Google Sheets</h3>
          <p className="mt-3 text-slate-600">Sincronización constante con Google Sheets para guardar y recuperar toda la información del torneo.</p>
          <Link href="/configuracion" className="button-primary mt-6 inline-block">Ir a Configuración</Link>
        </div>
      </div>
    </section>
  );
}

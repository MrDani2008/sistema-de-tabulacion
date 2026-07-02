export default function ConfiguracionPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Configuración</p>
        <h2 className="mt-4 text-3xl font-bold text-slate-900">Ajustes de integración</h2>
        <p className="mt-4 text-slate-600">Configure Google Sheets para sincronizar automáticamente toda la información del torneo.</p>
      </div>

      <div className="card space-y-5">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Google Sheets</h3>
          <p className="mt-2 text-slate-600">Use las siguientes variables de entorno en Vercel: <strong>GOOGLE_SHEETS_ID</strong> y <strong>GOOGLE_SERVICE_ACCOUNT_KEY</strong>.</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Documentación visible</h3>
          <p className="mt-2 text-slate-600">Al iniciar la aplicación, se crea y sincroniza la hoja de cálculo automáticamente si no existe.</p>
        </div>
      </div>
    </section>
  );
}

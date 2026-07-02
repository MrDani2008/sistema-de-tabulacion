import Link from 'next/link';

const navItems = [
  { href: '/', label: 'Inicio' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/equipos', label: 'Equipos' },
  { href: '/instituciones', label: 'Instituciones' },
  { href: '/rondas', label: 'Rondas' },
  { href: '/salas', label: 'Salas' },
  { href: '/pairings', label: 'Pairings' },
  { href: '/resultados', label: 'Resultados' },
  { href: '/ranking', label: 'Ranking General' },
  { href: '/configuracion', label: 'Configuración' }
];

export default function Sidebar() {
  return (
    <aside className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Sistema de Tabulación</p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">BP Debate</h1>
        <p className="mt-2 text-sm text-slate-600">Administre torneos, equipos, rondas y resultados con Google Sheets.</p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="block rounded-2xl px-4 py-3 text-slate-700 transition hover:bg-slate-100 hover:text-slate-900">
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

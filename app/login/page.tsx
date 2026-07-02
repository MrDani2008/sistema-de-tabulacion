'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/dashboard';
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ usuario, contrasena }),
        credentials: 'include'
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Error al iniciar sesión');
      router.push(from);
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Acceso</p>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">Iniciar sesión</h1>
        <p className="mt-4 text-slate-600">Ingrese sus credenciales para acceder al sistema de tabulación.</p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="usuario" className="mb-2 block text-sm font-medium text-slate-700">Usuario</label>
            <input
              id="usuario"
              type="text"
              className="input"
              placeholder="Usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="contrasena" className="mb-2 block text-sm font-medium text-slate-700">Contraseña</label>
            <input
              id="contrasena"
              type="password"
              className="input"
              placeholder="Contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-600">{error}</p>}
          <button type="submit" className="button-primary w-full" disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><p>Cargando...</p></div>}>
      <LoginForm />
    </Suspense>
  );
}

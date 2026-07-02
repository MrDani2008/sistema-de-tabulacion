'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const router = useRouter();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
      async function check() {
        try {
          const res = await fetch('/api/tournament', { credentials: 'include' });
          if (res.status === 401) {
            router.replace('/login');
            return;
          }
          setChecked(true);
        } catch {
          setChecked(true);
        }
      }
      check();
    }, [router]);

    if (!checked) {
      return (
        <div className="flex items-center justify-center p-12">
          <p className="text-slate-500">Verificando sesión...</p>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}

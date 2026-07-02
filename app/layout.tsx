import './globals.css';
import type { Metadata } from 'next';
import Sidebar from './components/Sidebar';

export const metadata: Metadata = {
  title: 'Sistema de Tabulación BP',
  description: 'Gestión completa de torneos British Parliamentary sincronizada con Google Sheets.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className="min-h-screen bg-slate-100">
          <div className="container mx-auto px-4 py-6">
            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
              <Sidebar />
              <main className="space-y-6">{children}</main>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

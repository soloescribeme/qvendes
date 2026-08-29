import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Qvendes | Sitio de Compra y Venta Recomendado por Usuarios',
  description: 'Publica y encuentra productos, vehículos, inmuebles y servicios de forma segura con retención de pago y vendedores verificados.',
  keywords: ['Qvendes', 'Marketplace Ecuador', 'Compra y Venta', 'Vendedores Verificados', 'Escrow Ecuador', 'Anuncios Clasificados'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased selection:bg-purple-500 selection:text-white bg-slate-950 text-slate-100 min-h-screen flex flex-col justify-between">
        {children}
      </body>
    </html>
  );
}

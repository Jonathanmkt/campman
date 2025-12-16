import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Mobile - Campanha Thiago Moura',
  description: 'Área mobile para lideranças e coordenadores',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}

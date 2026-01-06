import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Convite para Campanha Thiago Moura',
  description: 'Convite Especial',
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

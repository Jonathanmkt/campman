import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Convite para Campanha Thiago Moura',
  description: 'Convite Especial',
  openGraph: {
    title: 'Convite para Campanha Thiago Moura',
    description: 'Convite Especial',
    images: [
      {
        url: '/convite-wp.png',
        width: 1200,
        height: 630,
        alt: 'Convite especial para a Campanha Thiago Moura',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Convite para Campanha Thiago Moura',
    description: 'Convite Especial',
    images: ['/convite-wp.png'],
  },
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

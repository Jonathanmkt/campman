import { Metadata, Viewport } from 'next';
import { MobileHeader } from './components/MobileHeader';

export const metadata: Metadata = {
  title: 'Thiago Moura 2026',
  description: 'Campanha Thiago Moura 2026',
  openGraph: {
    title: 'Thiago Moura 2026',
    description: 'Campanha Thiago Moura 2026',
    images: [
      {
        url: '/convite-wp.png',
        width: 1200,
        height: 630,
        alt: 'Campanha Thiago Moura 2026',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Thiago Moura 2026',
    description: 'Campanha Thiago Moura 2026',
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MobileHeader />
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

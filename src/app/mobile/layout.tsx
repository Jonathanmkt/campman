import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
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
  return <>{children}</>;
}

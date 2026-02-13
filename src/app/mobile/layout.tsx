import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'Idealis Core',
  description: 'Idealis Core - Sistema de gestão de campanha política',
  openGraph: {
    title: 'Idealis Core',
    description: 'Idealis Core - Sistema de gestão de campanha política',
    images: [
      {
        url: '/convite-wp.png',
        width: 1200,
        height: 630,
        alt: 'Idealis Core',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Idealis Core',
    description: 'Idealis Core - Sistema de gestão de campanha política',
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

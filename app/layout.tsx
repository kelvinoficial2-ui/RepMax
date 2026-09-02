import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import { PwaRegister } from '@/components/pwa-register';
import './globals.css';

const geist = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Foco — Treino pessoal',
  description: 'Seu treino, suas cargas e sua evolução em um só lugar.',
  applicationName: 'Foco',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Foco',
  },
};

export const viewport: Viewport = {
  themeColor: '#091214',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${geist.variable} antialiased`}>
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}

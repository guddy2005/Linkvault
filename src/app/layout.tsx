import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LinkVault - Gamified URL Shortener',
  description: 'Shorten links, earn XP, unlock premium features. The only URL shortener that rewards you.',
  keywords: ['url shortener', 'link shortener', 'gamification', 'qr code', 'analytics'],
  authors: [{ name: 'LinkVault' }],
  openGraph: {
    title: 'LinkVault - Gamified URL Shortener',
    description: 'Shorten links, earn XP, unlock premium features.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-space-900 text-white antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

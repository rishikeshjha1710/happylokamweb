import type { Metadata, Viewport } from 'next';
import { Manrope, Space_Grotesk } from 'next/font/google';
import type { ReactNode } from 'react';
import { SiteShell } from '@/components/site-shell';
import { Providers } from './providers';
import './globals.css';

const bodyFont = Manrope({
  subsets: ['latin'],
  variable: '--font-body'
});

const displayFont = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display'
});

export const metadata: Metadata = {
  title: {
    default: 'Happy Lokam ',
    template: '%s | Happy Lokam '
  },
  description: 'Premium event booking platform for users, vendors, and admins with secure bookings, polished dashboards, and commerce-ready operations.',
  applicationName: 'Happy Lokam ',
  keywords: ['event booking platform', 'vendor marketplace', 'wedding planning', 'event services', 'Happy Lokam'],
  openGraph: {
    title: 'Happy Lokam ',
    description: 'Secure event discovery, booking, vendor operations, and admin control in one premium platform.',
    type: 'website'
  }
};

export const viewport: Viewport = {
  themeColor: '#e11d48'
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body className="antialiased">
        <Providers>
          <SiteShell>{children}</SiteShell>
        </Providers>
      </body>
    </html>
  );
}

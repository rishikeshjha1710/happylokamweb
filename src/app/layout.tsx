import type { Metadata, Viewport } from 'next';
import { Manrope, Space_Grotesk } from 'next/font/google';
import type { ReactNode } from 'react';
import { SiteShell } from '@/components/site-shell';
import { Providers } from './providers';
import './globals.css';

const siteOrigin = process.env.NEXT_PUBLIC_SITE_ORIGIN?.trim() || 'https://happylokam.com';

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
    default: 'happylokam',
    template: '%s | happylokam'
  },
  description:
    'happylokam is a premium celebration platform for users, partners, and admins with fast discovery, secure bookings, and polished dashboards.',
  applicationName: 'happylokam',
  keywords: [
    'happylokam',
    'celebration booking platform',
    'celebration planning',
    'vendor marketplace',
    'wedding services',
    'party booking',
    'celebration management',
    'secure bookings',
    'partner dashboard',
    'admin dashboard'
  ],
  metadataBase: new URL(siteOrigin),
  alternates: {
    canonical: '/'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1
    }
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg'
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: 'happylokam',
    description:
      'Secure celebration discovery, booking, vendor operations, and admin control in one premium celebration platform.',
    type: 'website',
    url: siteOrigin,
    siteName: 'happylokam',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'happylokam - Premium celebration platform'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'happylokam',
    description:
      'Premium celebration platform for users, partners, and admins with fast discovery and secure bookings.',
    images: ['/og-image.svg']
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

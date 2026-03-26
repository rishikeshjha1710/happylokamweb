import type { MetadataRoute } from 'next';

const siteOrigin = process.env.NEXT_PUBLIC_SITE_ORIGIN?.trim() || 'https://happylokam.com';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Happylokam',
    short_name: 'Happylokam',
    description: 'Premium event booking and celebration platform for users, partners, and admins.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#fff1f2',
    theme_color: '#e11d48',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml'
      }
    ],
    id: siteOrigin
  };
}

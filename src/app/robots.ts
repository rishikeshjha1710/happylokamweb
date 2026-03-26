import type { MetadataRoute } from 'next';

const siteOrigin = process.env.NEXT_PUBLIC_SITE_ORIGIN?.trim() || 'https://happylokam.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/login', '/signup']
      }
    ],
    sitemap: `${siteOrigin}/sitemap.xml`,
    host: siteOrigin
  };
}

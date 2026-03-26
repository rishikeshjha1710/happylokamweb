import type { MetadataRoute } from 'next';

const siteOrigin = process.env.NEXT_PUBLIC_SITE_ORIGIN?.trim() || 'https://happylokam.com';
const graphqlOrigin = (process.env.INTERNAL_API_ORIGIN?.trim() || 'http://127.0.0.1:4000').replace(/\/+$/, '');

type SitemapService = {
  slug?: string | null;
  vendor?: {
    id?: string | null;
  } | null;
};

async function loadServiceRoutes() {
  try {
    const response = await fetch(`${graphqlOrigin}/graphql`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        query: `
          query SitemapServices {
            fetchServices {
              slug
              vendor {
                id
              }
            }
          }
        `
      }),
      cache: 'no-store'
    });

    if (!response.ok) {
      return { services: [] as SitemapService[] };
    }

    const payload = await response.json();
    return { services: (payload?.data?.fetchServices ?? []) as SitemapService[] };
  } catch {
    return { services: [] as SitemapService[] };
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { services } = await loadServiceRoutes();
  const vendorIds = new Set<string>();

  const dynamicEntries = services.flatMap((service) => {
    const entries: MetadataRoute.Sitemap = [];

    if (service?.slug) {
      entries.push({
        url: `${siteOrigin}/services/${service.slug}`,
        changeFrequency: 'weekly',
        priority: 0.8
      });
    }

    if (service?.vendor?.id) {
      vendorIds.add(service.vendor.id);
    }

    return entries;
  });

  const vendorEntries: MetadataRoute.Sitemap = Array.from(vendorIds).map((vendorId) => ({
    url: `${siteOrigin}/vendors/${vendorId}`,
    changeFrequency: 'weekly',
    priority: 0.75
  }));

  return [
    {
      url: siteOrigin,
      changeFrequency: 'daily',
      priority: 1
    },
    {
      url: `${siteOrigin}/explore`,
      changeFrequency: 'daily',
      priority: 0.9
    },
    {
      url: `${siteOrigin}/how-to-and-what-is`,
      changeFrequency: 'monthly',
      priority: 0.6
    },
    ...dynamicEntries,
    ...vendorEntries
  ];
}

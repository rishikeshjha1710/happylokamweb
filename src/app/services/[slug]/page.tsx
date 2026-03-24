import { ServiceDetailView } from '@/components/detail-views';

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ServiceDetailView slug={slug} />;
}

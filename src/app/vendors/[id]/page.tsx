import { PartnerDetailView } from '@/components/detail-views';

export default async function VendorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PartnerDetailView vendorId={id} />;
}

import Image from 'next/image';
import { isExternalImage, resolveServiceImage } from '@/lib/media';

type MarketplaceImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  sizes: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
};

export function MarketplaceImage({
  src,
  alt,
  className,
  sizes,
  fill = false,
  width = 1200,
  height = 800,
  priority = false
}: MarketplaceImageProps) {
  const resolvedSrc = resolveServiceImage(src, alt);
  const unoptimized = resolvedSrc.startsWith('data:') || isExternalImage(resolvedSrc);

  if (fill) {
    return (
      <Image
        src={resolvedSrc}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={unoptimized}
        className={className}
      />
    );
  }

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      unoptimized={unoptimized}
      className={className}
    />
  );
}

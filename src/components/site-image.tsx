import Image from "next/image";

type SiteImageProps = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
};

/**
 * A photo managed in the admin (a path in public/images or an uploaded photo).
 * Fills its positioned parent; shows nothing when no photo has been set.
 */
export function SiteImage({ src, alt, sizes, className }: SiteImageProps) {
  if (!src) return null;
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      // Uploaded photos are already resized to WebP when they are uploaded.
      unoptimized={src.startsWith("/media/")}
      className={className}
    />
  );
}

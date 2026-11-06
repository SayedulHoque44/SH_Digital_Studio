import Image, { type ImageProps } from "next/image";
import { canOptimizeImage, isSafeMediaSrc } from "@/lib/image";
import { cn } from "@/lib/utils";
import MediaPlaceholder from "./MediaPlaceholder";

type TSmartImageProps = Omit<ImageProps, "src" | "alt"> & {
  src?: string;
  alt?: string;
  placeholderLabel?: string;
};

/**
 * next/image with sensible fallbacks:
 * - optimizes local files and configured hosts (resizing + AVIF/WebP)
 * - renders other https images unoptimized instead of erroring, so any
 *   media URL added in the admin works
 * - shows a polished placeholder when no image is available
 */
export default function SmartImage({
  src,
  alt = "",
  className,
  placeholderLabel,
  ...props
}: TSmartImageProps) {
  if (!isSafeMediaSrc(src)) {
    return (
      <MediaPlaceholder
        label={placeholderLabel}
        className={cn(props.fill && "absolute inset-0", className)}
      />
    );
  }

  return (
    <Image
      src={src!}
      alt={alt}
      className={className}
      unoptimized={!canOptimizeImage(src)}
      {...props}
    />
  );
}

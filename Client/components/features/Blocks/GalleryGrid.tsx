"use client";

import { useState } from "react";
import Lightbox from "@/components/shared/Lightbox";
import SmartImage from "@/components/shared/SmartImage";
import { cn } from "@/lib/utils";
import type { IMedia } from "@/features/Public/interface/public.interface";

const COLUMNS: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
};

export default function GalleryGrid({ images, columns = 3 }: { images: IMedia[]; columns?: number }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <div className={cn("grid gap-4", COLUMNS[columns] || COLUMNS[3])}>
        {images.map((image, index) => (
          <figure key={`${image.url}-${index}`}>
            <button
              type="button"
              onClick={() => setOpen(index)}
              className="group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl bg-ink-900 ring-1 ring-ink-900/10"
            >
              <SmartImage
                src={image.url}
                alt={image.alt || ""}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
              />
              <span className="sr-only">Open image {index + 1} in a larger view</span>
            </button>
            {image.caption && <figcaption className="mt-2 text-sm text-stone-600">{image.caption}</figcaption>}
          </figure>
        ))}
      </div>
      {open !== null && <Lightbox images={images} index={open} onClose={() => setOpen(null)} onChange={setOpen} />}
    </>
  );
}

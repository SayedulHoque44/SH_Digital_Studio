"use client";

import { type KeyboardEvent as ReactKeyboardEvent, useId, useMemo, useRef, useState } from "react";
import { LuMonitor, LuSmartphone, LuTablet } from "react-icons/lu";
import Lightbox from "@/components/shared/Lightbox";
import SmartImage from "@/components/shared/SmartImage";
import { cn } from "@/lib/utils";
import type { IMedia } from "@/features/Public/interface/public.interface";

type TDevice = "desktop" | "tablet" | "mobile";

const DEVICES: { key: TDevice; label: string; Icon: typeof LuMonitor }[] = [
  { key: "desktop", label: "Desktop", Icon: LuMonitor },
  { key: "tablet", label: "Tablet", Icon: LuTablet },
  { key: "mobile", label: "Mobile", Icon: LuSmartphone },
];

const grid: Record<TDevice, string> = {
  desktop: "grid gap-5 md:grid-cols-2",
  tablet: "grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
  mobile: "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4",
};

const aspect: Record<TDevice, string> = {
  desktop: "aspect-[16/10]",
  tablet: "aspect-[834/1194]",
  mobile: "aspect-[390/844]",
};

/**
 * Screenshots grouped by device with an accessible tab list (arrow keys
 * move between tabs) and a lightbox. Only the active tab's images render, so
 * other devices' screenshots are not downloaded until requested.
 */
export default function ScreensGallery({
  desktop,
  tablet,
  mobile,
  gallery = [],
  title,
}: {
  desktop: IMedia[];
  tablet: IMedia[];
  mobile: IMedia[];
  gallery?: IMedia[];
  title: string;
}) {
  const sets = useMemo(
    () => ({ desktop: [...desktop, ...gallery], tablet, mobile }),
    [desktop, gallery, tablet, mobile],
  );
  const available = DEVICES.filter((device) => sets[device.key].length > 0);
  const [active, setActive] = useState<TDevice>(available[0]?.key || "desktop");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const baseId = useId();

  if (!available.length) return null;
  const images = sets[active];

  const onTabKey = (event: ReactKeyboardEvent, position: number) => {
    if (!["ArrowRight", "ArrowLeft"].includes(event.key)) return;
    event.preventDefault();
    const next = (position + (event.key === "ArrowRight" ? 1 : -1) + available.length) % available.length;
    setActive(available[next].key);
    tabsRef.current[next]?.focus();
  };

  return (
    <div>
      {available.length > 1 && (
        <div role="tablist" aria-label="Screenshot device" className="mb-8 inline-flex max-w-full rounded-full bg-paper-200 p-1">
          {available.map((device, position) => {
            const selected = device.key === active;
            return (
              <button
                key={device.key}
                ref={(node) => {
                  tabsRef.current[position] = node;
                }}
                id={`${baseId}-tab-${device.key}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(device.key)}
                onKeyDown={(event) => onTabKey(event, position)}
                className={cn(
                  "inline-flex h-10 min-w-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-sm font-medium transition-colors sm:gap-2 sm:px-4",
                  selected ? "bg-ink-950 text-paper-50" : "text-ink-800 hover:bg-paper-300",
                )}
              >
                <device.Icon aria-hidden className="size-4 max-sm:hidden" />
                {device.label}
                <span className={cn("text-xs", selected ? "text-ink-300" : "text-stone-500")}>
                  {sets[device.key].length}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${active}`}
        className={grid[active]}
      >
        {images.map((image, index) => (
          <button
            key={image.url}
            type="button"
            onClick={() => setLightboxIndex(index)}
            className="group relative overflow-hidden rounded-2xl bg-ink-900 ring-1 ring-ink-900/10 [box-shadow:var(--shadow-card)]"
          >
            <span className={cn("relative block", aspect[active])}>
              <SmartImage
                src={image.url}
                alt={image.alt || `${title} screenshot ${index + 1}`}
                fill
                sizes={active === "mobile" ? "(max-width: 640px) 50vw, 25vw" : "(max-width: 768px) 100vw, 50vw"}
                className="object-cover object-top transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
              />
            </span>
            <span className="sr-only">Open screenshot {index + 1} in a larger view</span>
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onChange={setLightboxIndex}
        />
      )}
    </div>
  );
}

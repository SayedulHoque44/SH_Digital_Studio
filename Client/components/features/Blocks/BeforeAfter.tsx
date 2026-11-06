"use client";

import { useId, useState } from "react";
import SmartImage from "@/components/shared/SmartImage";
import type { IMedia } from "@/features/Public/interface/public.interface";

/**
 * Before/after comparison. The divider is a native range input, so it works
 * with keyboard (arrow keys), touch and screen readers.
 */
export default function BeforeAfter({
  before,
  after,
  beforeLabel = "Before",
  afterLabel = "After",
}: {
  before: IMedia;
  after: IMedia;
  beforeLabel?: string;
  afterLabel?: string;
}) {
  const [position, setPosition] = useState(50);
  const id = useId();

  return (
    <div className="relative">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[1.4rem] bg-ink-900 ring-1 ring-ink-900/10 select-none">
        <SmartImage src={after.url} alt={after.alt || afterLabel} fill sizes="(max-width: 1024px) 100vw, 1100px" className="object-cover object-top" />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
          <SmartImage src={before.url} alt={before.alt || beforeLabel} fill sizes="(max-width: 1024px) 100vw, 1100px" className="object-cover object-top" />
        </div>
        <div aria-hidden className="absolute inset-y-0 w-0.5 bg-paper-50 shadow-[0_0_0_1px_rgb(0_0_0/0.2)]" style={{ left: `${position}%` }}>
          <span className="absolute left-1/2 top-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-paper-50 text-xs font-semibold text-ink-950 shadow-lg">
            ⇆
          </span>
        </div>
        <span className="absolute left-4 top-4 rounded-full bg-ink-950/70 px-3 py-1 text-xs font-medium text-paper-50">{beforeLabel}</span>
        <span className="absolute right-4 top-4 rounded-full bg-ink-950/70 px-3 py-1 text-xs font-medium text-paper-50">{afterLabel}</span>
      </div>
      <label htmlFor={id} className="sr-only">
        Compare {beforeLabel} and {afterLabel}
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}

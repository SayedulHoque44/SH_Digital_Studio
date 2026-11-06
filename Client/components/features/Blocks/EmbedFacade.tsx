"use client";

import { useState } from "react";
import { LuExternalLink, LuMousePointerClick } from "react-icons/lu";
import { hostnameOf } from "@/lib/format";

const RATIO: Record<string, string> = {
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  "1:1": "aspect-square",
  "9:16": "aspect-[9/16] max-w-sm mx-auto",
};

/**
 * Embedded external demo, loaded only on request. The iframe is sandboxed
 * (no top-level navigation, no access to this site) and sends no referrer.
 * Only https URLs added by an admin can reach this component.
 */
export default function EmbedFacade({
  url,
  title,
  aspectRatio = "16:9",
}: {
  url: string;
  title: string;
  aspectRatio?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <figure>
      <div className={`relative overflow-hidden rounded-[1.4rem] bg-ink-950 ring-1 ring-ink-900/10 ${RATIO[aspectRatio] || RATIO["16:9"]}`}>
        {loaded ? (
          <iframe
            src={url}
            title={title}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full bg-white"
          />
        ) : (
          <div className="surface-dark bg-grid-ink absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center text-paper-50">
            <p className="text-eyebrow text-ink-300">Interactive demo · {hostnameOf(url)}</p>
            <p className="font-display text-xl font-semibold">{title}</p>
            <button
              type="button"
              onClick={() => setLoaded(true)}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-accent-contrast hover:brightness-95"
            >
              <LuMousePointerClick aria-hidden className="size-4" />
              Load interactive demo
            </button>
            <p className="max-w-sm text-xs text-ink-400">Loads content from {hostnameOf(url)}.</p>
          </div>
        )}
      </div>
      <figcaption className="mt-3 flex items-center justify-between gap-4 text-sm text-stone-600">
        <span>{title}</span>
        <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline underline-offset-4">
          Open in a new tab <LuExternalLink aria-hidden className="size-3.5" />
        </a>
      </figcaption>
    </figure>
  );
}

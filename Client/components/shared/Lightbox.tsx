"use client";

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { LuChevronLeft, LuChevronRight, LuX } from "react-icons/lu";
import type { IMedia } from "@/features/Public/interface/public.interface";
import SmartImage from "./SmartImage";

/**
 * Accessible image lightbox: modal dialog with focus trap, Escape to close,
 * arrow keys / swipe to navigate, and focus returned to the trigger.
 */
export default function Lightbox({
  images,
  index,
  onClose,
  onChange,
}: {
  images: IMedia[];
  index: number;
  onClose: () => void;
  onChange: (index: number) => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<number | null>(null);
  const image = images[index];
  const count = images.length;

  const go = useCallback((delta: number) => onChange((index + delta + count) % count), [index, count, onChange]);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowRight") go(1);
      else if (event.key === "ArrowLeft") go(-1);
      else if (event.key === "Tab") {
        const focusables = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>("button") || []);
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [go, onClose]);

  if (!image) return null;

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Image ${index + 1} of ${count}${image.alt ? `: ${image.alt}` : ""}`}
      className="surface-dark animate-fade-in fixed inset-0 z-[80] flex flex-col bg-ink-950/95 backdrop-blur-sm [--delay:0]"
      onTouchStart={(event) => (touchStart.current = event.touches[0].clientX)}
      onTouchEnd={(event) => {
        if (touchStart.current === null) return;
        const delta = event.changedTouches[0].clientX - touchStart.current;
        if (Math.abs(delta) > 50) go(delta < 0 ? 1 : -1);
        touchStart.current = null;
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 text-sm text-ink-300 sm:px-6">
        <span aria-live="polite">
          {index + 1} / {count}
        </span>
        <button
          type="button"
          data-autofocus
          onClick={onClose}
          className="inline-flex size-11 items-center justify-center rounded-full text-paper-50 ring-1 ring-white/15 hover:bg-white/10"
        >
          <LuX aria-hidden className="size-5" />
          <span className="sr-only">Close</span>
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4 sm:px-20">
        <div className="relative h-full w-full">
          <SmartImage
            key={image.url}
            src={image.url}
            alt={image.alt || ""}
            fill
            sizes="100vw"
            className="animate-fade-in object-contain [--delay:0]"
          />
        </div>
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-ink-900/80 text-paper-50 ring-1 ring-white/15 hover:bg-ink-800 sm:left-5"
            >
              <LuChevronLeft aria-hidden className="size-6" />
              <span className="sr-only">Previous image</span>
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-ink-900/80 text-paper-50 ring-1 ring-white/15 hover:bg-ink-800 sm:right-5"
            >
              <LuChevronRight aria-hidden className="size-6" />
              <span className="sr-only">Next image</span>
            </button>
          </>
        )}
      </div>
      {(image.caption || image.alt) && (
        <p className="px-6 pb-6 text-center text-sm text-ink-300">{image.caption || image.alt}</p>
      )}
    </div>,
    document.body,
  );
}

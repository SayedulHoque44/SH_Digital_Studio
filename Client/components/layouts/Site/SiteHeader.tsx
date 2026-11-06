"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { LuArrowUpRight, LuMenu, LuX } from "react-icons/lu";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import type { ILink } from "@/features/Public/interface/public.interface";

type THeaderProps = {
  brandName: string;
  logoUrl?: string;
  navigation: ILink[];
  announcement?: { text: string; linkLabel?: string; linkHref?: string };
  contactEmail?: string;
};

const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

export default function SiteHeader({ brandName, logoUrl, navigation, announcement, contactEmail }: THeaderProps) {
  const pathname = usePathname();
  // The menu remembers the page it was opened on, so navigating closes it
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Solid background after leaving the top; hide while scrolling down and
  // reveal when scrolling up (never hidden while it contains focus).
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > 480 && y > lastY.current + 4);
      if (y < lastY.current - 4 || y < 480) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuPath(null);
    requestAnimationFrame(() => toggleRef.current?.focus());
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-[var(--ease-out-expo)] focus-within:translate-y-0",
          hidden && !menuOpen && "-translate-y-[calc(100%+12px)]",
        )}
      >
        {announcement && (
          <div className="surface-dark flex h-10 items-center justify-center bg-accent px-4 text-center text-[0.8rem] font-medium text-accent-contrast">
            <p className="truncate">
              {announcement.text}
              {announcement.linkHref && announcement.linkLabel && (
                <Link href={announcement.linkHref} className="ml-2 underline underline-offset-4">
                  {announcement.linkLabel}
                </Link>
              )}
            </p>
          </div>
        )}
        <div className="mx-auto mt-3 w-full max-w-[1360px] px-3 sm:px-6 lg:px-10 xl:px-12">
          <div
            className={cn(
              "surface-dark flex h-14 items-center justify-between rounded-full pl-4 pr-2 ring-1 backdrop-blur-xl transition-[background-color,box-shadow] duration-500 sm:pl-5",
              scrolled
                ? "bg-ink-950/90 shadow-[0_18px_40px_-20px_rgb(0_0_0/0.55)] ring-white/10"
                : "bg-ink-950/70 ring-white/[0.08]",
            )}
          >
            <Link href="/" aria-label={`${brandName} — home`} className="rounded-full">
              <Logo name={brandName} tone="light" size="sm" logoUrl={logoUrl} compactOnMobile />
            </Link>

            <nav aria-label="Main" className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {navigation
                  .filter((item) => item.href !== "/contact")
                  .map((item) => {
                    const active = isActive(pathname, item.href);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "relative rounded-full px-4 py-2 text-[0.9rem] transition-colors",
                            active ? "text-paper-50" : "text-ink-300 hover:text-paper-50",
                          )}
                        >
                          {item.label}
                          {active && (
                            <span
                              aria-hidden
                              className="absolute bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-[1px] bg-accent"
                            />
                          )}
                        </Link>
                      </li>
                    );
                  })}
              </ul>
            </nav>

            <div className="flex items-center gap-1.5">
              <Link
                href="/contact"
                className="group hidden h-10 items-center gap-1.5 rounded-full bg-accent px-5 text-[0.9rem] font-medium text-accent-contrast transition-[filter] hover:brightness-95 sm:inline-flex"
              >
                Start a project
                <LuArrowUpRight
                  aria-hidden
                  className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Link>
              <button
                ref={toggleRef}
                type="button"
                onClick={() => setMenuPath(pathname)}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                className="inline-flex size-11 items-center justify-center rounded-full text-paper-50 transition-colors hover:bg-white/10 lg:hidden"
              >
                <LuMenu aria-hidden className="size-5" />
                <span className="sr-only">Open menu</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {menuOpen && (
        <MobileMenu
          brandName={brandName}
          logoUrl={logoUrl}
          navigation={navigation}
          pathname={pathname}
          contactEmail={contactEmail}
          onClose={closeMenu}
        />
      )}
    </>
  );
}

function MobileMenu({
  brandName,
  logoUrl,
  navigation,
  pathname,
  contactEmail,
  onClose,
}: {
  brandName: string;
  logoUrl?: string;
  navigation: ILink[];
  pathname: string;
  contactEmail?: string;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus management, Escape to close, focus trap and background scroll lock
  useEffect(() => {
    const panel = panelRef.current;
    const focusables = () =>
      Array.from(panel?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") || []);
    focusables()[1]?.focus();

    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      id="mobile-menu"
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      className="surface-dark animate-fade-in fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-ink-950 [--delay:0]"
    >
      <div className="bg-grid-ink pointer-events-none absolute inset-0 opacity-60 mask-fade-y" aria-hidden />
      <div className="relative flex h-[4.5rem] items-center justify-between px-4 pt-3 sm:px-6">
        <Link href="/" onClick={onClose} aria-label={`${brandName} — home`} className="pl-3">
          <Logo name={brandName} tone="light" size="sm" logoUrl={logoUrl} />
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex size-11 items-center justify-center rounded-full text-paper-50 ring-1 ring-white/15 hover:bg-white/10"
        >
          <LuX aria-hidden className="size-5" />
          <span className="sr-only">Close menu</span>
        </button>
      </div>

      <nav aria-label="Mobile" className="relative flex-1 px-7 pt-10 sm:px-10">
        <ul className="space-y-1">
          {navigation.map((item, index) => (
            <li key={item.href} className="animate-rise" style={{ "--delay": 60 + index * 55 } as CSSProperties}>
              <Link
                href={item.href}
                onClick={onClose}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
                className={cn(
                  "font-display flex items-baseline gap-4 py-2 text-[2.6rem] leading-tight tracking-[-0.035em] transition-colors",
                  isActive(pathname, item.href) ? "text-accent" : "text-paper-50 hover:text-accent",
                )}
              >
                <span className="font-mono text-xs text-ink-400">0{index + 1}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="relative space-y-5 px-7 pb-10 pt-8 sm:px-10">
        <Link
          href="/contact"
          onClick={onClose}
          className="inline-flex h-[3.25rem] w-full items-center justify-center gap-2 rounded-full bg-accent text-base font-medium text-accent-contrast"
        >
          Start a project <LuArrowUpRight aria-hidden className="size-4" />
        </Link>
        {contactEmail && (
          <a href={`mailto:${contactEmail}`} className="block text-center text-sm text-ink-300 hover:text-paper-50">
            {contactEmail}
          </a>
        )}
      </div>
    </div>
  );
}

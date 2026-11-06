import { cn } from "@/lib/utils";

/*
 * SH Digital Studio logo system (original, editable SVG).
 *
 * The symbol is a geometric "S": two semicircular bowls joined by straight
 * bars on a 40x40 grid. Its top terminal breaks off into a single accent
 * "pixel" - craft and code in one mark. It stays legible down to 16px.
 *
 * Variants
 * - <LogoSymbol />            bare mark (inherits currentColor, accent pixel)
 * - <LogoSymbol tile />       mark on a rounded tile (favicon / app icon)
 * - <Logo tone="dark|light" /> symbol + live-text wordmark for headers/footers
 * The wordmark is real text in the display face, so the brand name can be
 * edited in Admin -> Site settings without new artwork.
 */

export const LOGO_S_PATH = "M24 9H16a5.5 5.5 0 0 0 0 11h5a5.5 5.5 0 0 1 0 11H10.5";

type TSymbolProps = {
  className?: string;
  tile?: boolean;
  title?: string;
  // Colour of the S stroke; defaults to currentColor
  strokeClassName?: string;
};

export function LogoSymbol({ className, tile = false, title, strokeClassName }: TSymbolProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn("shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      {tile && <rect width="40" height="40" rx="11" className="fill-ink-950" />}
      <path
        d={LOGO_S_PATH}
        fill="none"
        strokeWidth="4.5"
        strokeLinejoin="round"
        className={cn(tile ? "stroke-paper-50" : "stroke-current", strokeClassName)}
      />
      <rect x="27.25" y="6.75" width="4.5" height="4.5" className="fill-accent" />
    </svg>
  );
}

type TLogoProps = {
  name?: string;
  tone?: "dark" | "light"; // dark = for light backgrounds, light = for dark backgrounds
  size?: "sm" | "md" | "lg" | "xl";
  compactOnMobile?: boolean;
  logoUrl?: string; // custom uploaded logo overrides the built-in mark
  className?: string;
};

const sizes = {
  sm: { symbol: "size-7", text: "text-[0.95rem]" },
  md: { symbol: "size-8", text: "text-[1.05rem]" },
  lg: { symbol: "size-10", text: "text-xl" },
  xl: { symbol: "size-14", text: "text-3xl md:text-4xl" },
};

export function Logo({
  name = "SH Digital Studio",
  tone = "dark",
  size = "md",
  compactOnMobile = false,
  logoUrl,
  className,
}: TLogoProps) {
  if (logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logoUrl} alt={name} className={cn("h-8 w-auto", className)} />;
  }

  // First word is set heavier ("SH"), the rest lighter ("Digital Studio")
  const [first, ...rest] = name.split(" ");
  const textTone = tone === "light" ? "text-paper-50" : "text-ink-950";
  const restTone = tone === "light" ? "text-ink-300" : "text-stone-600";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoSymbol className={cn(sizes[size].symbol, textTone)} />
      <span
        className={cn(
          "font-display leading-none tracking-[-0.03em] whitespace-nowrap",
          sizes[size].text,
          textTone,
        )}
      >
        <span className="font-semibold">{first}</span>
        {rest.length > 0 && (
          <span className={cn("font-normal", restTone, compactOnMobile && "hidden sm:inline")}>
            {" "}
            {rest.join(" ")}
          </span>
        )}
      </span>
    </span>
  );
}

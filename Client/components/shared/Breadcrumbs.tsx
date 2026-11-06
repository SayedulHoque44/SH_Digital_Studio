import Link from "next/link";
import { LuChevronRight } from "react-icons/lu";
import { absoluteUrl } from "@/lib/site";
import { cn } from "@/lib/utils";
import JsonLd from "./JsonLd";

export type TCrumb = { label: string; href: string };

// Visible breadcrumb trail + matching BreadcrumbList structured data.
export default function Breadcrumbs({
  items,
  className,
  tone = "light",
}: {
  items: TCrumb[];
  className?: string;
  tone?: "light" | "dark";
}) {
  const trail = [{ label: "Home", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
        <ol className="flex flex-wrap items-center gap-1.5">
          {trail.map((item, index) => {
            const isLast = index === trail.length - 1;
            return (
              <li key={item.href} className="flex items-center gap-1.5">
                {isLast ? (
                  <span
                    aria-current="page"
                    className={cn("max-w-[48vw] truncate", tone === "dark" ? "text-paper-50" : "text-ink-900")}
                  >
                    {item.label}
                  </span>
                ) : (
                  <>
                    <Link
                      href={item.href}
                      className={cn(
                        "transition-colors",
                        tone === "dark" ? "text-ink-300 hover:text-paper-50" : "text-stone-600 hover:text-ink-900",
                      )}
                    >
                      {item.label}
                    </Link>
                    <LuChevronRight aria-hidden className="size-3.5 opacity-50" />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: trail.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.label,
            item: absoluteUrl(item.href),
          })),
        }}
      />
    </>
  );
}

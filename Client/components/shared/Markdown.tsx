import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/**
 * Renders admin-authored Markdown safely.
 *
 * react-markdown does not render raw HTML (no rehype-raw), and its default
 * URL transform drops dangerous protocols such as `javascript:`, so stored
 * content can never inject markup or scripts. Headings are shifted down so a
 * content field can never produce a second <h1> on the page.
 */
const components: Components = {
  h1: ({ children }) => <h2>{children}</h2>,
  h2: ({ children }) => <h3>{children}</h3>,
  h3: ({ children }) => <h4 className="font-display text-lg text-ink-900">{children}</h4>,
  a: ({ href = "", children }) => {
    if (href.startsWith("/") && !href.startsWith("//")) {
      return <Link href={href}>{children}</Link>;
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  },
  // eslint-disable-next-line @next/next/no-img-element
  img: ({ src, alt }) => (typeof src === "string" ? <img src={src} alt={alt || ""} loading="lazy" className="rounded-xl" /> : null),
};

export default function Markdown({
  children,
  className,
  invert = false,
}: {
  children?: string;
  className?: string;
  invert?: boolean;
}) {
  if (!children?.trim()) return null;
  return (
    <div className={cn("prose-studio", invert && "prose-invert", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components} skipHtml>
        {children}
      </ReactMarkdown>
    </div>
  );
}

/**
 * Structured data (schema.org). `<` is escaped so content can never close the
 * script tag early (XSS). Only pass properties backed by real page content.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

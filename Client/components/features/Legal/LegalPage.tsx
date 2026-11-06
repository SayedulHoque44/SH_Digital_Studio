import Markdown from "@/components/shared/Markdown";
import Container from "@/components/ui/Container";
import PageHero from "@/components/ui/PageHero";
import { formatDate } from "@/lib/format";

// Shared layout for the editable privacy policy and terms pages.
export default function LegalPage({
  title,
  content,
  updatedAt,
}: {
  title: string;
  content?: string;
  updatedAt?: string;
}) {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title={title}
        intro={updatedAt ? `Last updated ${formatDate(updatedAt)}` : undefined}
      />
      <section className="bg-paper-100 pb-[clamp(4rem,8vw,7rem)]">
        <Container size="narrow">
          <div className="rounded-[1.75rem] bg-paper-50 p-7 ring-1 ring-ink-900/10 sm:p-12">
            {content?.trim() ? (
              <Markdown>{content}</Markdown>
            ) : (
              <p className="text-stone-600">This page is being prepared.</p>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}

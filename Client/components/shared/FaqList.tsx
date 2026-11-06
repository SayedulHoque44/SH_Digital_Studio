import { LuPlus } from "react-icons/lu";
import { cn } from "@/lib/utils";
import type { IFaq } from "@/features/Public/interface/public.interface";
import JsonLd from "./JsonLd";

/**
 * FAQ accordion built on native <details>/<summary>: keyboard and screen
 * reader accessible with zero JavaScript. Emits FAQPage structured data from
 * the same (real) questions shown on the page.
 */
export default function FaqList({ faqs, className, withSchema = true }: { faqs: IFaq[]; className?: string; withSchema?: boolean }) {
  if (!faqs.length) return null;
  return (
    <>
      <div className={cn("divide-y divide-ink-900/10 border-y border-ink-900/10", className)}>
        {faqs.map((faq) => (
          <details key={faq.question} className="group py-1">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left font-display text-[1.15rem] font-semibold tracking-[-0.015em] [&::-webkit-details-marker]:hidden">
              {faq.question}
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full ring-1 ring-ink-900/15 transition-transform duration-300 group-open:rotate-45">
                <LuPlus aria-hidden className="size-4" />
              </span>
            </summary>
            <p className="max-w-3xl pb-6 pr-12 leading-relaxed text-stone-600">{faq.answer}</p>
          </details>
        ))}
      </div>
      {withSchema && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }}
        />
      )}
    </>
  );
}

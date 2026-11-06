import { LuArrowRight, LuCircleCheck, LuInfo, LuQuote, LuTriangleAlert } from "react-icons/lu";
import Icon from "@/components/shared/Icon";
import Markdown from "@/components/shared/Markdown";
import SmartImage from "@/components/shared/SmartImage";
import VideoPlayer from "@/components/shared/VideoPlayer";
import ButtonLink from "@/components/ui/ButtonLink";
import { cn } from "@/lib/utils";
import type { IContentBlock, IMedia } from "@/features/Public/interface/public.interface";
import BeforeAfter from "./BeforeAfter";
import EmbedFacade from "./EmbedFacade";
import GalleryGrid from "./GalleryGrid";

/*
 * Renders the ordered content blocks managed in the admin (project and
 * category pages). Each block type maps to one presentational component.
 * Data was validated by the API on save; unknown types are skipped so an
 * older frontend never breaks on newer content.
 */

const GRID: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

function BlockHeading({ children }: { children?: string }) {
  if (!children) return null;
  return <h2 className="text-display-md mb-8 max-w-3xl">{children}</h2>;
}

function Figure({ image, layout = "contained" }: { image: IMedia; layout?: string }) {
  return (
    <figure className={cn(layout === "wide" && "lg:-mx-12", layout === "full" && "lg:-mx-24")}>
      <div
        className="relative overflow-hidden rounded-[1.4rem] bg-paper-200 ring-1 ring-ink-900/10"
        style={{ aspectRatio: image.width && image.height ? `${image.width} / ${image.height}` : "16 / 10" }}
      >
        <SmartImage src={image.url} alt={image.alt || ""} fill sizes="(max-width: 1024px) 100vw, 1200px" className="object-cover" />
      </div>
      {image.caption && <figcaption className="mt-3 text-sm text-stone-600">{image.caption}</figcaption>}
    </figure>
  );
}

function Block({ block }: { block: IContentBlock }) {
  const d = block.data;
  switch (block.type) {
    case "richText":
      return <Markdown className="measure">{d.markdown}</Markdown>;

    case "heading":
      return (
        <div className="max-w-3xl">
          {d.eyebrow && <p className="text-eyebrow mb-4 text-stone-600">{d.eyebrow}</p>}
          <h2 className="text-display-md">{d.heading}</h2>
          {d.text && <Markdown className="mt-5">{d.text}</Markdown>}
        </div>
      );

    case "image":
      return <Figure image={d.image} layout={d.layout} />;

    case "gallery":
      return (
        <div>
          <BlockHeading>{d.heading}</BlockHeading>
          <GalleryGrid images={d.images || []} columns={d.columns} />
        </div>
      );

    case "video":
      return (
        <div>
          <BlockHeading>{d.heading}</BlockHeading>
          <VideoPlayer video={d.video} />
        </div>
      );

    case "imageText":
      return (
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className={cn(d.imagePosition === "right" && "lg:order-2")}>
            <Figure image={d.image} />
          </div>
          <div>
            {d.heading && <h2 className="text-display-md mb-5">{d.heading}</h2>}
            <Markdown>{d.markdown}</Markdown>
          </div>
        </div>
      );

    case "featureGrid":
      return (
        <div>
          <BlockHeading>{d.heading}</BlockHeading>
          {d.intro && <p className="text-lead -mt-4 mb-10 max-w-2xl text-stone-600">{d.intro}</p>}
          <ul className={cn("grid gap-5", GRID[d.columns] || GRID[3])}>
            {(d.items || []).map((item: { title: string; description?: string; icon?: string }) => (
              <li key={item.title} className="rounded-2xl bg-paper-50 p-6 ring-1 ring-ink-900/10">
                {item.icon && <Icon name={item.icon} className="mb-4 size-6 text-ink-900" />}
                <h3 className="font-display text-lg font-semibold tracking-[-0.02em]">{item.title}</h3>
                {item.description && <p className="mt-2 leading-relaxed text-stone-600">{item.description}</p>}
              </li>
            ))}
          </ul>
        </div>
      );

    case "techList":
      return (
        <div>
          <BlockHeading>{d.heading}</BlockHeading>
          <ul className="flex flex-wrap gap-2">
            {(d.items || []).map((item: string) => (
              <li key={item} className="rounded-full bg-paper-50 px-4 py-2 text-sm font-medium ring-1 ring-ink-900/10">
                {item}
              </li>
            ))}
          </ul>
        </div>
      );

    case "stats":
      // Every statistic carries its source (required by the admin form)
      return (
        <div>
          <BlockHeading>{d.heading}</BlockHeading>
          <dl className="grid gap-px overflow-hidden rounded-3xl bg-ink-900/10 sm:grid-cols-2 lg:grid-cols-4">
            {(d.items || []).map((item: { value: string; label: string; source: string }) => (
              <div key={item.label} className="bg-paper-50 p-7">
                <dd className="font-display text-[2.6rem] font-semibold leading-none tracking-[-0.04em]">{item.value}</dd>
                <dt className="mt-3 font-medium">{item.label}</dt>
                <p className="mt-2 text-xs text-stone-600">Source: {item.source}</p>
              </div>
            ))}
          </dl>
        </div>
      );

    case "comparison":
      return (
        <div>
          <BlockHeading>{d.heading}</BlockHeading>
          <div className="overflow-x-auto rounded-2xl ring-1 ring-ink-900/10">
            <table className="w-full min-w-[540px] bg-paper-50 text-left text-[0.95rem]">
              <thead className="bg-paper-200">
                <tr>
                  <th scope="col" className="p-4 font-medium text-stone-600">
                    <span className="sr-only">Aspect</span>
                  </th>
                  <th scope="col" className="p-4 font-semibold">{d.leftTitle}</th>
                  <th scope="col" className="p-4 font-semibold">{d.rightTitle}</th>
                </tr>
              </thead>
              <tbody>
                {(d.rows || []).map((row: { label: string; left: string; right: string }) => (
                  <tr key={row.label} className="border-t border-ink-900/10">
                    <th scope="row" className="p-4 font-medium">{row.label}</th>
                    <td className="p-4 text-stone-600">{row.left}</td>
                    <td className="p-4 text-stone-600">{row.right}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

    case "quote":
      // The API only returns quotes marked as approved
      return (
        <figure className="surface-dark rounded-3xl bg-ink-950 p-8 text-paper-50 sm:p-12">
          <LuQuote aria-hidden className="size-8 text-accent" />
          <blockquote className="mt-6 font-display text-[clamp(1.4rem,1rem+1.2vw,2rem)] leading-snug tracking-[-0.02em]">
            {d.quote}
          </blockquote>
          <figcaption className="mt-6 text-ink-300">
            <span className="font-medium text-paper-50">{d.author}</span>
            {d.role ? `, ${d.role}` : ""}
          </figcaption>
        </figure>
      );

    case "callout": {
      const tones: Record<string, { cls: string; Icon: typeof LuInfo }> = {
        info: { cls: "bg-info/10 ring-info/25", Icon: LuInfo },
        note: { cls: "bg-paper-200 ring-ink-900/10", Icon: LuInfo },
        warning: { cls: "bg-warning/10 ring-warning/30", Icon: LuTriangleAlert },
        success: { cls: "bg-success/10 ring-success/25", Icon: LuCircleCheck },
      };
      const tone = tones[d.tone] || tones.note;
      return (
        <aside className={cn("flex gap-4 rounded-2xl p-6 ring-1", tone.cls)}>
          <tone.Icon aria-hidden className="mt-1 size-5 shrink-0" />
          <div>
            {d.title && <p className="font-semibold">{d.title}</p>}
            <Markdown className={cn(d.title && "mt-1", "text-[0.98rem]")}>{d.markdown}</Markdown>
          </div>
        </aside>
      );
    }

    case "embed":
      return <EmbedFacade url={d.url} title={d.title} aspectRatio={d.aspectRatio} />;

    case "beforeAfter":
      return (
        <div>
          <BlockHeading>{d.heading}</BlockHeading>
          <BeforeAfter before={d.before} after={d.after} beforeLabel={d.beforeLabel} afterLabel={d.afterLabel} />
          {d.caption && <p className="mt-3 text-sm text-stone-600">{d.caption}</p>}
        </div>
      );

    case "timeline":
      return (
        <div>
          <BlockHeading>{d.heading}</BlockHeading>
          <ol className="relative space-y-8 border-l border-ink-900/15 pl-8">
            {(d.items || []).map((item: { title: string; date?: string; description?: string }) => (
              <li key={`${item.title}-${item.date}`} className="relative">
                <span aria-hidden className="absolute -left-[37px] top-1.5 size-3 rounded-[2px] bg-accent ring-4 ring-paper-100" />
                {item.date && <p className="text-eyebrow text-stone-600">{item.date}</p>}
                <h3 className="mt-1 font-display text-lg font-semibold tracking-[-0.02em]">{item.title}</h3>
                {item.description && <p className="mt-2 leading-relaxed text-stone-600">{item.description}</p>}
              </li>
            ))}
          </ol>
        </div>
      );

    case "cta":
      return (
        <div className="surface-dark flex flex-col gap-6 rounded-3xl bg-ink-950 p-8 text-paper-50 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-display-md">{d.heading}</h2>
            {d.text && <p className="mt-3 text-ink-300">{d.text}</p>}
          </div>
          <ButtonLink href={d.buttonHref} variant="accent" size="lg" rightIcon={<LuArrowRight aria-hidden className="size-4" />}>
            {d.buttonLabel}
          </ButtonLink>
        </div>
      );

    default:
      return null;
  }
}

export default function BlockRenderer({ blocks, className }: { blocks: IContentBlock[]; className?: string }) {
  if (!blocks?.length) return null;
  return (
    <div className={cn("space-y-[clamp(3.5rem,7vw,6rem)]", className)}>
      {blocks.map((block, index) => (
        <section key={block.id || index} data-reveal aria-label={block.data?.heading || undefined}>
          <Block block={block} />
        </section>
      ))}
    </div>
  );
}

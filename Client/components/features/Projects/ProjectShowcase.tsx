import { BrowserFrame, PhoneFrame } from "@/components/shared/DeviceFrames";
import SmartImage from "@/components/shared/SmartImage";
import { cn } from "@/lib/utils";
import type { IProjectDetail } from "@/features/Public/interface/public.interface";

/**
 * Main visual for a project page, chosen by project type:
 * - websites: a scrollable full-page capture in a browser frame + phone
 * - mobile apps: a row of phone screens
 * - web/desktop/SaaS apps: the interface in a browser/app frame
 */
export default function ProjectShowcase({ project }: { project: IProjectDetail }) {
  const { media } = project;
  const mobile = media.mobileScreenshots;

  if (project.projectType === "mobile-app") {
    const phones = mobile.length ? mobile.slice(0, 3) : project.coverImage ? [project.coverImage] : [];
    if (!phones.length) return null;
    return (
      <div className="flex items-end justify-center gap-4 sm:gap-8">
        {phones.map((image, index) => (
          <PhoneFrame
            key={image.url}
            image={image}
            priority={index === 0}
            className={cn("w-[30%] max-w-[260px]", index === 1 && "-translate-y-8")}
            sizes="(max-width: 768px) 30vw, 260px"
          />
        ))}
      </div>
    );
  }

  const tall = media.fullPageScreenshot;
  const main = media.browserMockup || media.coverImage || media.desktopScreenshots[0];
  if (!tall && !main) return null;

  return (
    <div className="relative">
      <BrowserFrame url={project.links.liveUrl} className="mx-auto max-w-[1180px]">
        {tall && project.projectType === "website" ? (
          // Native scrolling: works with mouse wheel, touch and keyboard
          <div className="relative">
            <div
              tabIndex={0}
              role="region"
              aria-label={`Scrollable preview of the full ${project.title} page`}
              className="relative aspect-[16/10] overflow-y-auto overscroll-contain bg-ink-800"
            >
              <SmartImage
                src={tall.url}
                alt={tall.alt || `${project.title} — full page preview`}
                width={tall.width || 1200}
                height={tall.height || 7500}
                sizes="(max-width: 1280px) 100vw, 1180px"
                priority
                className="h-auto w-full"
              />
            </div>
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-ink-950/70 px-3.5 py-1.5 text-xs font-medium text-paper-50 ring-1 ring-white/15 backdrop-blur-md"
            >
              ↕ Scroll to explore the full page
            </span>
          </div>
        ) : (
          <div className="relative aspect-[16/10] bg-ink-800">
            <SmartImage
              src={main?.url}
              alt={main?.alt || `${project.title} interface`}
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1180px"
              className="object-cover object-top"
            />
          </div>
        )}
      </BrowserFrame>

      {mobile[0] && (
        <PhoneFrame
          image={mobile[0]}
          className="absolute -bottom-10 right-[4%] hidden w-[17%] max-w-[230px] lg:block"
          sizes="230px"
        />
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { type CSSProperties, type ReactNode, useEffect, useRef } from "react";
import { BrowserFrame, PhoneFrame } from "@/components/shared/DeviceFrames";
import SmartImage from "@/components/shared/SmartImage";
import { cn } from "@/lib/utils";
import type { IProjectCard } from "@/features/Public/interface/public.interface";

/**
 * Hero composition built from real project screenshots (not decorative
 * stock art): three browser windows and a phone, layered in perspective.
 *
 * Pointer parallax only runs on fine pointers (mouse/trackpad) and is
 * disabled for prefers-reduced-motion. It writes two CSS variables on the
 * stage via requestAnimationFrame - no React re-renders, no animation
 * library.
 *
 * Each layer nests separate wrappers so transforms never fight (a CSS
 * animation with fill-mode would otherwise override an inline transform):
 * position -> entrance animation -> parallax translate -> float -> rotation.
 */
function Layer({
  className,
  depthX,
  depthY,
  delay,
  children,
}: {
  className: string;
  depthX: number;
  depthY: number;
  delay: number;
  children: ReactNode;
}) {
  return (
    <div className={cn("absolute", className)}>
      <div className="animate-rise" style={{ "--delay": delay } as CSSProperties}>
        <div
          style={{
            transform: `translate3d(calc(var(--mx, 0) * ${depthX}px), calc(var(--my, 0) * ${depthY}px), 0)`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default function HeroShowcase({ projects }: { projects: IProjectCard[] }) {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let frame = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const tick = () => {
      currentX += (targetX - currentX) * 0.07;
      currentY += (targetY - currentY) * 0.07;
      stage.style.setProperty("--mx", currentX.toFixed(4));
      stage.style.setProperty("--my", currentY.toFixed(4));
      const settled = Math.abs(targetX - currentX) < 0.001 && Math.abs(targetY - currentY) < 0.001;
      frame = settled ? 0 : requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      targetX = (event.clientX / window.innerWidth - 0.5) * 2;
      targetY = (event.clientY / window.innerHeight - 0.5) * 2;
      if (!frame) frame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  const [center, left, right] = projects;
  const phoneProject = projects.find((project) => project.mobilePreview) || center;
  if (!center) return null;

  const frameLink = (project: IProjectCard, priority = false, sizes = "(max-width: 768px) 92vw, 760px") => (
    <Link href={`/projects/${project.slug}`} aria-label={`View the ${project.title} project`} className="block rounded-xl">
      <BrowserFrame url={project.liveUrl}>
        <div className="relative aspect-16/10 bg-ink-800">
          <SmartImage
            src={project.coverImage?.url}
            alt=""
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover object-top"
          />
        </div>
      </BrowserFrame>
    </Link>
  );

  return (
    <div ref={stageRef} className="relative mx-auto h-[clamp(14rem,50vw,38rem)] w-full max-w-310">
      {/* Side windows (tablet and up) */}
      {left && (
        <Layer className="left-0 top-[18%] z-10 hidden w-[36%] md:block" depthX={-18} depthY={-10} delay={450}>
          <div className="animate-float-slow brightness-[0.82] transition-[filter] duration-500 [animation-delay:-2s] hover:brightness-100">
            <div className="transform-[perspective(1600px)_rotateY(16deg)_rotateZ(-2deg)]">
              {frameLink(left, false, "(max-width: 1280px) 36vw, 450px")}
            </div>
          </div>
        </Layer>
      )}
      {right && (
        <Layer className="right-0 top-[22%] z-10 hidden w-[36%] md:block" depthX={18} depthY={-12} delay={550}>
          <div className="animate-float-slow brightness-[0.82] transition-[filter] duration-500 [animation-delay:-4.5s] hover:brightness-100">
            <div className="transform-[perspective(1600px)_rotateY(-16deg)_rotateZ(2deg)]">
              {frameLink(right, false, "(max-width: 1280px) 36vw, 450px")}
            </div>
          </div>
        </Layer>
      )}

      {/* Main window - centred with inset-x margins (no translate needed) */}
      <Layer className="inset-x-0 top-0 z-20 mx-auto w-full md:w-[60%]" depthX={-8} depthY={-6} delay={300}>
        <div className="transform-[perspective(1800px)_rotateX(8deg)] origin-[50%_100%]">{frameLink(center, true)}</div>
      </Layer>

      {/* Phone */}
      {phoneProject?.mobilePreview && (
        <Layer
          className="bottom-[-6%] right-[2%] z-30 w-[26%] md:bottom-[-12%] md:right-[16%] md:w-[14%]"
          depthX={26}
          depthY={14}
          delay={700}
        >
          <Link
            href={`/projects/${phoneProject.slug}`}
            aria-label={`View the ${phoneProject.title} project on mobile`}
            className="block rounded-[2.1rem]"
          >
            <div className="animate-float-slow [animation-delay:-1s]">
              <PhoneFrame image={phoneProject.mobilePreview} sizes="(max-width: 768px) 26vw, 180px" />
            </div>
          </Link>
        </Layer>
      )}
    </div>
  );
}

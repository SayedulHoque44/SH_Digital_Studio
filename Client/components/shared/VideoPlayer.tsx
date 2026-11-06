"use client";

import { useState } from "react";
import { LuPlay } from "react-icons/lu";
import { cn } from "@/lib/utils";
import type { IVideo } from "@/features/Public/interface/public.interface";
import SmartImage from "./SmartImage";

const youTubeId = (url: string) => {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return parsed.pathname.slice(1).split("/")[0];
    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      if (parsed.pathname === "/watch") return parsed.searchParams.get("v");
      return parsed.pathname.match(/^\/(embed|shorts|live)\/([\w-]{6,})/)?.[2] || null;
    }
  } catch {
    return null;
  }
  return null;
};

const vimeoId = (url: string) => {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.replace(/^www\./, "").endsWith("vimeo.com")) return null;
    return parsed.pathname.match(/(\d{6,})/)?.[1] || null;
  } catch {
    return null;
  }
};

/**
 * Click-to-play video. Nothing heavy loads until the visitor presses play:
 * YouTube uses the privacy-enhanced youtube-nocookie.com domain, Vimeo uses
 * dnt=1, and direct files play in a native <video> with optional captions.
 */
export default function VideoPlayer({ video, className }: { video: IVideo; className?: string }) {
  const [playing, setPlaying] = useState(false);
  const yt = youTubeId(video.url);
  const vimeo = !yt ? vimeoId(video.url) : null;
  const poster = video.posterUrl || (yt ? `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` : undefined);
  const title = video.title || "Project video";

  return (
    <div className={cn("relative aspect-video overflow-hidden rounded-[1.4rem] bg-ink-950 ring-1 ring-ink-900/10", className)}>
      {playing ? (
        yt ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 h-full w-full"
          />
        ) : vimeo ? (
          <iframe
            src={`https://player.vimeo.com/video/${vimeo}?autoplay=1&dnt=1`}
            title={title}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <video
            src={video.url}
            poster={poster}
            controls
            autoPlay
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full bg-black object-contain"
          >
            {video.captionsUrl && <track kind="captions" src={video.captionsUrl} srcLang="en" label="English" default />}
          </video>
        )
      ) : (
        <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0 h-full w-full">
          {poster ? (
            <SmartImage src={poster} alt="" fill sizes="(max-width: 1024px) 100vw, 1100px" className="object-cover opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
          ) : (
            <span className="bg-grid-ink absolute inset-0" />
          )}
          <span className="absolute inset-0 bg-gradient-to-t from-ink-950/70 to-transparent" />
          <span className="absolute left-1/2 top-1/2 flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-accent-contrast shadow-xl transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-110">
            <LuPlay aria-hidden className="ml-1 size-8" />
          </span>
          <span className="absolute bottom-5 left-6 text-left text-paper-50">
            <span className="block text-eyebrow text-ink-300">Play video</span>
            <span className="mt-1 block font-display text-lg font-semibold">{title}</span>
          </span>
        </button>
      )}
    </div>
  );
}

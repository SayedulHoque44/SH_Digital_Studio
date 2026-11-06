import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { SITE_URL } from "@/lib/site";

/*
 * Branded 1200x630 social preview cards (Open Graph / Twitter / WhatsApp /
 * LinkedIn). Generated from published content, so every shared link shows
 * the right title, context and a real screenshot.
 */

const FONT_DIR = path.join(process.cwd(), "assets", "fonts");
const PUBLIC_DIR = path.join(process.cwd(), "public");
const IMAGE_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

let fontsPromise: Promise<Buffer[]> | null = null;
const loadFonts = () => {
  if (!fontsPromise) {
    fontsPromise = Promise.all(
      ["BricolageGrotesque-SemiBold.ttf", "InstrumentSerif-Italic.ttf", "Geist-Medium.ttf"].map((file) =>
        readFile(path.join(FONT_DIR, file)),
      ),
    );
  }
  return fontsPromise;
};

/**
 * Loads an image and returns it as a JPEG data URI.
 *
 * - Local paths are confined to /public with an image-extension allowlist,
 *   so a stored value like "/../.env" can never read other files.
 * - Remote images must be https, respond quickly and be under 4 MB.
 * - Everything is re-encoded to a 1280px JPEG with sharp: next/og cannot
 *   decode WebP/AVIF (the format of the captured screenshots and of most
 *   modern uploads), and smaller inputs render faster.
 */
async function loadImage(src?: string): Promise<string | undefined> {
  if (!src) return undefined;
  try {
    let data: Buffer;
    if (src.startsWith("/") && !src.startsWith("//")) {
      const resolved = path.resolve(PUBLIC_DIR, `.${decodeURIComponent(src.split("?")[0])}`);
      if (!IMAGE_TYPES[path.extname(resolved).toLowerCase()] || !resolved.startsWith(PUBLIC_DIR + path.sep)) {
        return undefined;
      }
      data = await readFile(resolved);
    } else {
      const url = new URL(src);
      if (url.protocol !== "https:") return undefined;
      const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
      const type = response.headers.get("content-type") || "";
      if (!response.ok || !type.startsWith("image/") || Number(response.headers.get("content-length") || 0) > 4_000_000) {
        return undefined;
      }
      data = Buffer.from(await response.arrayBuffer());
      if (data.byteLength > 4_000_000) return undefined;
    }
    const jpeg = await sharp(data).resize({ width: 1280, withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
  } catch {
    return undefined;
  }
}

const S_PATH = "M24 9H16a5.5 5.5 0 0 0 0 11h5a5.5 5.5 0 0 1 0 11H10.5";

export async function renderOgImage({
  eyebrow,
  title,
  subtitle,
  image,
  brand = "SH Digital Studio",
  accent = "#C8F25C",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  image?: string;
  brand?: string;
  accent?: string;
}) {
  const [fonts, picture] = await Promise.all([loadFonts(), loadImage(image)]);
  const domain = SITE_URL.replace(/^https?:\/\//, "");
  const titleSize = title.length > 46 ? 52 : title.length > 30 ? 62 : 72;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#0a0b0d",
          color: "#fbfaf6",
          fontFamily: "Geist",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Accent glow */}
        <div
          style={{
            position: "absolute",
            right: -220,
            top: -260,
            width: 720,
            height: 720,
            borderRadius: 720,
            background: `radial-gradient(circle, ${accent}33, transparent 62%)`,
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 0 56px 72px",
            width: picture ? 620 : 1060,
            height: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <svg width="44" height="44" viewBox="0 0 40 40">
              <path d={S_PATH} fill="none" stroke="#fbfaf6" strokeWidth="4.5" strokeLinejoin="round" />
              <rect x="27.25" y="6.75" width="4.5" height="4.5" fill={accent} />
            </svg>
            <div style={{ display: "flex", fontFamily: "Bricolage", fontSize: 30, letterSpacing: -0.8 }}>{brand}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {eyebrow && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontSize: 19,
                  color: "#9ba1a9",
                  textTransform: "uppercase",
                  letterSpacing: 2.2,
                  marginBottom: 22,
                }}
              >
                <div style={{ width: 10, height: 10, backgroundColor: accent }} />
                {eyebrow}
              </div>
            )}
            <div
              style={{
                display: "flex",
                fontFamily: "Bricolage",
                fontSize: titleSize,
                lineHeight: 1.02,
                letterSpacing: -2.4,
              }}
            >
              {title}
            </div>
            {subtitle && (
              <div style={{ display: "flex", marginTop: 22, fontSize: 25, lineHeight: 1.4, color: "#c4c8cd", maxWidth: 560 }}>
                {subtitle.length > 140 ? `${subtitle.slice(0, 137)}…` : subtitle}
              </div>
            )}
          </div>

          <div style={{ display: "flex", fontSize: 22, color: "#6c727b" }}>{domain}</div>
        </div>

        {!picture && (
          // Large, quiet brand mark balances cards that have no screenshot
          <svg
            width="430"
            height="430"
            viewBox="0 0 40 40"
            style={{ position: "absolute", right: 70, top: 100, opacity: 0.16 }}
          >
            <path d={S_PATH} fill="none" stroke="#fbfaf6" strokeWidth="4.5" strokeLinejoin="round" />
            <rect x="27.25" y="6.75" width="4.5" height="4.5" fill={accent} />
          </svg>
        )}

        {picture && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              position: "absolute",
              left: 690,
              top: 92,
              width: 640,
              height: 470,
              borderRadius: 18,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.12)",
              backgroundColor: "#1b1e22",
              boxShadow: "0 40px 80px rgba(0,0,0,0.55)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, height: 36, padding: "0 16px", backgroundColor: "#15181b" }}>
              <div style={{ width: 11, height: 11, borderRadius: 11, backgroundColor: "#ff5f57" }} />
              <div style={{ width: 11, height: 11, borderRadius: 11, backgroundColor: "#febc2e" }} />
              <div style={{ width: 11, height: 11, borderRadius: 11, backgroundColor: "#28c840" }} />
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={picture} width={640} height={400} style={{ objectFit: "cover", objectPosition: "top" }} alt="" />
          </div>
        )}
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Bricolage", data: fonts[0], weight: 600, style: "normal" },
        { name: "Instrument", data: fonts[1], weight: 400, style: "italic" },
        { name: "Geist", data: fonts[2], weight: 500, style: "normal" },
      ],
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}

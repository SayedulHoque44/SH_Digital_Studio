// Recognises YouTube/Vimeo links so videos can be embedded with a privacy
// friendly player and get an automatic poster image.

export const getYouTubeId = (url: string) => {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return parsed.pathname.slice(1).split("/")[0] || null;
    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      if (parsed.pathname === "/watch") return parsed.searchParams.get("v");
      const match = parsed.pathname.match(/^\/(embed|shorts|live)\/([\w-]{6,})/);
      if (match) return match[2];
    }
  } catch {
    return null;
  }
  return null;
};

export const getVimeoId = (url: string) => {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const match = parsed.pathname.match(/(\d{6,})/);
      return match ? match[1] : null;
    }
  } catch {
    return null;
  }
  return null;
};

export const detectVideoProvider = (url: string) => {
  const youtubeId = getYouTubeId(url);
  if (youtubeId) {
    return {
      provider: "youtube" as const,
      posterUrl: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
    };
  }
  if (getVimeoId(url)) return { provider: "vimeo" as const, posterUrl: undefined };
  return null;
};

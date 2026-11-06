import type { IconType } from "react-icons";
import { FaAws } from "react-icons/fa";
import { LuCloud, LuCode, LuDatabase, LuGlobe, LuKeyRound, LuMail, LuServer } from "react-icons/lu";
import {
  SiApple,
  SiBitbucket,
  SiCloudflare,
  SiCloudinary,
  SiCpanel,
  SiDigitalocean,
  SiDocker,
  SiExpo,
  SiFirebase,
  SiGithub,
  SiGitlab,
  SiGmail,
  SiGodaddy,
  SiGoogle,
  SiGooglecloud,
  SiGoogleplay,
  SiHeroku,
  SiHetzner,
  SiHostinger,
  SiMongodb,
  SiMysql,
  SiNamecheap,
  SiNetlify,
  SiOpenai,
  SiPostgresql,
  SiRailway,
  SiRedis,
  SiRender,
  SiResend,
  SiSentry,
  SiStripe,
  SiSupabase,
  SiTwilio,
  SiVercel,
  SiVultr,
  SiWordpress,
  SiZoho,
} from "react-icons/si";

/*
 * Icons for client-project accounts (Vercel, Hostinger, GitHub…). The key is
 * stored on the account (`accounts[].icon`); when it's empty the icon is
 * guessed from the service name. `match` words are searched in that name.
 */
type TServiceIcon = { label: string; Icon: IconType; match: string[] };

export const SERVICE_ICONS: Record<string, TServiceIcon> = {
  vercel: { label: "Vercel", Icon: SiVercel, match: ["vercel"] },
  hostinger: { label: "Hostinger", Icon: SiHostinger, match: ["hostinger"] },
  github: { label: "GitHub", Icon: SiGithub, match: ["github", "gihub"] },
  gitlab: { label: "GitLab", Icon: SiGitlab, match: ["gitlab"] },
  bitbucket: { label: "Bitbucket", Icon: SiBitbucket, match: ["bitbucket"] },
  mongodb: { label: "MongoDB", Icon: SiMongodb, match: ["mongo"] },
  aws: { label: "AWS", Icon: FaAws, match: ["aws", "amazon", "s3"] },
  firebase: { label: "Firebase", Icon: SiFirebase, match: ["firebase"] },
  cloudflare: { label: "Cloudflare", Icon: SiCloudflare, match: ["cloudflare"] },
  netlify: { label: "Netlify", Icon: SiNetlify, match: ["netlify"] },
  render: { label: "Render", Icon: SiRender, match: ["render"] },
  railway: { label: "Railway", Icon: SiRailway, match: ["railway"] },
  heroku: { label: "Heroku", Icon: SiHeroku, match: ["heroku"] },
  digitalocean: { label: "DigitalOcean", Icon: SiDigitalocean, match: ["digitalocean", "digital ocean"] },
  hetzner: { label: "Hetzner", Icon: SiHetzner, match: ["hetzner"] },
  vultr: { label: "Vultr", Icon: SiVultr, match: ["vultr"] },
  namecheap: { label: "Namecheap", Icon: SiNamecheap, match: ["namecheap"] },
  godaddy: { label: "GoDaddy", Icon: SiGodaddy, match: ["godaddy"] },
  cpanel: { label: "cPanel", Icon: SiCpanel, match: ["cpanel"] },
  "google-cloud": { label: "Google Cloud", Icon: SiGooglecloud, match: ["google cloud", "gcp"] },
  google: { label: "Google", Icon: SiGoogle, match: ["google"] },
  gmail: { label: "Gmail", Icon: SiGmail, match: ["gmail"] },
  "google-play": { label: "Google Play", Icon: SiGoogleplay, match: ["play store", "google play"] },
  apple: { label: "Apple / App Store", Icon: SiApple, match: ["apple", "app store", "testflight"] },
  expo: { label: "Expo", Icon: SiExpo, match: ["expo"] },
  supabase: { label: "Supabase", Icon: SiSupabase, match: ["supabase"] },
  postgresql: { label: "PostgreSQL", Icon: SiPostgresql, match: ["postgres", "neon"] },
  mysql: { label: "MySQL", Icon: SiMysql, match: ["mysql"] },
  redis: { label: "Redis", Icon: SiRedis, match: ["redis", "upstash"] },
  docker: { label: "Docker", Icon: SiDocker, match: ["docker"] },
  cloudinary: { label: "Cloudinary", Icon: SiCloudinary, match: ["cloudinary"] },
  stripe: { label: "Stripe", Icon: SiStripe, match: ["stripe"] },
  openai: { label: "OpenAI", Icon: SiOpenai, match: ["openai", "chatgpt"] },
  sentry: { label: "Sentry", Icon: SiSentry, match: ["sentry"] },
  resend: { label: "Resend", Icon: SiResend, match: ["resend"] },
  twilio: { label: "Twilio", Icon: SiTwilio, match: ["twilio"] },
  zoho: { label: "Zoho", Icon: SiZoho, match: ["zoho"] },
  wordpress: { label: "WordPress", Icon: SiWordpress, match: ["wordpress"] },
  // Generic
  server: { label: "Server", Icon: LuServer, match: ["server", "vps"] },
  database: { label: "Database", Icon: LuDatabase, match: ["database", " db"] },
  cloud: { label: "Cloud / storage", Icon: LuCloud, match: ["cloud", "storage"] },
  domain: { label: "Domain / DNS", Icon: LuGlobe, match: ["domain", "dns"] },
  email: { label: "E-mail", Icon: LuMail, match: ["mail", "smtp"] },
  code: { label: "Code", Icon: LuCode, match: ["code", "repo"] },
  api: { label: "API key", Icon: LuKeyRound, match: ["api"] },
};

// Chosen icon, else the first service whose name appears in the text
export const resolveServiceIcon = (icon?: string, provider = "") => {
  if (icon && SERVICE_ICONS[icon]) return SERVICE_ICONS[icon];
  const text = ` ${provider.toLowerCase()}`;
  return Object.values(SERVICE_ICONS).find((item) => item.match.some((word) => text.includes(word)));
};

export const SERVICE_ICON_OPTIONS = Object.entries(SERVICE_ICONS).map(([value, { label, Icon }]) => ({ value, label, Icon }));

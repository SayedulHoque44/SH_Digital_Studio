import {
  LuDribbble,
  LuFacebook,
  LuGithub,
  LuGlobe,
  LuInstagram,
  LuLinkedin,
  LuMail,
  LuMessageCircle,
  LuTwitter,
  LuYoutube,
} from "react-icons/lu";

const MAP = {
  linkedin: LuLinkedin,
  github: LuGithub,
  x: LuTwitter,
  twitter: LuTwitter,
  instagram: LuInstagram,
  facebook: LuFacebook,
  youtube: LuYoutube,
  dribbble: LuDribbble,
  whatsapp: LuMessageCircle,
  email: LuMail,
};

export const SOCIAL_PLATFORMS = [
  "linkedin",
  "github",
  "x",
  "instagram",
  "facebook",
  "youtube",
  "dribbble",
  "behance",
  "whatsapp",
  "website",
  "other",
];

export const socialLabel = (platform: string) =>
  ({
    linkedin: "LinkedIn",
    github: "GitHub",
    x: "X (Twitter)",
    twitter: "X (Twitter)",
    instagram: "Instagram",
    facebook: "Facebook",
    youtube: "YouTube",
    dribbble: "Dribbble",
    behance: "Behance",
    whatsapp: "WhatsApp",
    website: "Website",
  })[platform.toLowerCase()] || platform;

export default function SocialIcon({ platform, className }: { platform: string; className?: string }) {
  const Component = MAP[platform.toLowerCase() as keyof typeof MAP] || LuGlobe;
  return <Component aria-hidden className={className} />;
}

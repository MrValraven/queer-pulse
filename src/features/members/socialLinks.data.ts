import type { IconType } from "react-icons";
import {
  FiGithub,
  FiGlobe,
  FiInstagram,
  FiLinkedin,
  FiLink,
  FiMail,
  FiYoutube,
} from "react-icons/fi";
import {
  SiBehance,
  SiBluesky,
  SiDribbble,
  SiMastodon,
  SiTiktok,
  SiX,
} from "react-icons/si";

/** A selectable platform in the social-links editor. `key` is stored on the
 *  `SocialLink`; `icon` renders it in read + edit mode; `placeholder` hints the
 *  expected value; `hrefPrefix` (when set) is prepended to a bare handle to make
 *  a link, unless the value already looks like a URL. */
export interface SocialPlatform {
  key: string;
  label: string;
  icon: IconType;
  placeholder: string;
  /** Prefix that turns a bare handle into a URL (e.g. an "@name" or a domain). */
  hrefPrefix?: string;
}

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    key: "website",
    label: "Website",
    icon: FiGlobe,
    placeholder: "yoursite.com",
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: FiInstagram,
    placeholder: "@handle",
    hrefPrefix: "https://instagram.com/",
  },
  {
    key: "x",
    label: "X",
    icon: SiX,
    placeholder: "@handle",
    hrefPrefix: "https://x.com/",
  },
  {
    key: "bluesky",
    label: "Bluesky",
    icon: SiBluesky,
    placeholder: "@you.bsky.social",
    hrefPrefix: "https://bsky.app/profile/",
  },
  {
    key: "mastodon",
    label: "Mastodon",
    icon: SiMastodon,
    placeholder: "@you@instance",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: FiLinkedin,
    placeholder: "linkedin.com/in/you",
  },
  {
    key: "github",
    label: "GitHub",
    icon: FiGithub,
    placeholder: "github.com/you",
    hrefPrefix: "https://github.com/",
  },
  {
    key: "dribbble",
    label: "Dribbble",
    icon: SiDribbble,
    placeholder: "dribbble.com/you",
    hrefPrefix: "https://dribbble.com/",
  },
  {
    key: "behance",
    label: "Behance",
    icon: SiBehance,
    placeholder: "behance.net/you",
    hrefPrefix: "https://www.behance.net/",
  },
  {
    key: "youtube",
    label: "YouTube",
    icon: FiYoutube,
    placeholder: "youtube.com/@you",
  },
  {
    key: "tiktok",
    label: "TikTok",
    icon: SiTiktok,
    placeholder: "@handle",
    hrefPrefix: "https://www.tiktok.com/@",
  },
  {
    key: "email",
    label: "Email",
    icon: FiMail,
    placeholder: "you@email.com",
  },
  {
    key: "other",
    label: "Other link",
    icon: FiLink,
    placeholder: "any URL",
  },
];

const BY_KEY: Record<string, SocialPlatform> = Object.fromEntries(
  SOCIAL_PLATFORMS.map((p) => [p.key, p]),
);

/** Resolve a platform key to its metadata, falling back to the generic "other". */
export function socialPlatform(key: string): SocialPlatform {
  return BY_KEY[key] ?? BY_KEY.other!;
}

/** Turn a stored `urlOrHandle` into an `href`, or `undefined` if it can't be a
 *  link (e.g. a Mastodon "@a@b" address the member should just read). */
export function socialHref(
  platform: string,
  value: string,
): string | undefined {
  const v = value.trim();
  if (!v) return undefined;
  if (platform === "email") return `mailto:${v.replace(/^mailto:/, "")}`;
  if (/^https?:\/\//i.test(v)) return v;
  const meta = socialPlatform(platform);
  if (meta.hrefPrefix) return `${meta.hrefPrefix}${v.replace(/^@/, "")}`;
  // Looks like a bare domain (has a dot, no spaces) → assume https.
  if (/^[^\s@]+\.[^\s@]+$/.test(v)) return `https://${v}`;
  return undefined;
}

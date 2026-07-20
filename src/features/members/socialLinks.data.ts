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
  SiGoodreads,
  SiLetterboxd,
  SiMastodon,
  SiTiktok,
  SiX,
} from "react-icons/si";
import { LuGamepad2 } from "react-icons/lu";

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
    key: "letterboxd",
    label: "Letterboxd",
    icon: SiLetterboxd,
    placeholder: "letterboxd.com/you",
    hrefPrefix: "https://letterboxd.com/",
  },
  {
    key: "backloggd",
    // No Backloggd mark in simple-icons yet — a neutral gamepad reads the
    // category (games) without faking a brand logo.
    label: "Backloggd",
    icon: LuGamepad2,
    placeholder: "backloggd.com/u/you",
    hrefPrefix: "https://backloggd.com/u/",
  },
  {
    key: "goodreads",
    // Goodreads profile URLs are /user/show/<id>-<name>, so a bare handle can't
    // be prefixed reliably — members paste the full path and the bare-domain
    // rule in `socialHref` adds the scheme.
    label: "Goodreads",
    icon: SiGoodreads,
    placeholder: "goodreads.com/user/show/…",
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

/** Host a `hrefPrefix` points at, without any "www." — e.g. "tiktok.com". */
function prefixHost(hrefPrefix: string): string {
  return new URL(hrefPrefix).host.replace(/^www\./i, "");
}

/** Turn a stored `urlOrHandle` into an `href`, or `undefined` if it can't be a
 *  link (e.g. a Mastodon "@a@b" address the member should just read). */
export function socialHref(
  platform: string,
  value: string,
): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (platform === "email")
    return `mailto:${trimmed.replace(/^mailto:/, "")}`;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const meta = socialPlatform(platform);
  if (meta.hrefPrefix) {
    // Members routinely paste the whole path ("github.com/you") into a field
    // whose prefix already carries the host — prefixing again would yield
    // "https://github.com/github.com/you". Treat it as a scheme-less URL.
    const withoutWww = trimmed.replace(/^www\./i, "");
    const host = prefixHost(meta.hrefPrefix);
    if (withoutWww.toLowerCase().startsWith(`${host}/`))
      return `https://${withoutWww}`;
    return `${meta.hrefPrefix}${trimmed.replace(/^@/, "")}`;
  }
  // Looks like a bare domain (has a dot, no spaces) → assume https.
  if (/^[^\s@]+\.[^\s@]+$/.test(trimmed)) return `https://${trimmed}`;
  return undefined;
}

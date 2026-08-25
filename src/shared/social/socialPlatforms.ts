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
  SiArtstation,
  SiBandcamp,
  SiBehance,
  SiBluesky,
  SiDribbble,
  SiGoodreads,
  SiImdb,
  SiKofi,
  SiLetterboxd,
  SiMastodon,
  SiPatreon,
  SiSoundcloud,
  SiSpotify,
  SiTiktok,
  SiTwitch,
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
    key: "bandcamp",
    label: "Bandcamp",
    icon: SiBandcamp,
    placeholder: "you.bandcamp.com",
    hrefPrefix: "https://bandcamp.com/",
  },
  {
    key: "soundcloud",
    label: "SoundCloud",
    icon: SiSoundcloud,
    placeholder: "@you",
    hrefPrefix: "https://soundcloud.com/",
  },
  {
    key: "spotify",
    label: "Spotify",
    icon: SiSpotify,
    placeholder: "spotify.com/artist/…",
  },
  {
    key: "twitch",
    label: "Twitch",
    icon: SiTwitch,
    placeholder: "@you",
    hrefPrefix: "https://twitch.tv/",
  },
  {
    key: "imdb",
    label: "IMDb",
    icon: SiImdb,
    placeholder: "imdb.com/name/…",
  },
  {
    key: "artstation",
    label: "ArtStation",
    icon: SiArtstation,
    placeholder: "@you",
    hrefPrefix: "https://artstation.com/",
  },
  {
    key: "kofi",
    label: "Ko-fi",
    icon: SiKofi,
    placeholder: "@you",
    hrefPrefix: "https://ko-fi.com/",
  },
  {
    key: "patreon",
    label: "Patreon",
    icon: SiPatreon,
    placeholder: "@you",
    hrefPrefix: "https://patreon.com/",
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

/** Bare host of a URL or bare-domain value — no scheme, no "www.", no path.
 *  e.g. "https://www.tiagocostadev.com/#/" → "tiagocostadev.com". */
function domainOf(value: string): string | undefined {
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const host = new URL(withScheme).host.replace(/^www\./i, "");
    return host || undefined;
  } catch {
    return undefined;
  }
}

/** A short, human-friendly label for a stored link, for read-mode chips: the
 *  bare handle for handle platforms ("https://github.com/you" → "you"), the
 *  bare domain for a website or other link ("https://you.com/#/" → "you.com"),
 *  the address for email. Falls back to the raw value when nothing tidier can
 *  be derived (e.g. a Mastodon "@you@instance" address, which reads best whole). */
export function socialDisplayLabel(platform: string, value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (platform === "email") return trimmed.replace(/^mailto:/i, "");
  if (platform === "mastodon") return trimmed;

  const meta = socialPlatform(platform);
  if (meta.hrefPrefix) {
    // Normalise to the resolved link, then strip the platform's own prefix so
    // only the handle remains — whether the member pasted "@you", "you", or the
    // whole "github.com/you" URL.
    const href = socialHref(platform, trimmed);
    if (href) {
      const path = href.replace(/^https?:\/\/(www\.)?/i, "");
      const prefixPath = meta.hrefPrefix.replace(/^https?:\/\/(www\.)?/i, "");
      if (path.toLowerCase().startsWith(prefixPath.toLowerCase())) {
        const handle = path.slice(prefixPath.length).replace(/\/+$/, "");
        if (handle) return handle;
      }
    }
    return trimmed.replace(/^@/, "");
  }

  // Prefix-less platforms (website, goodreads, other): show the bare domain.
  return domainOf(trimmed) ?? trimmed;
}

/** Turn a stored `urlOrHandle` into an `href`, or `undefined` if it can't be a
 *  link (e.g. a Mastodon "@a@b" address the member should just read). */
export function socialHref(
  platform: string,
  value: string,
): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (platform === "email") return `mailto:${trimmed.replace(/^mailto:/, "")}`;
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

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { defaultMeta, toAbsoluteUrl } from "./seo.data";

export interface DocumentMeta {
  /** Page <title>. Set verbatim — pages are expected to include the brand. */
  title: string;
  /** <meta name="description">. Falls back to the site default. */
  description?: string;
  /**
   * Canonical URL — a root-relative path or absolute URL. Defaults to the
   * current location's pathname (built against SITE_ORIGIN).
   */
  canonical?: string;
  /** Social image — root-relative path or absolute URL. Falls back to default. */
  image?: string;
  /** When true, emits `<meta name="robots" content="noindex, nofollow">`. */
  noIndex?: boolean;
  /** og:type (e.g. "website" | "article"). Defaults to "website". */
  type?: string;
}

/** Upsert a <meta> tag, returning a function that restores the prior state. */
function upsertMeta(
  attr: "name" | "property",
  key: string,
  content: string,
): () => void {
  const existing = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`,
  );
  const created = existing === null;
  const previous = existing?.getAttribute("content") ?? null;

  const el = existing ?? document.createElement("meta");
  if (created) {
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);

  return () => {
    if (created) {
      el.remove();
    } else if (previous !== null) {
      el.setAttribute("content", previous);
    }
  };
}

/** Upsert the canonical <link>, returning a restore function. */
function upsertCanonical(href: string): () => void {
  const existing = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  const created = existing === null;
  const previous = existing?.getAttribute("href") ?? null;

  const el = existing ?? document.createElement("link");
  if (created) {
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);

  return () => {
    if (created) {
      el.remove();
    } else if (previous !== null) {
      el.setAttribute("href", previous);
    }
  };
}

/**
 * Imperatively set `document.title` and upsert the SEO/social meta tags for the
 * current page, restoring the previous values on unmount / dependency change.
 *
 * React-19-native and dependency-free: it manages tags via a single effect so
 * it composes cleanly with the static defaults baked into `index.html`. Because
 * meta is applied client-side, non-JS social scrapers still see the static
 * shell — see README.md in this folder for the prerender option.
 */
export function useDocumentMeta(meta: DocumentMeta): void {
  const { pathname } = useLocation();
  const {
    title,
    description,
    canonical,
    image,
    noIndex = false,
    type = "website",
  } = meta;

  useEffect(() => {
    const resolvedDescription = description ?? defaultMeta.description;
    const url = toAbsoluteUrl(canonical ?? pathname);
    const resolvedImage = toAbsoluteUrl(image ?? defaultMeta.image);

    const previousTitle = document.title;
    document.title = title;

    const cleanups: Array<() => void> = [
      upsertMeta("name", "description", resolvedDescription),
      upsertCanonical(url),
      upsertMeta("property", "og:title", title),
      upsertMeta("property", "og:description", resolvedDescription),
      upsertMeta("property", "og:url", url),
      upsertMeta("property", "og:image", resolvedImage),
      upsertMeta("property", "og:type", type),
      upsertMeta("name", "twitter:card", defaultMeta.twitterCard),
      upsertMeta("name", "twitter:title", title),
      upsertMeta("name", "twitter:description", resolvedDescription),
      upsertMeta("name", "twitter:image", resolvedImage),
    ];

    if (noIndex) {
      cleanups.push(upsertMeta("name", "robots", "noindex, nofollow"));
    }

    return () => {
      document.title = previousTitle;
      // Restore in reverse so overlapping tags unwind cleanly.
      for (let i = cleanups.length - 1; i >= 0; i--) cleanups[i]?.();
    };
  }, [title, description, canonical, image, noIndex, type, pathname]);
}

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
  /** Alt text for the social image — emitted as `og:image:alt` /
   *  `twitter:image:alt`. Omitted entirely when absent (an empty alt is worse
   *  than none for a social card). */
  imageAlt?: string;
  /** Twitter card style — `"summary"` (small square thumb) or
   *  `"summary_large_image"` (wide hero). Defaults to the site default. Pass
   *  `"summary_large_image"` only when the `image` is a genuine wide cover. */
  twitterCard?: string;
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

/**
 * Remove a <meta> tag (if present), restoring it on cleanup. Used to drop the
 * static shell's fixed `og:image:width`/`height` when a page overrides
 * `og:image` with an image of unknown dimensions — announcing a square avatar
 * as 1200×630 makes scrapers crop it. Re-appends the original node on cleanup
 * (order among head tags is irrelevant), so the default shell dimensions
 * survive for the next page.
 */
function removeMeta(attr: "name" | "property", key: string): () => void {
  const existing = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`,
  );
  if (existing === null) return () => {};
  existing.remove();
  return () => {
    document.head.appendChild(existing);
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
 * it composes cleanly with the static defaults baked into `index.html`.
 *
 * Meta is applied client-side, so non-JS crawlers would see only the static
 * shell — which is why `scripts/prerender.mjs` renders every public page to real
 * HTML at build time. This hook is what tells it a page is ready: the effect
 * sets `data-prerender-ready`, and the prerenderer waits for it. A page that
 * never renders `<PageMeta>` therefore fails the build by design. See README.md
 * in this folder.
 */
export function useDocumentMeta(meta: DocumentMeta): void {
  const { pathname } = useLocation();
  const {
    title,
    description,
    canonical,
    image,
    imageAlt,
    twitterCard,
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
      upsertMeta("name", "twitter:card", twitterCard ?? defaultMeta.twitterCard),
      upsertMeta("name", "twitter:title", title),
      upsertMeta("name", "twitter:description", resolvedDescription),
      upsertMeta("name", "twitter:image", resolvedImage),
    ];

    if (imageAlt) {
      cleanups.push(upsertMeta("property", "og:image:alt", imageAlt));
      cleanups.push(upsertMeta("name", "twitter:image:alt", imageAlt));
    }

    // The static shell (index.html) hardcodes og:image:width=1200 / height=630
    // for the default 1200×630 social card. When a page overrides `image` — e.g.
    // a persona route pointing og:image at a square avatar or an arbitrary cover —
    // those fixed dimensions are stale and misdescribe the new image, so scrapers
    // crop it to 1200×630. We don't know the override's real size here, so drop
    // the width/height tags entirely and let consumers read the actual image.
    if (image) {
      cleanups.push(removeMeta("property", "og:image:width"));
      cleanups.push(removeMeta("property", "og:image:height"));
    }

    if (noIndex) {
      cleanups.push(upsertMeta("name", "robots", "noindex, nofollow"));
    }

    // Signals scripts/prerender.mjs that this route's metadata has been
    // applied and the DOM is safe to serialise. Harmless in the browser.
    document.documentElement.dataset.prerenderReady = "true";

    return () => {
      document.title = previousTitle;
      delete document.documentElement.dataset.prerenderReady;
      // Restore in reverse so overlapping tags unwind cleanly.
      for (let i = cleanups.length - 1; i >= 0; i--) cleanups[i]?.();
    };
  }, [
    title,
    description,
    canonical,
    image,
    imageAlt,
    twitterCard,
    noIndex,
    type,
    pathname,
  ]);
}

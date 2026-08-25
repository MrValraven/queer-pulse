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
   *  `twitter:image:alt`. When an `image` override arrives without one, the
   *  alt tags are dropped: the shell's alt describes the default card and
   *  would misdescribe the new image. */
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

/** Upsert a <meta> tag's content, creating the tag if the shell lacks it. */
function setMeta(
  attribute: "name" | "property",
  key: string,
  content: string,
): void {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
  );
  if (element === null) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

/** Remove a <meta> tag if it is present. */
function removeMeta(attribute: "name" | "property", key: string): void {
  document.head
    .querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
    ?.remove();
}

/** Upsert the canonical <link>, creating it if the shell lacks it. */
function setCanonical(href: string): void {
  let element = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  if (element === null) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

/**
 * Put the document head back to the neutral site defaults — the same values the
 * static shell (index.html) ships, mirrored from `defaultMeta`.
 *
 * This is the baseline every page returns to on unmount. It is deliberately
 * *absolute* rather than "whatever the head held when this page mounted":
 * `scripts/prerender.mjs` writes a per-path `dist/<path>/index.html` with that
 * page's own title and tags baked in, so a session that lands on a prerendered
 * public page starts with a page-specific head. Restoring that captured state
 * left every route entered afterwards wearing e.g. "The Magazine — QueerPulse",
 * which is visible on the gated routes (feed, local directory) because they
 * render no <PageMeta> of their own.
 *
 * Canonical / og:url are rebuilt from the live pathname: cleanup runs after the
 * router has already committed the new URL, so this describes the page being
 * entered rather than the one being left.
 */
export function applyDefaultDocumentMeta(): void {
  const image = toAbsoluteUrl(defaultMeta.image);
  const url = toAbsoluteUrl(window.location.pathname);

  document.title = defaultMeta.title;
  setMeta("name", "description", defaultMeta.description);
  setCanonical(url);
  setMeta("property", "og:type", "website");
  setMeta("property", "og:url", url);
  setMeta("property", "og:title", defaultMeta.title);
  setMeta("property", "og:description", defaultMeta.description);
  setMeta("property", "og:image", image);
  setMeta("property", "og:image:width", String(defaultMeta.imageWidth));
  setMeta("property", "og:image:height", String(defaultMeta.imageHeight));
  setMeta("property", "og:image:alt", defaultMeta.imageAlt);
  setMeta("name", "twitter:card", defaultMeta.twitterCard);
  setMeta("name", "twitter:title", defaultMeta.title);
  setMeta("name", "twitter:description", defaultMeta.description);
  setMeta("name", "twitter:image", image);
  setMeta("name", "twitter:image:alt", defaultMeta.imageAlt);
  removeMeta("name", "robots");
}

/**
 * Imperatively set `document.title` and upsert the SEO/social meta tags for the
 * current page, resetting the head to the site defaults on unmount / dependency
 * change (see `applyDefaultDocumentMeta`).
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

    document.title = title;
    setMeta("name", "description", resolvedDescription);
    setCanonical(url);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", resolvedDescription);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", resolvedImage);
    setMeta("property", "og:type", type);
    setMeta("name", "twitter:card", twitterCard ?? defaultMeta.twitterCard);
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", resolvedDescription);
    setMeta("name", "twitter:image", resolvedImage);

    if (imageAlt) {
      setMeta("property", "og:image:alt", imageAlt);
      setMeta("name", "twitter:image:alt", imageAlt);
    } else if (image) {
      // An image override with no alt of its own: the shell's alt describes the
      // default 1200×630 card, so leaving it would caption someone's avatar or
      // cover with brand copy. No alt is better than a wrong one.
      removeMeta("property", "og:image:alt");
      removeMeta("name", "twitter:image:alt");
    }

    // The defaults declare og:image:width=1200 / height=630 for the 1200×630
    // social card. When a page overrides `image` — e.g. a persona route pointing
    // og:image at a square avatar or an arbitrary cover — those dimensions are
    // stale and misdescribe the new image, so scrapers crop it to 1200×630. We
    // don't know the override's real size here, so drop the width/height tags
    // entirely and let consumers read the actual image. Cleanup puts them back.
    if (image) {
      removeMeta("property", "og:image:width");
      removeMeta("property", "og:image:height");
    }

    if (noIndex) {
      setMeta("name", "robots", "noindex, nofollow");
    }

    // Signals scripts/prerender.mjs that this route's metadata has been
    // applied and the DOM is safe to serialise. Harmless in the browser.
    document.documentElement.dataset.prerenderReady = "true";

    return () => {
      delete document.documentElement.dataset.prerenderReady;
      applyDefaultDocumentMeta();
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

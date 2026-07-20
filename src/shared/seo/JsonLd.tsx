import { useEffect } from "react";

export interface JsonLdProps {
  /** A schema.org object, from the builders in jsonLd.data.ts. */
  schema: object;
}

/**
 * Injects a <script type="application/ld+json"> into <head> and removes it on
 * unmount. Mirrors useDocumentMeta's upsert-and-restore lifecycle so it
 * composes with prerendering: scripts/prerender.mjs serialises the DOM after
 * the effect has run, so the schema is baked into the emitted HTML.
 *
 * Each instance owns its own script element, so a page may render several
 * (e.g. MedicalWebPage + BreadcrumbList) without collision.
 */
export function JsonLd({ schema }: JsonLdProps): null {
  // Rewrite every "<" as its six-character JSON unicode escape.
  //
  // This looks redundant — textContent never parses HTML, so the browser path is
  // already safe — but it is NOT redundant when prerendering. scripts/prerender.mjs
  // serialises the live DOM back into an HTML string via Playwright's
  // page.content(), and the HTML serialization algorithm emits <script> as raw
  // text with no escaping. A schema field containing the substring "</script"
  // would therefore close the tag early and corrupt the page for exactly the
  // non-JS crawlers this module exists to serve.
  //
  // A unicode-escaped "<" parses back to "<", so the JSON is unchanged in
  // meaning. Do not remove this.
  const serialised = JSON.stringify(schema).replace(/</g, "\\u003c");

  useEffect(() => {
    const element = document.createElement("script");
    element.type = "application/ld+json";
    element.textContent = serialised;
    document.head.appendChild(element);
    return () => {
      element.remove();
    };
  }, [serialised]);

  return null;
}

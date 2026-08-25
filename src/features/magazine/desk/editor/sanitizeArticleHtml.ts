/**
 * Sanitizes block-authored rich text before it is ever rendered on the
 * public reader (`ArticleBlockView.tsx`, via `dangerouslySetInnerHTML`).
 *
 * Article block `html` fields (`paragraph`/`heading`/`pullQuote`/`quote`/
 * `qa`'s `q` and answer `html`/image `caption`) are produced by the block
 * editor's uncontrolled contentEditable surface (`RichText.tsx`) using
 * `document.execCommand`, normalized to `<em>`/`<strong>`, plus `<a>`/`<br>`.
 * That is still attacker-reachable rich text (anyone who can save a draft —
 * or a future collaborator/import path — can shape the stored HTML), so it
 * must never be dumped into the DOM unsanitized.
 *
 * This repo has no sanitization library yet (checked `package.json` for
 * `dompurify`/`sanitize-html`, and `src/shared` for an existing `sanitize*`
 * util — neither exists), so this is a small DOM-based allowlist walker:
 * parse the markup into an inert `<template>` (its content is never attached
 * to the live document, so it neither executes scripts nor fetches images),
 * then recursively unwrap or strip anything outside the allowlist. A
 * regex-only sanitizer is deliberately avoided — HTML tag/attribute nesting
 * does not tokenize safely with regex (mismatched/nested/malformed markup
 * routinely defeats naive patterns).
 *
 * Allowlist: tags `em`, `strong`, `a`, `br`; `a` may carry only `href`,
 * restricted to `http:`/`https:`/`mailto:`, and always gets a forced
 * `rel="noopener noreferrer"` (plus `target="_blank"`) regardless of what
 * the source markup asked for. Every other tag (script, img, div, style,
 * event-handler-bearing anything, …) is unwrapped — its safe descendants are
 * kept, the wrapper itself is dropped — and every attribute on a kept tag
 * other than the allowed `href` is stripped outright.
 *
 * FOLLOW-UP (not done here): this only guards the READ path. The more
 * robust long-term hardening is sanitizing on WRITE — when the editor's
 * `PATCH /magazine/admin/pieces/:id/article` lands a block, so no
 * unsanitized rich text is ever persisted in the first place. Tracked as a
 * follow-up, out of scope for the public-reader task this file was added for.
 */

const ALLOWED_TAGS = new Set(["EM", "STRONG", "A", "BR"]);
/** Exported so the editor can validate a link at the moment it is created
 * (`linkHref.ts`) against the exact allowlist the reader enforces here. */
export const ALLOWED_HREF_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);

/** True when `href` resolves to an allowlisted protocol (blocks `javascript:`,
 * `data:`, `vbscript:`, and anything else not explicitly permitted). */
function isSafeHref(href: string): boolean {
  try {
    const url = new URL(href, window.location.origin);
    return ALLOWED_HREF_PROTOCOLS.has(url.protocol);
  } catch {
    return false;
  }
}

/** Removes `element` from its parent but keeps its children in place — used
 * for any tag outside the allowlist (and for an `<a>` whose `href` didn't
 * survive `isSafeHref`, which is not a link worth keeping as one). */
function unwrap(element: Element, parent: ParentNode): void {
  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element);
  }
  element.remove();
}

/** Recursively sanitizes every descendant of `root` in place. `root` itself
 * is never inspected — callers pass the inert `<template>` content or an
 * already-allowlisted element. */
function sanitizeChildren(root: ParentNode): void {
  // Snapshot the child list before mutating — unwrapping/removing a node
  // while iterating its live NodeList would skip siblings.
  for (const node of Array.from(root.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) continue;
    if (node.nodeType !== Node.ELEMENT_NODE) {
      // Comments, processing instructions, etc. — never legitimate here.
      node.remove();
      continue;
    }

    const element = node as Element;
    if (!ALLOWED_TAGS.has(element.tagName)) {
      sanitizeChildren(element);
      unwrap(element, root);
      continue;
    }

    const originalHref =
      element.tagName === "A" ? element.getAttribute("href") : null;
    for (const attribute of Array.from(element.attributes)) {
      element.removeAttribute(attribute.name);
    }

    if (element.tagName === "A") {
      if (originalHref && isSafeHref(originalHref)) {
        element.setAttribute("href", originalHref);
        element.setAttribute("rel", "noopener noreferrer");
        element.setAttribute("target", "_blank");
      } else {
        sanitizeChildren(element);
        unwrap(element, root);
        continue;
      }
    }

    sanitizeChildren(element);
  }
}

/**
 * Sanitizes an article block's rich-text `html` down to the reader-safe
 * allowlist (`em`, `strong`, `a[href]`, `br`). Safe to call with untrusted
 * input; never throws (an unparseable fragment simply yields whatever the
 * HTML parser recovered, then gets stripped down to the allowlist same as
 * anything else).
 */
export function sanitizeArticleHtml(html: string): string {
  const template = document.createElement("template");
  template.innerHTML = html;
  sanitizeChildren(template.content);
  return template.innerHTML;
}

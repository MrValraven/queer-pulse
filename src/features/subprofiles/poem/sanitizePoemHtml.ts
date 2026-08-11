/**
 * Sanitizes a poem block's rich-text `html` down to the reader-safe allowlist
 * (`em`, `strong`, `br`). Poems allow inline emphasis + line breaks only — no
 * links, no block tags, no attributes. Modeled on the magazine's
 * `sanitizeArticleHtml` but link-free (so no href/protocol handling).
 *
 * Applied on WRITE (each block on save) and on READ (before
 * `dangerouslySetInnerHTML`) — defense in depth. Safe on untrusted input;
 * never throws.
 */
const ALLOWED_TAGS = new Set(["EM", "STRONG", "BR"]);

/** Removes `element` but keeps its children in place. */
function unwrap(element: Element, parent: ParentNode): void {
  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element);
  }
  element.remove();
}

/** Recursively sanitize every descendant of `root` in place. */
function sanitizeChildren(root: ParentNode): void {
  for (const node of Array.from(root.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) continue;
    if (node.nodeType !== Node.ELEMENT_NODE) {
      node.remove();
      continue;
    }
    const element = node as Element;
    if (!ALLOWED_TAGS.has(element.tagName)) {
      sanitizeChildren(element);
      unwrap(element, root);
      continue;
    }
    // Strip every attribute on the kept tag (em/strong/br carry none).
    for (const attribute of Array.from(element.attributes)) {
      element.removeAttribute(attribute.name);
    }
    sanitizeChildren(element);
  }
}

export function sanitizePoemHtml(html: string): string {
  const template = document.createElement("template");
  template.innerHTML = html;
  sanitizeChildren(template.content);
  return template.innerHTML;
}

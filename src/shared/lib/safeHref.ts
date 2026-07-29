/**
 * Guard a user-supplied URL before putting it in an `<a href>` / `Button href`.
 *
 * React does NOT sanitize dangerous URL schemes — a member-editable value like
 * `javascript:fetch('/steal?'+document.cookie)` will execute on click. Any URL
 * that originates from user input must pass through here first.
 *
 * Returns the trimmed URL only when it is a safe `http(s):` or `mailto:` link;
 * otherwise `null`. Never render a `null` href — omit the link or fall back to
 * plain text. Mirrors the scheme check already used by `workLinkTarget`.
 */
export function safeHref(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^mailto:/i.test(trimmed)) return trimmed;
  return null;
}

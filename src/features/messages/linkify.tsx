import { Fragment, type ReactNode } from "react";
import { FiAlertTriangle, FiExternalLink } from "react-icons/fi";
import { messages as enMessages } from "../../shared/i18n/catalogs/en/messages";
import { messages as ptMessages } from "../../shared/i18n/catalogs/pt/messages";
import { detectLanguage, intlLocale } from "../../shared/i18n/locale";
import { resolveEntry } from "../../shared/i18n/translate";
import type {
  Catalog,
  Language,
  TranslateOptions,
} from "../../shared/i18n/types";
import { linkSafetyReasonsLabelStatic } from "./linkSafetyCopy";
import { OpenExternalConfirmDialog } from "./OpenExternalConfirmDialog";
import { useLinkSafetyGuard } from "./useLinkSafetyGuard";
import styles from "./linkify.module.css";

// Match http(s):// URLs and bare www. hosts. Trailing sentence punctuation is
// excluded so "see www.x.org." doesn't swallow the period into the href.
const URL_PATTERN = /((?:https?:\/\/|www\.)[^\s<]+[^\s<.,:;!?)\]])/gi;

// How much visible label a bubble can afford before a long URL starts
// dominating the thread the way a wall of tracking params does.
const DISPLAY_BUDGET = 48;
const TRUNCATION_ELLIPSIS = "…";

/**
 * The text a reader actually sees for a link, as opposed to the href it
 * resolves to. A pasted share link is usually the host a person recognizes
 * plus a pile of analytics noise (`gclid`, `_gl`, `utm_*`...) that carries no
 * meaning for the reader and, left alone, wraps a bubble across five lines.
 * We keep the href exact for navigation and shrink only what's shown:
 * strip the scheme and `www.`, then drop the query/hash if they push us over
 * budget, then middle-truncate the path (never the host, since the host is
 * the trust signal a reader needs to decide whether to tap). A malformed
 * match is returned unchanged rather than risking a throw on render.
 */
export function formatLinkLabel(href: string): string {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return href;
  }

  const host = url.host.replace(/^www\./i, "");
  const pathname =
    url.pathname === "/"
      ? ""
      : url.pathname.endsWith("/")
        ? url.pathname.slice(0, -1)
        : url.pathname;

  const withQuery = `${host}${pathname}${url.search}${url.hash}`;
  if (withQuery.length <= DISPLAY_BUDGET) return withQuery;

  const withoutQuery = `${host}${pathname}`;
  if (withoutQuery.length <= DISPLAY_BUDGET) return withoutQuery;

  const pathBudget = DISPLAY_BUDGET - host.length - TRUNCATION_ELLIPSIS.length;
  if (pathBudget <= 0) return host;

  const leadLength = Math.ceil(pathBudget / 2);
  const trailLength = Math.floor(pathBudget / 2);
  const truncatedPath =
    pathname.slice(0, leadLength) +
    TRUNCATION_ELLIPSIS +
    (trailLength > 0 ? pathname.slice(pathname.length - trailLength) : "");

  return `${host}${truncatedPath}`;
}

/**
 * The first http(s) URL in `text`, normalized to an absolute href (bare `www.`
 * hosts get an `https://` scheme), or null if there is none. Reuses the single
 * `URL_PATTERN` above so link *detection* and link *preview* never drift apart.
 * A non-global clone avoids sharing `lastIndex` state with `renderWithLinks`.
 */
export function firstLinkUrl(text: string): string | null {
  const match = new RegExp(URL_PATTERN.source, "i").exec(text);
  if (!match) return null;
  const found = match[0];
  return found.startsWith("www.") ? `https://${found}` : found;
}

// Hosts that are QueerPulse itself. `window.location.host` covers wherever the
// app is actually being served — a preview deployment, a LAN address, a dev
// server on localhost:5173 — and the two literal production hosts cover the
// case that host check cannot: while developing on localhost, a link somebody
// shared as `https://queerpulse.com/...` is still a link *into* the product,
// and flagging it as "leaves QueerPulse" would be a lie that only ever shows
// up off production. Checking both means the badge means the same thing in
// every environment.
const QUEERPULSE_HOSTS: readonly string[] = [
  "queerpulse.com",
  "www.queerpulse.com",
];

/**
 * Whether tapping `href` takes the reader off QueerPulse. Drives the small
 * external-link icon on a chat link: leaving the product mid-conversation is
 * worth a heads-up, following a link back into it is not.
 *
 * An href that fails to parse is treated as external, which is the safer
 * default — over-warning costs a reader nothing, while silently presenting an
 * unparseable URL as "stays here" would be a claim we cannot back. It also
 * matches how `formatLinkLabel` swallows a malformed URL rather than throwing
 * mid-render.
 */
export function isExternalHref(href: string): boolean {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return true;
  }

  // Hosts are case-insensitive; a pasted `HTTPS://QueerPulse.com` is us.
  const host = url.host.toLowerCase();
  const servedHost =
    typeof window === "undefined" ? "" : window.location.host.toLowerCase();

  if (servedHost !== "" && host === servedHost) return false;
  return !QUEERPULSE_HOSTS.includes(host);
}

const MESSAGES_CATALOGS: Record<Language, Catalog> = {
  en: enMessages,
  pt: ptMessages,
};

/**
 * Resolves one `messages` catalog entry WITHOUT a hook — same technique
 * `externalLinkHint` (below) always used, generalized to take any path and
 * optional `{token}` values (PRD-371's suspicious-link copy needs one:
 * `{host}`).
 *
 * `renderWithLinks` is handed to `MentionText` as a bare function reference and
 * invoked once per text segment inside a `map`, so the number of calls per
 * render varies with the message — `useTranslation()` anywhere in this module
 * would be a rules-of-hooks violation waiting to happen, and `ChatLinkAnchor`
 * below is exercised directly (no `I18nProvider` ancestor) by
 * `linkify.test.tsx`. Instead this composes the same non-hook pieces the rest
 * of the app already uses outside React: `detectLanguage()` (what
 * `activeLocale()` reads for socket cache patches and message-timestamp
 * adapters) and `resolveEntry` (what `loadCatalogTranslate` resolves
 * moderation labels with). The two `messages` catalogs are imported statically
 * rather than through the lazy namespace loader because this needs an answer
 * synchronously on first paint, and they land in the messages chunk this
 * module already belongs to. EN is the fallback, as everywhere else.
 */
function resolveMessagesString(
  path: string,
  options?: TranslateOptions,
): string {
  const language = detectLanguage();
  const active = resolveEntry(
    MESSAGES_CATALOGS[language],
    path,
    intlLocale(language),
    options,
  );
  if (active !== undefined) return active;
  return (
    resolveEntry(MESSAGES_CATALOGS.en, path, "en", options) ??
    `messages:${path}`
  );
}

/** The screen-reader gloss for the external-link icon. */
function externalLinkHint(): string {
  return resolveMessagesString("link.opensExternally");
}

/**
 * One linkified URL: a safe new-tab anchor, unless `assessLinkSafety` (PRD-
 * 371) flags it as suspicious, in which case a plain left-click pauses on
 * `OpenExternalConfirmDialog` instead of navigating — see `useLinkSafetyGuard`
 * for exactly what counts as suspicious and what a modified click still does.
 * A non-suspicious link is completely unaffected: same anchor, same `href`,
 * same external-site hint as before. Its own component (not inlined in
 * `renderWithLinks`, which isn't one) so it can hold the confirm dialog's
 * open/closed state.
 */
function ChatLinkAnchor({ href }: { href: string }) {
  const {
    isSuspicious,
    reasons,
    displayHost,
    isConfirmOpen,
    handleAnchorClick,
    openAnyway,
    cancel,
  } = useLinkSafetyGuard(href);
  // Resolved without `useTranslation()` — see `resolveMessagesString`'s own
  // doc for why this whole module stays hook-free. `OpenExternalConfirmDialog`
  // itself still uses the ordinary hook for its OWN button labels; that's
  // fine, since it only ever mounts once `isSuspicious` is true.
  const reasonsLabel = isSuspicious
    ? linkSafetyReasonsLabelStatic(reasons)
    : "";
  return (
    <>
      <a
        className={styles.chatLink}
        href={href}
        title={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleAnchorClick}
      >
        {formatLinkLabel(href)}
        {isSuspicious ? (
          <span
            className={styles.suspiciousIcon}
            role="img"
            aria-label={reasonsLabel}
          >
            <FiAlertTriangle aria-hidden />
          </span>
        ) : isExternalHref(href) ? (
          <>
            <span className={styles.externalIcon}>
              <FiExternalLink aria-hidden />
            </span>
            <span className="visuallyHidden">{externalLinkHint()}</span>
          </>
        ) : null}
      </a>
      {isSuspicious && (
        <OpenExternalConfirmDialog
          open={isConfirmOpen}
          onClose={cancel}
          onConfirm={openAnyway}
          title={resolveMessagesString("link.confirmTitle")}
        >
          <p>
            {resolveMessagesString("link.confirmDestination", {
              host: displayHost,
            })}
          </p>
          <p>{reasonsLabel}</p>
        </OpenExternalConfirmDialog>
      )}
    </>
  );
}

/** Render `text` with URLs turned into safe new-tab anchors; plain text stays escaped. */
export function renderWithLinks(text: string): ReactNode {
  const parts = text.split(URL_PATTERN);
  return parts.map((part, index) => {
    if (index % 2 === 0) return <Fragment key={index}>{part}</Fragment>;
    const href = part.startsWith("www.") ? `https://${part}` : part;
    return <ChatLinkAnchor key={index} href={href} />;
  });
}

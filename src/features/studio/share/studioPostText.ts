import {
  findStudioLinkAt,
  isStudioLinkBoundary,
  parseStudioLink,
  textWithoutStudioLink,
  type StudioLinkMatch,
  type StudioLinkTarget,
} from "./studioLinkTarget";

/** What a post surface renders from its text: the card's target and the
 *  words a reader sees. One card per post, the first Studio link. */
export interface StudioPostText {
  /** The first Studio link in the text, or null when it holds none. */
  target: StudioLinkTarget | null;
  /** The text with that link taken out. A markdown link around it stays
   *  whole on a markdown surface, where its label is the reader's link, and
   *  collapses to its label on a plain-text surface. */
  visibleText: string;
}

/** How the surface shows the words. */
export interface StudioPostTextOptions {
  /** True (the default) on a surface that renders markdown, such as the
   *  forum; false on a plain-text surface, where `[label](url)` would show
   *  as written. */
  isMarkdown?: boolean;
}

interface LocatedStudioLink {
  match: StudioLinkMatch;
  /** Where `match.url` starts in the text it was found in. */
  index: number;
}

/** The character a server-cut summary ends with (the feed's `truncate`). */
const ELLIPSIS = "…";

/** How a Studio link candidate starts (the link grammar's URL starts). */
const LINK_STARTS: readonly string[] = ["https://", "http://", "/studio/"];

/** A cut that stops inside a URL start counts once this much of it shows
 *  (`http`, `/stu`), so a short word like `/s` stays as written. */
const MIN_CUT_PREFIX_LENGTH = 4;

/** Openers a link may sit right after, dropped with a cut link. */
const TRAILING_OPENERS = /[([{<«'"]+$/u;

/** A markdown link the cut ran through: `[label](` and any URL characters. */
const CUT_MARKDOWN_LINK = /(\s*)\[([^\]\n]*)\]\([^\s)]*$/u;

/** Brackets, punctuation and spaces only (the note-text leftover rule). */
const LEFTOVER_ONLY = /^[\s.,;:!?()[\]{}<>«»'"]*$/u;

function withLineFeeds(text: string): string {
  return text.replace(/\r\n/g, "\n");
}

function isSameTarget(first: StudioLinkTarget, second: StudioLinkTarget) {
  return first.kind === second.kind && first.id === second.id;
}

/** Where `match` sits in `text`, read by the same scan that found it. */
function locatedLink(
  text: string,
  match: StudioLinkMatch,
): LocatedStudioLink | null {
  const found = findStudioLinkAt(text);
  if (found && found.match.url === match.url) return found;
  const index = text.indexOf(match.url);
  return index === -1 ? null : { match, index };
}

/** Where the `[` of `[label](url)` sits when the link is its target, or -1. */
function markdownLinkStart(text: string, urlIndex: number): number {
  if (urlIndex < 2 || text.slice(urlIndex - 2, urlIndex) !== "](") return -1;
  const labelStart = text.lastIndexOf("[", urlIndex - 2);
  if (labelStart === -1) return -1;
  const label = text.slice(labelStart + 1, urlIndex - 2);
  return label.includes("]") || label.includes("\n") ? -1 : labelStart;
}

/** The words around a found link: a bare link goes through the contract's
 *  note-text rule; a markdown link stays whole for a markdown surface and
 *  collapses to its label for a plain-text one, as the composer's remove
 *  control leaves it. */
function visibleTextAround(
  text: string,
  link: LocatedStudioLink,
  isMarkdown: boolean,
): string {
  if (markdownLinkStart(text, link.index) === -1) {
    return textWithoutStudioLink(text, link.match);
  }
  return isMarkdown ? text : draftWithoutStudioLink(text, link.match);
}

/** True when a cut piece is a URL start, or enough of one to read as the
 *  cut link (`https:/`, `/stud`). */
function isCutLinkStart(piece: string): boolean {
  const loweredPiece = piece.toLowerCase();
  return LINK_STARTS.some(
    (linkStart) =>
      loweredPiece.startsWith(linkStart) ||
      (loweredPiece.length >= MIN_CUT_PREFIX_LENGTH &&
        linkStart.startsWith(loweredPiece)),
  );
}

/** Where a cut link starts inside the summary's last word, at a grammar
 *  boundary, or -1. */
function cutLinkStartIn(word: string): number {
  for (let position = 0; position < word.length; position += 1) {
    const isAtBoundary =
      position === 0 || isStudioLinkBoundary(word.charAt(position - 1));
    if (isAtBoundary && isCutLinkStart(word.slice(position))) return position;
  }
  return -1;
}

/** The kept words, with the ellipsis that says the summary goes on. */
function withEllipsis(keptText: string): string {
  const trimmedText = keptText.trimEnd();
  return LEFTOVER_ONLY.test(trimmedText) ? "" : `${trimmedText}${ELLIPSIS}`;
}

/** A cut summary without the URL the cut ran through. A markdown link the
 *  cut ran through keeps its label as plain words. */
function withoutCutLinkTail(summary: string): string {
  const uncutText = summary.slice(0, -ELLIPSIS.length);
  const markdownTail = CUT_MARKDOWN_LINK.exec(uncutText);
  if (markdownTail) {
    const leadingSpace = markdownTail[1] ?? "";
    const label = markdownTail[2] ?? "";
    return withEllipsis(
      `${uncutText.slice(0, markdownTail.index)}${leadingSpace}${label}`,
    );
  }
  const lastWordStart = uncutText.search(/\S*$/u);
  const lastWord = uncutText.slice(lastWordStart);
  const linkStart = cutLinkStartIn(lastWord);
  if (linkStart === -1) return summary;
  const keptWord = lastWord.slice(0, linkStart).replace(TRAILING_OPENERS, "");
  return withEllipsis(`${uncutText.slice(0, lastWordStart)}${keptWord}`);
}

/** A whole post, reply or draft: the card and the words without its URL.
 *  Plain-text surfaces pass `{ isMarkdown: false }`. */
export function splitStudioPostText(
  text: string,
  options: StudioPostTextOptions = {},
): StudioPostText {
  const { isMarkdown = true } = options;
  const normalizedText = withLineFeeds(text);
  const found = findStudioLinkAt(normalizedText);
  if (!found) return { target: null, visibleText: text };
  return {
    target: found.match.target,
    visibleText: visibleTextAround(normalizedText, found, isMarkdown),
  };
}

/**
 * A summary the server cut short (the feed's 220 characters). `studioLink`
 * is the backend's path of the first Studio link in the full body: null when
 * there is none or the body was blanked, undefined from an older backend,
 * which falls back to reading the summary itself. A link is taken out of the
 * summary only when it is the card's own target.
 */
export function splitStudioSummaryText(
  summary: string,
  studioLink: string | null | undefined,
): StudioPostText {
  if (studioLink === undefined) return splitStudioPostText(summary);
  const target = studioLink === null ? null : parseStudioLink(studioLink);
  if (!target) return { target: null, visibleText: summary };
  const normalizedSummary = withLineFeeds(summary);
  const found = findStudioLinkAt(normalizedSummary);
  if (found) {
    return {
      target,
      visibleText: isSameTarget(found.match.target, target)
        ? visibleTextAround(normalizedSummary, found, true)
        : summary,
    };
  }
  return {
    target,
    visibleText: summary.endsWith(ELLIPSIS)
      ? withoutCutLinkTail(normalizedSummary)
      : summary,
  };
}

/** The composer's remove control: the draft without the link. A markdown
 *  link collapses to its label, so no empty `[label]()` is left behind,
 *  also while its closing `)` is still unwritten. */
export function draftWithoutStudioLink(
  text: string,
  match: StudioLinkMatch,
): string {
  const normalizedText = withLineFeeds(text);
  const link = locatedLink(normalizedText, match);
  const labelStart = link ? markdownLinkStart(normalizedText, link.index) : -1;
  if (!link || labelStart === -1) {
    return textWithoutStudioLink(normalizedText, match);
  }
  const label = normalizedText.slice(labelStart + 1, link.index - 2);
  const urlEnd = link.index + match.url.length;
  // The closing `)` belongs to the link only inside the URL's own run.
  const runRest = /^\S*/u.exec(normalizedText.slice(urlEnd))?.[0] ?? "";
  const parenOffset = runRest.indexOf(")");
  const linkEnd = parenOffset === -1 ? urlEnd : urlEnd + parenOffset + 1;
  const draft =
    `${normalizedText.slice(0, labelStart)}${label}${normalizedText.slice(linkEnd)}`.trim();
  return LEFTOVER_ONLY.test(draft) ? "" : draft;
}

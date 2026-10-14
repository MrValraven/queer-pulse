// Show notes as written (spec 5.3): plain text, web addresses as links and
// h:mm:ss or m:ss times as play buttons. Paragraphs split on blank lines,
// lines on single line breaks.

export type ShowNotesToken =
  | { kind: "text"; text: string }
  | { kind: "link"; text: string; href: string }
  | { kind: "time"; text: string; seconds: number }
  | { kind: "break" };

/** A link or a time; a time is not glued to other digits or colons. */
const NOTES_PATTERN =
  /(https?:\/\/[^\s<>"]+)|(?<![\d:])(\d{1,2}:\d{2}:\d{2}|\d{1,3}:\d{2})(?![\d:])/g;
/** Sentence punctuation after an address, kept outside the link. */
const TRAILING_PUNCTUATION = ".,;:!?)]";

function countOf(text: string, character: string): number {
  return text.split(character).length - 1;
}

/** The punctuation that ends an address and belongs to the sentence. A ")"
 *  stays in the link while it closes a "(" of the address, as in
 *  https://en.wikipedia.org/wiki/Foo_(bar). */
function trailingPunctuationOf(address: string): string {
  let end = address.length;
  while (end > 0) {
    const character = address.charAt(end - 1);
    if (!TRAILING_PUNCTUATION.includes(character)) break;
    const body = address.slice(0, end);
    if (character === ")" && countOf(body, ")") <= countOf(body, "(")) break;
    end -= 1;
  }
  return address.slice(end);
}

/** "4:10" is 250; "1:02:30" is 3750; null for 4:70 and the like. */
export function secondsOfTimestamp(text: string): number | null {
  const parts = text.split(":").map(Number);
  if (parts.some((part) => !Number.isInteger(part) || part < 0)) return null;
  if (parts.length === 2) {
    const [minutes = 0, seconds = 0] = parts;
    return seconds < 60 ? minutes * 60 + seconds : null;
  }
  if (parts.length === 3) {
    const [hours = 0, minutes = 0, seconds = 0] = parts;
    return minutes < 60 && seconds < 60
      ? hours * 3600 + minutes * 60 + seconds
      : null;
  }
  return null;
}

function pushText(tokens: ShowNotesToken[], text: string) {
  if (!text) return;
  const last = tokens[tokens.length - 1];
  if (last?.kind === "text") last.text += text;
  else tokens.push({ kind: "text", text });
}

function tokenizeLine(
  line: string,
  durationSeconds: number | null,
): ShowNotesToken[] {
  const tokens: ShowNotesToken[] = [];
  let cursor = 0;
  for (const match of line.matchAll(NOTES_PATTERN)) {
    const start = match.index ?? 0;
    pushText(tokens, line.slice(cursor, start));
    const [whole, address, time] = match;
    if (address) {
      const trailing = trailingPunctuationOf(address);
      const href = address.slice(0, address.length - trailing.length);
      tokens.push({ kind: "link", text: href, href });
      pushText(tokens, trailing);
    } else if (time) {
      const seconds = secondsOfTimestamp(time);
      const isInside =
        seconds !== null &&
        (durationSeconds === null || seconds < durationSeconds);
      if (isInside) tokens.push({ kind: "time", text: time, seconds });
      else pushText(tokens, whole);
    }
    cursor = start + whole.length;
  }
  pushText(tokens, line.slice(cursor));
  return tokens;
}

export function tokenizeShowNotes(
  notes: string,
  durationSeconds: number | null,
): ShowNotesToken[][] {
  return notes
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)
    .map((paragraph) =>
      paragraph
        .split("\n")
        .flatMap((line, index) => [
          ...(index > 0 ? [{ kind: "break" } as const] : []),
          ...tokenizeLine(line, durationSeconds),
        ]),
    );
}

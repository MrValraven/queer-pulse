import {
  STORY_CANVAS_WIDTH,
  STORY_SIDE_MARGIN,
  STORY_TRUNCATION_MARK,
  type StoryTextSpec,
} from "./storyImage.data";

/**
 * Text fitting for the story image. Every helper measures through a callback:
 * the canvas hands in `measureText`, and a test hands in any width rule.
 */

/** A line's width in canvas pixels, in the font it will paint in. */
export type MeasureLineWidth = (line: string) => number;

/** The widest a line starting at `spec.x` may run: the canvas width less
 *  that x and the side margin kept on the right. */
export function storyLineMaxWidth(spec: Pick<StoryTextSpec, "x">): number {
  return STORY_CANVAS_WIDTH - spec.x - STORY_SIDE_MARGIN;
}

/**
 * `text` cut back by characters until it and an ellipsis fit in `maxWidth`.
 * Characters are whole code points, so a character outside the basic plane
 * (most emoji) is kept in one piece.
 */
function truncateWithMark(
  text: string,
  maxWidth: number,
  measureWidth: MeasureLineWidth,
): string {
  let characters = Array.from(text.trimEnd());
  while (
    characters.length > 1 &&
    measureWidth(`${characters.join("")}${STORY_TRUNCATION_MARK}`) > maxWidth
  ) {
    characters = Array.from(characters.slice(0, -1).join("").trimEnd());
  }
  return `${characters.join("")}${STORY_TRUNCATION_MARK}`;
}

/**
 * One line of text as it fits in `maxWidth`: the text itself when it fits,
 * else cut back by characters and ended with an ellipsis.
 */
export function fitLine(
  text: string,
  maxWidth: number,
  measureWidth: MeasureLineWidth,
): string {
  if (measureWidth(text) <= maxWidth) return text;
  return truncateWithMark(text, maxWidth, measureWidth);
}

/** A word wider than a whole line, cut by characters into pieces that fit. */
function breakWordByCharacters(
  word: string,
  maxWidth: number,
  measureWidth: MeasureLineWidth,
): string[] {
  const pieces: string[] = [];
  let currentPiece = "";
  for (const character of Array.from(word)) {
    const candidate = `${currentPiece}${character}`;
    if (currentPiece && measureWidth(candidate) > maxWidth) {
      pieces.push(currentPiece);
      currentPiece = character;
    } else {
      currentPiece = candidate;
    }
  }
  if (currentPiece) pieces.push(currentPiece);
  return pieces;
}

/**
 * Split a title into lines no wider than `maxWidth`, breaking between words.
 * A single word wider than a whole line starts a line of its own and is cut
 * by characters. Past `maxLines`, the last kept line is shortened and ends in
 * an ellipsis.
 */
export function wrapTitleLines(
  text: string,
  maxWidth: number,
  measureWidth: MeasureLineWidth,
  maxLines: number,
): string[] {
  const lines: string[] = [];
  let currentLine = "";
  for (const word of text.trim().split(/\s+/).filter(Boolean)) {
    if (measureWidth(word) > maxWidth) {
      if (currentLine) lines.push(currentLine);
      const pieces = breakWordByCharacters(word, maxWidth, measureWidth);
      lines.push(...pieces.slice(0, -1));
      currentLine = pieces.at(-1) ?? "";
      continue;
    }
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (currentLine && measureWidth(candidate) > maxWidth) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = candidate;
    }
  }
  if (currentLine) lines.push(currentLine);
  if (lines.length <= maxLines) return lines;

  const keptLines = lines.slice(0, maxLines);
  keptLines[maxLines - 1] = truncateWithMark(
    `${keptLines[maxLines - 1]} ${lines[maxLines]}`,
    maxWidth,
    measureWidth,
  );
  return keptLines;
}

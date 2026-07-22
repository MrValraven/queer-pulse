import type { ChangemakerStory } from "../changemakerStories.types";
import type { ChangemakerDTO } from "./changemakers.api";

const WORDS_PER_MINUTE = 200;

/** "N min read" from the article body word count (min 1). */
export function deriveReadTime(body: string[]): string {
  const words = body.join(" ").trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  return `${minutes} min read`;
}

/**
 * DB row → the FE `ChangemakerStory` shape the mock already uses. `body` and
 * `lead` are plain strings here — valid `ReactNode`s — so no type change and
 * the JSX mock in `changemakerStories.*.data` stays untouched. `readTime` and
 * `date` are derived, not stored: `readTime` from the body, `date` from
 * `publishedAt` (formatted by the caller's locale-aware formatter).
 */
export function changemakerDtoToStory(
  dto: ChangemakerDTO,
  formatDate: (value: number) => string,
): ChangemakerStory {
  const published = dto.publishedAt ? new Date(dto.publishedAt).getTime() : null;
  return {
    slug: dto.slug,
    name: dto.name,
    initials: dto.initials,
    cause: dto.cause,
    tint: dto.tint,
    tags: dto.tags,
    summary: dto.summary,
    image: dto.imageUrl ?? undefined,
    impact: dto.impact,
    byline: dto.byline,
    readTime: deriveReadTime(dto.body),
    date: published !== null ? formatDate(published) : "",
    heroNote: dto.heroNote,
    lead: dto.lead,
    body: dto.body,
    pullQuote: { text: dto.pullQuoteText, cite: dto.pullQuoteCite },
  };
}

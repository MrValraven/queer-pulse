import type { Format, Group } from "./readingGroups.data";

/** What the member typed into the "Start your own group" form. */
export interface DemoGroupFields {
  book: string;
  clubName: string;
  why: string;
  format: string;
  maxPeople: string;
}

/** How a member may separate title from author: "Title - Author", the
 *  EN placeholder's "Title by Author" and the PT placeholder's
 *  "Título, de Autor". The first separator that matches wins. */
const TITLE_AUTHOR_SEPARATORS = [/\s+[—-]\s+/, /\s+by\s+/, /,\s+de\s+/];

/** Split an entry into book and author where a known separator allows. */
function splitTitleAndAuthor(book: string): [string, string | undefined] {
  for (const separator of TITLE_AUTHOR_SEPARATORS) {
    const [titlePart = book, authorPart] = book.split(separator);
    if (authorPart !== undefined) return [titlePart, authorPart];
  }
  return [book, undefined];
}

/** Build the prototype's instant directory card. Demo mode only: `where`,
 *  `frequency`, `spots` and `language` are invented here, so a live proposal
 *  must never be rendered through this (the server stores a proposal for
 *  review and knows none of those facts). A typed club name titles the card;
 *  a blank one falls back to the generic "your new group". */
export function buildDemoGroup(
  fields: DemoGroupFields,
  t: (key: string) => string,
): Group {
  const { book, clubName, why, format, maxPeople } = fields;
  const [titlePart, authorPart] = splitTitleAndAuthor(book);
  const groupFormat: Format = format === "Online" ? "online" : "irl";
  return {
    id: `mine-${Date.now()}`,
    genre: "fiction",
    format: groupFormat,
    book: titlePart.trim() || book,
    author:
      authorPart?.trim() ||
      t("community:readingGroups.listGroup.defaultAuthor"),
    spine: (titlePart.trim() || book).charAt(0).toUpperCase(),
    spineColor: "var(--violet)",
    name: clubName.trim() || t("community:readingGroups.listGroup.defaultName"),
    description:
      why.trim() || t("community:readingGroups.listGroup.newGroupDesc"),
    where: t(
      groupFormat === "online"
        ? "community:readingGroups.listGroup.defaultWhereOnline"
        : "community:readingGroups.listGroup.defaultWhereIrl",
    ),
    frequency: t("community:readingGroups.listGroup.defaultFrequency"),
    spots: Math.max(1, parseInt(maxPeople, 10) - 1),
    language: t("community:readingGroups.listGroup.defaultLang"),
  };
}

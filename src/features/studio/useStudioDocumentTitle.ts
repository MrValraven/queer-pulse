import { useEffect } from "react";
import {
  getDocumentBaseTitle,
  writeDocumentTitle,
} from "../../shared/seo/documentTitleBadge";

/**
 * The browser tab title for a Studio page: `"<title> · Studio · QueerPulse"`,
 * or `"Studio · QueerPulse"` when no title is given (or it is still loading).
 *
 * Every mounted caller registers an entry. The shell registers an untitled
 * one and each route page registers its own, so the winner is the most
 * recently registered entry that carries a title, else the untitled base.
 * A plain "last effect wins" would break here: React runs child effects
 * before parent ones, so the shell would overwrite the page on first mount.
 *
 * When the last entry unmounts (leaving Studio), the title that was showing
 * before Studio took over comes back, but only while the tab still shows
 * the last title written here: a destination that already set its own
 * (its PageMeta effect ran before this cleanup) keeps it. Writes go through `writeDocumentTitle`,
 * so the unread count in front of the title survives, and Quick Exit and
 * sign-out keep their own reset path.
 */

/** The bare Studio title, before a page names itself. RouteAnnouncer treats
 *  it like the site default and keeps waiting for the page's own title. */
export const STUDIO_BASE_TITLE = "Studio · QueerPulse";

interface StudioTitleEntry {
  title: string | undefined;
}

const registeredEntries: StudioTitleEntry[] = [];
let titleBeforeStudio: string | null = null;
/** The last title this module wrote, to tell whether someone wrote since. */
let lastWrittenTitle: string | null = null;

function studioTitleOf(title: string | undefined): string {
  const trimmedTitle = title?.trim();
  return trimmedTitle
    ? `${trimmedTitle} · ${STUDIO_BASE_TITLE}`
    : STUDIO_BASE_TITLE;
}

function writeWinningTitle(): void {
  const titledEntry = [...registeredEntries]
    .reverse()
    .find((entry) => entry.title?.trim());
  lastWrittenTitle = studioTitleOf(titledEntry?.title);
  writeDocumentTitle(lastWrittenTitle);
}

export function useStudioDocumentTitle(title?: string): void {
  useEffect(() => {
    if (registeredEntries.length === 0) {
      titleBeforeStudio = getDocumentBaseTitle();
    }
    const entry: StudioTitleEntry = { title };
    registeredEntries.push(entry);
    writeWinningTitle();

    return () => {
      const entryIndex = registeredEntries.indexOf(entry);
      if (entryIndex !== -1) registeredEntries.splice(entryIndex, 1);
      if (registeredEntries.length > 0) {
        writeWinningTitle();
        return;
      }
      const isStillOurs = getDocumentBaseTitle() === lastWrittenTitle;
      if (titleBeforeStudio !== null && isStillOurs) {
        writeDocumentTitle(titleBeforeStudio);
      }
      titleBeforeStudio = null;
      lastWrittenTitle = null;
    };
  }, [title]);
}

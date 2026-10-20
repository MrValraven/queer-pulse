import type { TFunction } from "../../../shared/i18n/types";
import type { CreatorDraftProgress } from "../../creatorDrafts/api/creatorDrafts.types";
import type {
  AdminCreatorDraftRow,
  CreatorDraftKind,
  CreatorDraftMadeFor,
} from "../api/adminCreatorDrafts.api";

export const CREATOR_DRAFT_KIND_LABEL_KEYS: Record<CreatorDraftKind, string> = {
  persona: "admin:creatorDrafts.kind.persona",
  studio_release: "admin:creatorDrafts.kind.studio_release",
  studio_episode: "admin:creatorDrafts.kind.studio_episode",
  listing: "admin:creatorDrafts.kind.listing",
  event: "admin:creatorDrafts.kind.event",
  listing_edit: "admin:creatorDrafts.kind.listing_edit",
  community: "admin:creatorDrafts.kind.community",
};

const MISSING_OTHER_KEY = "admin:creatorDrafts.missing.other";

/** The real `t` echoes a missing key, with or without its namespace. */
function isEchoedKey(translated: string, key: string): boolean {
  return translated === key || translated === key.slice(key.indexOf(":") + 1);
}

/** The draft's title, or the untitled line when the creator has not typed one. */
export function creatorDraftTitleText(
  row: Pick<AdminCreatorDraftRow, "title">,
  t: TFunction,
): string {
  return row.title && row.title.trim() !== ""
    ? row.title
    : t("admin:creatorDrafts.untitled");
}

/** "For Rainbow Runners" or "As NIGHTFORM"; null when the draft is for no one yet. */
export function creatorDraftMadeForText(
  madeFor: CreatorDraftMadeFor | null,
  t: TFunction,
): string | null {
  if (!madeFor) return null;
  return t(`admin:creatorDrafts.madeFor.${madeFor.kind}`, {
    name: madeFor.name,
  });
}

/** "4 of 9 steps"; null when the kind reports no progress. */
export function creatorDraftProgressText(
  progress: CreatorDraftProgress | null,
  t: TFunction,
): string | null {
  if (!progress) return null;
  return t("admin:creatorDrafts.progress", {
    done: progress.done,
    total: progress.total,
  });
}

/**
 * What is still missing, in the draft's own order, one label per known code.
 * Codes this build has no label for fold into one trailing "Something else",
 * so a code from a newer server never shows raw.
 */
export function creatorDraftMissingLabels(
  kind: CreatorDraftKind,
  missing: string[] | null,
  t: TFunction,
): string[] {
  const labels: string[] = [];
  let hasUnknownCode = false;
  for (const code of missing ?? []) {
    const key = `admin:creatorDrafts.missing.${kind}.${code}`;
    const translated = t(key);
    if (isEchoedKey(translated, key)) {
      hasUnknownCode = true;
    } else {
      labels.push(translated);
    }
  }
  if (hasUnknownCode) labels.push(t(MISSING_OTHER_KEY));
  return labels;
}

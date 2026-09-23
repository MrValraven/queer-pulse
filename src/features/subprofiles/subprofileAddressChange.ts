import type { LinkVisibility } from "./api/subprofiles.api";
import type { HandleAvailability } from "../settings/api/useHandleAvailability";

/** What `SubprofileLinkFields` is holding a confirm/cancel decision on,
 *  surfaced through `AddressChangeWarningModal`. Kept out of the component
 *  file so the pane's line count stays under the cap. */
export type PendingAddressChange =
  | { kind: "switchMode"; target: LinkVisibility }
  | {
      kind: "editField";
      field: "slug" | "handle";
      value: string;
      previous: string;
    };

/** Whether the "linked" choice card is locked for this viewer, and whether to
 *  explain why. Only the persona's CREATOR may switch a currently-unlinked
 *  persona to linked (linking shows the creator's name); co-owners keep every
 *  other edit on this pane, and an already-linked persona is never locked
 *  here (unlinking stays open to every owner, unchanged).
 *
 *  `isCreator === undefined` means the members query is still resolving:
 *  `locked` stays true through that window so the choice never flashes
 *  enabled and then gets taken away, but `showHint` waits for a CONFIRMED
 *  non-creator answer before explaining why. */
export function linkChoiceLockState(
  isCreator: boolean | undefined,
  isCurrentlyUnlinked: boolean,
): { locked: boolean; showHint: boolean } {
  return {
    locked: isCurrentlyUnlinked && isCreator !== true,
    showHint: isCurrentlyUnlinked && isCreator === false,
  };
}

/** The public path this persona lives at under a given link mode. */
export function pathFor(
  mode: LinkVisibility,
  ownerSlug: string,
  slugValue: string,
  handleValue: string,
): string {
  return mode === "linked"
    ? `/members/${ownerSlug}/${slugValue || "…"}`
    : `/p/${handleValue || "…"}`;
}

/** The live `.handlestate` line for the unlinked choice card — reuses the
 *  Settings feature's existing availability copy (`checking`/taken-etc.
 *  reasons) rather than duplicating it under a new `subprofiles:` key. */
export function handleStateLine(
  status: HandleAvailability,
  t: (key: string) => string,
): { tone: "good" | "bad" | "idle"; message: string } | null {
  if (status.status === "checking") {
    return { tone: "idle", message: t("settings:usernameField.checking") };
  }
  if (status.status === "unavailable" && status.reason) {
    return {
      tone: "bad",
      message: t(`settings:usernameField.reason.${status.reason}`),
    };
  }
  if (status.status === "available") {
    return {
      tone: "good",
      message: t("subprofiles:newModal.handleStateClaim"),
    };
  }
  return null;
}

/** The old/new path pair + whether a global `@handle` is being released, for
 *  whichever kind of pending change is currently awaiting confirmation. */
export function warningPathsForPending(
  pending: PendingAddressChange,
  current: {
    link: LinkVisibility;
    ownerSlug: string;
    slug: string;
    handle: string;
  },
): { oldPath: string; newPath: string; releasesHandle: boolean } {
  const { link, ownerSlug, slug, handle } = current;
  if (pending.kind === "switchMode") {
    return {
      oldPath: pathFor(link, ownerSlug, slug, handle),
      newPath: pathFor(pending.target, ownerSlug, slug, handle),
      releasesHandle: link === "unlinked",
    };
  }
  const isSlug = pending.field === "slug";
  return {
    oldPath: isSlug
      ? pathFor("linked", ownerSlug, pending.previous, handle)
      : pathFor("unlinked", ownerSlug, slug, pending.previous),
    newPath: isSlug
      ? pathFor("linked", ownerSlug, pending.value, handle)
      : pathFor("unlinked", ownerSlug, slug, pending.value),
    releasesHandle: !isSlug,
  };
}

import type { LinkVisibility } from "./api/subprofiles.api";
import { linkedPersonaHandleCandidate } from "./personaHandle";

/** What `SubprofileLinkFields` is holding a confirm/cancel decision on,
 *  surfaced through `AddressChangeWarningModal`. Kept out of the component
 *  file so the pane's line count stays under the cap. */
export type PendingAddressChange =
  | { kind: "switchMode"; target: LinkVisibility }
  | {
      kind: "editField";
      field: "handle";
      value: string;
      previous: string;
    };

/** Which of `AddressChangeWarningModal`'s copy branches a pending change
 *  needs (PRD-427, ENG-447). A plain handle edit on an already-published
 *  persona (`"rename"`) now keeps the page live at its new address with the
 *  old one forwarding for the cooldown, so it reads nothing like a link-mode
 *  switch. Switching a LINKED persona to unlinked (`"linkToUnlink"`) is the
 *  one direction that drops followers and endorsements (ENG-447's clean
 *  break), so nothing left over still ties the pseudonymous address to its
 *  owner. Every other change (switching unlinked to linked, or a link switch
 *  still awaiting a typed handle) reads with the original generic copy. */
export type AddressChangeKind = "rename" | "linkToUnlink" | "other";

/** Classify a pending change for the modal's copy, given the link mode it is
 *  changing FROM: the saved/editor value, ahead of whatever `pending` targets. */
export function addressChangeKindFor(
  pending: PendingAddressChange,
  currentLink: LinkVisibility,
): AddressChangeKind {
  if (pending.kind === "editField") return "rename";
  if (currentLink === "linked" && pending.target === "unlinked")
    return "linkToUnlink";
  return "other";
}

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

/** The public path a persona lives at under a given link mode. Every persona
 *  lives at `/p/<handle>`; an empty linked handle previews the default the
 *  server derives and stores on save, and an empty unlinked one shows a
 *  placeholder until something is typed. */
export function pathFor(
  mode: LinkVisibility,
  ownerSlug: string,
  slugValue: string,
  handleValue: string,
): string {
  if (handleValue) return `/p/${handleValue}`;
  return mode === "linked" && ownerSlug !== "…"
    ? `/p/${linkedPersonaHandleCandidate(ownerSlug, slugValue || "persona")}`
    : "/p/…";
}

/** The old/new path pair for whichever pending change is awaiting
 *  confirmation. Both kinds release the current handle: a link switch starts
 *  from a fresh handle, and a handle edit gives up the old one. `newPath` is
 *  null when the change lands on an unlinked persona with no handle yet: its
 *  new address only exists once the owner chooses one. */
export function warningPathsForPending(
  pending: PendingAddressChange,
  current: {
    link: LinkVisibility;
    ownerSlug: string;
    slug: string;
    handle: string;
  },
): { oldPath: string; newPath: string | null; releasesHandle: boolean } {
  const { link, ownerSlug, slug, handle } = current;
  const isSwitch = pending.kind === "switchMode";
  const targetLink = isSwitch ? pending.target : link;
  const nextHandle = isSwitch ? "" : pending.value;
  const isAwaitingHandle = targetLink === "unlinked" && !nextHandle;
  return {
    oldPath: pathFor(
      link,
      ownerSlug,
      slug,
      isSwitch ? handle : pending.previous,
    ),
    newPath: isAwaitingHandle
      ? null
      : pathFor(targetLink, ownerSlug, slug, nextHandle),
    releasesHandle: true,
  };
}

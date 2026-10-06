// src/features/messages/personaAuthorName.ts
import type { AuthorSummary } from "../../shared/contracts/contracts";
import type { SubprofileKind } from "../subprofiles/api/subprofiles.api";
import {
  KIND_LABELS,
  personaNameBesideCraft,
  personaTitleName,
} from "../subprofiles/personaTitleName";

/** The summary's persona kind when it is a persona the client knows how to
 *  title. A kind the backend added before this client learned it falls
 *  through to the plain display name. */
function knownPersonaKind(author: AuthorSummary): SubprofileKind | undefined {
  if (author.identityKind !== "subprofile" || !author.personaKind) return;
  return Object.hasOwn(KIND_LABELS, author.personaKind)
    ? (author.personaKind as SubprofileKind)
    : undefined;
}

/** The name a chat titles an author with (the inbox row, the conversation
 *  header, a search or starred group label). A persona still named after its
 *  craft reads "Owner Name | Poet", the same title its persona page uses
 *  (`personaTitleName`); every other author keeps its display name. An
 *  unlinked persona carries no `personaOwnerName`, so it keeps its own. */
export function authorTitleName(author: AuthorSummary): string {
  const personaKind = knownPersonaKind(author);
  if (!personaKind) return author.displayName;
  return personaTitleName({
    displayName: author.displayName,
    kind: personaKind,
    ownerName: author.personaOwnerName,
  });
}

/** The name to take avatar initials from: the owner's name for a persona
 *  still named after its craft (`personaNameBesideCraft`), so "Alina Costa |
 *  Poet" gives "AC". Every other author keeps its display name. */
export function authorInitialsName(author: AuthorSummary): string {
  const personaKind = knownPersonaKind(author);
  if (!personaKind) return author.displayName;
  return personaNameBesideCraft({
    displayName: author.displayName,
    kind: personaKind,
    ownerName: author.personaOwnerName,
  });
}

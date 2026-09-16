// src/features/messages/starredMessageIdentity.ts
import { initialsOf, tintForSlug } from "../../shared/api/refs";
import type { TFunction } from "../../shared/i18n/types";
import type { MessageSearchConversationGroup } from "../../shared/contracts/contracts";
import { groupInitials } from "./api/messages.adapters";

/** Identity for a starred hit's conversation: a group (its own name/avatar),
 *  an official thread (the org identity), a DM counterpart, or a DM whose
 *  counterpart erased their account. `name` for the official case reuses
 *  `messages:conversation.officialName`, the same key the thread adapter's
 *  `conversationToView` (`api/messages.adapters.ts`) resolves for an official
 *  conversation with no counterpart profile, so a starred hit from that thread
 *  reads in the caller's language. `initials` stays the brand mark "QP" for the
 *  official case, invariant across languages: the same choice
 *  `orgBadgeInitials`'s default makes (`shared/lib/initials.ts`) and what the
 *  thread adapter itself falls back to for an official conversation's avatar. */
export function groupIdentity(
  group: MessageSearchConversationGroup | undefined,
  t: TFunction,
) {
  if (group?.kind === "group") {
    const name = group.title ?? t("messages:group.untitled");
    return {
      name,
      initials: groupInitials(name),
      tint: "plum" as const,
      avatarUrl: group.avatarUrl ?? undefined,
    };
  }
  const participant = group?.otherParticipant;
  if (!participant) {
    // ENG-243: a DM carries no participant in TWO cases, and they are not the
    // same person. One is the official thread; the other is a DM whose
    // counterpart erased their account. `isOfficial` is what tells them apart
    // (the same branch `conversationToView` and `useMessageSearch`'s `toGroups`
    // already make), and without it every starred or searched hit from an
    // erased counterpart's thread was labelled QueerPulse. A response from
    // before the field existed keeps the historical reading, where no
    // participant meant official.
    const isOfficial = group?.isOfficial ?? true;
    return {
      name: isOfficial
        ? t("messages:conversation.officialName")
        : t("messages:formerMember"),
      // The brand mark for the official thread; nothing for a former member,
      // whose label names a state, so there are no initials to take.
      initials: isOfficial ? "QP" : "",
      tint: "plum" as const,
    };
  }
  const parts = participant.displayName.trim().split(/\s+/);
  const initials = initialsOf(
    parts[0] ?? "",
    parts.length > 1 ? parts.at(-1)! : "",
  );
  return {
    name: participant.displayName,
    initials,
    tint: tintForSlug(participant.handle),
    avatarUrl: participant.avatarUrl ?? undefined,
  };
}

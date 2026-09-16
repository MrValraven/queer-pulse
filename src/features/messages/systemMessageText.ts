// src/features/messages/systemMessageText.ts
import type { TFunction } from "../../shared/i18n/types";
import type { ChatSystemEvent } from "./data";

/** Resolves a system event to its bilingual i18n key + params. `actorIsMe`
 *  swaps to the "You …" phrasing; `target`/`value` fill the templated slots. */
function systemLine(event: ChatSystemEvent): {
  key: string;
  params: Record<string, string>;
} {
  const actor = event.actorName;
  const target = event.targetName ?? "";
  const value = event.value ?? "";
  const isActorMe = event.actorIsMe === true;
  const isTargetMe = event.targetIsMe === true;
  switch (event.type) {
    case "group_created":
      return isActorMe
        ? { key: "messages:system.groupCreatedYou", params: {} }
        : { key: "messages:system.groupCreated", params: { actor } };
    case "member_added":
      if (isActorMe) {
        return { key: "messages:system.memberAddedYou", params: { target } };
      }
      if (isTargetMe) {
        return { key: "messages:system.memberAddedTarget", params: { actor } };
      }
      return { key: "messages:system.memberAdded", params: { actor, target } };
    case "member_removed":
      if (isActorMe) {
        return { key: "messages:system.memberRemovedYou", params: { target } };
      }
      if (isTargetMe) {
        return {
          key: "messages:system.memberRemovedTarget",
          params: { actor },
        };
      }
      return {
        key: "messages:system.memberRemoved",
        params: { actor, target },
      };
    case "member_left":
      return isActorMe
        ? { key: "messages:system.memberLeftYou", params: {} }
        : { key: "messages:system.memberLeft", params: { actor } };
    case "group_renamed":
      return isActorMe
        ? { key: "messages:system.groupRenamedYou", params: { value } }
        : { key: "messages:system.groupRenamed", params: { actor, value } };
    case "member_promoted":
      if (isActorMe) {
        return {
          key: "messages:system.memberPromotedYou",
          params: { target },
        };
      }
      if (isTargetMe) {
        return {
          key: "messages:system.memberPromotedTarget",
          params: { actor },
        };
      }
      return {
        key: "messages:system.memberPromoted",
        params: { actor, target },
      };
    case "member_demoted":
      if (isActorMe) {
        return { key: "messages:system.memberDemotedYou", params: { target } };
      }
      if (isTargetMe) {
        return {
          key: "messages:system.memberDemotedTarget",
          params: { actor },
        };
      }
      return {
        key: "messages:system.memberDemoted",
        params: { actor, target },
      };
    case "owner_changed":
      // The actor is the PREVIOUS owner and never named in the copy: only
      // the new owner (the target) is. "You are now the owner" overrides
      // when the viewer IS the new owner; otherwise the sentence always
      // names them, whether or not the viewer is the previous owner.
      return isTargetMe
        ? { key: "messages:system.ownerChangedYou", params: {} }
        : { key: "messages:system.ownerChanged", params: { target } };
    case "group_photo_changed":
      return isActorMe
        ? { key: "messages:system.groupPhotoChangedYou", params: {} }
        : { key: "messages:system.groupPhotoChanged", params: { actor } };
    case "group_description_changed":
      return isActorMe
        ? { key: "messages:system.groupDescriptionChangedYou", params: {} }
        : { key: "messages:system.groupDescriptionChanged", params: { actor } };
    case "member_joined":
      return isActorMe
        ? { key: "messages:system.memberJoinedYou", params: {} }
        : { key: "messages:system.memberJoined", params: { actor } };
    case "group_dissolved":
      return isActorMe
        ? { key: "messages:system.groupDissolvedYou", params: {} }
        : { key: "messages:system.groupDissolved", params: { actor } };
    default: {
      const exhaustiveCheck: never = event.type;
      void exhaustiveCheck;
      return { key: "messages:system.memberLeft", params: { actor } };
    }
  }
}

/** The localized sentence for a system event ("Ana added Bea"). The ONE text
 *  builder shared by `SystemMessagePill` (what the log shows) and
 *  `useNewIncomingAnnouncement` (what a screen reader hears when the event
 *  arrives live), so the two can never drift apart in wording. */
export function systemMessageText(
  event: ChatSystemEvent,
  t: TFunction,
): string {
  const { key, params } = systemLine(event);
  return t(key, params);
}

// src/features/messages/systemMessageText.ts
import type { KnownSystemEventType } from "../../shared/contracts/contracts";
import type { TFunction } from "../../shared/i18n/types";
import type { ChatSystemEvent } from "./data";

/** Every type this client renders a dedicated sentence for, so a raw wire
 *  value can be checked against it at runtime. */
const KNOWN_SYSTEM_EVENT_TYPES: ReadonlySet<string> =
  new Set<KnownSystemEventType>([
    "group_created",
    "member_added",
    "member_removed",
    "member_left",
    "group_renamed",
    "member_promoted",
    "member_demoted",
    "owner_changed",
    "group_photo_changed",
    "group_description_changed",
    "member_joined",
    "group_dissolved",
    "moved_to_business_mailbox",
  ]);

/** Folds a raw wire `systemEvent.type` into a type this client actually
 *  knows how to render, or `"unknown"` when a newer server sends a type
 *  this build has never heard of. A migration can start writing a new
 *  system-event type before the client that renders it ships; without this
 *  fold, an unrecognised type used to fall through to `"member_left"`'s own
 *  copy ("X left the group"), which is wrong for every event that isn't
 *  actually a departure. */
export function normalizeSystemEventType(
  rawType: string,
): ChatSystemEvent["type"] {
  return KNOWN_SYSTEM_EVENT_TYPES.has(rawType)
    ? (rawType as KnownSystemEventType)
    : "unknown";
}

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
    case "moved_to_business_mailbox":
      // A controller ruling supersedes the earlier actor-named draft of this
      // copy: the migration's row carries a NULL sender and names no actor,
      // so the line stays neutral for every viewer, owner included, with no
      // "You moved" variant and no actor interpolation at all. The business
      // name comes from `systemEvent.mailboxName`, which the server resolves
      // on every read; the adapter drops it for a deleted business, so that
      // note reads the unnamed line.
      if (event.mailboxName) {
        return {
          key: "messages:system.movedToNamedBusinessMailbox",
          params: { business: event.mailboxName },
        };
      }
      return { key: "messages:system.movedToBusinessMailbox", params: {} };
    case "unknown":
      return { key: "messages:system.unknownEvent", params: {} };
    default: {
      // Every member of `ChatSystemEvent["type"]` is handled above; a value
      // that somehow isn't is treated the same as an explicit "unknown"
      // event and renders that neutral line. The old fallback here fell
      // through to "member_left"'s copy, turning an unrelated event (a
      // migration note, a type this client predates) into "X left the group".
      const exhaustiveCheck: never = event.type;
      void exhaustiveCheck;
      return { key: "messages:system.unknownEvent", params: {} };
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

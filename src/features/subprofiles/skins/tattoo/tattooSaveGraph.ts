import { ApiError } from "../../../../shared/api/client";
import type {
  AvailabilityKey,
  ItemStructured,
  SubprofileItemInputDTO,
  SubprofileKind,
  SubprofileSection,
} from "../../api/subprofiles.api";
import {
  isTattooBodyPhotoSection,
  isTattooBooksStatus,
  TATTOO_STATUS_TO_AVAILABILITY,
} from "./tattooVocab.data";

/** For a tattoo persona: the availability its books status pairs with, when it differs from the current one; else null. */
export function availabilityForTattooStatus(
  kind: SubprofileKind,
  status: unknown,
  currentAvailability: AvailabilityKey | "" | null,
): AvailabilityKey | null {
  if (kind !== "tattoo_artist") return null;
  if (!isTattooBooksStatus(status)) return null;
  const pairedAvailability: AvailabilityKey =
    TATTOO_STATUS_TO_AVAILABILITY[status];
  return pairedAvailability === currentAvailability ? null : pairedAvailability;
}

/** The item with `structured` swapped for `nextStructured`, the key removed when it holds nothing. */
function withStructured(
  item: SubprofileItemInputDTO,
  nextStructured: ItemStructured,
): SubprofileItemInputDTO {
  const { structured: _previousStructured, ...itemWithoutStructured } = item;
  return Object.keys(nextStructured).length > 0
    ? { ...itemWithoutStructured, structured: nextStructured }
    : itemWithoutStructured;
}

/** A flash day entry with its event link removed; the same item when it carries none. */
function withoutEventSlug(
  item: SubprofileItemInputDTO,
): SubprofileItemInputDTO {
  const flashDay = item.structured?.flashDay;
  if (!item.structured || !flashDay || !("eventSlug" in flashDay)) return item;
  const { eventSlug: _droppedSlug, ...remainingFlashDay } = flashDay;
  const { flashDay: _previousFlashDay, ...otherStructured } = item.structured;
  const nextStructured: ItemStructured =
    Object.keys(remainingFlashDay).length > 0
      ? { ...otherStructured, flashDay: remainingFlashDay }
      : otherStructured;
  return withStructured(item, nextStructured);
}

/** A project in progress without the sessions whose photo is still empty; the same item when every session has one. */
function withoutEmptySessions(
  item: SubprofileItemInputDTO,
): SubprofileItemInputDTO {
  const sessions = item.structured?.sessions;
  if (!item.structured || !sessions) return item;
  const sessionsWithPhoto = sessions.filter(
    (session) => session.imageUrl.trim() !== "",
  );
  if (sessionsWithPhoto.length === sessions.length) return item;
  const { sessions: _previousSessions, ...otherStructured } = item.structured;
  const nextStructured: ItemStructured =
    sessionsWithPhoto.length > 0
      ? { ...otherStructured, sessions: sessionsWithPhoto }
      : otherStructured;
  return withStructured(item, nextStructured);
}

/** An item with its credited collaborators cleared; the same item when it holds none. */
function withoutCollaborators(
  item: SubprofileItemInputDTO,
): SubprofileItemInputDTO {
  if (!item.collaborators || item.collaborators.length === 0) return item;
  return { ...item, collaborators: [] };
}

/** Body-photo sections: collaborators cleared, since the server refuses them there and the drawer hides the picker.
 *  flash_days: every eventSlug dropped while the draft unlinks the persona. in_progress: sessions whose photo reads "" dropped.
 *  An emptied flashDay or structured key is removed. Any other section comes back as the same array. */
export function prepareTattooItemsForSave(
  section: SubprofileSection,
  items: SubprofileItemInputDTO[],
  options: { isUnlinked: boolean },
): SubprofileItemInputDTO[] {
  if (section === "flash_days" && options.isUnlinked) {
    return items.map(withoutEventSlug);
  }
  const itemsForSection = isTattooBodyPhotoSection(section)
    ? items.map(withoutCollaborators)
    : items;
  if (section === "in_progress") {
    return itemsForSection.map(withoutEmptySessions);
  }
  return itemsForSection;
}

export interface TattooRefusalCopy {
  messageKey: string;
  params: Record<string, string | number>;
}

/** Item refusals that name the section and the item number, by error code. */
const ITEM_REFUSAL_KEYS: Record<string, string> = {
  CLIENT_CONSENT_REQUIRED: "subprofiles:tattoo.refusal.consent",
  TATTOO_ITEM_INVALID: "subprofiles:tattoo.refusal.item",
  FLASH_DAY_EVENT_UNLINKED_PERSONA: "subprofiles:tattoo.refusal.eventUnlinked",
  FLASH_DAY_EVENT_NOT_ELIGIBLE: "subprofiles:tattoo.refusal.eventNotEligible",
};

/** The 400 body of a tattoo refusal as a plain record; null for any other error. */
function refusalBody(error: unknown): Record<string, unknown> | null {
  if (!(error instanceof ApiError) || error.status !== 400) return null;
  const { data } = error;
  if (typeof data !== "object" || data === null) return null;
  return data as Record<string, unknown>;
}

/** The contract's tattoo error codes as save-toast copy that names the place to fix; null for any other error. */
export function tattooRefusalCopy(
  error: unknown,
  context: {
    sectionLabel: string;
    controlLabelForPath: (path: string) => string | null;
  },
): TattooRefusalCopy | null {
  const body = refusalBody(error);
  if (!body || typeof body.code !== "string") return null;
  if (body.code === "TATTOO_SKIN_INVALID") {
    const fieldLabel =
      typeof body.path === "string"
        ? context.controlLabelForPath(body.path)
        : null;
    return fieldLabel
      ? {
          messageKey: "subprofiles:tattoo.refusal.skin",
          params: { field: fieldLabel },
        }
      : { messageKey: "subprofiles:tattoo.refusal.skinUnknown", params: {} };
  }
  const itemMessageKey = ITEM_REFUSAL_KEYS[body.code];
  if (!itemMessageKey || typeof body.itemIndex !== "number") return null;
  return {
    messageKey: itemMessageKey,
    params: { section: context.sectionLabel, number: body.itemIndex + 1 },
  };
}

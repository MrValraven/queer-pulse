/**
 * Refusals of the demo VJ library, mirroring the backend's `vj.constants.ts`
 * (`VJ_REFUSALS`, `VJ_REFUSAL_EXTRAS`, `vjError`; v1 contract 4, v2 contract
 * 5). Statuses, messages and extra body fields match it; edit both together.
 * No message interpolates a clip title, pack name, scene name, set list name,
 * event title, look, file name or key.
 */
import { ApiError } from "../../../shared/api/client";
import { VJ_LIMITS, type VjRefusalCode } from "../../../shared/contracts/vj";

interface VjRefusalRule {
  status: number;
  message: string;
}

/** Status and fixed English message of every refusal (backend VJ_REFUSALS). */
export const VJ_DEMO_REFUSALS: Record<VjRefusalCode, VjRefusalRule> = {
  VJ_PACK_NOT_FOUND: { status: 404, message: "No VJ pack has this id." },
  VJ_PACK_NAME_REQUIRED: { status: 400, message: "A pack needs a name." },
  VJ_PACK_NAME_TOO_LONG: {
    status: 400,
    message: `A pack name can be at most ${VJ_LIMITS.packNameMax} characters.`,
  },
  VJ_PACK_NAME_TAKEN: {
    status: 409,
    message: "Another pack already has this name.",
  },
  VJ_PACK_LIMIT_REACHED: {
    status: 409,
    message: `The library holds at most ${VJ_LIMITS.packsMax} packs.`,
  },
  VJ_PACK_REORDER_MISMATCH: {
    status: 400,
    message: "The new order must list every pack exactly once.",
  },
  VJ_PACK_FULL: {
    status: 409,
    message: `A pack holds at most ${VJ_LIMITS.packClipsMax} clips.`,
  },
  VJ_PACK_CLIPS_REORDER_MISMATCH: {
    status: 400,
    message: "The new order must list every clip of the pack exactly once.",
  },
  VJ_CLIP_NOT_FOUND: { status: 404, message: "No VJ clip has this id." },
  VJ_CLIP_ALREADY_IN_PACK: {
    status: 409,
    message: "This clip is already in the pack.",
  },
  VJ_CLIP_NOT_IN_PACK: {
    status: 404,
    message: "This clip is not in the pack.",
  },
  VJ_CLIP_TITLE_REQUIRED: { status: 400, message: "A clip needs a title." },
  VJ_CLIP_TITLE_TOO_LONG: {
    status: 400,
    message: `A clip title can be at most ${VJ_LIMITS.clipTitleMax} characters.`,
  },
  VJ_CLIP_FIT_MODE_INVALID: {
    status: 400,
    message: "The fit mode must be fill or fit.",
  },
  VJ_CLIP_DIMENSIONS_INVALID: {
    status: 400,
    message: "Width and height must be whole numbers from 1 to 16384.",
  },
  VJ_CLIP_DURATION_INVALID: {
    status: 400,
    message:
      "A video needs a duration from 1 ms to one hour, and a GIF takes none.",
  },
  VJ_CLIP_KEY_INVALID: {
    status: 400,
    message: "The storage key is not a VJ upload key.",
  },
  VJ_CLIP_KEY_IN_USE: {
    status: 409,
    message: "Another clip already stores this upload.",
  },
  VJ_CLIP_IDS_INVALID: {
    status: 400,
    message: `clipIds must list 1 to ${VJ_LIMITS.mediaClipIdsMax} clip ids separated by commas.`,
  },
  VJ_LIBRARY_FULL: {
    status: 409,
    message: `The library holds at most ${VJ_LIMITS.libraryClipsMax} clips.`,
  },
  VJ_UPLOAD_NOT_ADMIN: {
    status: 403,
    message: "Only an admin or a VJ operator may upload VJ clips.",
  },
  VJ_UPLOAD_TYPE_UNSUPPORTED: {
    status: 400,
    message: "This file type is not accepted for this VJ upload.",
  },
  VJ_UPLOAD_TOO_LARGE: {
    status: 413,
    message: "The file is over the size cap for this VJ upload.",
  },
  VJ_UPLOAD_FORMAT_MOV: {
    status: 400,
    message: "The upload is a QuickTime MOV file. Export it as MP4 or WebM.",
  },
  VJ_UPLOAD_CONTENT_MISMATCH: {
    status: 400,
    message: "The uploaded bytes do not match the file type.",
  },
  VJ_UPLOAD_MISSING: {
    status: 409,
    message: "The upload never reached storage.",
  },
  VJ_CLIP_FAVORITE_INVALID: {
    status: 400,
    message: "isFavorite must be true or false.",
  },
  VJ_CLIP_SPEED_INVALID: {
    status: 400,
    message: "The default speed must be 0.25, 0.5, 1, 1.5, 2 or 4.",
  },
  VJ_CLIP_LOOP_MODE_INVALID: {
    status: 400,
    message: "The loop mode must be loop or pingPong.",
  },
  VJ_CLIP_LOOP_INVALID: {
    status: 400,
    message: `Loop points must sit inside the clip and leave at least ${VJ_LIMITS.loopMinLengthMs} ms between them.`,
  },
  VJ_EVENT_NOT_FOUND: { status: 404, message: "No event has this id." },
  VJ_EVENT_NOT_LINKABLE: {
    status: 409,
    message:
      "Only a published event open to the public or to members can link to a pack.",
  },
  VJ_SCENE_NOT_FOUND: { status: 404, message: "No VJ scene has this id." },
  VJ_SCENE_NAME_REQUIRED: { status: 400, message: "A scene needs a name." },
  VJ_SCENE_NAME_TOO_LONG: {
    status: 400,
    message: `A scene name can be at most ${VJ_LIMITS.sceneNameMax} characters.`,
  },
  VJ_SCENE_LIMIT_REACHED: {
    status: 409,
    message: `The library holds at most ${VJ_LIMITS.scenesMax} scenes.`,
  },
  VJ_SCENE_LOOK_INVALID: {
    status: 400,
    message: "The scene look holds a field the projector cannot use.",
  },
  VJ_SCENE_CLIP_NOT_FOUND: {
    status: 404,
    message: "The scene look names a clip that no longer exists.",
  },
  VJ_SCENE_REORDER_MISMATCH: {
    status: 400,
    message: "The new order must list every scene exactly once.",
  },
  VJ_SETLIST_NOT_FOUND: {
    status: 404,
    message: "No VJ set list has this id.",
  },
  VJ_SETLIST_NAME_REQUIRED: {
    status: 400,
    message: "A set list needs a name.",
  },
  VJ_SETLIST_NAME_TOO_LONG: {
    status: 400,
    message: `A set list name can be at most ${VJ_LIMITS.setlistNameMax} characters.`,
  },
  VJ_SETLIST_NAME_TAKEN: {
    status: 409,
    message: "Another set list already has this name.",
  },
  VJ_SETLIST_LIMIT_REACHED: {
    status: 409,
    message: `The library holds at most ${VJ_LIMITS.setlistsMax} set lists.`,
  },
  VJ_SETLIST_REORDER_MISMATCH: {
    status: 400,
    message: "The new order must list every set list exactly once.",
  },
  VJ_SETLIST_ITEMS_INVALID: {
    status: 400,
    message: "sceneIds must be an array of scene ids.",
  },
  VJ_SETLIST_FULL: {
    status: 409,
    message: `A set list holds at most ${VJ_LIMITS.setlistItemsMax} scenes.`,
  },
};

/** A body field a refusal may carry beside `statusCode`, `message` and `code`. */
export type VjDemoRefusalExtra =
  | "packId"
  | "field"
  | "kind"
  | "maxBytes"
  | "setlistId"
  | "sceneId"
  | "lookField";

/** The extra body fields each code carries (backend VJ_REFUSAL_EXTRAS).
 *  `vjRefusal` copies only these, so a stray option never reaches a body. */
export const VJ_DEMO_REFUSAL_EXTRAS: Record<
  VjRefusalCode,
  readonly VjDemoRefusalExtra[]
> = {
  VJ_PACK_NOT_FOUND: [],
  VJ_PACK_NAME_REQUIRED: [],
  VJ_PACK_NAME_TOO_LONG: [],
  VJ_PACK_NAME_TAKEN: ["packId"],
  VJ_PACK_LIMIT_REACHED: [],
  VJ_PACK_REORDER_MISMATCH: [],
  VJ_PACK_FULL: ["packId"],
  VJ_PACK_CLIPS_REORDER_MISMATCH: [],
  VJ_CLIP_NOT_FOUND: [],
  VJ_CLIP_ALREADY_IN_PACK: ["packId"],
  VJ_CLIP_NOT_IN_PACK: ["packId"],
  VJ_CLIP_TITLE_REQUIRED: [],
  VJ_CLIP_TITLE_TOO_LONG: [],
  VJ_CLIP_FIT_MODE_INVALID: [],
  VJ_CLIP_DIMENSIONS_INVALID: [],
  VJ_CLIP_DURATION_INVALID: [],
  VJ_CLIP_KEY_INVALID: ["field"],
  VJ_CLIP_KEY_IN_USE: ["field"],
  VJ_CLIP_IDS_INVALID: [],
  VJ_LIBRARY_FULL: [],
  VJ_UPLOAD_NOT_ADMIN: [],
  VJ_UPLOAD_TYPE_UNSUPPORTED: ["kind"],
  VJ_UPLOAD_TOO_LARGE: ["kind", "maxBytes", "field"],
  VJ_UPLOAD_FORMAT_MOV: ["field"],
  VJ_UPLOAD_CONTENT_MISMATCH: ["field"],
  VJ_UPLOAD_MISSING: ["field"],
  VJ_CLIP_FAVORITE_INVALID: [],
  VJ_CLIP_SPEED_INVALID: [],
  VJ_CLIP_LOOP_MODE_INVALID: [],
  VJ_CLIP_LOOP_INVALID: [],
  VJ_EVENT_NOT_FOUND: [],
  VJ_EVENT_NOT_LINKABLE: [],
  VJ_SCENE_NOT_FOUND: ["sceneId"],
  VJ_SCENE_NAME_REQUIRED: [],
  VJ_SCENE_NAME_TOO_LONG: [],
  VJ_SCENE_LIMIT_REACHED: [],
  VJ_SCENE_LOOK_INVALID: ["lookField"],
  VJ_SCENE_CLIP_NOT_FOUND: ["lookField"],
  VJ_SCENE_REORDER_MISMATCH: [],
  VJ_SETLIST_NOT_FOUND: [],
  VJ_SETLIST_NAME_REQUIRED: [],
  VJ_SETLIST_NAME_TOO_LONG: [],
  VJ_SETLIST_NAME_TAKEN: ["setlistId"],
  VJ_SETLIST_LIMIT_REACHED: [],
  VJ_SETLIST_REORDER_MISMATCH: [],
  VJ_SETLIST_ITEMS_INVALID: [],
  VJ_SETLIST_FULL: ["setlistId"],
};

/** What a caller may hand `vjRefusal` (backend VjErrorOptions). `sceneId`
 *  goes only on a set list item refusal, and `lookField` is a dot path of
 *  schema names with no value in it. */
export interface VjDemoRefusalOptions {
  packId?: string;
  sceneId?: string;
  setlistId?: string;
  lookField?: string;
  field?: "storageKey" | "thumbnailStorageKey" | "previewStorageKey";
  kind?: "vj_clip" | "vj_thumbnail" | "vj_preview";
  maxBytes?: number;
}

/** Builds the refusal the live API would throw for this code: the body
 *  `{ statusCode, message, code }` plus each extra the code lists whose
 *  option is defined. */
export function vjRefusal(
  code: VjRefusalCode,
  extra?: VjDemoRefusalOptions,
): ApiError {
  const { status, message } = VJ_DEMO_REFUSALS[code];
  const body: Record<string, unknown> = {
    statusCode: status,
    message,
    code,
  };
  for (const extraName of VJ_DEMO_REFUSAL_EXTRAS[code]) {
    const value = extra?.[extraName];
    if (value !== undefined) {
      body[extraName] = value;
    }
  }
  return new ApiError(status, message, body);
}

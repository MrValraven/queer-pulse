import {
  upgradeVjStageFieldsV1,
  upgradeVjStageFieldsV2,
  type VjClipDTO,
  type VjPackDTO,
} from "../../../shared/contracts/vj";
import type { VjScreenRecord } from "./vjScreenRecord";
import {
  isVjClipV2,
  isVjFiniteNumber,
  isVjPackV2,
  isVjPlainObject,
  isVjStageStateV2,
} from "./vjScreenRecordGuards";

/**
 * The v1 snapshot reader (contract 9.1). A v1 record is
 * `{ savedAt, state, pack, clips, liveClip? }` with v1 state fields and clip
 * and pack DTOs from before the v2 fields existed. Every part is upgraded and
 * then held to the v2 guards, so a v1 list member or shape that v2 dropped
 * reads as unreadable.
 */

/** The fields a v2 clip DTO gained, at the values contract 9.1 fills. */
const VJ_CLIP_V2_DEFAULTS: Pick<
  VjClipDTO,
  | "isFavorite"
  | "defaultSpeed"
  | "loopInMs"
  | "loopOutMs"
  | "loopMode"
  | "previewUrl"
> = {
  isFavorite: false,
  defaultSpeed: 1,
  loopInMs: null,
  loopOutMs: null,
  loopMode: "loop",
  previewUrl: null,
};

/** A v1 clip with each v2 field filled; null when it is no clip. */
function upgradeVjClipV1(value: unknown): VjClipDTO | null {
  if (!isVjPlainObject(value)) return null;
  const upgradedClip: unknown = { ...value, ...VJ_CLIP_V2_DEFAULTS };
  return isVjClipV2(upgradedClip) ? upgradedClip : null;
}

/** A v1 pack with no linked event; null when it is no pack. */
function upgradeVjPackV1(value: unknown): VjPackDTO | null {
  if (!isVjPlainObject(value)) return null;
  const upgradedPack: unknown = { ...value, event: null };
  return isVjPackV2(upgradedPack) ? upgradedPack : null;
}

/** Every clip of a v1 list upgraded; null when any entry is unreadable. */
function upgradeVjClipListV1(value: unknown): VjClipDTO[] | null {
  if (!Array.isArray(value)) return null;
  const upgradedClips: VjClipDTO[] = [];
  for (const entry of value) {
    const upgradedClip = upgradeVjClipV1(entry);
    if (upgradedClip === null) return null;
    upgradedClips.push(upgradedClip);
  }
  return upgradedClips;
}

/** A missing `liveClip` (records saved before v1 added it) reads as none. */
function upgradeVjLiveClipV1(value: unknown): VjClipDTO | null | undefined {
  if (value === undefined || value === null) return null;
  return upgradeVjClipV1(value) ?? undefined;
}

/**
 * A parsed v1 record as a v2 record, or null when any part is unreadable.
 * The state goes through `upgradeVjStageFieldsV1` with `savedAt` as now,
 * so the fresh tempo's downbeat and a live clip's `liveSince` sit at the
 * moment the look was saved, then through `upgradeVjStageFieldsV2`, which
 * fills the default setlistPlayback.
 */
export function upgradeVjScreenRecordV1(value: unknown): VjScreenRecord | null {
  if (
    !isVjPlainObject(value) ||
    !isVjFiniteNumber(value.savedAt) ||
    !isVjPlainObject(value.state)
  ) {
    return null;
  }
  const savedAt = value.savedAt;
  const state = upgradeVjStageFieldsV2(
    upgradeVjStageFieldsV1(value.state, savedAt),
  );
  const pack = value.pack === null ? null : upgradeVjPackV1(value.pack);
  const clips = upgradeVjClipListV1(value.clips);
  const liveClip = upgradeVjLiveClipV1(value.liveClip);
  if (
    !isVjStageStateV2(state) ||
    (value.pack !== null && pack === null) ||
    clips === null ||
    liveClip === undefined
  ) {
    return null;
  }
  return {
    version: 2,
    savedAt,
    state,
    pack,
    clips,
    liveClip,
    extraClips: [],
    eventCard: null,
    clockOffsetMs: null,
  };
}

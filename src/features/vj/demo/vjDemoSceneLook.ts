// Scene look validation, the stored-look normaliser and the clip delete
// rewrite (C 3.7, C 6.2), the demo mirror of the backend `vj-scene-look.ts`
// and the transition, overlay, mix and generator field rules of
// `vj-field-checks.ts`. Same check order and the same `lookField` dot paths;
// a stored look reads leniently, part by part, and never throws.

import {
  VJ_BLEND_MODES,
  VJ_COLOR_TOKENS,
  VJ_LIMITS,
  VJ_OVERLAY_POSITIONS,
  VJ_OVERLAY_SIZES,
  VJ_OVERLAY_STYLES,
  VJ_SPEEDS,
  VJ_TRANSITION_IDS,
  createVjStageState,
  roundVjAmount,
  vjSceneLookOf,
  type VjMix,
  type VjOverlay,
  type VjSceneLook,
  type VjSceneSource,
  type VjSocketErrorCode,
  type VjSpeed,
  type VjTransition,
} from "../../../shared/contracts/vj";
import {
  checkVjEffectSettingsPatch,
  mergeVjEffectSettings,
  readStoredVjEffectSettings,
} from "./vjDemoEffectRules";
import { isVjUuid } from "./vjDemoRules";
import {
  UNIT_AMOUNT_RANGE,
  hasExactlyVjKeys,
  isNumberInRange,
  isOneOf,
  isVjRecord,
  readOverlayText,
  readVjGeneratorChoice,
  readVjTransitionLength,
} from "./vjDemoStageInput";

export type VjSceneLookCheck =
  { look: VjSceneLook } | { code: "VJ_SCENE_LOOK_INVALID"; lookField: string };

type VjSceneOverlay = Omit<VjOverlay, "hideAt">;

/** A part's answer inside the look check: the canonical part, or the dot
 *  path of its first bad field. */
type VjLookPart<Part> = { part: Part } | { lookField: string };

/** The keys of a look, of each of its parts and of each source kind. */
const LOOK_KEYS = ["source", "effects", "transition", "overlay", "mix"];
const EFFECTS_KEYS = ["speed", "settings"];
const TRANSITION_KEYS = ["mode", "length"];
const OVERLAY_KEYS = [
  "text",
  "style",
  "isVisible",
  "position",
  "size",
  "colorToken",
];
const MIX_KEYS = ["clipId", "amount", "blendMode"];
const CLIP_SOURCE_KEYS = ["kind", "clipId"];
const GENERATOR_SOURCE_KEYS = ["kind", "generatorId", "generatorVariant"];

/** The listed overlay fields after text, in check order. */
const OVERLAY_LIST_FIELDS = [
  { field: "style", list: VJ_OVERLAY_STYLES },
  { field: "position", list: VJ_OVERLAY_POSITIONS },
  { field: "size", list: VJ_OVERLAY_SIZES },
  { field: "colorToken", list: VJ_COLOR_TOKENS },
] as const;

/** The default look: nothing live, every part at its stage default. */
function defaultSceneLook(): VjSceneLook {
  return vjSceneLookOf(createVjStageState("", 0));
}

export const EMPTY_VJ_SCENE_LOOK: VjSceneLook = defaultSceneLook();

function refusePart<Part>(lookField: string): VjLookPart<Part> {
  return { lookField };
}

/** `prefix.path`, or `prefix` alone when the path names the whole value. */
function joinLookField(prefix: string, path: string): string {
  return path === "" ? prefix : `${prefix}.${path}`;
}

/** The look's UTF-8 JSON size in bytes; Infinity when it does not serialise. */
function lookByteLength(value: unknown): number {
  try {
    return new TextEncoder().encode(JSON.stringify(value)).length;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

/** The look field of a generator choice refusal. */
function generatorChoiceField(code: VjSocketErrorCode): string {
  return code === "vj_generator_invalid" ? "generatorId" : "generatorVariant";
}

/** Step 2: null, a clip source with a uuid, or a generator source with a
 *  catalog id and a variant valid for it; no extra keys. */
function checkSource(value: unknown): VjLookPart<VjSceneSource | null> {
  if (value === null) return { part: null };
  if (!isVjRecord(value)) return refusePart("source");
  if (value.kind === "clip") {
    if (!hasExactlyVjKeys(value, CLIP_SOURCE_KEYS)) return refusePart("source");
    if (!isVjUuid(value.clipId)) return refusePart("source.clipId");
    return { part: { kind: "clip", clipId: value.clipId.toLowerCase() } };
  }
  if (value.kind === "generator") {
    if (!hasExactlyVjKeys(value, GENERATOR_SOURCE_KEYS)) {
      return refusePart("source");
    }
    // The variant is required here: an absent one fails like a bad one.
    const choice = readVjGeneratorChoice(
      value.generatorId,
      value.generatorVariant,
      true,
    );
    if ("error" in choice) {
      return refusePart(`source.${generatorChoiceField(choice.error)}`);
    }
    return { part: { kind: "generator", ...choice } };
  }
  return refusePart("source.kind");
}

/** Step 3: exactly speed and settings; complete entries, at most 8 on, at
 *  most one playhead effect on. */
function checkEffects(value: unknown): VjLookPart<VjSceneLook["effects"]> {
  if (!isVjRecord(value) || !hasExactlyVjKeys(value, EFFECTS_KEYS)) {
    return refusePart("effects");
  }
  if (!isOneOf<VjSpeed>(VJ_SPEEDS, value.speed)) {
    return refusePart("effects.speed");
  }
  const patchCheck = checkVjEffectSettingsPatch(value.settings, {
    isComplete: true,
  });
  if ("error" in patchCheck) {
    return refusePart(joinLookField("effects.settings", patchCheck.path));
  }
  const merged = mergeVjEffectSettings({}, patchCheck.patch);
  if ("error" in merged) {
    return refusePart(joinLookField("effects.settings", merged.path));
  }
  return { part: { speed: value.speed, settings: merged.settings } };
}

/** Step 4: exactly mode and length, with the stage:setTransition rules. */
function checkTransition(value: unknown): VjLookPart<VjTransition> {
  if (!isVjRecord(value) || !hasExactlyVjKeys(value, TRANSITION_KEYS)) {
    return refusePart("transition");
  }
  if (!isOneOf(VJ_TRANSITION_IDS, value.mode)) {
    return refusePart("transition.mode");
  }
  const length = readVjTransitionLength(value.length);
  if ("error" in length) return refusePart("transition.length");
  return { part: { mode: value.mode, length } };
}

/** Step 5: exactly the six fields with the stage:setOverlay rules (text,
 *  style, position, size, colorToken, isVisible); visible with blank text
 *  fails at overlay.isVisible. */
function checkOverlay(value: unknown): VjLookPart<VjSceneOverlay> {
  if (!isVjRecord(value) || !hasExactlyVjKeys(value, OVERLAY_KEYS)) {
    return refusePart("overlay");
  }
  const text = readOverlayText(value.text);
  if (typeof text !== "string") return refusePart("overlay.text");
  for (const { field, list } of OVERLAY_LIST_FIELDS) {
    if (!isOneOf<string>(list, value[field])) {
      return refusePart(`overlay.${field}`);
    }
  }
  if (typeof value.isVisible !== "boolean") {
    return refusePart("overlay.isVisible");
  }
  if (value.isVisible && text === "") return refusePart("overlay.isVisible");
  return {
    part: {
      text,
      style: value.style,
      isVisible: value.isVisible,
      position: value.position,
      size: value.size,
      colorToken: value.colorToken,
    } as VjSceneOverlay,
  };
}

/** Step 6: exactly clipId (uuid or null), amount (0..1, rounded) and blendMode. */
function checkMix(value: unknown): VjLookPart<VjMix> {
  if (!isVjRecord(value) || !hasExactlyVjKeys(value, MIX_KEYS)) {
    return refusePart("mix");
  }
  const { clipId, amount, blendMode } = value;
  const isClipIdValid = clipId === null || isVjUuid(clipId);
  if (!isClipIdValid) return refusePart("mix.clipId");
  if (!isNumberInRange(amount, UNIT_AMOUNT_RANGE)) {
    return refusePart("mix.amount");
  }
  if (!isOneOf(VJ_BLEND_MODES, blendMode)) return refusePart("mix.blendMode");
  return {
    part: {
      clipId: isVjUuid(clipId) ? clipId.toLowerCase() : null,
      amount: roundVjAmount(amount),
      blendMode,
    },
  };
}

/** C 3.7 steps 1 to 6 in order; lookField is the dot path of the first bad field ("" for the whole look). */
export function checkVjSceneLook(value: unknown): VjSceneLookCheck {
  const refuse = (lookField: string): VjSceneLookCheck => ({
    code: "VJ_SCENE_LOOK_INVALID",
    lookField,
  });
  if (
    !isVjRecord(value) ||
    !hasExactlyVjKeys(value, LOOK_KEYS) ||
    lookByteLength(value) > VJ_LIMITS.sceneLookMaxBytes
  ) {
    return refuse("");
  }
  const source = checkSource(value.source);
  if ("lookField" in source) return refuse(source.lookField);
  const effects = checkEffects(value.effects);
  if ("lookField" in effects) return refuse(effects.lookField);
  const transition = checkTransition(value.transition);
  if ("lookField" in transition) return refuse(transition.lookField);
  const overlay = checkOverlay(value.overlay);
  if ("lookField" in overlay) return refuse(overlay.lookField);
  const mix = checkMix(value.mix);
  if ("lookField" in mix) return refuse(mix.lookField);
  return {
    look: {
      source: source.part,
      effects: effects.part,
      transition: transition.part,
      overlay: overlay.part,
      mix: mix.part,
    },
  };
}

/** Step 7 input: the clip ids a look names, with their field paths. */
export function vjSceneLookClipRefs(
  look: VjSceneLook,
): Array<{ lookField: "source.clipId" | "mix.clipId"; clipId: string }> {
  const refs: Array<{
    lookField: "source.clipId" | "mix.clipId";
    clipId: string;
  }> = [];
  if (look.source !== null && look.source.kind === "clip") {
    refs.push({ lookField: "source.clipId", clipId: look.source.clipId });
  }
  if (look.mix.clipId !== null) {
    refs.push({ lookField: "mix.clipId", clipId: look.mix.clipId });
  }
  return refs;
}

/** A stored source read leniently: extra keys ignored, an absent generator
 *  variant takes the default, anything unreadable reads as null. */
function readStoredSource(value: unknown): VjSceneSource | null {
  if (!isVjRecord(value)) return null;
  if (value.kind === "clip") {
    return isVjUuid(value.clipId)
      ? { kind: "clip", clipId: value.clipId.toLowerCase() }
      : null;
  }
  if (value.kind === "generator") {
    const choice = readVjGeneratorChoice(
      value.generatorId,
      value.generatorVariant,
      value.generatorVariant !== undefined,
    );
    return "error" in choice ? null : { kind: "generator", ...choice };
  }
  return null;
}

/** The listed fields of a record, extra keys left out. */
function pickFields(
  value: Record<string, unknown>,
  fields: readonly string[],
): Record<string, unknown> {
  const picked: Record<string, unknown> = {};
  for (const field of fields) picked[field] = value[field];
  return picked;
}

/** A stored part through its strict rules with extra keys left out; a bad
 *  part takes its default. */
function readStoredPart<Part>(
  value: unknown,
  fields: readonly string[],
  check: (part: unknown) => VjLookPart<Part>,
  fallback: Part,
): Part {
  if (!isVjRecord(value)) return fallback;
  const result = check(pickFields(value, fields));
  return "part" in result ? result.part : fallback;
}

/** The read normaliser: drops catalog-unknown effects, canonical, uuids
 *  lowercased. Lenient part by part like the backend: a bad part takes its
 *  default, and a value that is no object reads as the empty look. */
export function normalizeStoredVjSceneLook(value: unknown): VjSceneLook {
  const defaults = defaultSceneLook();
  if (!isVjRecord(value)) return defaults;
  const storedEffects: Record<string, unknown> = isVjRecord(value.effects)
    ? value.effects
    : {};
  return {
    source: readStoredSource(value.source),
    effects: {
      speed: isOneOf<VjSpeed>(VJ_SPEEDS, storedEffects.speed)
        ? storedEffects.speed
        : defaults.effects.speed,
      settings: readStoredVjEffectSettings(storedEffects.settings),
    },
    transition: readStoredPart(
      value.transition,
      TRANSITION_KEYS,
      checkTransition,
      defaults.transition,
    ),
    overlay: readStoredPart(
      value.overlay,
      OVERLAY_KEYS,
      checkOverlay,
      defaults.overlay,
    ),
    mix: readStoredPart(value.mix, MIX_KEYS, checkMix, defaults.mix),
  };
}

/** C 6.2 clip delete rewrite; null when the look does not name the clip. */
export function rewriteVjSceneLookForDeletedClip(
  look: VjSceneLook,
  clipId: string,
): VjSceneLook | null {
  const deletedClipId = clipId.toLowerCase();
  const isSourceNamed =
    look.source !== null &&
    look.source.kind === "clip" &&
    look.source.clipId.toLowerCase() === deletedClipId;
  const isMixNamed =
    look.mix.clipId !== null && look.mix.clipId.toLowerCase() === deletedClipId;
  if (!isSourceNamed && !isMixNamed) return null;
  return {
    source: isSourceNamed ? null : look.source,
    effects: look.effects,
    transition: look.transition,
    overlay: look.overlay,
    mix: isMixNamed
      ? { clipId: null, amount: 0, blendMode: look.mix.blendMode }
      : look.mix,
  };
}

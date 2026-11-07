import { useId, useMemo } from "react";
import { Select, type SelectOption } from "../../../../../shared/components/ui";
import {
  VJ_GENERATOR_CATALOG,
  VJ_GENERATOR_IDS,
  type VjClipDTO,
  type VjGeneratorId,
  type VjScreenOverride,
} from "../../../../../shared/contracts/vj";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import styles from "./VjScreensSheet.module.css";

const FOLLOW_VALUE = "follow";
const CLIP_PREFIX = "clip:";
const GENERATOR_PREFIX = "generator:";

/** The picker's value for an override: follow, one clip or one generator. */
function vjOverrideValueOf(override: VjScreenOverride | null): string {
  if (override === null) return FOLLOW_VALUE;
  if (override.clipId !== null) return `${CLIP_PREFIX}${override.clipId}`;
  if (override.generatorId !== null) {
    return `${GENERATOR_PREFIX}${override.generatorId}`;
  }
  return FOLLOW_VALUE;
}

function isVjGeneratorId(value: string): value is VjGeneratorId {
  return (VJ_GENERATOR_IDS as readonly string[]).includes(value);
}

/**
 * The override a picked value sends, with exactly one source set: a clip, or
 * a generator with the catalog's default variant. Follow sends null.
 */
function vjOverrideOfValue(value: string): VjScreenOverride | null {
  if (value.startsWith(CLIP_PREFIX)) {
    return {
      clipId: value.slice(CLIP_PREFIX.length),
      generatorId: null,
      generatorVariant: null,
    };
  }
  const generatorId = value.slice(GENERATOR_PREFIX.length);
  if (value.startsWith(GENERATOR_PREFIX) && isVjGeneratorId(generatorId)) {
    return {
      clipId: null,
      generatorId,
      generatorVariant: VJ_GENERATOR_CATALOG[generatorId].defaultVariant,
    };
  }
  return null;
}

export interface VjScreenOverridePickerProps {
  /** The id of the row's "Screen {number}" title, read after the label. */
  screenTitleId: string;
  /** The stage's override for this screen; null while it follows. */
  override: VjScreenOverride | null;
  /** A pick still on its way, shown until its ack lands. */
  pendingValue: string | null;
  packClips: readonly VjClipDTO[];
  /** Picks send nothing while held; the trigger stays focusable. */
  isHeld: boolean;
  /** The line naming why the picker is held, when it is. */
  describedBy?: string;
  onPick: (override: VjScreenOverride | null, value: string) => void;
}

/**
 * What this screen shows: follow the main look, one clip of the active pack
 * or one generator. The shared Select, searchable once the list runs long.
 * An override naming a clip outside the pack shows the label as its value.
 */
export function VjScreenOverridePicker({
  screenTitleId,
  override,
  pendingValue,
  packClips,
  isHeld,
  describedBy,
  onPick,
}: VjScreenOverridePickerProps) {
  const { t } = useTranslation();
  const labelId = useId();
  const options = useMemo<SelectOption[]>(
    () => [
      { value: FOLLOW_VALUE, label: t("vj:screensSheet.followMain") },
      ...packClips.map((clip) => ({
        value: `${CLIP_PREFIX}${clip.id}`,
        label: t("vj:screensSheet.overrideClip", { title: clip.title }),
      })),
      ...VJ_GENERATOR_IDS.map((generatorId) => ({
        value: `${GENERATOR_PREFIX}${generatorId}`,
        label: t("vj:screensSheet.overrideGenerator", {
          name: t(`vj:generator.name.${generatorId}`),
        }),
      })),
    ],
    [packClips, t],
  );
  const value = pendingValue ?? vjOverrideValueOf(override);
  const isKnownValue = options.some((option) => option.value === value);
  return (
    <div className={styles.override} data-vj-screen-override="">
      <span id={labelId} className={styles.overrideLabel}>
        {t("vj:screensSheet.override")}
      </span>
      <div className={styles.overrideSelect} data-held={isHeld || undefined}>
        <Select
          label={t("vj:screensSheet.override")}
          labelledBy={`${labelId} ${screenTitleId}`}
          placeholder={t("vj:screensSheet.override")}
          options={options}
          value={isKnownValue ? value : null}
          aria-describedby={describedBy}
          onChange={(pickedValue) => {
            if (isHeld || pickedValue === null || pickedValue === value) return;
            onPick(vjOverrideOfValue(pickedValue), pickedValue);
          }}
        />
      </div>
    </div>
  );
}

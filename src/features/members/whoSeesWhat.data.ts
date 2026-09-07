/**
 * The three one-tap visibility presets offered at the top of the "Who sees
 * what" sheet. Each maps directly onto the four instant-save fields
 * `WhoSeesWhatFieldToggles` also exposes individually, so applying a preset is
 * just a bulk `updateDraft` + `save()` of the same shape a member could reach
 * by hand — see `WhoSeesWhatPresets`, which also derives "is this preset
 * currently active" by comparing the live draft against these exact shapes
 * (so there's no separate, sync-prone "selected preset" state to maintain).
 */
export const VISIBILITY_PRESETS = {
  findable: {
    photoVisible: true,
    hoodVisible: true,
    vouchersVisible: true,
    lookingForPublic: true,
  },
  careful: {
    photoVisible: false,
    hoodVisible: false,
    vouchersVisible: true,
    lookingForPublic: true,
  },
  closed: {
    photoVisible: false,
    hoodVisible: false,
    vouchersVisible: false,
    lookingForPublic: false,
  },
} as const;

export type VisibilityPresetKey = keyof typeof VISIBILITY_PRESETS;

/** Copy keys for each preset card. Left for the catalog task (18) to fill in;
 *  `t()` on a missing key renders the raw key string, which is an accepted
 *  stopgap in this multi-task plan. */
export const PRESET_META: Record<
  VisibilityPresetKey,
  { labelKey: string; descKey: string }
> = {
  findable: {
    labelKey: "members:profile.whoSeesWhat.presets.findable.label",
    descKey: "members:profile.whoSeesWhat.presets.findable.desc",
  },
  careful: {
    labelKey: "members:profile.whoSeesWhat.presets.careful.label",
    descKey: "members:profile.whoSeesWhat.presets.careful.desc",
  },
  closed: {
    labelKey: "members:profile.whoSeesWhat.presets.closed.label",
    descKey: "members:profile.whoSeesWhat.presets.closed.desc",
  },
};

/** One instant-save visibility switch. `key` names the exact `ProfileDraft`
 *  boolean field it edits. */
export interface VisibilityFieldConfig {
  key: "photoVisible" | "hoodVisible" | "vouchersVisible" | "lookingForPublic";
  labelKey: string;
  descKey: string;
}

export const VISIBILITY_FIELDS: VisibilityFieldConfig[] = [
  {
    key: "photoVisible",
    labelKey: "members:profile.whoSeesWhat.fields.photo.label",
    descKey: "members:profile.whoSeesWhat.fields.photo.desc",
  },
  {
    key: "hoodVisible",
    labelKey: "members:profile.whoSeesWhat.fields.hood.label",
    descKey: "members:profile.whoSeesWhat.fields.hood.desc",
  },
  {
    key: "vouchersVisible",
    labelKey: "members:profile.whoSeesWhat.fields.vouchers.label",
    descKey: "members:profile.whoSeesWhat.fields.vouchers.desc",
  },
  {
    key: "lookingForPublic",
    labelKey: "members:profile.whoSeesWhat.fields.intent.label",
    descKey: "members:profile.whoSeesWhat.fields.intent.desc",
  },
];

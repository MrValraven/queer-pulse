import type { BadgeTone } from "../../shared/components/ui";
import type { MyReportEntry } from "./api/useMyReports";

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

/** `ReportDTO.status` (open/resolved/escalated, per `reports.api.ts`) → the
 *  shared `<Badge>` tone + a copy key. An unrecognised status still renders
 *  (falls back to `ghost`/a raw-key label) rather than throwing. */
export const REPORT_STATUS_TONE: Record<string, BadgeTone> = {
  open: "amber",
  resolved: "jade",
  escalated: "danger",
};

export const REPORT_STATUS_LABEL_KEY: Record<string, string> = {
  open: "members:profile.whoSeesWhat.reports.status.open",
  resolved: "members:profile.whoSeesWhat.reports.status.resolved",
  escalated: "members:profile.whoSeesWhat.reports.status.escalated",
};

/** Demo-mode fallback for `useMyReports` — a couple of plausible entries so
 *  the section has something to render in the prototype. */
export const DEMO_MY_REPORTS: MyReportEntry[] = [
  {
    id: "demo-report-1",
    reference: "QP-RPT-1042",
    subjectType: "post",
    reasonCode: "off_topic",
    status: "resolved",
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-report-2",
    reference: "QP-RPT-1187",
    subjectType: "member",
    reasonCode: "unwanted_contact",
    status: "open",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

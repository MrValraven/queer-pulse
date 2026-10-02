import type {
  LinkVisibility,
  SubprofileKind,
  SubprofileSection,
  Visibility,
} from "./api/subprofiles.api";

// ── Publish thresholds (mirror contract C5) ──────────────────────────────────

/** Minimum bio length before an unlinked persona can go live. */
export const MIN_BIO = 80;
/** How many content items (section ≠ links) count as a rounded-out persona.
 *  ADVISORY: an empty persona publishes fine, so this only drives the optional
 *  "add a few pieces" polish nudge and the readiness estimate, never the gate. */
export const MIN_CONTENT_ITEMS = 3;
/** Server-side cap, surfaced here as a friendly limit on the Add affordance. */
export const MAX_ITEMS_PER_SECTION = 100;

/** Sections whose items support per-item typed social links (stored in each
 *  item's `structured.links`). Kept narrow: only project-shaped sections where
 *  a GitHub / demo / docs link per entry makes sense. */
export const ITEM_LINKS_SECTIONS = new Set<SubprofileSection>([
  "projects",
  "open_source",
]);
/** Friendly per-item link cap surfaced on the Add affordance. */
export const MAX_ITEM_LINKS = 6;

/** Sections whose `imageUrl` is a photo of a certificate or diploma. The item
 *  drawer adds a privacy note to the upload field, and the public row shows
 *  the photo as a thumbnail that opens full size (`CredentialProofThumb`). */
export const CREDENTIAL_PHOTO_SECTIONS = new Set<SubprofileSection>([
  "credentials",
  "trainings",
]);

// ── Meta-form options + copy ─────────────────────────────────────────────────
// i18n label-key indirection throughout this section: `value`/the Record key
// is the PERSISTED canonical id (visibility / linkVisibility are stored
// fields), so `labelKey`/`helpKey` resolve via `t()` at render — a language
// switch never touches the stored choice.

export const VISIBILITY_OPTIONS: {
  value: Visibility;
  labelKey: string;
  helpKey: string;
}[] = [
  {
    value: "open",
    labelKey: "subprofiles:visibility.open.label",
    helpKey: "subprofiles:visibility.open.help",
  },
  {
    value: "network",
    labelKey: "subprofiles:visibility.network.label",
    helpKey: "subprofiles:visibility.network.help",
  },
  {
    value: "private",
    labelKey: "subprofiles:visibility.private.label",
    helpKey: "subprofiles:visibility.private.help",
  },
];

/** Segmented-control values for the link-visibility choice — canonical ids;
 *  the component renders their translated labels via `LINK_TO_LABEL_KEY`. */
export const LINK_OPTIONS = [
  "linked",
  "unlinked",
] as const satisfies readonly LinkVisibility[];

export const LINK_TO_LABEL_KEY: Record<LinkVisibility, string> = {
  linked: "subprofiles:link.linked",
  unlinked: "subprofiles:link.standalone",
};

export const LINK_HELP_KEY: Record<LinkVisibility, string> = {
  linked: "subprofiles:link.help.linked",
  unlinked: "subprofiles:link.help.unlinked",
};

// ── Per-field labels for the item editor ─────────────────────────────────────
// Generic, friendly labels for the generalized item columns. Each section only
// renders the fields listed in SECTION_META[section].fields. Not persisted
// choices (the field NAMES title/subtitle/… are fixed, only their labels
// translate), still resolved via `t()` for consistency.

export interface ItemFieldMeta {
  labelKey: string;
  placeholderKey: string;
  multiline?: boolean;
  /** `"month"` renders a month+year picker (stored as `yyyy-mm`), `"date"` a
   *  day picker (stored as `yyyy-mm-dd`), instead of the default free-text
   *  input. */
  inputType?: "text" | "month" | "date";
  /** Optional helper line under the field. */
  helperKey?: string;
  /** Text field only: common answers offered as one-tap chips under the
   *  input. A tap writes that chip's text into the field, in the language
   *  the owner is writing in. */
  quickPickKeys?: string[];
}

export const FIELD_META: Record<string, ItemFieldMeta> = {
  title: {
    labelKey: "subprofiles:field.title.label",
    placeholderKey: "subprofiles:field.title.placeholder",
  },
  subtitle: {
    labelKey: "subprofiles:field.subtitle.label",
    placeholderKey: "subprofiles:field.subtitle.placeholder",
  },
  description: {
    labelKey: "subprofiles:field.description.label",
    placeholderKey: "subprofiles:field.description.placeholder",
    multiline: true,
  },
  url: {
    labelKey: "subprofiles:field.url.label",
    placeholderKey: "subprofiles:field.url.placeholder",
  },
  date: {
    labelKey: "subprofiles:field.date.label",
    placeholderKey: "subprofiles:field.date.placeholder",
    inputType: "month",
  },
  meta: {
    labelKey: "subprofiles:field.meta.label",
    placeholderKey: "subprofiles:field.meta.placeholder",
  },
  tags: {
    labelKey: "subprofiles:field.tags.label",
    placeholderKey: "subprofiles:field.tags.placeholder",
  },
};

// ── Per-kind item fields ─────────────────────────────────────────────────────

const gm = (section: string, field: string, part: string) =>
  `subprofiles:itemField.gameMaster.${section}.${field}.${part}`;

/**
 * Where a kind words a section's item fields its own way, over `FIELD_META`.
 * A game master's campaign keeps its seats in `subtitle` and its schedule in
 * `date`, where a month picker would hide "Sundays, fortnightly"; a session
 * is one evening, so its date is a day.
 */
export const KIND_ITEM_FIELD_META: Partial<
  Record<
    SubprofileKind,
    Partial<Record<SubprofileSection, Record<string, Partial<ItemFieldMeta>>>>
  >
> = {
  game_master: {
    campaigns: {
      title: { placeholderKey: gm("campaigns", "title", "placeholder") },
      subtitle: {
        labelKey: gm("campaigns", "subtitle", "label"),
        placeholderKey: gm("campaigns", "subtitle", "placeholder"),
        quickPickKeys: [
          "subprofiles:itemField.gameMaster.campaigns.subtitle.pick.recruiting",
          "subprofiles:itemField.gameMaster.campaigns.subtitle.pick.oneSeat",
          "subprofiles:itemField.gameMaster.campaigns.subtitle.pick.twoSeats",
          "subprofiles:itemField.gameMaster.campaigns.subtitle.pick.full",
          "subprofiles:itemField.gameMaster.campaigns.subtitle.pick.waitlist",
          "subprofiles:itemField.gameMaster.campaigns.subtitle.pick.break",
        ],
      },
      date: {
        labelKey: gm("campaigns", "date", "label"),
        placeholderKey: gm("campaigns", "date", "placeholder"),
        inputType: "text",
      },
      description: {
        placeholderKey: gm("campaigns", "description", "placeholder"),
      },
    },
    sessions: {
      title: { placeholderKey: gm("sessions", "title", "placeholder") },
      date: { inputType: "date" },
      url: {
        labelKey: gm("sessions", "url", "label"),
        helperKey: gm("sessions", "url", "helper"),
      },
      description: {
        placeholderKey: gm("sessions", "description", "placeholder"),
      },
    },
  },
};

/** An item field's wording and input for this kind and section. */
export function itemFieldMeta(
  field: string,
  section: SubprofileSection,
  kind: SubprofileKind | undefined,
): ItemFieldMeta | undefined {
  const base = FIELD_META[field];
  if (!base) return undefined;
  const override = kind && KIND_ITEM_FIELD_META[kind]?.[section]?.[field];
  return override ? { ...base, ...override } : base;
}

/** The item drawer's heading for sections that read better with their own
 *  noun ("Add a campaign") than the generic "Add to Campaigns". */
export const SECTION_DRAWER_TITLE_KEYS: Partial<
  Record<SubprofileSection, { add: string; edit: string }>
> = {
  campaigns: {
    add: "subprofiles:itemDrawer.section.campaigns.add",
    edit: "subprofiles:itemDrawer.section.campaigns.edit",
  },
  sessions: {
    add: "subprofiles:itemDrawer.section.sessions.add",
    edit: "subprofiles:itemDrawer.section.sessions.edit",
  },
};

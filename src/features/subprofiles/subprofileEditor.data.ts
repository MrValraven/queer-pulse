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

const architectField = (section: string, field: string) =>
  `subprofiles:itemField.architect.${section}.${field}.placeholder`;

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
  // A guest spot names its studio or convention and runs from a first day;
  // a flash day is one day at a place; a shop item links out to buy.
  tattoo_artist: {
    guest_spots: {
      title: {
        labelKey: "subprofiles:itemField.tattoo.guest_spots.title.label",
        placeholderKey:
          "subprofiles:itemField.tattoo.guest_spots.title.placeholder",
      },
      subtitle: {
        labelKey: "subprofiles:itemField.tattoo.guest_spots.subtitle.label",
        placeholderKey:
          "subprofiles:itemField.tattoo.guest_spots.subtitle.placeholder",
      },
      date: {
        labelKey: "subprofiles:itemField.tattoo.guest_spots.date.label",
        inputType: "date",
      },
      url: { labelKey: "subprofiles:itemField.tattoo.guest_spots.url.label" },
    },
    flash_days: {
      subtitle: {
        labelKey: "subprofiles:itemField.tattoo.flash_days.subtitle.label",
        placeholderKey:
          "subprofiles:itemField.tattoo.flash_days.subtitle.placeholder",
      },
      date: { inputType: "date" },
      url: { labelKey: "subprofiles:itemField.tattoo.flash_days.url.label" },
    },
    shop: {
      url: {
        labelKey: "subprofiles:itemField.tattoo.shop.url.label",
        placeholderKey: "subprofiles:itemField.tattoo.shop.url.placeholder",
        helperKey: "subprofiles:itemField.tattoo.shop.url.helper",
      },
    },
  },
  // A finished building names its place and the architect's role on it; a
  // competition names who ran it and how the entry placed.
  architect: {
    built_work: {
      title: { placeholderKey: architectField("built_work", "title") },
      subtitle: {
        labelKey: "subprofiles:itemField.architect.built_work.subtitle.label",
        placeholderKey: architectField("built_work", "subtitle"),
      },
      date: {
        labelKey: "subprofiles:itemField.architect.built_work.date.label",
      },
      meta: {
        labelKey: "subprofiles:itemField.architect.built_work.meta.label",
        placeholderKey: architectField("built_work", "meta"),
      },
    },
    competitions: {
      title: { placeholderKey: architectField("competitions", "title") },
      subtitle: {
        labelKey: "subprofiles:itemField.architect.competitions.subtitle.label",
        placeholderKey: architectField("competitions", "subtitle"),
      },
      meta: {
        labelKey: "subprofiles:itemField.architect.competitions.meta.label",
        placeholderKey: architectField("competitions", "meta"),
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
  flash: {
    add: "subprofiles:itemDrawer.section.flash.add",
    edit: "subprofiles:itemDrawer.section.flash.edit",
  },
  healed: {
    add: "subprofiles:itemDrawer.section.healed.add",
    edit: "subprofiles:itemDrawer.section.healed.edit",
  },
  wanna_dos: {
    add: "subprofiles:itemDrawer.section.wanna_dos.add",
    edit: "subprofiles:itemDrawer.section.wanna_dos.edit",
  },
  in_progress: {
    add: "subprofiles:itemDrawer.section.in_progress.add",
    edit: "subprofiles:itemDrawer.section.in_progress.edit",
  },
  cover_ups: {
    add: "subprofiles:itemDrawer.section.cover_ups.add",
    edit: "subprofiles:itemDrawer.section.cover_ups.edit",
  },
  scar_work: {
    add: "subprofiles:itemDrawer.section.scar_work.add",
    edit: "subprofiles:itemDrawer.section.scar_work.edit",
  },
  guest_spots: {
    add: "subprofiles:itemDrawer.section.guest_spots.add",
    edit: "subprofiles:itemDrawer.section.guest_spots.edit",
  },
  flash_days: {
    add: "subprofiles:itemDrawer.section.flash_days.add",
    edit: "subprofiles:itemDrawer.section.flash_days.edit",
  },
  shop: {
    add: "subprofiles:itemDrawer.section.shop.add",
    edit: "subprofiles:itemDrawer.section.shop.edit",
  },
};

/** The section editor's Add button, for sections whose button names what it
 *  adds ("Add flash") in place of the generic "Add". */
export const SECTION_ADD_LABEL_KEYS: Partial<
  Record<SubprofileSection, string>
> = {
  flash: "subprofiles:itemDrawer.section.flash.add",
  healed: "subprofiles:itemDrawer.section.healed.add",
  wanna_dos: "subprofiles:itemDrawer.section.wanna_dos.add",
  in_progress: "subprofiles:itemDrawer.section.in_progress.add",
  cover_ups: "subprofiles:itemDrawer.section.cover_ups.add",
  scar_work: "subprofiles:itemDrawer.section.scar_work.add",
  guest_spots: "subprofiles:itemDrawer.section.guest_spots.add",
  flash_days: "subprofiles:itemDrawer.section.flash_days.add",
  shop: "subprofiles:itemDrawer.section.shop.add",
};

/** The item drawer's photo field prompt, for sections whose main photo has a
 *  role of its own (a cover-up's main photo is the after photo). */
export const SECTION_IMAGE_PLACEHOLDER_KEYS: Partial<
  Record<SubprofileSection, string>
> = {
  cover_ups: "subprofiles:tattooItem.afterPhoto.placeholder",
};

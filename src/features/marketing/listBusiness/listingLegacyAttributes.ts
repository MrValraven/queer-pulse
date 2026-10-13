import type { ListingDraft } from "./listBusiness.data";
import {
  isHighlightableAttribute,
  LISTING_HIGHLIGHT_CAP,
  type ListingAttributeSlug,
} from "./listingAttributes.data";
import {
  hasCoverCategory,
  LANGS_OTHER_MAX_LENGTH,
  LISTING_LANGUAGE_CODES,
  type ListingEntryMode,
} from "./listingFacts.data";
import { listingKindOf } from "./listingMobile.data";
import {
  healRetiredOnlineTags,
  legacyStringList,
  type LegacyListingDraftFields,
} from "./listingRetiredTags";

export type { LegacyListingDraftFields } from "./listingRetiredTags";

/**
 * Drafts saved before 2026-10-08 (local autosave, a server draft, the
 * editor's local copy, a member draft handed to staff) still carry `tags`,
 * `goodFor` and language names. This heals them on load with the contract's
 * mapping table, the same one the backend migration froze in
 * `listing-attributes-migration.ts`, so a resumed draft opens with its
 * attributes, highlights, way in, free entry and language codes in place
 * and sends only keys and codes the API accepts.
 */

type LegacyMove =
  | { kind: "attribute"; slug: ListingAttributeSlug }
  | {
      kind: "entryMode";
      mode: ListingEntryMode;
      /** What the value becomes on an online listing, which has no way in. */
      onlineSlug?: ListingAttributeSlug;
    }
  | { kind: "freeEntry" };

const attribute = (slug: ListingAttributeSlug): LegacyMove => ({
  kind: "attribute",
  slug,
});

/** The contract table, keyed by the lowercased, trimmed old value. A value
 *  missing here is dropped (the server keeps it in `tags`/`good_for` until
 *  the drop migration). */
export const LEGACY_VALUE_MOVES: Readonly<Record<string, LegacyMove>> = {
  "walk-ins welcome": { kind: "entryMode", mode: "walkIn" },
  "booking recommended": { kind: "entryMode", mode: "bookingRecommended" },
  "by appointment": {
    kind: "entryMode",
    mode: "appointmentOnly",
    onlineSlug: "by-appointment",
  },
  "members only": { kind: "entryMode", mode: "membersOnly" },
  "free entry": { kind: "freeEntry" },
  "day passes": attribute("day-passes"),
  memberships: attribute("memberships"),
  "class packs": attribute("class-packs"),
  workshops: attribute("workshops"),
  classes: attribute("classes"),
  "live music": attribute("live-music"),
  "dj nights": attribute("dj-nights"),
  "drag shows": attribute("drag-shows"),
  exhibitions: attribute("exhibitions"),
  "readings and talks": attribute("readings-and-talks"),
  "community events": attribute("hosts-events"),
  "hosts community events": attribute("hosts-events"),
  "support groups": attribute("support-groups"),
  "space for hire": attribute("space-for-hire"),
  "vegan options": attribute("vegan-options"),
  "vegetarian options": attribute("vegetarian-options"),
  "gluten-free options": attribute("gluten-free-options"),
  "alcohol-free options": attribute("alcohol-free-drinks"),
  terrace: attribute("terrace"),
  "sliding scale": attribute("sliding-scale"),
  "pay what you can": attribute("pay-what-you-can"),
  "student discount": attribute("student-discount"),
  "made to order": attribute("made-to-order"),
  "custom commissions": attribute("custom-commissions"),
  "gift cards": attribute("gift-cards"),
  "free first call": attribute("free-first-call"),
  "solo-friendly": attribute("solo-friendly"),
  "dog-friendly": attribute("dog-friendly"),
  "beginner-friendly": attribute("beginner-friendly"),
  "good for gifts": attribute("good-for-gifts"),
};

/** Strictest first: several values on one draft resolve to the first. */
const ENTRY_STRICTNESS: readonly ListingEntryMode[] = [
  "membersOnly",
  "appointmentOnly",
  "bookingRecommended",
  "walkIn",
];

/** The old wizard's language names, lowercased, to their codes. "Other" is
 *  dropped; any other name goes to `langsOther` as written. */
export const LEGACY_LANGUAGE_CODES: Readonly<Record<string, string>> = {
  português: "pt",
  "português (brasil)": "pt-BR",
  english: "en",
  español: "es",
  français: "fr",
  "lgp (sign)": "lgp",
};
const DROPPED_LANGUAGE_NAMES: ReadonlySet<string> = new Set(["other"]);
const KNOWN_LANGUAGE_CODES: readonly string[] = LISTING_LANGUAGE_CODES;

/** A stored value as the backend migration reads it: NFC, trimmed. */
function cleanedLegacyValue(value: string): string {
  return value.normalize("NFC").trim();
}

function legacyMoveOf(value: string): LegacyMove | undefined {
  const key = cleanedLegacyValue(value).toLowerCase();
  return Object.hasOwn(LEGACY_VALUE_MOVES, key)
    ? LEGACY_VALUE_MOVES[key]
    : undefined;
}

function languageCodeOf(value: string): string | undefined {
  const lowered = value.toLowerCase();
  if (Object.hasOwn(LEGACY_LANGUAGE_CODES, lowered)) {
    return LEGACY_LANGUAGE_CODES[lowered];
  }
  return KNOWN_LANGUAGE_CODES.find(
    (candidate) => candidate.toLowerCase() === lowered,
  );
}

/**
 * The names joined with ", ", each one whole: a name that would take the
 * text past `LANGS_OTHER_MAX_LENGTH` is left out and the next one is tried,
 * so the text never ends mid-name or on a separator. Same rule as the
 * backend migration's `joinWholeNamesThatFit`.
 */
function joinWholeNamesThatFit(names: readonly string[]): string {
  let joinedNames = "";
  for (const name of names) {
    const candidate = joinedNames === "" ? name : `${joinedNames}, ${name}`;
    if (candidate.length <= LANGS_OTHER_MAX_LENGTH) joinedNames = candidate;
  }
  return joinedNames;
}

/** Names to codes, codes kept (any case), "Other" dropped, anything else
 *  appended to `langsOther` once each (case ignored), as whole names that
 *  fit in 80 characters. */
export function healLegacyLanguages(
  langs: readonly string[],
  langsOther: string,
): { langs: string[]; langsOther: string } {
  // What the field already holds stays first and is never cut mid-word
  // unless it alone runs past the limit.
  const heldText = langsOther
    .normalize("NFC")
    .trim()
    .slice(0, LANGS_OTHER_MAX_LENGTH)
    .trimEnd();
  const seenNames = new Set(
    heldText
      .split(",")
      .map((part) => part.trim().toLowerCase())
      .filter(Boolean),
  );
  const codes: string[] = [];
  const otherNames: string[] = [];
  for (const raw of langs) {
    const value = cleanedLegacyValue(raw);
    if (!value) continue;
    const lowered = value.toLowerCase();
    if (DROPPED_LANGUAGE_NAMES.has(lowered)) continue;
    const code = languageCodeOf(value);
    if (code) {
      if (!codes.includes(code)) codes.push(code);
    } else if (!seenNames.has(lowered)) {
      seenNames.add(lowered);
      otherNames.push(value);
    }
  }
  return {
    langs: codes,
    langsOther: joinWholeNamesThatFit(
      heldText ? [heldText, ...otherNames] : otherNames,
    ),
  };
}

function needsLegacyHealing(
  draft: ListingDraft & LegacyListingDraftFields,
): boolean {
  return (
    draft.tags !== undefined ||
    draft.goodFor !== undefined ||
    legacyStringList(draft.langs).some(
      (value) => !KNOWN_LANGUAGE_CODES.includes(value),
    )
  );
}

/** Tags and Good-for to the new fields, language names to codes, and the
 *  legacy keys gone. Values the draft already holds in the new fields win.
 *  The same object comes back when there is nothing to heal. */
export function healLegacyListingAttributes(
  draft: ListingDraft & LegacyListingDraftFields,
): ListingDraft {
  if (!needsLegacyHealing(draft)) return draft;
  const { tags: legacyTags, goodFor: legacyGoodFor, ...current } = draft;
  const isOnline = listingKindOf(draft) === "online";
  const mapped: string[] = [];
  const entryModes: ListingEntryMode[] = [];
  let hasFreeEntry = false;
  const addMapped = (slug: string) => {
    if (!mapped.includes(slug)) mapped.push(slug);
  };
  for (const value of [
    ...legacyStringList(legacyTags),
    ...legacyStringList(legacyGoodFor),
  ]) {
    const move = legacyMoveOf(value);
    if (!move) continue;
    if (move.kind === "attribute") addMapped(move.slug);
    else if (move.kind === "freeEntry") hasFreeEntry = true;
    else if (isOnline && move.onlineSlug) addMapped(move.onlineSlug);
    else if (!isOnline) entryModes.push(move.mode);
  }
  // Read defensively: a copy from local storage can hold anything here.
  const attributes = legacyStringList(draft.attributes);
  for (const slug of mapped) {
    if (!attributes.includes(slug)) attributes.push(slug);
  }
  const storedHighlights = legacyStringList(draft.highlights);
  const languages = healLegacyLanguages(
    legacyStringList(draft.langs),
    typeof draft.langsOther === "string" ? draft.langsOther : "",
  );
  return {
    ...current,
    attributes,
    highlights:
      storedHighlights.length > 0
        ? storedHighlights
        : mapped
            .filter((slug) => isHighlightableAttribute(slug))
            .slice(0, LISTING_HIGHLIGHT_CAP),
    entryMode:
      draft.entryMode ??
      ENTRY_STRICTNESS.find((mode) => entryModes.includes(mode)) ??
      null,
    coverPolicy:
      draft.coverPolicy ??
      (hasFreeEntry &&
      !isOnline &&
      hasCoverCategory(legacyStringList(draft.cats).map(cleanedLegacyValue))
        ? "free"
        : null),
    langs: languages.langs,
    langsOther: languages.langsOther,
  };
}

/** Every load of a draft goes through this: the retired online tags move
 *  into the online block first (`healRetiredOnlineTags`), then the rest of
 *  the legacy shape heals. */
export function healLegacyListingDraft(
  draft: ListingDraft & LegacyListingDraftFields,
): ListingDraft {
  return healLegacyListingAttributes(healRetiredOnlineTags(draft));
}

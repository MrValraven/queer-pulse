/* ===========================================================
   Shared values — the browsable library.
   A community's shared values live on `Community.rules`: a plain
   string array the join flow shows, bans and takedowns cite by
   index, and `rulesVersion` re-consents when it changes. This
   file is the *offer*: a themed catalogue a founder or owner can
   pick from instead of facing an empty field, plus the helpers
   both surfaces (the Start-a-Community wizard's Tone chapter and
   `EditCommunityModal`) use to recognise a picked value again.
   Writing your own is untouched and always available.
   =========================================================== */

/**
 * Ceiling on how many shared values a community can hold, mirroring
 * `@ArrayMaxSize(50)` on the backend's `CreateCommunityDto.rules` /
 * `UpdateCommunityDto.rules`. Kept here so the picker stops at the same
 * place the server would rather than letting an owner select into a 400.
 */
export const MAX_COMMUNITY_RULES = 50;

/**
 * Selecting past this many is legal and still allowed, but every member has
 * to read the whole list when they join, so the picker says so gently once a
 * founder crosses it. A soft nudge with no enforcement behind it.
 */
export const COMFORTABLE_RULE_COUNT = 12;

/** The themes values are grouped under, in display order. */
export const SHARED_VALUE_THEMES = [
  "safety",
  "privacy",
  "access",
  "conflict",
  "money",
  "substances",
  "intimacy",
  "showingUp",
  "family",
  "organising",
] as const;

export type SharedValueTheme = (typeof SHARED_VALUE_THEMES)[number];

export interface SharedValueEntry {
  /** Stable id, unique across every theme. Used for React keys and tests. */
  id: string;
  /** Namespaced i18n key holding the value's copy in the reader's language. */
  key: string;
  theme: SharedValueTheme;
}

/**
 * The four values a new community starts with, pre-selected on the wizard's
 * Tone chapter. They keep their original `start.rulePreset.*` keys: a founder
 * may have a half-finished draft in localStorage holding those exact strings,
 * and renaming them would strip their values on the next visit.
 */
export const RULE_PRESET_KEYS: string[] = [
  "communities:start.rulePreset.warmth",
  "communities:start.rulePreset.confidentiality",
  "communities:start.rulePreset.consent",
  "communities:start.rulePreset.welcome",
];

/** Sugar for the (many) library entries whose key follows the default shape. */
function value(
  id: string,
  theme: SharedValueTheme,
  key = `communities:values.lib.${id}`,
): SharedValueEntry {
  return { id, key, theme };
}

/**
 * Every value on offer, grouped by theme in display order. The four preset
 * entries appear here too, so the picker shows them already selected rather
 * than offering a founder a duplicate of a value they already hold.
 */
export const SHARED_VALUE_LIBRARY: readonly SharedValueEntry[] = [
  /* ── Safety and respect ─────────────────────────────────────────────── */
  value("warmth", "safety", "communities:start.rulePreset.warmth"),
  value("noPunchingDown", "safety"),
  value("transWelcome", "safety"),
  value("identityNotDebate", "safety"),
  value("racismNamed", "safety"),
  value("bodyComments", "safety"),
  value("listenFirst", "safety"),
  value("tellAnOrganiser", "safety"),

  /* ── Consent and privacy ────────────────────────────────────────────── */
  value(
    "confidentiality",
    "privacy",
    "communities:start.rulePreset.confidentiality",
  ),
  value("consent", "privacy", "communities:start.rulePreset.consent"),
  value("photoYes", "privacy"),
  value("pronounsUsed", "privacy"),
  value("chosenNames", "privacy"),
  value("noForwarding", "privacy"),
  value("contactsTheirs", "privacy"),
  value("gatheringsOffline", "privacy"),

  /* ── Access and welcome ─────────────────────────────────────────────── */
  value("welcome", "access", "communities:start.rulePreset.welcome"),
  value("accessDetails", "access"),
  value("plainLanguage", "access"),
  value("scentAware", "access"),
  value("quieterSpace", "access"),
  value("noAssumedKnowledge", "access"),
  value("remoteOption", "access"),
  value("ownLanguage", "access"),

  /* ── Conflict and repair ────────────────────────────────────────────── */
  value("repairFirst", "conflict"),
  value("directFirst", "conflict"),
  value("noPileOn", "conflict"),
  value("apologyIsAction", "conflict"),
  value("sayWhenItLanded", "conflict"),
  value("stepBackStepUp", "conflict"),
  value("mediationOffered", "conflict"),
  value("leaveTheThread", "conflict"),

  /* ── Money and reciprocity ──────────────────────────────────────────── */
  value("costNoBarrier", "money"),
  value("slidingScale", "money"),
  value("costsInTheOpen", "money"),
  value("noSelling", "money"),
  value("labourNamed", "money"),
  value("payThePerformers", "money"),
  value("askWhatHelps", "money"),
  value("noDebts", "money"),

  /* ── Drink and substances ───────────────────────────────────────────── */
  value("softDrinksGood", "substances"),
  value("neverAskedTwice", "substances"),
  value("soberGatherings", "substances"),
  value("harmReduction", "substances"),
  value("stayWithThem", "substances"),
  value("substanceFree", "substances"),
  value("recoveryRespected", "substances"),
  value("getHomeSafe", "substances"),

  /* ── Flirting and intimacy ──────────────────────────────────────────── */
  value("flirtingAndNo", "intimacy"),
  value("communityFirst", "intimacy"),
  value("noUnsolicitedImages", "intimacy"),
  value("askBeforeMessages", "intimacy"),
  value("takeANo", "intimacy"),
  value("relationshipsRespected", "intimacy"),
  value("enthusiasticYes", "intimacy"),
  value("desiresPrivate", "intimacy"),

  /* ── Showing up ─────────────────────────────────────────────────────── */
  value("sayIfYouCannot", "showingUp"),
  value("arriveOnTime", "showingUp"),
  value("helpPackDown", "showingUp"),
  value("lurkingIsFine", "showingUp"),
  value("noObligation", "showingUp"),
  value("bringAFriend", "showingUp"),
  value("answerNewcomers", "showingUp"),
  value("rotateTheJobs", "showingUp"),

  /* ── Kids and family ────────────────────────────────────────────────── */
  value("kidsWelcome", "family"),
  value("chosenFamily", "family"),
  value("carersSupported", "family"),
  value("ageStated", "family"),
  value("adultsOnly", "family"),
  value("partnersWelcome", "family"),
  value("somewhereForKids", "family"),
  value("schedulingReal", "family"),

  /* ── Politics and organising ────────────────────────────────────────── */
  value("noPolice", "organising"),
  value("smallAndAccessible", "organising"),
  value("decisionsInTheOpen", "organising"),
  value("solidarityNamed", "organising"),
  value("noBrandUse", "organising"),
  value("dataMinimal", "organising"),
  value("noSpokespeople", "organising"),
  value("disagreeOnTactics", "organising"),
];

const LIBRARY_BY_KEY = new Map(
  SHARED_VALUE_LIBRARY.map((entry) => [entry.key, entry]),
);

/** The i18n key naming a theme's heading in the picker. */
export function sharedValueThemeLabelKey(theme: SharedValueTheme): string {
  return `communities:values.theme.${theme}`;
}

/**
 * Whether a stored rule is a library i18n key rather than somebody's own
 * words. The wizard holds library picks as keys (so the copy follows a
 * language switch mid-draft) and renders anything else verbatim.
 */
export function isSharedValueKey(rule: string): boolean {
  return LIBRARY_BY_KEY.has(rule);
}

export function sharedValueByKey(key: string): SharedValueEntry | undefined {
  return LIBRARY_BY_KEY.get(key);
}

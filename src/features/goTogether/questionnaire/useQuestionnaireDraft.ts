import { useEffect, useRef, useState } from "react";
import {
  ACTIVE_HUMOUR_PAIR_IDS,
  AGE_BRACKETS,
  AGE_PREFERENCES,
  AREA_IDS,
  CHAT_LANGUAGES,
  DRINKING_OPTIONS,
  ENERGY_ITEM_IDS,
  INTENTS,
  INTEREST_TAG_IDS,
  MAX_INTEREST_TAGS,
  MAX_MUSIC_TAGS,
  MEET_FREQUENCIES,
  MUSIC_TAG_IDS,
  VALUE_ITEM_IDS,
  type AgeBracket,
  type AgePreference,
  type AreaId,
  type ChatLanguage,
  type DrinkingOption,
  type EnergyItemId,
  type FriendMatchAnswers,
  type HumourPairId,
  type HumourPick,
  type Intent,
  type InterestTagId,
  type MeetFrequency,
  type MusicTagId,
  type Scale5,
  type ValueItemId,
} from "../goTogetherQuestionnaire.data";
import {
  MIN_INTEREST_TAGS,
  QUESTIONNAIRE_STEPS,
  type QuestionnaireStepId,
} from "./questionnaireSteps.data";
import {
  questionnaireDraftKey,
  readStoredQuestionnaireDraft,
  removeStoredQuestionnaireDraft,
  writeStoredQuestionnaireDraft,
} from "./questionnaireDraftStorage";

/** The answers while the member is still filling them in: every single
 *  choice may be unset, and the score maps may be partial. */
export interface QuestionnaireDraft {
  values: Partial<Record<ValueItemId, Scale5>>;
  humour: Partial<Record<HumourPairId, HumourPick>>;
  interests: InterestTagId[];
  music: MusicTagId[];
  energy: Partial<Record<EnergyItemId, Scale5>>;
  intent: Intent | null;
  meetFrequency: MeetFrequency | null;
  languages: ChatLanguage[];
  drinking: DrinkingOption | null;
  ageBracket: AgeBracket | null;
  agePreference: AgePreference | null;
  area: AreaId | null;
}

export type QuestionnaireTagField = "interests" | "music" | "languages";
export type QuestionnaireChoiceField =
  | "intent"
  | "meetFrequency"
  | "drinking"
  | "ageBracket"
  | "agePreference"
  | "area";

const TAG_OPTIONS: Record<QuestionnaireTagField, readonly string[]> = {
  interests: INTEREST_TAG_IDS,
  music: MUSIC_TAG_IDS,
  languages: CHAT_LANGUAGES,
};

const TAG_LIMITS: Record<QuestionnaireTagField, number> = {
  interests: MAX_INTEREST_TAGS,
  music: MAX_MUSIC_TAGS,
  languages: CHAT_LANGUAGES.length,
};

// ── Parsing: shared by the server answers, the stored draft and the profile ──

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isScale5(value: unknown): value is Scale5 {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
  );
}

function pickOne<Option extends string>(
  options: readonly Option[],
  value: unknown,
): Option | null {
  return typeof value === "string" &&
    (options as readonly string[]).includes(value)
    ? (value as Option)
    : null;
}

function pickList<Option extends string>(
  options: readonly Option[],
  maximum: number,
  value: unknown,
): Option[] {
  if (!Array.isArray(value)) return [];
  const known = value.filter(
    (item): item is Option =>
      typeof item === "string" && (options as readonly string[]).includes(item),
  );
  return [...new Set(known)].slice(0, maximum);
}

function pickScores<ItemId extends string>(
  itemIds: readonly ItemId[],
  value: unknown,
): Partial<Record<ItemId, Scale5>> {
  const source = isRecord(value) ? value : {};
  const scores: Partial<Record<ItemId, Scale5>> = {};
  for (const itemId of itemIds) {
    const score = source[itemId];
    if (isScale5(score)) scores[itemId] = score;
  }
  return scores;
}

function pickHumour(value: unknown): Partial<Record<HumourPairId, HumourPick>> {
  const source = isRecord(value) ? value : {};
  const picks: Partial<Record<HumourPairId, HumourPick>> = {};
  for (const pairId of ACTIVE_HUMOUR_PAIR_IDS) {
    const pick = source[pairId];
    if (pick === "a" || pick === "b") picks[pairId] = pick;
  }
  return picks;
}

/** Reads anything shaped like answers (the server's, or a stored draft) into
 *  a draft, keeping only ids the current catalog knows. Retired ids and
 *  inactive humour pairs fall away, so the next save still validates. */
export function sanitizeDraft(raw: unknown): QuestionnaireDraft {
  const source = isRecord(raw) ? raw : {};
  return {
    values: pickScores(VALUE_ITEM_IDS, source.values),
    humour: pickHumour(source.humour),
    interests: pickList(INTEREST_TAG_IDS, MAX_INTEREST_TAGS, source.interests),
    music: pickList(MUSIC_TAG_IDS, MAX_MUSIC_TAGS, source.music),
    energy: pickScores(ENERGY_ITEM_IDS, source.energy),
    intent: pickOne(INTENTS, source.intent),
    meetFrequency: pickOne(MEET_FREQUENCIES, source.meetFrequency),
    languages: pickList(
      CHAT_LANGUAGES,
      CHAT_LANGUAGES.length,
      source.languages,
    ),
    drinking: pickOne(DRINKING_OPTIONS, source.drinking),
    ageBracket: pickOne(AGE_BRACKETS, source.ageBracket),
    agePreference: pickOne(AGE_PREFERENCES, source.agePreference),
    area: pickOne(AREA_IDS, source.area),
  };
}

/** Profile languages are stored as upper-case codes ("PT", "EN"); the
 *  questionnaire uses the lower-case wire ids. */
export function chatLanguagesFromProfile(
  profileLanguages: readonly string[] | undefined,
): ChatLanguage[] {
  return pickList(
    CHAT_LANGUAGES,
    CHAT_LANGUAGES.length,
    (profileLanguages ?? []).map((language) => language.trim().toLowerCase()),
  );
}

// ── Validity and the wire shape ─────────────────────────────────────────────

export function isStepComplete(
  stepId: QuestionnaireStepId,
  draft: QuestionnaireDraft,
  hasConsented: boolean,
): boolean {
  switch (stepId) {
    case "values":
      return VALUE_ITEM_IDS.every((itemId) => draft.values[itemId] != null);
    case "humour":
      return ACTIVE_HUMOUR_PAIR_IDS.every(
        (pairId) => draft.humour[pairId] != null,
      );
    case "interests":
      return draft.interests.length >= MIN_INTEREST_TAGS;
    case "music":
      return true;
    case "energy":
      return ENERGY_ITEM_IDS.every((itemId) => draft.energy[itemId] != null);
    case "intent":
      return draft.intent != null && draft.meetFrequency != null;
    case "dealbreakers":
      return (
        draft.languages.length > 0 &&
        draft.drinking != null &&
        draft.ageBracket != null &&
        draft.agePreference != null
      );
    case "area":
      return true;
    case "consent":
      return hasConsented;
  }
}

function completeScores<ItemId extends string>(
  itemIds: readonly ItemId[],
  scores: Partial<Record<ItemId, Scale5>>,
): Record<ItemId, Scale5> | null {
  const complete = {} as Record<ItemId, Scale5>;
  for (const itemId of itemIds) {
    const score = scores[itemId];
    if (score == null) return null;
    complete[itemId] = score;
  }
  return complete;
}

/** The exact `FriendMatchAnswers` body the backend validates, or null while
 *  any required answer is still missing. A skipped area goes out as null. */
export function draftToAnswers(
  draft: QuestionnaireDraft,
): FriendMatchAnswers | null {
  const values = completeScores(VALUE_ITEM_IDS, draft.values);
  const energy = completeScores(ENERGY_ITEM_IDS, draft.energy);
  const isAnswerable = QUESTIONNAIRE_STEPS.filter(
    (questionnaireStep) => questionnaireStep.id !== "consent",
  ).every((questionnaireStep) =>
    isStepComplete(questionnaireStep.id, draft, true),
  );
  if (
    !isAnswerable ||
    values == null ||
    energy == null ||
    draft.intent == null ||
    draft.meetFrequency == null ||
    draft.drinking == null ||
    draft.ageBracket == null ||
    draft.agePreference == null
  ) {
    return null;
  }
  const humour: FriendMatchAnswers["humour"] = {};
  for (const pairId of ACTIVE_HUMOUR_PAIR_IDS) {
    humour[pairId] = draft.humour[pairId];
  }
  return {
    values,
    humour,
    interests: [...draft.interests],
    music: [...draft.music],
    energy,
    intent: draft.intent,
    meetFrequency: draft.meetFrequency,
    languages: [...draft.languages],
    drinking: draft.drinking,
    ageBracket: draft.ageBracket,
    agePreference: draft.agePreference,
    area: draft.area ?? null,
  };
}

// ── Session storage: a per-member convenience that may be unavailable ───────

function clampStepIndex(stepIndex: unknown): number {
  if (typeof stepIndex !== "number" || !Number.isInteger(stepIndex)) return 0;
  return Math.min(Math.max(stepIndex, 0), QUESTIONNAIRE_STEPS.length - 1);
}

interface StoredQuestionnaire {
  draft: QuestionnaireDraft;
  stepIndex: number;
}

function readStoredQuestionnaire(
  storageKey: string,
): StoredQuestionnaire | null {
  const stored = readStoredQuestionnaireDraft(storageKey);
  if (!isRecord(stored)) return null;
  return {
    draft: sanitizeDraft(stored.draft),
    stepIndex: clampStepIndex(stored.stepIndex),
  };
}

// ── The hook ────────────────────────────────────────────────────────────────

export interface UseQuestionnaireDraftOptions {
  /** Saved answers from `useFriendMatchProfile`, to edit them in place. */
  initialAnswers?: FriendMatchAnswers | null;
  /** The viewer's profile languages, used to prefill a first answer. */
  profileLanguages?: readonly string[];
  /** From `questionnaireDraftKey(memberId)`, so one member's draft never
   *  prefills another's. Defaults to the `anon` slot. */
  storageKey?: string;
}

function initialDraft(
  initialAnswers: FriendMatchAnswers | null | undefined,
  profileLanguages: readonly string[] | undefined,
): QuestionnaireDraft {
  const draft = sanitizeDraft(initialAnswers);
  if (initialAnswers == null) {
    draft.languages = chatLanguagesFromProfile(profileLanguages);
  }
  return draft;
}

/**
 * Answer state for the questionnaire page: the draft, the current step, the
 * consent tick, per-step validity and the wire body for the save. An edited
 * draft and its step survive a reload in sessionStorage under the member's own
 * key, and win over the saved answers because they are the newer edit. The consent tick lives in memory
 * only, so every save asks for it again. The options are read
 * once on mount, so the page mounts this hook only after the saved answers
 * have loaded.
 */
export function useQuestionnaireDraft({
  initialAnswers,
  profileLanguages,
  storageKey = questionnaireDraftKey(null),
}: UseQuestionnaireDraftOptions = {}) {
  const [storedQuestionnaire] = useState(() =>
    readStoredQuestionnaire(storageKey),
  );
  const [baselineDraft] = useState(() =>
    initialDraft(initialAnswers, profileLanguages),
  );
  const [baselineJson] = useState(() => JSON.stringify(baselineDraft));
  const [draft, setDraft] = useState<QuestionnaireDraft>(
    () => storedQuestionnaire?.draft ?? baselineDraft,
  );
  const [stepIndex, setStepIndex] = useState(
    () => storedQuestionnaire?.stepIndex ?? 0,
  );
  const [hasConsented, setHasConsented] = useState(false);
  const hasClearedStorageRef = useRef(false);

  // Only answers that differ from what the page started with are worth
  // resuming. Untouched saved answers stay out of storage (so a delete in
  // Settings cannot bring them back), and moving between steps alone stores
  // nothing.
  useEffect(() => {
    if (hasClearedStorageRef.current) return;
    if (JSON.stringify(draft) === baselineJson) {
      removeStoredQuestionnaireDraft(storageKey);
      return;
    }
    writeStoredQuestionnaireDraft(storageKey, { draft, stepIndex });
  }, [draft, stepIndex, storageKey, baselineJson]);

  const setValueScore = (itemId: ValueItemId, score: Scale5) =>
    setDraft((current) => ({
      ...current,
      values: { ...current.values, [itemId]: score },
    }));

  const setEnergyScore = (itemId: EnergyItemId, score: Scale5) =>
    setDraft((current) => ({
      ...current,
      energy: { ...current.energy, [itemId]: score },
    }));

  const setHumourPick = (pairId: HumourPairId, pick: HumourPick) =>
    setDraft((current) => ({
      ...current,
      humour: { ...current.humour, [pairId]: pick },
    }));

  /** Adds or removes one tag. A pick past the field's limit is refused. */
  const toggleTag = (field: QuestionnaireTagField, tagId: string) =>
    setDraft((current) => {
      if (!TAG_OPTIONS[field].includes(tagId)) return current;
      const picked: readonly string[] = current[field];
      if (picked.includes(tagId)) {
        return { ...current, [field]: picked.filter((id) => id !== tagId) };
      }
      if (picked.length >= TAG_LIMITS[field]) return current;
      return { ...current, [field]: [...picked, tagId] };
    });

  const setChoice = <Field extends QuestionnaireChoiceField>(
    field: Field,
    choice: QuestionnaireDraft[Field],
  ) => setDraft((current) => ({ ...current, [field]: choice }));

  /** Called once the save lands, so a finished questionnaire never resumes. */
  const clearSavedDraft = () => {
    hasClearedStorageRef.current = true;
    removeStoredQuestionnaireDraft(storageKey);
  };

  return {
    draft,
    stepIndex,
    setStepIndex: (nextIndex: number) =>
      setStepIndex(clampStepIndex(nextIndex)),
    hasConsented,
    setHasConsented,
    setValueScore,
    setEnergyScore,
    setHumourPick,
    toggleTag,
    setChoice,
    isStepComplete: (stepId: QuestionnaireStepId) =>
      isStepComplete(stepId, draft, hasConsented),
    toAnswers: () => draftToAnswers(draft),
    clearSavedDraft,
  };
}

export type QuestionnaireDraftState = ReturnType<typeof useQuestionnaireDraft>;

/** What every step body receives from the page. */
export interface QuestionnaireStepProps {
  questionnaire: QuestionnaireDraftState;
  /** The id of the step heading, for groups the heading itself names. */
  headingId: string;
}

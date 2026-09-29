/**
 * Where an unsaved Go together questionnaire waits across a reload, and how
 * it is forgotten. The answers are sensitive, so the draft is per member and
 * per tab (sessionStorage), and it is cleared on save, on sign-out and when
 * the member deletes their answers in Settings.
 *
 * Kept apart from `useQuestionnaireDraft` so `AuthProvider` and the Settings
 * data section can clear drafts without loading the questionnaire catalog:
 * this file imports nothing.
 */

const QUESTIONNAIRE_DRAFT_KEY_PREFIX = "qp:goTogether:questionnaireDraft";

/** Where this member's draft lives. An unresolved session gets the `anon`
 *  slot, which sign-out clears along with every member's. */
export function questionnaireDraftKey(
  memberId: string | null | undefined,
): string {
  return `${QUESTIONNAIRE_DRAFT_KEY_PREFIX}:${memberId || "anon"}`;
}

/** The stored value as written, or null when absent, unreadable or blocked. */
export function readStoredQuestionnaireDraft(storageKey: string): unknown {
  try {
    const stored = window.sessionStorage.getItem(storageKey);
    return stored == null ? null : (JSON.parse(stored) as unknown);
  } catch {
    return null;
  }
}

export function writeStoredQuestionnaireDraft(
  storageKey: string,
  value: unknown,
): void {
  try {
    window.sessionStorage.setItem(storageKey, JSON.stringify(value));
  } catch {
    // Storage is full, blocked or absent: the draft simply will not survive
    // a reload, which is the only thing it was for.
  }
}

export function removeStoredQuestionnaireDraft(storageKey: string): void {
  try {
    window.sessionStorage.removeItem(storageKey);
  } catch {
    // Storage is blocked: there is nothing this tab could have stored.
  }
}

/**
 * Forget every questionnaire draft in this tab: the `anon` slot and each
 * member's. Sign-out and the Settings delete call this, so the next person on
 * a shared device, and the member after a delete, start from a clean slate.
 * Keys are collected before any is removed, since each removal shifts the
 * indexes `sessionStorage.key` reads.
 */
export function clearQuestionnaireDrafts(): void {
  const draftKeyStart = `${QUESTIONNAIRE_DRAFT_KEY_PREFIX}:`;
  const draftKeys: string[] = [];
  try {
    for (let index = 0; index < window.sessionStorage.length; index += 1) {
      const storageKey = window.sessionStorage.key(index);
      if (storageKey?.startsWith(draftKeyStart)) draftKeys.push(storageKey);
    }
  } catch {
    return;
  }
  for (const draftKey of draftKeys) removeStoredQuestionnaireDraft(draftKey);
}

import { queryClient } from "../../shared/api/queryClient";
import { purgeMessagingCache } from "../../shared/api/queryPersistence/messagingCachePersistence";
import { logWarn } from "../../shared/observability/logger";
import { safeStorage } from "../../shared/storage/safeStorage";
import { clearStoredGatheringDrafts } from "../../features/gatherings/createGatheringDraftStorage";
import { clearStoredAddMonthDrafts } from "../../features/gatherings/addMonth/addMonthDraftStorage";
import { clearLegacyCreatorDraftCopies } from "../../features/creatorDrafts/legacyCreatorDraftStorage";
import { clearCreatorDraftDemoStore } from "../../features/creatorDrafts/api/creatorDrafts.demoStore";
import { CREATOR_DRAFT_QUERY_ROOT } from "../../features/creatorDrafts/api/creatorDraftQueryKeys";
import { clearQuestionnaireDrafts } from "../../features/goTogether/questionnaire/questionnaireDraftStorage";
import { clearDraftsForScope } from "../../features/messages/drafts";
import { clearOutboxForScope } from "../../features/messages/outbox";
import { clearStudioEpisodeMemory } from "../../features/studio/player/studioEpisodeMemory";
import { clearStudioQueueSnapshots } from "../../features/studio/player/studioQueueStorage";
import { clearStudioWarningConsent } from "../../features/studio/player/studioWarningGate";
import { clearStudioTrackReveals } from "../../features/forum/forumWarnings.helpers";
import { clearStoredStoryDraft } from "../../features/magazine/useStoryDraft";
import { clearRecents } from "../../features/members/searchRecents";
import { clearStoredIssuer } from "../../features/economy/tools/useIssuer";

/**
 * Fixed localStorage keys that hold one member's own text or numbers with no
 * member scope in the key: the post-a-job draft, the set-aside pot, the IVA
 * tracker, the rate board and the badge story notes. Each name is the one its
 * owner module writes (`usePostJobForm`, `setAside.data`, `IvaTrackerPage`,
 * `RateBoardPage`, `useBadgePreferences`).
 */
const FIXED_MEMBER_STORAGE_KEYS = [
  "qp-postjob-draft",
  "qp.economy.setAsidePot",
  "qp.economy.ivaEntries",
  "qp.economy.rateBoard",
  "qp-badges-story-notes",
] as const;

/**
 * Per-member buckets written through `useScopedLocalStorage`: the bare key
 * (demo and signed out) and each `<key>.u.<memberId>` variant. Matched as the
 * key itself or the key plus ".", so `qp.drafts.v1` never matches
 * `qp.messages.drafts.v1`. Owners: `DraftsProvider`, `SavedProvider`,
 * `VouchProvider`.
 */
const MEMBER_BUCKET_STORAGE_KEYS = [
  "qp.drafts.v1",
  "qp.saved.v1",
  "qp.vouches.v1",
] as const;

/** Key prefixes for per-draft stores: the forum composer's field snapshots
 *  (`forumDraftSnapshot`), one key per draft and member scope. */
const MEMBER_STORAGE_KEY_PREFIXES = [
  "qp.forum.draft.fields.",
  ...MEMBER_BUCKET_STORAGE_KEYS.map((key) => `${key}.`),
] as const;

/** The DM composer drafts and offline outbox, every scope included: the bare
 *  key (demo and signed out) and each `.u.<memberId>` variant. */
const MESSAGING_STORAGE_KEY_PREFIXES = [
  "qp.messages.drafts.v1",
  "qp.messages.outbox.v1",
] as const;

/** The last member whose session this device confirmed (live only), so the
 *  next confirmed member can tell whether someone else used it before. */
const LAST_SIGNED_IN_MEMBER_KEY = "qp.auth.last-member";

/**
 * Runs every named step on its own, in order, so one that throws (blocked
 * storage, a broken module) never stops the steps after it. A failure logs
 * the step's name and nothing that was stored. Shared by sign-out and Quick
 * Exit.
 */
export function runEach(steps: Readonly<Record<string, () => void>>): void {
  for (const [step, run] of Object.entries(steps)) {
    try {
      run();
    } catch {
      logWarn("member wipe step failed", { step });
    }
  }
}

function removeKeysWithPrefixes(prefixes: ReadonlyArray<string>): void {
  for (const key of safeStorage.keys()) {
    if (prefixes.some((prefix) => key.startsWith(prefix))) {
      safeStorage.remove(key);
    }
  }
}

/**
 * The fixed-key stores that hold one member's typed text: the unpublished
 * magazine story (byline, headline, body), the recent global searches and
 * the invoice tools' issuer details (name, NIF, address, email, IBAN). Also
 * wiped on an involuntary loss of session (a 401, a failed refresh, a remote
 * sign-out), since a key with no member in it would otherwise greet whoever
 * signs in next.
 */
export function wipeFixedKeyMemberStores(): void {
  runEach({ clearStoredStoryDraft, clearRecents, clearStoredIssuer });
}

/**
 * Every per-member trace this browser keeps outside the session itself, wiped
 * so the next person on a shared device starts clean. Sign-out and Quick Exit
 * both call this one function, so the two wipes always cover the same list:
 * a new per-member store is added here and both pick it up. Each step runs on
 * its own (`runEach`), so this never throws.
 *
 * `scopeId` is the leaving member's messaging scope ("demo" in demo mode, the
 * member id live, null when nobody was signed in); the DM outbox and composer
 * drafts are keyed by it.
 *
 * Only an explicit sign-out (or Quick Exit, or a different member's session
 * confirmed on this device) runs this: a session that expires keeps its
 * scoped drafts for the member's return (ruling F4).
 */
export function wipeMemberLocalData(scopeId: string | null): void {
  runEach({
    // Every unpublished event draft and every unpublished month of events.
    clearStoredGatheringDrafts,
    clearStoredAddMonthDrafts,
    // Creator drafts live on the server. Their only client copies are the
    // react-query cache, the demo store and the old browser keys.
    removeCreatorDraftQueries: () =>
      queryClient.removeQueries({ queryKey: [CREATOR_DRAFT_QUERY_ROOT] }),
    clearCreatorDraftDemoStore,
    clearLegacyCreatorDraftCopies,
    // An unsaved Go together questionnaire: its answers are sensitive.
    clearQuestionnaireDrafts,
    // The Studio player's saved queue, its episode memory (played episodes,
    // saved places and speed, spec 5.7), the warned tracks this tab agreed
    // to hear (spec 6.3) and the lyrics and show notes it uncovered (6.2).
    clearStudioQueueSnapshots,
    clearStudioEpisodeMemory,
    clearStudioWarningConsent,
    clearStudioTrackReveals,
    // Every unsent DM: the offline outbox and each composer draft, for the
    // leaving member's own scope (ENG-404). Runs here so the wipe happens
    // whether or not the Messages page is mounted to see the scope change.
    clearOutbox: () => clearOutboxForScope(scopeId),
    clearMessageDrafts: () => clearDraftsForScope(scopeId),
    // The story draft, recent searches and issuer details.
    wipeFixedKeyMemberStores,
    // The other fixed-key stores, the per-member buckets (drafts, saved,
    // vouches) and the per-draft forum snapshots.
    removeFixedMemberKeys: () =>
      [...FIXED_MEMBER_STORAGE_KEYS, ...MEMBER_BUCKET_STORAGE_KEYS].forEach(
        (key) => safeStorage.remove(key),
      ),
    removeMemberKeyPrefixes: () =>
      removeKeysWithPrefixes(MEMBER_STORAGE_KEY_PREFIXES),
    // And the record of who last signed in here: nothing of theirs is left.
    forgetLastSignedInMember: () =>
      safeStorage.remove(LAST_SIGNED_IN_MEMBER_KEY),
  });
}

/**
 * Quick Exit only: the DM composer drafts and offline outbox of EVERY scope on
 * this device, on top of the leaving member's own (a session still checking
 * has no member id to scope by).
 */
export function wipeEveryScopeMessagingDrafts(): void {
  runEach({
    removeMessagingKeyPrefixes: () =>
      removeKeysWithPrefixes(MESSAGING_STORAGE_KEY_PREFIXES),
  });
}

/**
 * The live session's cached reads, dropped once the session is cleared: the
 * messaging cache persisted for offline reading (PRD-375) goes first, so the
 * clear below cannot race a queued write and every other open tab of this
 * app drops its copy too; then every authenticated query (conversations,
 * messages, profile, blocks, the Infinity-staleTime bootstrap), so a shared
 * device cannot render the previous member's data from cache.
 *
 * Treat this as the backstop. The primary guarantee for cross-member
 * isolation lives in the keys themselves: `sessionBootstrapQueryKey` (see
 * `src/shared/api/useSessionBootstrap.ts`) carries the member id, so the next
 * member reads a different cache entry whether or not this ever runs.
 */
export function wipeMemberSessionCaches(): void {
  runEach({
    purgeMessagingCache: () => void purgeMessagingCache(),
    clearQueryCache: () => queryClient.clear(),
  });
}

/**
 * Called with each live session the device confirms, before any member UI
 * renders. When a different member was the last one confirmed here (they
 * never signed out: the session expired, or was ended from another device),
 * their local traces go first. Then this member is remembered.
 */
export function adoptConfirmedMember(memberId: string): void {
  const previousMemberId = safeStorage.get(LAST_SIGNED_IN_MEMBER_KEY);
  if (previousMemberId && previousMemberId !== memberId) {
    wipeMemberLocalData(previousMemberId);
  }
  safeStorage.set(LAST_SIGNED_IN_MEMBER_KEY, memberId);
}

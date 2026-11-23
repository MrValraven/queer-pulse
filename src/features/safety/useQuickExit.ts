import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import {
  runEach,
  wipeEveryScopeMessagingDrafts,
  wipeMemberLocalData,
  wipeMemberSessionCaches,
} from "../../app/providers/wipeMemberLocalData";
import { setSessionState } from "../../shared/api/client";
import { markQuickExitPending } from "../../shared/api/queryPersistence/messagingCachePersistence";
import { markQuickExiting } from "../../shared/hooks/useUnsavedChangesGuard";
import { safeStorage } from "../../shared/storage/safeStorage";
import { postLogout } from "../auth/api/auth.api";
import { AUTH_STORAGE_KEY } from "../marketing/cookies.data";
import { logoutAndDetachPush } from "../push/detachPushOnSignOut";
import { readThisDevicePushEndpoint } from "../push/push.api";
import { endStoryDraftSaving } from "../magazine/useStoryDraft";
import { endStudioEpisodeSaving } from "../studio/player/studioEpisodeMemory";
import { endStudioQueueSaving } from "../studio/player/studioQueueStorage";

const SAFE_DESTINATION = "https://www.google.com";

/**
 * How many inert sentinel history entries to stack before the hard redirect.
 * location.replace only overwrites the *current* entry, so earlier QueerPulse
 * pages would still sit one Back press away; burying them under sentinels means
 * Back from the neutral site lands on inert entries and never steps back into
 * the app.
 */
const HISTORY_BURY_DEPTH = 30;

/** How long after the redirect a page that is still here counts as stuck
 *  (a slow network, a blocked navigation). Long enough that a slow but
 *  working redirect to the neutral site lands first: a fallback that fires
 *  while the replace is still pending would navigate home over it. */
const STILL_HERE_AFTER_MS = 4_000;

/** Who is at the device when Quick Exit is pressed. */
interface QuickExitSession {
  demoMode: boolean;
  isSignedIn: boolean;
  memberId: string | null;
}

/**
 * Signs the member out without waiting on anything. Live, the logout request
 * goes out whatever this tab believes about the session (a session still
 * being checked is signed out too; the backend answers a repeat logout
 * without harm). It carries this device's push endpoint when the
 * subscription sync has seen it, so the backend drops the push row in the
 * same request; it is keepalive, so it outlives the page, and bounded by the
 * API client's request deadline. Then the client session is cleared and the
 * browser-side push detach (unsubscribe, shown notifications, badge) runs
 * best effort. Demo flips the stored mock session flag. Neither touches React
 * state, so no route gate re-renders while the page is leaving.
 */
function signOutNow({ demoMode, isSignedIn }: QuickExitSession): void {
  if (demoMode) {
    if (isSignedIn) safeStorage.set(AUTH_STORAGE_KEY, "false");
    return;
  }
  const logoutRequest = postLogout(readThisDevicePushEndpoint() ?? undefined);
  setSessionState("none");
  void logoutAndDetachPush(() => logoutRequest);
}

/**
 * Signs out first, then forgets every per-member trace this browser keeps:
 * the same wipe sign-out runs, the DM drafts and outbox of every scope, and
 * live, the session caches (the IndexedDB messaging cache and every cached
 * query) plus a marker so the next launch purges that cache before reading
 * it, in case this page goes before the delete commits. The Studio trackers
 * and the story draft autosave stop first, so the pagehide the leave fires
 * cannot write them back. Every step runs on its own.
 */
function forgetThisVisit(session: QuickExitSession): void {
  runEach({
    signOutNow: () => signOutNow(session),
    endStudioQueueSaving,
    endStudioEpisodeSaving,
    endStoryDraftSaving,
    wipeMemberLocalData: () =>
      wipeMemberLocalData(session.demoMode ? "demo" : session.memberId),
    wipeEveryScopeMessagingDrafts,
  });
  if (session.demoMode) return;
  runEach({ markQuickExitPending, wipeMemberSessionCaches });
}

/**
 * History scrub, then the redirect. replace() alone only neutralises the
 * current page, leaving earlier QueerPulse pages reachable with Back, so
 * sentinel entries bury that trail first. pushState here is same-document
 * (hash only), so it adds no page loads and stays instant; it fires no
 * popstate/hashchange, so the router never reacts before the page leaves.
 */
function buryHistoryAndLeave(): void {
  try {
    for (let index = 0; index < HISTORY_BURY_DEPTH; index += 1) {
      window.history.pushState(null, "", "#");
    }
  } catch {
    // History API unavailable: fall through to the hard redirect below.
  }
  // No leave guard may hold the exit: unsaved-edit prompts stand down.
  markQuickExiting();
  window.location.replace(SAFE_DESTINATION);
}

/** Stops the armed still-here watch, when one is armed. */
let stopStillHereWatch: (() => void) | null = null;

/**
 * Arms the fallback for a page that is still here: four seconds after the
 * redirect (a slow or blocked navigation), or when Back restores it from the
 * back/forward cache. Runs `onStillHere` once. Nothing here delays the exit.
 */
function watchForStillHere(onStillHere: () => void): void {
  stopStillHereWatch?.();
  function stopWatching() {
    window.clearTimeout(stillHereTimer);
    window.removeEventListener("pageshow", handlePageShow);
    stopStillHereWatch = null;
  }
  function runOnce() {
    stopWatching();
    onStillHere();
  }
  function handlePageShow(event: PageTransitionEvent) {
    if (event.persisted) runOnce();
  }
  const stillHereTimer = window.setTimeout(runOnce, STILL_HERE_AFTER_MS);
  window.addEventListener("pageshow", handlePageShow);
  stopStillHereWatch = stopWatching;
}

/** Tests only: a test that stubs the redirect stops the watch it armed, so
 *  its fallback never fires inside a later test. */
export function stopQuickExitStillHereWatchForTests(): void {
  stopStillHereWatch?.();
}

/**
 * Quick Exit: sign out, wipe this device, bury the history and land on a
 * neutral site, at once. A failing wipe step never holds the exit. If the
 * page is somehow still here afterwards, `onStillHere` signs the tab out
 * locally and takes it home.
 */
export function leaveNow(
  session: QuickExitSession,
  onStillHere: () => void,
): void {
  forgetThisVisit(session);
  buryHistoryAndLeave();
  runEach({ watchForStillHere: () => watchForStillHere(onStillHere) });
}

/** The Quick Exit action for whoever is at the device right now. */
export function useQuickExit(): () => void {
  const { demoMode } = useDemoMode();
  const { loggedIn, user, signOut } = useAuth();
  const navigate = useNavigate();
  const memberId = user?.id ?? null;
  return useCallback(() => {
    leaveNow({ demoMode, isSignedIn: loggedIn, memberId }, () => {
      // The tab's own sign-out: clears the user and the session in React
      // state (repeating the wipe and the logout harmlessly), then home.
      signOut();
      void navigate("/", { replace: true });
    });
  }, [demoMode, loggedIn, memberId, signOut, navigate]);
}

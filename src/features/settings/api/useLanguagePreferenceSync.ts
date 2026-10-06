import { useEffect, useRef, useState } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { isLanguage } from "../../../shared/i18n/locale";
import type { Language } from "../../../shared/i18n/types";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { logWarn } from "../../../shared/observability/logger";
import {
  getLanguagePreference,
  putLanguagePreference,
} from "./languagePreference.api";

/**
 * Keeps the interface language in step with the member's server copy
 * (PRD-325), so it follows them to a new device and back after site data is
 * cleared.
 *
 * Once per signed-in session (app load with a session, or a fresh sign-in) it
 * reads `GET /me/language`. When the read succeeds:
 * - the member has switched language since the read started (even away and
 *   back again): their choice wins and is written up.
 * - otherwise, the server holds a language: adopt it. `setLanguage` goes
 *   through `I18nProvider`, whose effect writes localStorage and the
 *   IndexedDB mirror the service worker reads for push copy.
 * - otherwise (the server holds `null`): write this device's language up.
 *
 * Once the read has settled, every switch the member makes is written through
 * with `PUT /me/language`. It watches the language itself, so every switcher
 * (Settings, the account menu, the mega-nav footer, `LanguageSwitcher`) is
 * covered from this one place. Writes run one at a time and the latest one
 * wins: a queued write that a later one has replaced is skipped, and only the
 * success of the latest write updates what the server is known to hold. A
 * failed write is logged and the member keeps the language they picked.
 *
 * When the read FAILS (a flaky boot connection), nothing is written unless the
 * member switches, because the server may hold a choice made elsewhere. The
 * read is retried when the browser reports it is back online, under the same
 * rules.
 *
 * All bookkeeping lives on one per-session object that is replaced whenever
 * the signed-in member changes (sign-out, sign-in, or one member to another),
 * and every pending read or write checks it still belongs to the live session
 * before touching anything. Demo mode makes no server calls at all.
 */
export function useLanguagePreferenceSync(): void {
  const { demoMode } = useDemoMode();
  const { loggedIn, checking, user } = useAuth();
  const { language, setLanguage } = useTranslation();

  const sessionUserId =
    !demoMode && !checking && loggedIn ? (user?.id ?? null) : null;

  const languageRef = useRef(language);
  const sessionRef = useRef<SyncSession>(newSyncSession(null));
  // Bumped by the `online` listener to re-run a failed read.
  const [readAttempt, setReadAttempt] = useState(0);

  // Declared first: a new member starts from a clean slate before anything
  // below reads the session.
  useEffect(() => {
    if (sessionRef.current.userId !== sessionUserId) {
      sessionRef.current = newSyncSession(sessionUserId);
    }
  }, [sessionUserId]);

  // Notices the member's switches and writes them through once the read has
  // settled. A change this hook made itself (adopting the server value) is
  // neither a switch nor written back.
  useEffect(() => {
    const previousLanguage = languageRef.current;
    languageRef.current = language;
    if (previousLanguage === language) return;
    const session = sessionRef.current;
    if (session.adoptedLanguage === language) {
      session.adoptedLanguage = null;
      return;
    }
    session.hasSwitchedSinceReadStart = true;
    if (session.userId !== null && session.readState !== "pending") {
      requestWrite(sessionRef, session, language, false);
    }
  }, [language]);

  useEffect(() => {
    const session = sessionRef.current;
    if (session.userId === null || session.readState === "succeeded") return;

    let isCancelled = false;
    const isLive = () => !isCancelled && sessionRef.current === session;
    void getLanguagePreference()
      .then(({ language: serverLanguage }) => {
        if (!isLive()) return;
        session.readState = "succeeded";
        const storedLanguage = isLanguage(serverLanguage)
          ? serverLanguage
          : null;
        session.confirmedServerLanguage = storedLanguage;
        const localLanguage = languageRef.current;
        if (session.hasSwitchedSinceReadStart || storedLanguage === null) {
          requestWrite(sessionRef, session, localLanguage, true);
          return;
        }
        if (storedLanguage !== localLanguage) {
          session.adoptedLanguage = storedLanguage;
          setLanguage(storedLanguage);
        }
      })
      .catch((error: unknown) => {
        if (!isLive()) return;
        logWarn("Could not read the stored interface language", { error });
        session.readState = "failed";
        // A switch made while this read was in flight was never written.
        if (session.hasSwitchedSinceReadStart) {
          requestWrite(sessionRef, session, languageRef.current, true);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [sessionUserId, setLanguage, readAttempt]);

  useEffect(() => {
    if (sessionUserId === null) return;
    const retryFailedRead = () => {
      if (sessionRef.current.readState === "failed") {
        setReadAttempt((attempt) => attempt + 1);
      }
    };
    window.addEventListener("online", retryFailedRead);
    return () => window.removeEventListener("online", retryFailedRead);
  }, [sessionUserId]);
}

/** Everything the sync knows about one signed-in member's session. */
interface SyncSession {
  userId: string | null;
  readState: "pending" | "succeeded" | "failed";
  /** Any switch since the first read started, including after a failure. */
  hasSwitchedSinceReadStart: boolean;
  /** The value set by `setLanguage` when adopting, so it is not a switch. */
  adoptedLanguage: Language | null;
  /**
   * What the server is known to hold: set when a read succeeds or the latest
   * write succeeds, and cleared while the latest write is in flight. `null`
   * when unknown or unset.
   */
  confirmedServerLanguage: Language | null;
  /** The value of the latest queued write while it is unsettled. */
  latestQueuedLanguage: Language | null;
  writeSequence: number;
  writeQueue: Promise<void>;
}

function newSyncSession(userId: string | null): SyncSession {
  return {
    userId,
    readState: "pending",
    hasSwitchedSinceReadStart: false,
    adoptedLanguage: null,
    confirmedServerLanguage: null,
    latestQueuedLanguage: null,
    writeSequence: 0,
    writeQueue: Promise.resolve(),
  };
}

/**
 * Queue `PUT /me/language` for `next`, latest write wins.
 *
 * Skipped when nothing is pending and the server is known to hold `next`
 * already, or (unless `shouldForce`) when the latest queued write is already
 * `next`. A read that settles forces the write, because a write still in
 * flight from before the read may yet fail.
 *
 * When its turn comes, a write whose session has ended or which a later write
 * has replaced is skipped. The latest write clears `confirmedServerLanguage`
 * when it starts and sets it on success; a failure is logged and changes
 * nothing the member sees. The queue never rejects.
 */
function requestWrite(
  sessionRef: { current: SyncSession },
  session: SyncSession,
  next: Language,
  shouldForce: boolean,
): void {
  const hasPendingWrite = session.latestQueuedLanguage !== null;
  if (!hasPendingWrite && session.confirmedServerLanguage === next) return;
  if (!shouldForce && session.latestQueuedLanguage === next) return;

  session.writeSequence += 1;
  const sequence = session.writeSequence;
  session.latestQueuedLanguage = next;
  const isLive = () => sessionRef.current === session;
  const isLatest = () => session.writeSequence === sequence;

  session.writeQueue = session.writeQueue.then(async () => {
    if (!isLive() || !isLatest()) return;
    // Unknown until this write settles: a failure (a client timeout the
    // server still stored) must leave a later switch back free to write.
    session.confirmedServerLanguage = null;
    try {
      await putLanguagePreference(next);
      if (isLive() && isLatest()) {
        session.confirmedServerLanguage = next;
        session.latestQueuedLanguage = null;
      }
    } catch (error) {
      if (!isLive()) return;
      if (isLatest()) session.latestQueuedLanguage = null;
      logWarn("Could not save the interface language", { error });
    }
  });
}

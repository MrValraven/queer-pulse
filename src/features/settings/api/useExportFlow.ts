import { useCallback, useEffect, useRef, useState } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { TFunction } from "../../../shared/i18n/types";
import { logError } from "../../../shared/observability/logger";
import { currentUser, currentUserEmail } from "../../members/data/members";
import {
  getExportJob,
  requestExport,
  type ExportJob,
  type ExportFormat,
} from "./account.api";
import { useReauth } from "./useAccountMutations";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Build a small, genuinely machine-readable JSON archive of the mock user in
 * DEMO mode, so the "Download" actually yields a file (no backend). Live mode
 * gets a real signed `.zip` from the worker instead.
 */
function buildDemoArchive(
  categories: string[],
  format: ExportFormat,
  t: TFunction,
): string {
  const now = new Date().toISOString();
  const archive: Record<string, unknown> = {
    manifest: {
      exportedAt: now,
      schemaVersion: "1.0",
      format,
      categories,
      note: t("settings:dataExport.demoArchiveNote"),
    },
    profile: categories.includes("profile")
      ? {
          name: `${currentUser.first} ${currentUser.last}`,
          pronouns: currentUser.pronouns,
          email: currentUserEmail,
        }
      : undefined,
    messages: categories.includes("messages") ? [] : undefined,
    posts: categories.includes("forumPosts") ? [] : undefined,
    events: categories.includes("events") ? [] : undefined,
    connections: categories.includes("connections") ? [] : undefined,
    activity: categories.includes("activityLog") ? [] : undefined,
  };
  const blob = new Blob([JSON.stringify(archive, null, 2)], {
    type: "application/json",
  });
  return URL.createObjectURL(blob);
}

type StartArgs = {
  categories: string[];
  format: ExportFormat;
  /**
   * A step-up token to use INSTEAD of the cached one, for the resume that runs
   * on the reauth landing (PRD-305). `useReauthCompletion` writes the cache in
   * an effect at the app root, and a page's own effects run before its
   * parents', so the resume would otherwise read an empty cache and redirect
   * the member into a second OAuth round trip. It passes the token it read
   * straight off the landing fragment.
   */
  reauthToken?: string;
};

/**
 * Drives the async data-export job: `queued → processing → ready | failed |
 * expired`. Live mode POSTs then polls `GET /account/export/:jobId`; demo mode
 * simulates the progression and produces a real downloadable blob so the UX is
 * honest offline. `null` job === not yet requested.
 */
export function useExportFlow() {
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();
  const { getReauthToken, beginReauth } = useReauth();
  const [job, setJob] = useState<ExportJob | null>(null);
  // True from the click until the POST resolves, so the form can disable itself
  // instead of letting a second click enqueue a second full dump of the account.
  const [isStarting, setIsStarting] = useState(false);
  const pollRef = useRef<number | null>(null);
  const blobRef = useRef<string | null>(null);
  // Mirrors `isStarting` for the re-entry guard: state is a render behind, and
  // two clicks in the same tick would both get through.
  const isStartingRef = useRef(false);
  // Demo-mode progression timers, kept so they can be cancelled: they used to
  // fire into an unmounted hook.
  const demoTimersRef = useRef<number[]>([]);

  const stopPoll = useCallback(() => {
    if (pollRef.current !== null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
    for (const timerId of demoTimersRef.current) window.clearTimeout(timerId);
    demoTimersRef.current = [];
  }, []);

  // Clean up any polling timer + object URL when the flow unmounts.
  useEffect(
    () => () => {
      stopPoll();
      if (blobRef.current) URL.revokeObjectURL(blobRef.current);
    },
    [stopPoll],
  );

  const start = useCallback(
    async ({ categories, format, reauthToken: presented }: StartArgs) => {
      if (isStartingRef.current) return;
      stopPoll();
      if (demoMode) {
        setJob({
          jobId: "demo-export",
          status: "queued",
          requestedAt: new Date().toISOString(),
        });
        demoTimersRef.current.push(
          window.setTimeout(
            () => setJob((j) => (j ? { ...j, status: "processing" } : j)),
            800,
          ),
        );
        demoTimersRef.current.push(
          window.setTimeout(() => {
            if (blobRef.current) URL.revokeObjectURL(blobRef.current);
            const url = buildDemoArchive(categories, format, t);
            blobRef.current = url;
            setJob({
              jobId: "demo-export",
              status: "ready",
              requestedAt: new Date().toISOString(),
              downloadUrl: url,
              sizeBytes: 2048,
              expiresAt: new Date(Date.now() + 7 * DAY_MS).toISOString(),
            });
          }, 2200),
        );
        return;
      }

      // Step-up auth. An export is a full dump of everything we hold on a
      // person, so it sits behind the same real OAuth step-up the deletion and
      // deactivation flows use — a stolen session cookie alone shouldn't be
      // enough to exfiltrate someone's entire account. Resolved here rather
      // than by the caller so the demo branch above never touches the network
      // and no page has to know the flow needs a token at all.
      //
      // No fresh token: redirect instead of proceeding, with no job state
      // change. The member's chosen categories and format ride out in the
      // page's query string and come back intact (see `beginReauth`), and
      // DataExportPage resumes this call for them on the landing, so the
      // second run exports exactly the set they picked (PRD-305). Before that,
      // both choices lived in component state, the round trip reset them to
      // the defaults, and the 3-per-hour throttle capped how many times a
      // member could correct it.
      const reauthToken = presented ?? getReauthToken();
      if (!reauthToken) {
        beginReauth();
        return;
      }

      isStartingRef.current = true;
      setIsStarting(true);
      try {
        const created = await requestExport({
          categories,
          format,
          reauthToken,
        });
        setJob(created);
        if (created.status === "queued" || created.status === "processing") {
          pollRef.current = window.setInterval(() => {
            void (async () => {
              try {
                const next = await getExportJob(created.jobId);
                setJob(next);
                if (next.status !== "queued" && next.status !== "processing") {
                  stopPoll();
                }
              } catch (err) {
                logError(err, { where: "useExportFlow.poll" });
                stopPoll();
                setJob((j) =>
                  j ? { ...j, status: "failed", error: "Lost contact" } : j,
                );
              }
            })();
          }, 3000);
        }
      } catch (err) {
        logError(err, { where: "useExportFlow.start" });
        setJob({
          jobId: "error",
          status: "failed",
          requestedAt: new Date().toISOString(),
          error: err instanceof Error ? err.message : "Request failed",
        });
      } finally {
        isStartingRef.current = false;
        setIsStarting(false);
      }
    },
    [demoMode, stopPoll, t, getReauthToken, beginReauth],
  );

  const reset = useCallback(() => {
    stopPoll();
    setJob(null);
  }, [stopPoll]);

  return { job, start, reset, isStarting };
}

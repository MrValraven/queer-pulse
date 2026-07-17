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
  const [job, setJob] = useState<ExportJob | null>(null);
  const pollRef = useRef<number | null>(null);
  const blobRef = useRef<string | null>(null);

  const stopPoll = useCallback(() => {
    if (pollRef.current !== null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
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
    async ({ categories, format, reauthToken }: StartArgs) => {
      stopPoll();
      if (demoMode) {
        setJob({
          jobId: "demo-export",
          status: "queued",
          requestedAt: new Date().toISOString(),
        });
        window.setTimeout(
          () => setJob((j) => (j ? { ...j, status: "processing" } : j)),
          800,
        );
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
        }, 2200);
        return;
      }

      try {
        const created = await requestExport({
          categories,
          format,
          reauthToken,
        });
        setJob(created);
        if (created.status === "queued" || created.status === "processing") {
          pollRef.current = window.setInterval(async () => {
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
      }
    },
    [demoMode, stopPoll, t],
  );

  const reset = useCallback(() => {
    stopPoll();
    setJob(null);
  }, [stopPoll]);

  return { job, start, reset };
}

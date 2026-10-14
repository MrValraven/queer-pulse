import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { StudioTrackRowView } from "../api/studio.adapters";
import { studioKeys } from "../api/studioQueryKeys";
import { useUpdateStudioTrack } from "../api/useStudioTrackMutations";
import {
  useStudioTrackUploads,
  type AcceptedUpload,
  type StudioTrackUploads,
} from "../useStudioTrackUploads";
import type { StudioAudioAnalysis } from "./analysis/studioAnalysisAccumulator";
import {
  analyseUploadFile,
  createAnalysisRunner,
  estimatedDurationSeconds,
  type AnalysisRunner,
} from "./studioAnalysisRunner";

/** "queued" waits behind another file and shows nothing; "measuring" is
 *  set only when this file's run begins. */
export type StudioAnalysisStatus =
  "queued" | "measuring" | "measured" | "skipped" | "failed";

const isPendingStatus = (status: StudioAnalysisStatus) =>
  status === "queued" || status === "measuring";

interface AnalysisEntry {
  status: StudioAnalysisStatus;
  analysis: StudioAudioAnalysis | null;
  file: File;
  isSaved: boolean;
}

export interface StudioUploadAnalysis {
  statusOf: (localId: string) => StudioAnalysisStatus | null;
  analysisOf: (localId: string) => StudioAudioAnalysis | null;
  /** The picked file, for the lyric timing tool's tap-along. */
  fileOf: (localId: string) => File | null;
  /** Tracks measured this session, which the backfill leaves alone. */
  measuredTrackIds: ReadonlySet<string>;
  /** A file is queued or being measured: the backfill waits, so a phone
   *  never decodes two files at once. */
  hasPendingAnalysis: boolean;
}

type Entries = Readonly<Record<string, AnalysisEntry>>;

const withoutIds = (entries: Entries, ids: readonly string[]): Entries =>
  Object.fromEntries(
    Object.entries(entries).filter(([localId]) => !ids.includes(localId)),
  );

/** The upload list plus spec 8.1's measurement of every picked file. */
export function useStudioUploadAnalysis(
  releaseId: string | null,
  subprofileId: string,
  initialTracks: StudioTrackRowView[],
  audioMaxBytes?: number,
): { uploads: StudioTrackUploads; analysis: StudioUploadAnalysis } {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { mutateAsync: updateTrack } = useUpdateStudioTrack();
  const [entries, setEntries] = useState<Entries>({});
  const runnerRef = useRef<AnalysisRunner | null>(null);
  const savingRef = useRef(new Set<string>());
  const readyRef = useRef(new Set<string>());
  /** Rows handed to the runner, so a removed one can be cancelled. */
  const queuedIdsRef = useRef(new Set<string>());

  useEffect(() => {
    const runner = createAnalysisRunner();
    runnerRef.current = runner;
    return () => runner.dispose();
  }, []);

  const patchEntry = useCallback(
    (localId: string, patch: Partial<AnalysisEntry>) => {
      setEntries((previous) => {
        const entry = previous[localId];
        return entry
          ? { ...previous, [localId]: { ...entry, ...patch } }
          : previous;
      });
    },
    [],
  );

  const registerFiles = useCallback(
    (accepted: AcceptedUpload[]) => {
      setEntries((previous) => ({
        ...previous,
        ...Object.fromEntries(
          accepted.map((item): [string, AnalysisEntry] => [
            item.localId,
            {
              status: "queued",
              analysis: null,
              file: item.file,
              isSaved: false,
            },
          ]),
        ),
      }));
      for (const item of accepted) {
        queuedIdsRef.current.add(item.localId);
        runnerRef.current?.enqueue(
          {
            localId: item.localId,
            durationSeconds: estimatedDurationSeconds(item.file.size),
            run: (signal) =>
              analyseUploadFile(item.file, item.contentType, signal),
            onStart: () => patchEntry(item.localId, { status: "measuring" }),
          },
          (outcome) =>
            patchEntry(
              item.localId,
              outcome.status === "measured"
                ? { status: "measured", analysis: outcome.analysis }
                : { status: outcome.status },
            ),
        );
      }
    },
    [patchEntry],
  );

  const uploads = useStudioTrackUploads(
    releaseId,
    subprofileId,
    initialTracks,
    { onFilesAccepted: registerFiles, audioMaxBytes },
  );

  // A removed row forgets its numbers. Adjusted while rendering, so a gone
  // row's entry never reaches the screen or the PATCH below.
  const liveIds = new Set(uploads.rows.map((row) => row.localId));
  const goneIds = Object.keys(entries).filter(
    (localId) => !liveIds.has(localId),
  );
  if (goneIds.length > 0)
    setEntries((previous) => withoutIds(previous, goneIds));

  // ...and stops measuring: its queued or running analysis is dropped.
  useEffect(() => {
    const liveRowIds = new Set(uploads.rows.map((row) => row.localId));
    for (const localId of queuedIdsRef.current) {
      if (liveRowIds.has(localId)) continue;
      runnerRef.current?.cancel(localId);
      queuedIdsRef.current.delete(localId);
    }
  }, [uploads.rows]);

  // After a confirm the backend clears stored measurements: refetch (live).
  useEffect(() => {
    if (!releaseId || demoMode) return;
    const newlyReady = uploads.rows.filter(
      (row) =>
        row.stage === "ready" &&
        row.fileName !== null &&
        !readyRef.current.has(row.localId),
    );
    if (newlyReady.length === 0) return;
    newlyReady.forEach((row) => readyRef.current.add(row.localId));
    void queryClient.invalidateQueries({
      queryKey: studioKeys.release(false, releaseId),
    });
  }, [uploads.rows, releaseId, demoMode, queryClient]);

  // The PATCH waits for this row's own confirm, and sends all three fields.
  useEffect(() => {
    if (!releaseId) return;
    for (const row of uploads.rows) {
      const entry = entries[row.localId];
      const trackId = row.trackId;
      if (!entry?.analysis || entry.status !== "measured" || entry.isSaved)
        continue;
      if (
        row.stage !== "ready" ||
        !trackId ||
        savingRef.current.has(row.localId)
      )
        continue;
      const localId = row.localId;
      const { waveformPeaks, loudnessLufs, peakDb } = entry.analysis;
      savingRef.current.add(localId);
      void updateTrack({
        trackId,
        releaseId,
        body: { waveformPeaks, loudnessLufs, peakDb },
      })
        .then(() => {
          patchEntry(localId, { isSaved: true });
          if (!demoMode)
            void queryClient.invalidateQueries({
              queryKey: studioKeys.release(false, releaseId),
            });
        })
        .catch(() => patchEntry(localId, { status: "failed", isSaved: true }))
        .finally(() => savingRef.current.delete(localId));
    }
  }, [
    uploads.rows,
    entries,
    releaseId,
    demoMode,
    queryClient,
    updateTrack,
    patchEntry,
  ]);

  const analysis = useMemo<StudioUploadAnalysis>(
    () => ({
      statusOf: (localId) => entries[localId]?.status ?? null,
      analysisOf: (localId) => entries[localId]?.analysis ?? null,
      fileOf: (localId) => entries[localId]?.file ?? null,
      measuredTrackIds: new Set(
        uploads.rows.flatMap((row) =>
          row.trackId && entries[row.localId] ? [row.trackId] : [],
        ),
      ),
      hasPendingAnalysis: Object.values(entries).some((entry) =>
        isPendingStatus(entry.status),
      ),
    }),
    [entries, uploads.rows],
  );
  return { uploads, analysis };
}

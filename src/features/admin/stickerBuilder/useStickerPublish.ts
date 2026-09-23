import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../../shared/api/client";
import type { AdminStickerPackResponse } from "../../../shared/contracts/contracts";
import { useUploadImage } from "../../members/api/useUploadImage";
import { renderStickerBlob } from "../../stickers/render/renderStickerBlob";
import { primitivesToSvg } from "../../stickers/render/primitivesToSvg";
import { unoReverseGeometry } from "../../stickers/templates/unoReverse.geometry";
import {
  STICKER_CANVAS_SIZE,
  type UnoReverseParams,
} from "../../stickers/templates/unoReverse.params";
import {
  ADMIN_STICKER_PACKS_KEY,
  useAddSticker,
  useUpdateSticker,
} from "../../stickers/api/useAdminStickerPacks";
import type {
  FlagPlanEntry,
  FlagRunState,
  PublishFailureReason,
  PublishMode,
  StickerPublishRun,
  StickerPublishSummary,
} from "./stickerBuilder.types";
import {
  buildFlagPlan,
  stickerKeywordsForFlag,
  stickerSlugForFlag,
} from "./stickerFlags";

const UNO_REVERSE_TEMPLATE_ID = "uno-reverse";

interface StartRunArgs {
  pack: AdminStickerPackResponse;
  plan: FlagPlanEntry[];
  mode: PublishMode;
  params: UnoReverseParams;
  labelsByFlagId: Record<string, string>;
}

/** A failed flag a retry found already in the pack, carried into the new run
 *  as done. */
interface LandedFlag {
  flagId: string;
  action: StickerPublishRun["actionByFlag"][string];
}

/** Counts a run's outcomes for the progress bar and the result line. */
export function summarizeRun(
  run: StickerPublishRun | null,
): StickerPublishSummary {
  const summary: StickerPublishSummary = {
    totalCount: 0,
    doneCount: 0,
    failedCount: 0,
    cancelledCount: 0,
    addedCount: 0,
    replacedCount: 0,
  };
  if (!run) return summary;
  summary.totalCount = run.flagIds.length;
  for (const flagId of run.flagIds) {
    const status = run.stateByFlag[flagId]?.status;
    if (status === "done") {
      summary.doneCount += 1;
      if (run.actionByFlag[flagId] === "replace") summary.replacedCount += 1;
      else summary.addedCount += 1;
    } else if (status === "failed") {
      summary.failedCount += 1;
    } else if (status === "cancelled") {
      summary.cancelledCount += 1;
    }
  }
  return summary;
}

/** How many `cause` links to follow before giving up, so a cyclic chain
 *  cannot loop forever. */
const MAX_CAUSE_DEPTH = 8;

/** The HTTP status of the first `ApiError` in the error's `cause` chain. The
 *  upload hook wraps a presign failure in an `ImageProcessingError` whose
 *  `cause` is the original `ApiError`, so a presign 429 is found here. */
function apiStatusInChain(error: unknown): number | null {
  let current: unknown = error;
  for (let depth = 0; depth < MAX_CAUSE_DEPTH; depth += 1) {
    if (current instanceof ApiError) return current.status;
    if (!(current instanceof Error)) return null;
    current = current.cause;
  }
  return null;
}

/** A status the backend answered with wins over the step that threw it: a
 *  409 means the slug or sticker clashed, a 429 means the rate limit bit. */
function failureReasonOf(
  error: unknown,
  isArtworkStep: boolean,
): PublishFailureReason {
  const apiStatus = apiStatusInChain(error);
  if (apiStatus === 409) return "conflict";
  if (apiStatus === 429) return "rate-limit";
  return isArtworkStep ? "upload" : "unknown";
}

/**
 * The failed flags of a finished run, re-planned against the pack as it
 * stands now. A flag whose add landed server-side (a POST that timed out on
 * the way back, then failed as "Already in this pack") becomes a skip in "Add
 * missing only", and a replace targets the sticker the pack holds today.
 */
function retryPlanFor(
  run: StickerPublishRun,
  latestPack: AdminStickerPackResponse,
): FlagPlanEntry[] {
  const failedFlagIds = run.flagIds.filter(
    (flagId) => run.stateByFlag[flagId]?.status === "failed",
  );
  if (failedFlagIds.length === 0) return [];
  return buildFlagPlan(failedFlagIds, latestPack, run.mode);
}

/** The retry plan's skips: flags the pack already holds did land, so they
 *  read as done, under the action they were first sent as. */
function landedFlagsOf(
  retryPlan: FlagPlanEntry[],
  run: StickerPublishRun,
): LandedFlag[] {
  return retryPlan
    .filter((entry) => entry.action === "skip")
    .map((entry) => ({
      flagId: entry.flagId,
      action: run.actionByFlag[entry.flagId] ?? "add",
    }));
}

/**
 * Publish one sticker per planned flag, sequentially, as a run the builder
 * can watch flag by flag.
 *
 * Sequential on purpose: every flag is a presign round trip plus an S3 PUT
 * plus a metadata call, and firing twelve of those at once would burn the
 * per-user presign rate limit (20 per minute) and give no usable progress.
 *
 * An "add" creates the sticker with its label and default keywords. A
 * "replace" sends the redrawn artwork only, so the sticker keeps its id,
 * order and cover status, and the label and keywords an admin may have
 * edited stay as they are.
 *
 * A failure part-way leaves the stickers already written in place and marks
 * that flag failed with a reason, so `retryFailed` re-runs only the flags
 * that did not land, and the rest of the pack stays untouched.
 *
 * `labelsByFlagId` carries the translated "<Flag> reverse" label for every
 * flag the page currently shows, resolved by the caller through `t()`. This
 * hook stays translation-free on purpose: resolving labels once in the
 * caller keeps `useTranslation`'s read of the active language to a single
 * pass, ahead of the sequential loop. A raw flag id must never ship as a
 * sticker's label, because that label becomes the sticker's alt text and
 * its reply-quote line.
 */
export function useStickerPublish() {
  const queryClient = useQueryClient();
  const uploadImage = useUploadImage("sticker");
  const addSticker = useAddSticker();
  const updateSticker = useUpdateSticker();
  const [run, setRun] = useState<StickerPublishRun | null>(null);
  const isCancelRequestedRef = useRef(false);
  const isRunningRef = useRef(false);
  // True while this hook instance is mounted. `retryFailed` checks it after
  // its refetch await, so a refetch that resolves once the builder has
  // navigated away stops there rather than starting a run or updating state.
  const isMountedRef = useRef(true);
  // The inputs of the last run, kept so `retryFailed` can rebuild it from
  // its failed flags with the same mode, params and labels (the pack itself
  // is read fresh from the admin list, see `retryPlanFor`).
  const lastRunArgsRef = useRef<StartRunArgs | null>(null);
  // Set while `retryFailed` refetches the pack list, so a second tap on
  // Retry in that window does not start a second retry. The ref is the guard
  // (read synchronously inside the callback); the state mirrors it so the
  // Retry button can show that it is busy.
  const isRetryPendingRef = useRef(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const setFlagState = useCallback(
    (flagId: string, flagState: FlagRunState) => {
      // Functional on purpose: a fast flag can land its "running" and "done"
      // updates in the same tick, and a closure over `run` would drop one.
      setRun((previous) =>
        previous
          ? {
              ...previous,
              stateByFlag: { ...previous.stateByFlag, [flagId]: flagState },
            }
          : previous,
      );
    },
    [],
  );

  const publishFlag = useCallback(
    async (entry: FlagPlanEntry, args: StartRunArgs) => {
      const { flagId } = entry;
      const existingSticker = entry.existingSticker;
      if (entry.action === "replace" && existingSticker === null) {
        // A replace with nothing to replace is a broken plan. Failing the
        // flag keeps it visible, where adding would quietly create a second
        // sticker the admin never asked for.
        setFlagState(flagId, { status: "failed", failureReason: "unknown" });
        return;
      }
      const stickerParams: UnoReverseParams = { ...args.params, flagId };
      let isArtworkStep = true;
      let previewUrl: string | null = null;
      try {
        const primitives = unoReverseGeometry(stickerParams);
        const blob = await renderStickerBlob(primitives);
        const file = new File([blob], `${flagId}.png`, { type: "image/png" });
        const uploaded = await uploadImage(file);
        previewUrl = uploaded.previewUrl;
        const artwork = {
          storageKey: uploaded.key,
          width: STICKER_CANVAS_SIZE,
          height: STICKER_CANVAS_SIZE,
          svgSource: primitivesToSvg(primitives, STICKER_CANVAS_SIZE),
          templateId: UNO_REVERSE_TEMPLATE_ID,
          templateParams: { ...stickerParams },
        };
        isArtworkStep = false;
        if (existingSticker !== null && entry.action === "replace") {
          await updateSticker.mutateAsync({
            packId: args.pack.id,
            stickerId: existingSticker.id,
            body: { artwork },
          });
        } else {
          await addSticker.mutateAsync({
            packId: args.pack.id,
            body: {
              ...artwork,
              slug: stickerSlugForFlag(flagId),
              label: args.labelsByFlagId[flagId] ?? flagId,
              keywords: stickerKeywordsForFlag(flagId),
            },
          });
        }
        setFlagState(flagId, { status: "done" });
      } catch (error) {
        setFlagState(flagId, {
          status: "failed",
          failureReason: failureReasonOf(error, isArtworkStep),
        });
      } finally {
        // The upload hands its local preview URL to the caller; this loop
        // never shows it, so it is released here.
        if (previewUrl) URL.revokeObjectURL(previewUrl);
      }
    },
    [uploadImage, addSticker, updateSticker, setFlagState],
  );

  // `landedFlags` are flags a retry found already in the pack. They join the
  // new run as done, with the action they were first sent as, so the result
  // line keeps counting them as part of the run they now belong to.
  const startRun = useCallback(
    async (args: StartRunArgs, landedFlags: readonly LandedFlag[]) => {
      if (isRunningRef.current) return;
      const entries = args.plan.filter((entry) => entry.action !== "skip");
      if (entries.length === 0) return;
      isRunningRef.current = true;
      isCancelRequestedRef.current = false;
      lastRunArgsRef.current = args;
      const actionByFlag: StickerPublishRun["actionByFlag"] = {};
      const stateByFlag: StickerPublishRun["stateByFlag"] = {};
      for (const landed of landedFlags) {
        actionByFlag[landed.flagId] = landed.action;
        stateByFlag[landed.flagId] = { status: "done" };
      }
      for (const entry of entries) {
        actionByFlag[entry.flagId] =
          entry.action === "replace" ? "replace" : "add";
        stateByFlag[entry.flagId] = { status: "queued" };
      }
      setRun({
        packId: args.pack.id,
        packName: args.pack.name,
        mode: args.mode,
        flagIds: [
          ...landedFlags.map((landed) => landed.flagId),
          ...entries.map((entry) => entry.flagId),
        ],
        actionByFlag,
        stateByFlag,
        isRunning: true,
      });
      // The teardown belongs in `finally`, structurally, rather than as the
      // loop's last statements: a synchronous throw between iterations, or a
      // step added later outside its own inner try, must still clear
      // `isRunning`, or the publish bar stays dead until a page reload.
      try {
        for (const [index, entry] of entries.entries()) {
          if (isCancelRequestedRef.current) {
            for (const remaining of entries.slice(index)) {
              setFlagState(remaining.flagId, { status: "cancelled" });
            }
            break;
          }
          setFlagState(entry.flagId, { status: "running" });
          await publishFlag(entry, args);
        }
      } finally {
        isRunningRef.current = false;
        setRun((previous) =>
          previous ? { ...previous, isRunning: false } : previous,
        );
      }
    },
    [publishFlag, setFlagState],
  );

  const start = useCallback(
    (args: StartRunArgs) => startRun(args, []),
    [startRun],
  );

  const cancel = useCallback(() => {
    if (isRunningRef.current) isCancelRequestedRef.current = true;
  }, []);

  const retryFailed = useCallback(async () => {
    const lastRunArgs = lastRunArgsRef.current;
    if (!run || run.isRunning || !lastRunArgs || isRetryPendingRef.current) {
      return;
    }
    isRetryPendingRef.current = true;
    setIsRetrying(true);
    try {
      // The cached list can predate a POST that landed and then timed out on
      // the way back. Re-planning from it would send that flag as an add
      // again, so the list is read fresh from the server first.
      await queryClient.refetchQueries({
        queryKey: ADMIN_STICKER_PACKS_KEY,
        exact: true,
      });
    } catch {
      // A failed refetch leaves the cache as it was; plan from that.
    }
    // The builder unmounted while the refetch was in flight, so nothing else
    // about this retry proceeds.
    if (!isMountedRef.current) return;
    // Dismissing the run while the list loaded drops the retry, and a run
    // started in that window wins over it.
    const isRetryStillWanted = isRetryPendingRef.current;
    isRetryPendingRef.current = false;
    setIsRetrying(false);
    if (!isRetryStillWanted || isRunningRef.current) return;
    const latestPack =
      queryClient
        .getQueryData<AdminStickerPackResponse[]>(ADMIN_STICKER_PACKS_KEY)
        ?.find((pack) => pack.id === run.packId) ?? lastRunArgs.pack;
    const retryPlan = retryPlanFor(run, latestPack);
    if (retryPlan.length === 0) return;
    const landedFlags = landedFlagsOf(retryPlan, run);
    if (landedFlags.length === retryPlan.length) {
      // Nothing is left to send, so this is the whole retry: the marks go on
      // the finished run, and its result line and the grid badges agree with
      // the pack.
      for (const landed of landedFlags) {
        setFlagState(landed.flagId, { status: "done" });
      }
      return;
    }
    await startRun(
      { ...lastRunArgs, pack: latestPack, plan: retryPlan },
      landedFlags,
    );
  }, [queryClient, run, setFlagState, startRun]);

  const dismiss = useCallback(() => {
    if (isRunningRef.current) return;
    isRetryPendingRef.current = false;
    setIsRetrying(false);
    setRun(null);
  }, []);

  // Leaving the page mid-run strands the flags still queued, so the browser
  // asks first while a run is in flight.
  const isRunning = run?.isRunning ?? false;
  useEffect(() => {
    if (!isRunning) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isRunning]);

  // An in-app navigation away unmounts the builder; the flag in flight
  // finishes and the rest stop, so no sticker lands where nobody can see it.
  // `isMountedRef` is cleared at the same time, so a retry's refetch that
  // resolves after this point sees it and stops in `retryFailed`.
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isCancelRequestedRef.current = true;
      isMountedRef.current = false;
    };
  }, []);

  return { run, isRetrying, start, cancel, retryFailed, dismiss };
}

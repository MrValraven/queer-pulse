import type {
  AdminStickerPackResponse,
  AdminStickerResponse,
} from "../../../shared/contracts/contracts";

export type PackStatus = AdminStickerPackResponse["status"];

/** How a run treats a selected flag the pack already holds. */
export type PublishMode = "add-missing" | "replace";

/** Whether a flag already has a sticker in the selected pack. */
export type FlagPackState = "new" | "in-pack";

/** What a run will do with one selected flag. */
export type FlagPlanAction = "add" | "replace" | "skip";

export interface FlagPlanEntry {
  flagId: string;
  action: FlagPlanAction;
  /** The existing sticker a "replace" (or "skip") refers to. */
  existingSticker: AdminStickerResponse | null;
}

export type FlagRunStatus =
  "queued" | "running" | "done" | "failed" | "cancelled";

export type PublishFailureReason =
  "conflict" | "rate-limit" | "upload" | "unknown";

export interface FlagRunState {
  status: FlagRunStatus;
  failureReason?: PublishFailureReason;
}

export interface StickerPublishRun {
  packId: string;
  packName: string;
  mode: PublishMode;
  /** The flags this run processes, in canonical order (skips excluded). */
  flagIds: string[];
  /** Per flag, the action it was planned with. */
  actionByFlag: Record<string, Exclude<FlagPlanAction, "skip">>;
  stateByFlag: Record<string, FlagRunState>;
  isRunning: boolean;
}

export interface StickerPublishSummary {
  totalCount: number;
  doneCount: number;
  failedCount: number;
  cancelledCount: number;
  addedCount: number;
  replacedCount: number;
}

export type PreviewBackdrop = "light" | "dark" | "checker";

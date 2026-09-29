import type {
  AdminStickerPackResponse,
  AdminStickerResponse,
} from "../../../shared/contracts/contracts";
import type { StickerTemplateId } from "../../stickers/templates/templateDefinition";

export type PackStatus = AdminStickerPackResponse["status"];

/** How a run treats a selected item the pack already holds. */
export type PublishMode = "add-missing" | "replace";

/** Whether an item of the pack's template already has a sticker in the
 *  selected pack. */
export type ItemPackState = "new" | "in-pack";

/** What a run will do with one selected item. */
export type ItemPlanAction = "add" | "replace" | "skip";

export interface ItemPlanEntry {
  itemId: string;
  action: ItemPlanAction;
  /** The existing sticker a "replace" (or "skip") refers to. */
  existingSticker: AdminStickerResponse | null;
}

export type ItemRunStatus =
  "queued" | "running" | "done" | "failed" | "cancelled";

export type PublishFailureReason =
  "conflict" | "rate-limit" | "upload" | "unknown";

export interface ItemRunState {
  status: ItemRunStatus;
  failureReason?: PublishFailureReason;
}

export interface StickerPublishRun {
  packId: string;
  packName: string;
  mode: PublishMode;
  /** The template every sticker in this run is drawn with. */
  templateId: StickerTemplateId;
  /** The items this run processes, in canonical order (skips excluded). */
  itemIds: string[];
  /** Per item, the action it was planned with. */
  actionByItem: Record<string, Exclude<ItemPlanAction, "skip">>;
  stateByItem: Record<string, ItemRunState>;
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

/**
 * The piece record's unified publish/unpublish calls (PRD-119 / PRD-120).
 *
 * These live apart from `pieces.api.ts` because they are the ONE publish path
 * that works for both formats: an `article`-format piece publishes its
 * `MagazineArticle`, a `deck`-format piece publishes its `MagazineDeck`. The
 * article editor's own rail keeps its narrower
 * `PATCH /magazine/admin/pieces/:id/article/publish` (`publishArticle` in
 * `pieces.api.ts`), which now runs the same care gate on the server.
 */

import { ApiError, apiPost } from "../../../shared/api/client";
import type { PieceRecordDto } from "./pieces.api";

/**
 * The publish state the piece record carries alongside its editorial fields.
 * Read defensively (`Partial`) at every call site: an older backend, and the
 * demo fixture, answer without these keys and the page must still render.
 */
export interface PiecePublishStateDto {
  /** Whether the piece's linked article/deck is live to readers right now. */
  isPublished: boolean;
  /** ISO instant the linked article/deck goes (or went) live, or `null` while
   *  it is a draft. A value in the FUTURE means scheduled, so a caller has to
   *  compare against the clock rather than treat any value as "already live". */
  publishedAt: string | null;
  /** Reader-facing path for the live piece (e.g. `/magazine/a/<slug>`), or
   *  `null` when nothing is published yet. */
  publicHref: string | null;
}

/** `PieceRecordDto` as this slice reads it: the record plus the publish state. */
export type PieceRecordPublishFields = Partial<PiecePublishStateDto>;

/** Body of `POST /magazine/admin/pieces/:id/publish`. Omitting `publishedAt`
 *  publishes now; an ISO string publishes (or schedules) at that instant. */
export interface PublishPieceDto {
  publishedAt?: string | null;
}

/** The server's care gate rejected the publish. */
export const CARE_GATE_OPEN_CODE = "magazine_care_gate_open";
/** The article/deck itself is not ready (no standfirst, missing alt text, ...). */
export const PUBLISH_NOT_READY_CODE = "magazine_publish_not_ready";

/** The 400 body both publish refusals share. */
export interface PublishRefusalDto {
  message: string;
  code: typeof CARE_GATE_OPEN_CODE | typeof PUBLISH_NOT_READY_CODE;
  /** Every reason the publish was refused, already human-readable. */
  openGateItems: string[];
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((entry) => typeof entry === "string")
  );
}

/**
 * Pulls the structured refusal out of a failed publish, or returns `null` when
 * the failure was something else (offline, 401, a 500).
 *
 * The disabled Publish button is a courtesy: the server is the real gate, and
 * it can refuse a publish the client believed was clear (someone reopened a
 * care item in another tab, or the article lost its standfirst). Surfacing the
 * server's own `openGateItems` is the only way the editor learns WHICH item.
 */
export function readPublishRefusal(error: unknown): PublishRefusalDto | null {
  if (!(error instanceof ApiError) || error.status !== 400) return null;
  const body = error.data;
  if (typeof body !== "object" || body === null) return null;
  const { code, openGateItems, message } = body as Record<string, unknown>;
  if (code !== CARE_GATE_OPEN_CODE && code !== PUBLISH_NOT_READY_CODE) {
    return null;
  }
  return {
    code,
    message: typeof message === "string" ? message : "",
    openGateItems: isStringArray(openGateItems) ? openGateItems : [],
  };
}

/** POST /magazine/admin/pieces/:id/publish. Gated by the care gate and by
 *  the format's own readiness check, in that order. */
export const publishPiece = (id: string, body: PublishPieceDto) =>
  apiPost<PieceRecordDto & PieceRecordPublishFields>(
    `/magazine/admin/pieces/${id}/publish`,
    body,
  );

/** POST /magazine/admin/pieces/:id/unpublish. Never gated: pulling a live
 *  piece back down has to stay available whatever state its care gate is in. */
export const unpublishPiece = (id: string) =>
  apiPost<PieceRecordDto & PieceRecordPublishFields>(
    `/magazine/admin/pieces/${id}/unpublish`,
  );

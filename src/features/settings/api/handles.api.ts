import { apiGet, apiPatch } from "../../../shared/api/client";
import type { ProfileDTO } from "../../members/api/members.api";

/**
 * Unified-username wire helpers (UC4). The NestJS backend lives outside this
 * repo; these are the thin LIVE-mode wrappers. Demo/live branching happens one
 * layer up in `useHandleAvailability.ts` and in the Settings save handler — an
 * `ApiError` (409 taken / 422 invalid|reserved) surfaces to those callers.
 */

/** Why a handle can't be used, or `null` when it's free. */
export type HandleReason = "invalid" | "reserved" | "taken" | null;

export interface HandleCheck {
  available: boolean;
  reason: HandleReason;
}

/** GET /handles/check?name= — is this handle free across the whole namespace? */
export const checkHandle = (name: string) =>
  apiGet<HandleCheck>(`/handles/check?name=${encodeURIComponent(name)}`);

/**
 * PATCH /profiles/me/username — set the member's mandatory `@username`.
 * Resolves the updated profile; rejects with `ApiError` on 409 (taken) or 422
 * (invalid | reserved), whose `.data` carries the server's reason.
 */
export const updateUsername = (username: string) =>
  apiPatch<ProfileDTO>("/profiles/me/username", { username });

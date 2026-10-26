import { useSyncExternalStore } from "react";
import type { ReauthCodeChallenge } from "../../auth/api/emailCode.api";

/**
 * Which step-up dialog is open, if any.
 *
 * `beginReauth()` is a plain function that call sites run from inside an
 * action handler, and the dialog it opens (`ReauthCodeModal`) is mounted once
 * by `ReauthCompletionProvider` near the app root. A tiny module store bridges
 * the two: `openReauthDialog` publishes a request, the provider reads it with
 * `useReauthDialogRequest`, and `closeReauthDialog` clears it. Every open gets
 * a fresh `id`, so the provider can key the dialog on it and a second open
 * starts a clean dialog with its own code request.
 *
 * `onConfirmed` runs after the code is accepted and the token is cached, for a
 * page that wants to react in place (the verification page shows its success
 * panel). Destructive call sites leave it out and ask for a second press.
 */

export interface ReauthDialogRequest {
  id: number;
  onConfirmed?: () => void;
}

let currentRequest: ReauthDialogRequest | null = null;
let nextRequestId = 1;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

/** Opens the step-up dialog, replacing any open request with a new id. */
export function openReauthDialog(options?: { onConfirmed?: () => void }): void {
  currentRequest = { id: nextRequestId, onConfirmed: options?.onConfirmed };
  nextRequestId += 1;
  emit();
}

/**
 * Closes the step-up dialog. A dialog passes its own request `id`, so one
 * still playing its exit after a newer open cannot close the newer dialog.
 */
export function closeReauthDialog(id?: number): void {
  if (currentRequest === null) return;
  if (id !== undefined && currentRequest.id !== id) return;
  currentRequest = null;
  emit();
}

/**
 * The last code emailed for step-up, kept for the whole page session so a
 * member who closes the dialog and opens it again inside the resend cooldown
 * sees the code boxes for the code already on its way. Asking again there
 * would only come back `resend_too_soon`. `ownerId` keeps one account's code
 * from showing to another account signed in later in the same tab.
 */
let lastChallenge: { challenge: ReauthCodeChallenge; ownerId: string } | null =
  null;

/** Keeps the challenge a reauth request just answered with. */
export function rememberReauthChallenge(
  challenge: ReauthCodeChallenge,
  ownerId: string,
): void {
  lastChallenge = { challenge, ownerId };
}

/** The kept challenge when it belongs to `ownerId` and its code still works,
 *  else `null` (an expired one is dropped on the way). */
export function readLiveReauthChallenge(
  ownerId: string | null | undefined,
  now: number = Date.now(),
): ReauthCodeChallenge | null {
  if (lastChallenge === null || !ownerId) return null;
  if (new Date(lastChallenge.challenge.expiresAt).getTime() <= now) {
    lastChallenge = null;
    return null;
  }
  return lastChallenge.ownerId === ownerId ? lastChallenge.challenge : null;
}

/** Drops the kept challenge: its code was accepted or can no longer work. */
export function forgetReauthChallenge(): void {
  lastChallenge = null;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => currentRequest;
const getServerSnapshot = () => null;

/** The open step-up request, or `null` while the dialog is closed. */
export function useReauthDialogRequest(): ReauthDialogRequest | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

import { apiPost, ensureCsrf } from "../../../shared/api/client";
import type {
  QuizshowPairingClaim,
  QuizshowPairingStart,
} from "../../../shared/contracts/quizshow";

/**
 * TV pairing and the helper remote (C5.1, item 9). Every answer here carries a
 * code, a poll token or a device ticket and is sent `no-store`, so nothing here
 * is cached. Demo mode hides pairing, so these calls have no demo twin.
 *
 * Each POST first makes sure the CSRF cookie and token are in place, as the
 * sign-in page's public POST does: a signed-out TV has never sent a write
 * before, and the global CSRF guard covers the public routes too.
 */
const PAIRINGS_PATH = "/quizshow/device-pairings";

/** A signed-out TV asks for a code to show (public, 10 starts per IP in 10 minutes).
 *  `signal` cancels the start when the page unmounts. */
export async function startScreenPairing(
  signal?: AbortSignal,
): Promise<QuizshowPairingStart> {
  await ensureCsrf();
  return apiPost<QuizshowPairingStart>(
    `${PAIRINGS_PATH}/screen`,
    undefined,
    undefined,
    undefined,
    signal,
  );
}

/** A signed-in member's phone asks for a code to show as a helper remote.
 *  `signal` cancels the start when the page unmounts. */
export async function startHelperPairing(
  signal?: AbortSignal,
): Promise<QuizshowPairingStart> {
  await ensureCsrf();
  return apiPost<QuizshowPairingStart>(
    `${PAIRINGS_PATH}/helper`,
    undefined,
    undefined,
    undefined,
    signal,
  );
}

/** Polls a pairing: `waiting` until a host pairs it, then the device ticket
 *  once. `signal` cancels the poll when the TV page unmounts. */
export async function claimPairing(
  pairingId: string,
  pollToken: string,
  signal?: AbortSignal,
): Promise<QuizshowPairingClaim> {
  await ensureCsrf();
  return apiPost<QuizshowPairingClaim>(
    `${PAIRINGS_PATH}/${encodeURIComponent(pairingId)}/claim`,
    { pollToken },
    undefined,
    undefined,
    signal,
  );
}

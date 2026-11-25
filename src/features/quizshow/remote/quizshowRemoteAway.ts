import {
  QUIZSHOW_LIMITS,
  type QuizshowHostPlayer,
} from "../../../shared/contracts/quizshow";

type AwayFields = Pick<QuizshowHostPlayer, "isConnected" | "disconnectedAt">;

/**
 * C6.2: a player is away once their last socket has been gone for
 * `awayAfterMs`. `serverNowMs` is the remote's clock moved onto the server's
 * (`Date.now() + clockOffsetMs`); the server keeps no timer for this.
 */
export function isPlayerAwayAt(
  player: AwayFields,
  serverNowMs: number,
): boolean {
  if (player.isConnected || player.disconnectedAt === null) return false;
  return serverNowMs - player.disconnectedAt >= QUIZSHOW_LIMITS.awayAfterMs;
}

/**
 * The server time at which the next offline player turns away, or null when
 * no offline player is still waiting to (everyone is connected, already away,
 * or has no `disconnectedAt`). The roster sets one timeout for that moment.
 */
export function nextAwayFlipAt(
  players: readonly AwayFields[],
  serverNowMs: number,
): number | null {
  let nextFlipAt: number | null = null;
  for (const player of players) {
    if (player.isConnected || player.disconnectedAt === null) continue;
    const flipAt = player.disconnectedAt + QUIZSHOW_LIMITS.awayAfterMs;
    if (flipAt <= serverNowMs) continue;
    if (nextFlipAt === null || flipAt < nextFlipAt) nextFlipAt = flipAt;
  }
  return nextFlipAt;
}

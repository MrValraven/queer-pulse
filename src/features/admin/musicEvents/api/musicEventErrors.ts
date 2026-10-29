import { ApiError } from "../../../../shared/api/client";

const MUSIC_EVENT_NOT_FOUND_CODE = "music_event_not_found";

/** The server's answer for a slug that is not a QueerPulse music event: a 404
 *  carrying `code: "music_event_not_found"`. A plain 404 is something else. */
export function isMusicEventNotFound(error: unknown): boolean {
  if (!(error instanceof ApiError) || error.status !== 404) return false;
  const code = (error.data as { code?: unknown } | null | undefined)?.code;
  return code === MUSIC_EVENT_NOT_FOUND_CODE;
}

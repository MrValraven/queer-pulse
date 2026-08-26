import { ACTION_CODE } from "./moderationQueue.types";

/** `restrict`'s duration options. The backend always requires one (P0-15):
 *  unlike `ban`, there is no permanent restriction. */
export const RESTRICT_DURATIONS = ["24h", "7d", "30d"] as const;
export const DEFAULT_RESTRICT_DURATION: (typeof RESTRICT_DURATIONS)[number] =
  "7d";

/** The drawer holds a MOD_ACTIONS tile id ("hide"); the saved-response library
 *  is keyed by the server action code ("hide_content"). `ACTION_CODE` is the
 *  same map `useModerationQueue` uses when it files the action, so the picker
 *  filters on exactly the code the report will be resolved with. */
export function modActionCodeFor(action: string | null) {
  return action ? (ACTION_CODE[action] ?? null) : null;
}

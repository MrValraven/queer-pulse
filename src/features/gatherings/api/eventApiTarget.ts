/**
 * Which API surface an organizer call goes to. Members host through
 * `/events`; QueerPulse's own team hosts music events through
 * `/admin/music-events`, which mirrors the organizer routes one for one.
 * Imports nothing at runtime, so the g/ and goTogether/ chunks can use it
 * without reaching into features/admin/.
 */
export type EventApiTarget = "member" | "musicAdmin";

export const EVENT_API_BASE: Readonly<Record<EventApiTarget, string>> = {
  member: "/events",
  musicAdmin: "/admin/music-events",
};

/** `${base}/${slug}${suffix}` for the chosen target. */
export function eventApiPath(
  target: EventApiTarget,
  slug: string,
  suffix?: string,
): string {
  return `${EVENT_API_BASE[target]}/${slug}${suffix ?? ""}`;
}

/**
 * The react-query key segment that keeps an admin read from sharing a cache
 * entry with the member read of the same slug. Empty for the member target,
 * so every member key stays byte-identical.
 */
export function eventKeySegment(
  target: EventApiTarget | undefined,
): readonly string[] {
  return target === undefined || target === "member" ? [] : ["musicAdmin"];
}

/**
 * A QueerPulse-hosted event has no community and no Run by listing. The
 * server rejects a body that names either, so both keys are dropped
 * entirely, null included.
 */
export function toHouseEventBody<Body extends object>(
  body: Body,
): Omit<Body, "communitySlug" | "runByListingId"> {
  const {
    communitySlug: _communitySlug,
    runByListingId: _runByListingId,
    ...rest
  } = body as Record<string, unknown>;
  return rest as Omit<Body, "communitySlug" | "runByListingId">;
}

/** Shared with am/api/musicEventKeys.ts so house writes can refresh the admin list. */
export const MUSIC_ADMIN_LIST_KEY_ROOT = ["admin-music-events"] as const;

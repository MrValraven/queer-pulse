import { activeLocale } from "../../shared/i18n/locale";

/**
 * PRD-349: the absolute moment a TIMED mute lifts, for the "Muted until
 * {time}" accessible name: "14:32" when it lifts later today, else
 * "3 Aug, 14:32", since a bare clock time would be ambiguous for a mute that
 * lasts days (a "1 week" mute lifting "at 14:32" reads as today without a
 * date attached). Returns "" for an unparseable timestamp so a bad value
 * degrades to the plain "muted" label rather than showing garbage.
 */
export function formatMutedUntil(iso: string): string {
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) return "";
  const locale = activeLocale();
  const isToday = target.toDateString() === new Date().toDateString();
  return isToday
    ? target.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" })
    : target.toLocaleString(locale, {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      });
}

export interface ThreadMuteState {
  /** Whether the row's muted-bell indicator should show at all. */
  isMuted: boolean;
  /** Set only when `isMuted` is true AND the mute is a TIMED one (not a
   *  plain forever `muted: true`): the formatted moment it lifts. */
  mutedUntilTime: string | undefined;
  /** PRD-349: whether this thread is in "mentions only" mode, a SECOND axis
   *  independent of `isMuted` above. A thread can be `isMentionsOnly` while
   *  also `isMuted` (an ordinary timed/forever mute layered on top) or while
   *  fully unmuted; a consumer that renders ONE combined mute state (the row
   *  menu, `useThreadRowMenuItems.tsx`) treats this as its own honest state,
   *  always shown with its own `messages:thread.mutedMentionsOnly`/
   *  `.muteMentionsOnly` copy. */
  isMentionsOnly: boolean;
}

/**
 * PRD-349: `mutedUntil` governs the row's mute indicator whenever it's set,
 * INDEPENDENTLY of the plain `muted` boolean. In the future the row is
 * muted with a "Muted until {time}" name; once it's in the past the row
 * renders as unmuted even if `muted` hasn't been cleared server-side yet.
 * Only when `mutedUntil` is absent does the plain forever-mute boolean apply.
 *
 * `muteMode` is resolved alongside, as its own field (`isMentionsOnly`)
 * rather than folded into `isMuted`: the two axes can coexist (see
 * `ThreadMuteState.isMentionsOnly`'s own doc), so a caller that shows a
 * single-icon indicator must decide for itself how to combine them rather
 * than have this helper silently pick one.
 */
export function resolveMuteState(thread: {
  muted?: boolean;
  mutedUntil?: string | null;
  muteMode?: "all" | "mentionsOnly";
}): ThreadMuteState {
  const isMentionsOnly = thread.muteMode === "mentionsOnly";
  if (!thread.mutedUntil) {
    return {
      isMuted: !!thread.muted,
      mutedUntilTime: undefined,
      isMentionsOnly,
    };
  }
  const target = new Date(thread.mutedUntil);
  if (Number.isNaN(target.getTime())) {
    return {
      isMuted: !!thread.muted,
      mutedUntilTime: undefined,
      isMentionsOnly,
    };
  }
  const isMuted = target.getTime() > Date.now();
  return {
    isMuted,
    mutedUntilTime: isMuted ? formatMutedUntil(thread.mutedUntil) : undefined,
    isMentionsOnly,
  };
}

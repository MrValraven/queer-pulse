import type { Notification } from "./notifications.types";

export interface NotificationDayBuckets {
  /** Everything from today, under the "Today & recent" header. */
  recent: Notification[];
  /** Everything older, under "Earlier". */
  earlier: Notification[];
}

/**
 * Split a notification list into the page's two day headers, on each row's
 * real creation time.
 *
 * This used to be a positional slice (the first seven rows were "recent"), so
 * a member with eight notifications from today saw one of them filed under
 * "Earlier", and someone with five from last month saw them all as recent. A
 * row with no usable timestamp stays in the first bucket rather than claiming
 * an age nothing supports.
 *
 * `now` is injectable so the boundary is testable without touching the clock.
 */
export function bucketNotificationsByDay(
  notifications: Notification[],
  now: number = Date.now(),
): NotificationDayBuckets {
  const today = new Date(now);
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  ).getTime();

  const recent: Notification[] = [];
  const earlier: Notification[] = [];
  for (const notification of notifications) {
    const createdAt = notification.createdAtIso
      ? new Date(notification.createdAtIso).getTime()
      : Number.NaN;
    if (Number.isNaN(createdAt) || createdAt >= startOfToday) {
      recent.push(notification);
    } else {
      earlier.push(notification);
    }
  }
  return { recent, earlier };
}

import type { MusicEventBucket } from "./api/musicEvents.types";

/** Each bucket's own empty copy, so an empty tab never reads as no events
 *  at all while another bucket holds some. */
export const EMPTY_COPY_KEYS: Readonly<
  Record<MusicEventBucket, { title: string; body: string }>
> = {
  upcoming: {
    title: "admin:musicEvents.empty.upcoming.title",
    body: "admin:musicEvents.empty.upcoming.body",
  },
  past: {
    title: "admin:musicEvents.empty.past.title",
    body: "admin:musicEvents.empty.past.body",
  },
  cancelled: {
    title: "admin:musicEvents.empty.cancelled.title",
    body: "admin:musicEvents.empty.cancelled.body",
  },
};

/** Each tab's label key. */
export const BUCKET_TAB_KEYS: Readonly<Record<MusicEventBucket, string>> = {
  upcoming: "admin:musicEvents.tabs.upcoming",
  past: "admin:musicEvents.tabs.past",
  cancelled: "admin:musicEvents.tabs.cancelled",
};

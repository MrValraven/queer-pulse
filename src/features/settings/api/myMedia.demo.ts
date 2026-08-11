import type { MyMediaItem } from "./myMedia.api";

/**
 * Static stand-in for GET /me/media in demo mode. Uses the same Unsplash demo
 * photos the member registry uses, so the picker shows real-looking thumbnails
 * without touching the network. `fileUrl` is already absolute here (demo needs
 * no API_BASE prefix); `key` doubles as the persisted value in demo, where no
 * real storage key exists.
 *
 * `DEMO_MY_MEDIA` below is the immutable seed. `useMyMedia`'s demo `queryFn`
 * must NOT return the seed directly — react-query's default `staleTime` +
 * `refetchOnMount` mean the picker can silently refetch in the background,
 * and a `queryFn` that always resolves the pristine seed would revive a photo
 * the member just deleted. `demoMyMedia` is the actual mutable store the
 * queryFn reads; `removeDemoMedia` is the only way to shrink it.
 */
export const DEMO_MY_MEDIA: MyMediaItem[] = [
  {
    key: "demo-avatar-1",
    kind: "avatar",
    size: 148_000,
    lastModified: "2026-08-09T10:00:00.000Z",
    fileUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=800&auto=format&fit=crop",
    references: [
      {
        type: "profile-photo",
        entityId: "demo-member",
        label: "Tiago",
        slug: "tiago",
      },
    ],
  },
  {
    key: "demo-work-1",
    kind: "work-image",
    size: 262_000,
    lastModified: "2026-08-07T10:00:00.000Z",
    fileUrl:
      "https://images.unsplash.com/photo-1463453091185-61582044d556?q=80&w=800&auto=format&fit=crop",
    references: [
      {
        type: "persona-avatar",
        entityId: "demo-persona",
        label: "Décima Casa",
        slug: "decima-casa",
      },
    ],
  },
  {
    key: "demo-listing-1",
    kind: "listing-photo",
    size: 331_000,
    lastModified: "2026-08-05T10:00:00.000Z",
    fileUrl:
      "https://images.unsplash.com/photo-1485893086445-ed75865251e0?q=80&w=800&auto=format&fit=crop",
    references: [],
  },
];

/** The mutable demo store `useMyMedia`'s demo `queryFn` actually reads. */
let demoMyMedia: MyMediaItem[] = [...DEMO_MY_MEDIA];

/** Current demo media list (post-deletions). Never mutate the return value. */
export function getDemoMyMedia(): MyMediaItem[] {
  return demoMyMedia;
}

/** Removes one item from the demo store by key — demo-mode delete's effect. */
export function removeDemoMedia(key: string): void {
  demoMyMedia = demoMyMedia.filter((item) => item.key !== key);
}

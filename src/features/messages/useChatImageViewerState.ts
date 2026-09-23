import { useCallback, useRef, useState, type RefObject } from "react";
import {
  findPhotoIndex,
  useThreadImageGallery,
  type ViewerPhoto,
} from "./useThreadImageGallery";
import type { TFunction } from "../../shared/i18n/types";
import type { ChatMessage } from "./data";

/**
 * Stable identity of one photo in the thread's gallery, which survives the
 * gallery being rebuilt around it. A message carries at most one attachment,
 * so the message's own identity names the photo: the client `localId` an
 * acked send keeps, else the server id. The attachment URL is the identity
 * only for a message with neither (a demo message), because an optimistic
 * upload swaps its local blob preview for the stored URL when it is acked.
 */
export function viewerPhotoIdentity(photo: ViewerPhoto): string {
  const messageKey = photo.message.localId ?? photo.message.id;
  return messageKey === undefined
    ? `attachment:${photo.url}`
    : `message:${messageKey}`;
}

function findIdentityIndex(
  photos: ViewerPhoto[],
  identity: string | null,
): number {
  if (identity === null) return -1;
  return photos.findIndex((photo) => viewerPhotoIdentity(photo) === identity);
}

/** When the photo on screen has left the gallery, the nearest photo that was
 *  beside it and is still there: the next one first (the photo that slides
 *  into its place), then the previous one, widening outwards. Null when none
 *  of its old neighbours remain, which closes the viewer. */
function nearestSurvivingIdentity(
  previousPhotos: ViewerPhoto[],
  lostIdentity: string,
  nextPhotos: ViewerPhoto[],
): string | null {
  const lostIndex = findIdentityIndex(previousPhotos, lostIdentity);
  if (lostIndex < 0 || nextPhotos.length === 0) return null;
  const surviving = new Set(nextPhotos.map(viewerPhotoIdentity));
  for (let offset = 1; offset < previousPhotos.length; offset += 1) {
    for (const neighbour of [
      previousPhotos[lostIndex + offset],
      previousPhotos[lostIndex - offset],
    ]) {
      if (!neighbour) continue;
      const identity = viewerPhotoIdentity(neighbour);
      if (surviving.has(identity)) return identity;
    }
  }
  return null;
}

/**
 * Which photo the open viewer is on, tracked by `viewerPhotoIdentity` and
 * never by position. The gallery is rebuilt on every change to the loaded
 * groups, so a photo deleted earlier in the thread used to shift a stored
 * index onto the next photo without the member doing anything. The index is
 * derived from the identity on each render instead.
 *
 * `move` and `selectIndex` keep one identity for the life of the viewer: the
 * gesture layer memoizes its drag controller on them, and a fresh identity
 * would re-run the layout effect that resets zoom and pan. They read the
 * gallery from the state they update, which is always the latest one.
 */
export function useViewerPhotoCursor(
  photos: ViewerPhoto[],
  startIndex: number,
): {
  index: number;
  photo: ViewerPhoto | undefined;
  /** True while the photo on screen is still the one the viewer opened on. */
  isOnStartPhoto: boolean;
  move: (delta: number) => void;
  selectIndex: (index: number) => void;
} {
  const [cursor, setCursor] = useState(() => {
    const startPhoto = photos[startIndex];
    return {
      identity: startPhoto ? viewerPhotoIdentity(startPhoto) : null,
      photos,
    };
  });
  const [startIdentity] = useState(cursor.identity);

  let identity = cursor.identity;
  let index = findIdentityIndex(photos, identity);
  // React's documented "adjust state while rendering" pattern, guarded on the
  // gallery actually changing, so it re-renders at most once per new gallery.
  if (cursor.photos !== photos) {
    if (index < 0 && identity !== null) {
      identity = nearestSurvivingIdentity(cursor.photos, identity, photos);
      index = findIdentityIndex(photos, identity);
    }
    setCursor({ identity, photos });
  }

  const move = useCallback((delta: number) => {
    setCursor((current) => {
      const count = current.photos.length;
      if (count === 0) return current;
      const currentIndex = Math.max(
        0,
        findIdentityIndex(current.photos, current.identity),
      );
      const nextPhoto = current.photos[(currentIndex + delta + count) % count]!;
      return {
        identity: viewerPhotoIdentity(nextPhoto),
        photos: current.photos,
      };
    });
  }, []);

  const selectIndex = useCallback((nextIndex: number) => {
    setCursor((current) => {
      const nextPhoto = current.photos[nextIndex];
      if (!nextPhoto) return current;
      return {
        identity: viewerPhotoIdentity(nextPhoto),
        photos: current.photos,
      };
    });
  }, []);

  return {
    index,
    photo: photos[index],
    isOnStartPhoto: identity !== null && identity === startIdentity,
    move,
    selectIndex,
  };
}

/**
 * The open conversation's photo gallery plus which photo the viewer is showing.
 * Split out of `ConversationPanel` to keep that component under the line cap,
 * the same way its pin/star and action-menu state already are.
 *
 * `openImage` is `useCallback`-stable so the context value wrapped around the
 * message log stays identity-stable across unrelated re-renders.
 *
 * The bubble the viewer was opened from is kept in a REF, not in state. It is
 * only ever read by the viewer's open/close animation, so putting it in state
 * would re-render the whole panel to tell it something nothing renders from —
 * and a ref also keeps `openImage`'s identity out of it entirely.
 */
export function useChatImageViewerState(
  messageGroups: { day: string; items: ChatMessage[] }[],
  options: {
    counterpartName: string;
    youLabel: string;
    counterpartAvatar?: string;
    youAvatar?: string;
    t?: TFunction;
  },
): {
  photos: ViewerPhoto[];
  /** Null while closed. While open, the CURRENT index of the photo the viewer
   *  opened on, derived from its identity each render, or -1 once that photo
   *  has left the gallery. The mounted viewer reads it only as its start and
   *  tracks what it shows by identity from then on (`useViewerPhotoCursor`). */
  openIndex: number | null;
  /** The bubble thumbnail the open viewer grew out of, live so the close can
   *  re-measure it after the log has scrolled. Null when the viewer was opened
   *  from somewhere without one. */
  openOriginRef: RefObject<HTMLElement | null>;
  openImage: (message: ChatMessage, origin?: HTMLElement | null) => void;
  closeViewer: () => void;
} {
  const photos = useThreadImageGallery(messageGroups, options);
  const [openIdentity, setOpenIdentity] = useState<string | null>(null);
  const openOriginRef = useRef<HTMLElement | null>(null);
  const openIndex =
    openIdentity === null ? null : findIdentityIndex(photos, openIdentity);

  const openImage = useCallback(
    (message: ChatMessage, origin?: HTMLElement | null) => {
      const photo = photos[findPhotoIndex(photos, message)];
      if (!photo) return;
      openOriginRef.current = origin ?? null;
      setOpenIdentity(viewerPhotoIdentity(photo));
    },
    [photos],
  );

  // The origin is deliberately left alone here: the viewer is still on screen
  // playing its exit when this runs, and clearing the bubble it is flying back
  // to would drop it into the fade halfway through. The next open overwrites it.
  const closeViewer = useCallback(() => setOpenIdentity(null), []);

  return { photos, openIndex, openOriginRef, openImage, closeViewer };
}

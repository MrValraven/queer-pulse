import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ViewerPhoto } from "./useThreadImageGallery";
import styles from "./chatImageViewerFilmstrip.module.css";

/**
 * The viewer's bottom row: every photo the open conversation has loaded, laid
 * out as one horizontal strip with the photo on stage ringed in coral. Click a
 * thumbnail to jump straight to it, which is the only way to cross a long
 * gallery without stepping through every photo between here and there.
 *
 * It renders the LOADED history only, because that is all `useThreadImageGallery`
 * knows about: paging further back in the conversation extends the strip on the
 * next render rather than the strip fetching anything of its own.
 *
 * Desktop only. See the `hover: none` gate in the stylesheet for why.
 */
export function ChatImageViewerFilmstrip({
  photos,
  index,
  isChromeVisible,
  onSelect,
}: {
  photos: ViewerPhoto[];
  /** Index into `photos` of the photo currently on the stage. */
  index: number;
  /** False while the member has tapped the chrome away or is mid-gesture. */
  isChromeVisible: boolean;
  onSelect: (index: number) => void;
}) {
  const { t } = useTranslation();
  const isReducedMotion = usePrefersReducedMotion();
  const activeThumbRef = useRef<HTMLButtonElement>(null);

  // Keep the ringed thumbnail on screen as the member arrows or swipes through
  // the gallery. Centring rather than `nearest` means the neighbours on both
  // sides stay visible, so the strip always shows where in the conversation
  // this photo sits instead of pinning the active one to an edge.
  useEffect(() => {
    const activeThumb = activeThumbRef.current;
    // Two separate nulls to survive: the ref is empty on the first paint and
    // whenever the touch gate has removed the strip from the layout, and
    // `scrollIntoView` does not exist at all in jsdom.
    if (!activeThumb?.scrollIntoView) return;
    activeThumb.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: isReducedMotion ? "auto" : "smooth",
    });
  }, [index, isReducedMotion]);

  // Nothing to page through, so the strip is only chrome in the way of the
  // photo. Placed after the hooks above, which must run on every render.
  if (photos.length < 2) return null;

  return (
    <div
      className={[styles.filmstrip, !isChromeVisible && styles.filmstripHidden]
        .filter(Boolean)
        .join(" ")}
    >
      {/* `group`, never `listbox`: a listbox is a composite widget that owes its
          user one tab stop, a roving tabindex or an active descendant, and arrow
          keys of its own. This strip is a plain row of buttons with N tab stops,
          and the viewer already owns ArrowLeft/ArrowRight on the document, so
          claiming `listbox` would advertise a contract nothing here implements
          and invite a second arrow handler that pages two photos per press. */}
      <div
        className={styles.track}
        role="group"
        aria-label={t("messages:viewer.filmstripLabel")}
      >
        {photos.map((photo, photoIndex) => {
          const isActivePhoto = photoIndex === index;
          return (
            <button
              /* `photo.key` rather than `photoIndex`: the key is stable across
                 the optimistic-to-acked transition of a send, while the index
                 shifts the moment older history loads and prepends photos. A
                 shifting key would remount every thumbnail, dropping each
                 decoded image and re-running the lazy load for the whole
                 strip on a page-back. */
              key={photo.key}
              ref={isActivePhoto ? activeThumbRef : undefined}
              type="button"
              /* `aria-current`, not `aria-selected`: nothing here is selected,
                 one photo is currently DISPLAYED on the stage. Omitted rather
                 than written as "false" on the others, so a reader announces
                 the current photo and stays silent about the rest. */
              aria-current={isActivePhoto ? "true" : undefined}
              aria-label={t("messages:viewer.filmstripItem", {
                index: photoIndex + 1,
                total: photos.length,
                sender: photo.senderName,
              })}
              className={[styles.thumb, isActivePhoto && styles.thumbActive]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onSelect(photoIndex)}
            >
              <img
                className={styles.thumbImage}
                src={photo.url}
                /* Decorative: the button's own label already names the photo,
                   its position and its sender, and a second description here
                   would be read straight after it. */
                alt=""
                loading="lazy"
                decoding="async"
                /* The stage image is the one the member is waiting on. On open
                   the visible 56px thumbs would otherwise race it for
                   connections, and there is no smaller variant to point them
                   at, so they yield priority instead. */
                fetchPriority="low"
                referrerPolicy="no-referrer"
                draggable={false}
              />
              {photo.message.kind === "gif" && (
                <span className={styles.gifBadge} aria-hidden="true">
                  {t("messages:viewer.gifBadge")}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ThreadPhoto } from "./forum.data";
import { ForumPostImage } from "./ForumImageAttach";
import styles from "./ForumPostPhotos.module.css";

/**
 * The photos on a post: the opening post's gallery and a reply's alike, up to
 * four, in the order the author arranged them.
 *
 * ONE GALLERY, NO BRANCH ON THE OLD COLUMN. The backend reconciles the legacy
 * single `image` and the newer photo rows into this one list before it leaves
 * the server (a legacy photo arrives as a single entry carrying `id: null`), so
 * a post written years ago and a post written by the full-page composer render
 * through exactly the same code here. The `legacyImage` fallback below is for
 * the ONE case the gallery cannot cover: a demo fixture or an optimistic
 * just-posted reply, neither of which has been anywhere near the reconciler.
 *
 * EVERY FRAME RESERVES ITS SPACE. Each cell carries an `aspect-ratio` and the
 * image fills it, so a thread does not jump under the reader's thumb as the
 * photos decode. The layout is driven off the COUNT (`data-count`) rather than
 * a prop per arrangement: one photo runs wide, two split, three lead with one,
 * four make a square.
 */
export function ForumPostPhotos({
  photos,
  legacyImage,
}: {
  photos: ThreadPhoto[] | undefined;
  /** A local blob preview or a demo fixture's photo, for the surfaces that
   *  never went through the server's reconciliation. Ignored whenever the
   *  gallery has anything in it, so a post never draws the same photo twice. */
  legacyImage?: string;
}) {
  const { t } = useTranslation();
  const gallery = photos ?? [];

  if (!gallery.length) return <ForumPostImage src={legacyImage} />;

  const count = Math.min(gallery.length, 4);
  return (
    <ul className={styles.gallery} data-count={count}>
      {gallery.map((photo, photoIndex) => (
        <li
          // A legacy entry carries `id: null` and is always alone in its
          // gallery, so the index behind it is stable rather than positional
          // luck. Every other entry keys on its own row id.
          key={photo.id ?? `legacy-${photoIndex}`}
          className={styles.cell}
        >
          <img
            className={styles.photo}
            src={photo.url}
            // The author's own words when they wrote any. When they wrote
            // none, a generic label saying what the thing IS — never a
            // description invented on their behalf, which a screen reader
            // would read out as though the author had written it.
            alt={photo.alt ?? t("forum:post.imageAlt")}
            loading="lazy"
            decoding="async"
          />
        </li>
      ))}
    </ul>
  );
}

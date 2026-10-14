import { FiHeart } from "react-icons/fi";
import css from "./StudioLikedCover.module.css";

/** Liked songs' cover: a heart on the plum to coral gradient. Fills a
 *  positioned parent, like StudioPlaylistCover. Decorative: the name sits
 *  beside it. */
export function StudioLikedCover({ radius = 10 }: { radius?: number }) {
  return (
    <span className={css.cover} style={{ borderRadius: radius }} aria-hidden>
      <FiHeart className={css.heart} fill="currentColor" />
    </span>
  );
}

import { type RefObject } from "react";
import { FiHeart } from "react-icons/fi";
import { TbPin } from "react-icons/tb";
import styles from "./MessagesPage.module.css";

/**
 * The two full-height background layers revealed as a `MessagesThreadRow`
 * slides under `useThreadRowSwipe` — a leading (left) Pin affordance and a
 * trailing (right) Favorite affordance, sitting BEHIND the row's own opaque
 * `<button>` inside `.threadRowSwipeContainer`. Split out of
 * `MessagesThreadRow` purely to keep that component under the 200-line cap.
 *
 * Decorative only: the swipe is a touch enhancement layered on top of the
 * already-complete ⋯ menu (keyboard/AT users pin/favorite from there), so
 * these icons are `aria-hidden` and never focusable. Their opacity/scale are
 * driven by direct DOM writes from the gesture hook (see `leadingIconRef`/
 * `trailingIconRef`), never React state — this component only supplies the
 * stable nodes and their at-rest baseline style.
 */
export function ThreadRowSwipeAffordances({
  leadingIconRef,
  trailingIconRef,
}: {
  leadingIconRef: RefObject<HTMLSpanElement | null>;
  trailingIconRef: RefObject<HTMLSpanElement | null>;
}) {
  return (
    <>
      <div className={styles.threadRowSwipeLeading} aria-hidden="true">
        <span
          ref={leadingIconRef}
          className={styles.threadRowSwipeIcon}
          style={{ opacity: 0, transform: "scale(0.5)" }}
        >
          <TbPin aria-hidden />
        </span>
      </div>
      <div className={styles.threadRowSwipeTrailing} aria-hidden="true">
        <span
          ref={trailingIconRef}
          className={styles.threadRowSwipeIcon}
          style={{ opacity: 0, transform: "scale(0.5)" }}
        >
          <FiHeart aria-hidden />
        </span>
      </div>
    </>
  );
}

import type { StudioRangeBubbleRefs } from "./studioRange.types";
import styles from "./StudioRangeBubble.module.css";

/** The value bubble. The hover hook writes its position and text straight to the DOM. */
export function StudioRangeBubble({
  refs: { anchorRef, bubbleRef, detailRef, valueRef },
}: {
  refs: StudioRangeBubbleRefs;
}) {
  return (
    <div ref={anchorRef} className={styles.anchor} aria-hidden="true">
      <div ref={bubbleRef} className={styles.bubble}>
        <span ref={detailRef} className={styles.detail} data-empty="" />
        <span ref={valueRef} className={styles.value} />
      </div>
    </div>
  );
}

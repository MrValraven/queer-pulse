import type { ReactNode } from "react";
import { ModerationStanceNote } from "../safety/ModerationStanceNote";
import styles from "./AdminModerationPage.module.css";

/**
 * A worked queue with the standing "how we read these" note beside it.
 *
 * The note stays in front of whoever is deciding, every time, so it is never
 * folded away. On a wide pane it takes a sticky column to the right of the
 * queue, which lets the first report sit at the top of the screen; on a
 * narrower pane it stacks above the queue as before. It comes first in the
 * DOM either way, so a screen reader still meets it before the reports.
 */
export function ModerationQueueLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.queueLayout}>
      <div className={styles.queueGrid}>
        <div className={styles.queueGuide}>
          <ModerationStanceNote />
        </div>
        <div className={styles.queueMain}>{children}</div>
      </div>
    </div>
  );
}

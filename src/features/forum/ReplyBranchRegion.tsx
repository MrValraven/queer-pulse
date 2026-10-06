import type { ReactNode } from "react";
import {
  ReplyBranchHiddenContext,
  useIsReplyBranchHidden,
} from "./replyBranchVisibility";
import styles from "./ThreadPage.module.css";

/**
 * A run of branch rows that opens and closes smoothly: the height animates
 * through `grid-template-rows` (0fr to 1fr) and the rows fade with it, in pure
 * CSS. The rows stay mounted while closed, so collapsing never replays their
 * entrance animation and re-opening keeps every draft and scroll position.
 *
 * While closed the region is `inert`, so nothing in it can take focus or be
 * read out, and descendants learn through context that they are hidden.
 * `shouldAnimateOnMount` starts a freshly mounted region shut (via
 * `@starting-style`) so it opens in, the way "Continue this thread" does.
 */
export function ReplyBranchRegion({
  isOpen,
  shouldAnimateOnMount = false,
  children,
}: {
  isOpen: boolean;
  shouldAnimateOnMount?: boolean;
  children: ReactNode;
}) {
  const isAncestorHidden = useIsReplyBranchHidden();
  return (
    <ReplyBranchHiddenContext value={isAncestorHidden || !isOpen}>
      <div
        className={[
          styles.branchRegion,
          isOpen && styles.branchRegionOpen,
          shouldAnimateOnMount && styles.branchRegionEnters,
        ]
          .filter(Boolean)
          .join(" ")}
        inert={!isOpen}
      >
        <div className={styles.branchRegionInner}>{children}</div>
      </div>
    </ReplyBranchHiddenContext>
  );
}

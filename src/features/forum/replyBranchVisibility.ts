import { createContext, useContext } from "react";
import styles from "./ThreadPage.module.css";

/** True inside a collapsed (or not yet continued) branch of the reply tree.
 *  A collapsed branch stays mounted so it can animate shut and open again,
 *  and anything that would do work for a visible reply (a link preview's
 *  unfurl request) reads this to wait until the branch is shown. */
export const ReplyBranchHiddenContext = createContext(false);

export function useIsReplyBranchHidden(): boolean {
  return useContext(ReplyBranchHiddenContext);
}

/** Class names for one branch row. The row that ends the thread line gets
 *  `.replyBranchLast`, which fades out its straight continuation so the line
 *  stops at that row's elbow. It is set explicitly because the rows sit in
 *  separate animated regions, where `:last-child` cannot tell which row is
 *  the last one on screen. */
export function replyBranchRowClassName(
  isLastRow: boolean,
  modifier?: string,
): string {
  return [styles.replyBranch, modifier, isLastRow && styles.replyBranchLast]
    .filter(Boolean)
    .join(" ");
}

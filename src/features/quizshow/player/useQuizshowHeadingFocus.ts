import { useEffect, useRef } from "react";

/** Moves focus to the phone's heading each time `focusKey` changes, so a phase change
 *  lands keyboard and screen reader users on the new content. */
export function useQuizshowHeadingFocus(focusKey: string) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, [focusKey]);
  return headingRef;
}

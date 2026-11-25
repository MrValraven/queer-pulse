import { useContext, useEffect, useRef } from "react";
import { QuizshowTryOutContext } from "./quizshowTryOutContext";

/** The studio try-out's phone (item 55) marks its column with this attribute. */
const TRY_OUT_PHONE_SELECTOR = "[data-dry-run-phone]";

/** Moves focus to the phone's heading each time `focusKey` changes, so a phase change
 *  lands keyboard and screen reader users on the new content. In the studio's
 *  try-out it moves focus only while focus is already on the phone, so the
 *  host bar keeps it otherwise. */
export function useQuizshowHeadingFocus(focusKey: string) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isTryOut = useContext(QuizshowTryOutContext);
  useEffect(() => {
    const heading = headingRef.current;
    if (heading === null) return;
    if (isTryOut) {
      const phone = heading.closest(TRY_OUT_PHONE_SELECTOR);
      if (phone === null || !phone.contains(document.activeElement)) return;
    }
    heading.focus();
  }, [focusKey, isTryOut]);
  return headingRef;
}

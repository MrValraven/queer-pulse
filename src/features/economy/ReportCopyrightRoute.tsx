import { useEffect, useRef } from "react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Collapse } from "../../shared/components/ui";
import { useMediaQuery } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ReportListingModal.module.css";

/** The phone sheet's breakpoint (Modal.module.css), where the reason list
 *  can push the line below the fold. */
const PHONE_SHEET_QUERY = "(max-width: 719.98px)";
/** The shared Collapse's open time, so the scroll lands on its full height. */
const COLLAPSE_OPEN_MS = 280;

/** The line that stands in for the detail box while copyright routes to
 *  the claim form. The modal's primary button becomes the link. The live
 *  region stays mounted outside the Collapse, so the line is announced as
 *  it appears; on a phone the sheet scrolls it into view. */
export function ReportCopyrightRoute({
  isShown,
  href,
}: {
  isShown: boolean;
  href: string | null;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isPhoneSheet = useMediaQuery(PHONE_SHEET_QUERY);
  const lineRef = useRef<HTMLParagraphElement>(null);
  const isOpen = isShown && href !== null;
  const body = t("economy:housingListing.reportModal.copyrightRoute.body");

  useEffect(() => {
    if (!isOpen || !isPhoneSheet) return;
    const timer = window.setTimeout(
      () =>
        lineRef.current?.scrollIntoView({
          block: "nearest",
          behavior: reducedMotion ? "auto" : "smooth",
        }),
      reducedMotion ? 0 : COLLAPSE_OPEN_MS,
    );
    return () => window.clearTimeout(timer);
  }, [isOpen, isPhoneSheet, reducedMotion]);

  return (
    <>
      <p className="visuallyHidden" role="status">
        {isOpen ? body : ""}
      </p>
      <Collapse isOpen={isOpen}>
        <p ref={lineRef} className={styles.copyrightRoute}>
          {body}
        </p>
      </Collapse>
    </>
  );
}

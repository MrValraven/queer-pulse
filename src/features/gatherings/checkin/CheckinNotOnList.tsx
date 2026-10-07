import { useId, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiSearch } from "react-icons/fi";
import { MdQrCode2 } from "react-icons/md";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { InviteQrCode } from "../../auth/InviteQrCode";
import { gatheringShareUrl } from "../gatheringPaths";
import { EASE, keepOnFrameLoop } from "./checkinMotion";
import styles from "./CheckinNotOnList.module.css";

interface CheckinNotOnListProps {
  searchTerm: string;
  gatheringSlug: string;
  onClearSearch: () => void;
}

const CODE_VARIANTS = {
  closed: { height: 0, opacity: 0 },
  open: { height: "auto", opacity: 1 },
} as const;
const REDUCED_CODE_VARIANTS = {
  closed: { opacity: 0 },
  open: { opacity: 1 },
} as const;

/**
 * A search at the door that finds nobody. The person at the door may simply
 * not have RSVPed, so the main action shows them the gathering's code to scan
 * with their own phone; clearing the search (often a typo) sits beside it.
 * The code opens inside the panel and scrolls into view once it has opened.
 */
export function CheckinNotOnList({
  searchTerm,
  gatheringSlug,
  onClearSearch,
}: CheckinNotOnListProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const [isCodeOpen, setIsCodeOpen] = useState(false);
  const codePanelId = useId();
  const codePanelRef = useRef<HTMLDivElement>(null);

  const revealCodePanel = (definition: unknown) => {
    if (definition !== "open") return;
    codePanelRef.current?.scrollIntoView({
      block: "nearest",
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <div className={styles.notOnList}>
      <span className={styles.notOnListIcon} aria-hidden>
        <FiSearch />
      </span>
      <div className={styles.notOnListText} role="status">
        <h3 className={styles.notOnListTitle}>
          {t("gatherings:checkin.notOnList.title", { query: searchTerm })}
        </h3>
        <p className={styles.notOnListDescription}>
          {t("gatherings:checkin.notOnList.description")}
        </p>
      </div>
      <div className={styles.notOnListActions}>
        <Button
          type="button"
          aria-expanded={isCodeOpen}
          aria-controls={isCodeOpen ? codePanelId : undefined}
          onClick={() => setIsCodeOpen((wasOpen) => !wasOpen)}
        >
          <MdQrCode2 aria-hidden />{" "}
          {t("gatherings:checkin.notOnList.showCodeCta")}
        </Button>
        <Button type="button" variant="ghost" onClick={onClearSearch}>
          {t("gatherings:checkin.toolbar.clearSearch")}
        </Button>
      </div>
      <AnimatePresence initial={false}>
        {isCodeOpen && (
          <m.div
            key="rsvp-code"
            ref={codePanelRef}
            id={codePanelId}
            className={styles.codePanel}
            onUpdate={keepOnFrameLoop}
            variants={reducedMotion ? REDUCED_CODE_VARIANTS : CODE_VARIANTS}
            initial="closed"
            animate="open"
            exit="closed"
            transition={
              reducedMotion
                ? { duration: 0.12 }
                : { duration: 0.28, ease: EASE }
            }
            onAnimationComplete={revealCodePanel}
          >
            <div className={styles.codeInner}>
              <p className={styles.codeTitle}>
                {t("gatherings:checkin.notOnList.codeTitle")}
              </p>
              <InviteQrCode
                className={styles.code}
                value={gatheringShareUrl(gatheringSlug)}
                label={t("gatherings:checkin.notOnList.codeLabel")}
              />
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

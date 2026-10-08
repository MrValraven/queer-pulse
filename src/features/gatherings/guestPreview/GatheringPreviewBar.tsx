import { useEffect, useId, useRef, type RefObject } from "react";
import { FiEye } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { moveFocusTo } from "../../goTogether/card/goTogetherCardFocus";
import { useGatheringPreview } from "./gatheringPreviewContext";
import { GUEST_PREVIEW_ROLES, type GuestPreviewRole } from "./guestPreview";
import { useGuestPreviewNavigation } from "./useGuestPreviewNavigation";
import styles from "./GatheringPreviewBar.module.css";

const ROLE_LABEL_KEYS: Record<GuestPreviewRole, string> = {
  member: "gatherings:preview.role.member",
  going: "gatherings:preview.role.going",
  waitlisted: "gatherings:preview.role.waitlisted",
};

/** Read by the page's sticky sidebar, so it starts below the stuck bar. */
const PREVIEW_BAR_OFFSET_PROPERTY = "--preview-bar-offset";
/** The space the sidebar keeps below the stuck bar. */
const SIDEBAR_GAP_BELOW_BAR_PX = 16;

/**
 * Writes the bar's measured height, plus the gap below it, onto the bar's
 * parent as `--preview-bar-offset`, and keeps it current as the bar wraps or
 * its copy changes length. Removed again when the bar goes.
 */
function usePreviewBarOffset(
  barRef: RefObject<HTMLDivElement | null>,
  isPreviewing: boolean,
) {
  useEffect(() => {
    const bar = barRef.current;
    const container = bar?.parentElement;
    if (!isPreviewing || !bar || !container) return;
    const writeOffset = () => {
      const barHeight = bar.getBoundingClientRect().height;
      container.style.setProperty(
        PREVIEW_BAR_OFFSET_PROPERTY,
        `${Math.ceil(barHeight) + SIDEBAR_GAP_BELOW_BAR_PX}px`,
      );
    };
    writeOffset();
    // A layout-less environment (jsdom, a prerender pass) keeps the first
    // measurement.
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(writeOffset);
    observer?.observe(bar, { box: "border-box" });
    return () => {
      observer?.disconnect();
      container.style.removeProperty(PREVIEW_BAR_OFFSET_PROPERTY);
    };
  }, [barRef, isPreviewing]);
}

/**
 * The strip a host sees while previewing their gathering as a guest: which
 * guest they are looking as, a switch between the three, and the way out.
 * Its own buttons stay live inside the preview's click-catching region.
 * Switching replaces the history entry, so Back leaves the preview in one
 * step instead of walking through every view the host tried. The caption
 * sits below the sticky strip and scrolls away, so the strip stays short on
 * a phone.
 */
export function GatheringPreviewBar() {
  const { t } = useTranslation();
  const { viewAs } = useGatheringPreview();
  const { showAs, exitPreview } = useGuestPreviewNavigation();
  const labelId = useId();
  const barRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const isPreviewing = viewAs !== null;
  usePreviewBarOffset(barRef, isPreviewing);

  // Entering the preview unmounts the host menu that held focus, so focus
  // lands on the bar's label once and a screen reader hears where it is.
  // Switching perspective keeps focus on the pressed option instead.
  useEffect(() => {
    if (isPreviewing) moveFocusTo(labelRef.current);
  }, [isPreviewing]);

  if (viewAs === null) return null;

  return (
    <>
      <div
        ref={barRef}
        className={styles.bar}
        // The value of `PREVIEW_ALLOW_ATTRIBUTE`: the bar's own buttons stay live.
        data-preview-allow=""
      >
        <div className={styles.row}>
          <span
            ref={labelRef}
            id={labelId}
            className={styles.label}
            tabIndex={-1}
          >
            <FiEye aria-hidden /> {t("gatherings:preview.barLabel")}
          </span>
          <div role="group" aria-labelledby={labelId} className={styles.switch}>
            {GUEST_PREVIEW_ROLES.map((role) => (
              <button
                key={role}
                type="button"
                className={styles.option}
                aria-pressed={viewAs === role}
                onClick={() => showAs(role)}
              >
                {t(ROLE_LABEL_KEYS[role])}
              </button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={styles.exit}
            onClick={exitPreview}
          >
            {t("gatherings:preview.exitCta")}
          </Button>
        </div>
      </div>
      <p className={styles.caption}>{t("gatherings:preview.caption")}</p>
    </>
  );
}

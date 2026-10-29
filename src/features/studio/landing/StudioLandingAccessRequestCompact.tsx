import { useRef } from "react";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { Button, Collapse, SkeletonLine } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  useFocusOnArrival,
  useStudioLandingAccessActions,
} from "./useStudioLandingAccessActions";
import styles from "./StudioLandingCta.module.css";

interface StudioLandingAccessRequestCompactProps {
  placement: "closing" | "artists";
  /** What the request posts as `wantsToRelease`. */
  wantsToRelease: boolean;
}

/**
 * The member CTA in the For artists section and the closing: the request
 * button alone before a request, one on-list line after it. The full block
 * with the member note, the "I make music" choice and Cancel request lives
 * in the hero only. Each state folds in its own Collapse; the always-mounted
 * status region speaks a sent request, and focus moves to the on-list line
 * once it has mounted, since the button pressed folded away.
 */
export function StudioLandingAccessRequestCompact({
  placement,
  wantsToRelease,
}: StudioLandingAccessRequestCompactProps) {
  const { t } = useTranslation();
  const actions = useStudioLandingAccessActions();
  const onListRef = useRef<HTMLParagraphElement>(null);
  useFocusOnArrival(actions, "onList", actions.isOnList, onListRef);
  const placementClass =
    placement === "closing" ? styles.accessCentred : styles.accessStart;

  return (
    <div className={`${styles.access} ${styles.compact} ${placementClass}`}>
      <Collapse isOpen={actions.isChecking}>
        <div className={styles.checking}>
          <SkeletonLine width={36} height={10} />
          <span>{t("studio:landing.cta.checking")}</span>
        </div>
      </Collapse>
      <Collapse isOpen={actions.hasNoRequest}>
        <div className={styles.compactBlock}>
          <Button
            variant="primary"
            size="lg"
            onClick={() => actions.sendRequest(wantsToRelease)}
            aria-busy={actions.isRequestPending || undefined}
          >
            {t("studio:landing.cta.requestAccess")}
            <FiArrowRight aria-hidden="true" />
          </Button>
          <Collapse isOpen={actions.requestFailure !== null}>
            <p role="alert" className={styles.failure}>
              {actions.requestFailure}
            </p>
          </Collapse>
        </div>
      </Collapse>
      <Collapse isOpen={actions.isOnList}>
        <p ref={onListRef} tabIndex={-1} className={styles.onListLine}>
          <FiCheckCircle aria-hidden="true" className={styles.onListIcon} />
          {t("studio:landing.cta.onList.title")}
        </p>
      </Collapse>
      <p role="status" className="visuallyHidden">
        {actions.announcement}
      </p>
    </div>
  );
}

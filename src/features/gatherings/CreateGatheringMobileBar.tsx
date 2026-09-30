import { createPortal } from "react-dom";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./CreateGatheringShell.module.css";

export interface CreateGatheringMobileBarProps {
  metRequiredCount: number;
  requiredCount: number;
  checkedCount: number;
  pledgeCount: number;
  isReady: boolean;
  /** Open the review chapter with focus on its head. */
  onReview: () => void;
}

/**
 * The plum bar pinned to the bottom of a narrow screen: progress on the left,
 * and on the right Review, which opens the review chapter. The page mounts it
 * only at or under 900px and while the review chapter is closed, since that
 * chapter carries its own Publish and hint.
 *
 * Portalled to `document.body`, so no transformed ancestor can turn its
 * `position: fixed` into a position inside the page.
 */
export function CreateGatheringMobileBar({
  metRequiredCount,
  requiredCount,
  checkedCount,
  pledgeCount,
  isReady,
  onReview,
}: CreateGatheringMobileBarProps) {
  const { t } = useTranslation();
  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      className={styles.mobileBar}
      role="region"
      aria-label={t("gatherings:create.v2.mobileBar.label")}
    >
      <p className={styles.mobileBarText}>
        {isReady ? (
          <Translation
            i18nKey="gatherings:create.v2.mobileBar.ready"
            components={{ strong: <strong /> }}
          />
        ) : (
          <Translation
            i18nKey="gatherings:create.v2.mobileBar.progress"
            values={{
              met: metRequiredCount,
              total: requiredCount,
              checked: checkedCount,
              pledges: pledgeCount,
            }}
            components={{ strong: <strong /> }}
          />
        )}
      </p>
      <Button className={styles.mobileBarButton} onClick={onReview}>
        {t("gatherings:create.v2.mobileBar.review")}
      </Button>
    </div>,
    document.body,
  );
}

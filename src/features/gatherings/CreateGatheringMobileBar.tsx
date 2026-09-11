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
  isPublishing: boolean;
  /** Same handler as the ready panel's publish button. */
  onPublish: () => void;
}

/**
 * The plum bar pinned to the bottom of a narrow screen: progress on the left,
 * Publish on the right. The page mounts it only at or under 900px.
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
  isPublishing,
  onPublish,
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
      <Button
        className={styles.mobileBarButton}
        aria-disabled={!isReady || isPublishing}
        onClick={onPublish}
      >
        {isPublishing
          ? t("gatherings:create.v2.ready.publishing")
          : t("gatherings:create.v2.mobileBar.publish")}
      </Button>
    </div>,
    document.body,
  );
}

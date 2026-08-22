import { useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useUnfreezeCommunity } from "./api/useCommunityMutations";
import styles from "./CommunityFrozenBanner.module.css";

/**
 * Shown on a community's hub while it is auto-frozen pending report review (see
 * the backend `Community.frozenAt`). Explains to everyone why new posts/joins
 * are paused; owner/mods get an "Unfreeze" action once they've handled the
 * reports. Optimistically hides itself on a successful unfreeze in both modes —
 * live also refetches the detail unfrozen, demo (static data) relies on this.
 */
export function CommunityFrozenBanner({
  slug,
  canManage,
}: {
  slug: string;
  canManage: boolean;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const unfreeze = useUnfreezeCommunity();
  const [lifted, setLifted] = useState(false);

  if (lifted) return null;

  return (
    <div className={styles.banner} role="status">
      <span className={styles.icon} aria-hidden>
        <FiAlertTriangle />
      </span>
      <div className={styles.text}>
        <div className={styles.title}>
          {t("communities:detail.frozen.title")}
        </div>
        <p className={styles.body}>{t("communities:detail.frozen.body")}</p>
      </div>
      {canManage && (
        <Button
          variant="ghost"
          size="sm"
          disabled={unfreeze.isPending}
          onClick={() =>
            unfreeze.mutate(
              { slug },
              {
                onSuccess: () => setLifted(true),
                onError: () =>
                  showToast(t("communities:detail.frozen.errorToast"), "error"),
              },
            )
          }
        >
          {t("communities:detail.frozen.unfreezeCta")}
        </Button>
      )}
    </div>
  );
}

import { FiAlertCircle } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Collapse } from "../../shared/components/ui/Collapse";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import type { useAdminInviteQuotas } from "./api/useAdminInvites";
import { describeInviteQuotaLoadError } from "./adminInviteQuotaErrors";
import styles from "./AdminInviteQuotaModal.module.css";

/**
 * Under the rows: how many of the matching members are showing, a "Load more
 * members" button while the server holds more, and the reason when loading
 * the next page failed (the button then retries it).
 */
export function AdminInviteQuotaListFooter({
  quotas,
}: {
  quotas: ReturnType<typeof useAdminInviteQuotas>;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const shownCount = quotas.members.length;
  const isEverythingShown = shownCount >= quotas.total;
  const shownFigure = (
    <RollingNumber value={fmt.number(shownCount)} numericValue={shownCount} />
  );
  const totalFigure = (
    <RollingNumber
      value={fmt.number(quotas.total)}
      numericValue={quotas.total}
    />
  );
  const isLoadingMore = quotas.isFetchingNextPage;

  return (
    <div className={styles.listFooter}>
      <p className={styles.countLine}>
        {isEverythingShown ? (
          <Translation
            i18nKey="admin:adminInvites.quota.countAll"
            values={{ count: quotas.total }}
            slots={{ count: totalFigure }}
          />
        ) : (
          <Translation
            i18nKey="admin:adminInvites.quota.countPartial"
            values={{ count: quotas.total, shown: shownCount }}
            slots={{ shown: shownFigure, count: totalFigure }}
          />
        )}
      </p>
      <Collapse isOpen={quotas.isFetchNextPageError}>
        <p role="alert" className={styles.footerError}>
          <FiAlertCircle aria-hidden className={styles.editorErrorIcon} />
          <span>
            {t("admin:adminInvites.quota.error.loadMore", {
              reason: describeInviteQuotaLoadError(quotas.error, t),
            })}
          </span>
        </p>
      </Collapse>
      <Collapse isOpen={quotas.hasNextPage}>
        <div className={styles.loadMore}>
          <Button
            variant="ghost"
            size="sm"
            aria-disabled={isLoadingMore || undefined}
            onClick={() => {
              if (!isLoadingMore) void quotas.fetchNextPage();
            }}
          >
            {isLoadingMore
              ? t("admin:adminInvites.quota.loadingMore")
              : t("admin:adminInvites.quota.loadMoreCta")}
          </Button>
        </div>
      </Collapse>
    </div>
  );
}

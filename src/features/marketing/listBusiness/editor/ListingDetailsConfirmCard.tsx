import { FiCheck, FiCheckCircle } from "react-icons/fi";
import { Button } from "../../../../shared/components/ui";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useFormat } from "../../../../shared/i18n/format";
import { relativeAgo } from "../../../../shared/lib/relativeAgo";
import { useConfirmListingDetails } from "../api/useListingOwnerState";
import {
  detailsFreshness,
  type DetailsFreshness,
} from "./listingOperatingState.data";
import styles from "./ListingTrading.module.css";

/** Tone per freshness tier. Lives here, not in the data file, because the
 *  values are this CSS module's own class names. */
const FRESHNESS_CLASS: Record<DetailsFreshness, string | undefined> = {
  fresh: styles.confirmFresh,
  ageing: styles.confirmAgeing,
  stale: styles.confirmStale,
};

/**
 * "Still accurate?": one button that costs an owner nothing and tells every
 * reader the listing was vouched for recently.
 *
 * A directory rots quietly: the entry nobody has looked at in two years is the
 * one that sends someone to a closed door. So the ask escalates with the age of
 * the last confirmation instead of nagging from day one: a quiet aside while
 * it is fresh, a plain prompt at three months, and the loudest thing on the
 * page once it is past six or was never confirmed at all.
 */
export function ListingDetailsConfirmCard({
  listingRef,
  detailsConfirmedAt,
}: {
  listingRef: string;
  detailsConfirmedAt: string | null;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const confirmDetails = useConfirmListingDetails(listingRef);
  const freshness = detailsFreshness(detailsConfirmedAt);

  const confirm = () => {
    confirmDetails.mutate(undefined, {
      onSuccess: () =>
        showToast(t("marketing:listBusiness.confirmDetails.toast"), "success"),
      onError: () =>
        showToast(t("marketing:listBusiness.confirmDetails.error"), "error"),
    });
  };

  return (
    <section
      className={[styles.confirmCard, FRESHNESS_CLASS[freshness]]
        .filter(Boolean)
        .join(" ")}
      aria-labelledby="lb-confirm-details-title"
    >
      <span className={styles.confirmIcon}>
        {freshness === "fresh" ? (
          <FiCheckCircle aria-hidden />
        ) : (
          <FiCheck aria-hidden />
        )}
      </span>
      <div className={styles.confirmText}>
        <p id="lb-confirm-details-title" className={styles.confirmTitle}>
          {t(`marketing:listBusiness.confirmDetails.title.${freshness}`)}
        </p>
        <p className={styles.confirmSub}>
          {detailsConfirmedAt
            ? t("marketing:listBusiness.confirmDetails.lastConfirmed", {
                when: relativeAgo(detailsConfirmedAt, t, fmt, {
                  justNow: "marketing:listBusiness.confirmDetails.justNow",
                  unknown: "marketing:listBusiness.confirmDetails.unknownWhen",
                }),
              })
            : t("marketing:listBusiness.confirmDetails.never")}
        </p>
      </div>
      <Button
        variant={freshness === "stale" ? "primary" : "ghost"}
        size="sm"
        onClick={confirm}
        disabled={confirmDetails.isPending}
      >
        {confirmDetails.isPending
          ? t("marketing:listBusiness.confirmDetails.saving")
          : t("marketing:listBusiness.confirmDetails.cta")}
      </Button>
    </section>
  );
}

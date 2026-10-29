import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioLine } from "./StudioSkeletons";
import css from "./StudioPayments.module.css";

/** The first paint of a payments list: three rows of lines. */
export function StudioPaymentsListSkeleton() {
  const { t } = useTranslation();
  return (
    <div
      className={css.skeleton}
      role="status"
      aria-label={t("studio:loading.detail")}
    >
      {[0, 1, 2].map((line) => (
        <div key={line}>
          <StudioLine width="45%" height={16} />
          <StudioLine width="30%" height={12} style={{ marginTop: 8 }} />
        </div>
      ))}
    </div>
  );
}

/** The sales totals' first paint: two cards the shape of the real ones, so
 *  the totals fold in at their own height. Decorative; the list skeleton
 *  below carries the loading status. */
export function StudioPaymentsTotalsSkeleton() {
  return (
    <div className={css.totals} aria-hidden="true">
      {[0, 1].map((card) => (
        <div key={card} className={css.total}>
          <StudioLine width="50%" height={12} />
          <StudioLine width="40%" height={28} style={{ marginTop: 6 }} />
          <StudioLine width="30%" height={12} style={{ marginTop: 6 }} />
        </div>
      ))}
    </div>
  );
}

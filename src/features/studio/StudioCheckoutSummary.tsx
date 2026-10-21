import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  PLAN_LINES,
  PLAN_ARTIST_SHARE_PERCENT,
  PLAN_PLATFORM_SHARE_PERCENT,
  REASSURE_KEYS,
} from "./studioCheckout.data";
import s from "./studioPages.module.css";

/** The order summary beside the checkout form. */
export function StudioCheckoutSummary({ priceLabel }: { priceLabel: string }) {
  const { t } = useTranslation();
  return (
    <aside className={s.summary}>
      <div className={s.sumH}>
        <Translation
          i18nKey="studio:checkout.membershipLabel"
          components={{ em: <em /> }}
          values={{ name: t("studio:checkout.planName") }}
        />
      </div>
      {PLAN_LINES.map((line) => (
        <div key={line.labelKey} className={s.sumLine}>
          <span>{t(line.labelKey)}</span>
          <span>
            {line.valueKey
              ? t(line.valueKey)
              : line.labelKey === "studio:checkout.lines.artistShare"
                ? `${PLAN_ARTIST_SHARE_PERCENT}%`
                : `${PLAN_PLATFORM_SHARE_PERCENT}%`}
          </span>
        </div>
      ))}
      <div className={s.sumTotal}>
        <span>{t("studio:checkout.dueTodayLabel")}</span>
        <span>{priceLabel}</span>
      </div>
      <p className={s.sumNote}>
        {REASSURE_KEYS.map((key) => (
          <span key={key} style={{ display: "block", marginBottom: 6 }}>
            ·{" "}
            {key === "studio:checkout.reassure.share"
              ? t(key, { percent: PLAN_ARTIST_SHARE_PERCENT })
              : t(key)}
          </span>
        ))}
      </p>
    </aside>
  );
}

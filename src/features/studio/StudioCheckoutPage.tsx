import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { FiCheck, FiArrowRight } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { StudioShell } from "./StudioShell";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  PLAN_PRICE,
  PLAN_LINES,
  PLAN_ARTIST_SHARE_PERCENT,
  PLAN_PLATFORM_SHARE_PERCENT,
  REASSURE_KEYS,
} from "./studioCheckout.data";
import ss from "./studio.module.css";
import s from "./studioPages.module.css";

export function StudioCheckoutPage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const [done, setDone] = useState(false);

  const priceLabel = fmt.currency(PLAN_PRICE);
  const cadenceLabel = t("studio:checkout.cadenceMonthly");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setDone(true);
    showToast(t("studio:checkout.doneToast"));
  }

  if (done) {
    return (
      <StudioShell>
        <div className={`${s.done} ${s.screenIn}`} key="done">
          <div className={s.doneIcon}>
            <FiCheck />
          </div>
          <h1>
            <Translation
              i18nKey="studio:checkout.doneTitle"
              components={{ em: <em /> }}
            />
          </h1>
          <p>{t("studio:checkout.doneBody", { amount: priceLabel })}</p>
          <div className={s.doneActions}>
            <Link to={routes.studio} className={ss.btP}>
              {t("studio:checkout.startListeningCta")} <FiArrowRight aria-hidden />
            </Link>
            <Link to={routes.studioLibrary} className={ss.bt}>
              {t("studio:checkout.goToLibraryCta")}
            </Link>
          </div>
        </div>
      </StudioShell>
    );
  }

  return (
    <StudioShell>
      <div className={s.pageH}>
        <div className={s.eb}>{t("studio:checkout.eyebrow")}</div>
        <h1>
          <Translation
            i18nKey="studio:checkout.title"
            components={{ em: <em /> }}
          />
        </h1>
        <div className={s.dek}>{t("studio:checkout.dek")}</div>
      </div>

      <div className={s.coGrid}>
        <form onSubmit={handleSubmit}>
          <div className={s.coField}>
            <label className={s.coLabel} htmlFor="co-name">
              {t("studio:checkout.nameLabel")}
            </label>
            <input
              id="co-name"
              className={s.coInput}
              type="text"
              placeholder={t("studio:checkout.namePlaceholder")}
              required
            />
          </div>
          <div className={s.coField}>
            <label className={s.coLabel} htmlFor="co-card">
              {t("studio:checkout.cardLabel")}
            </label>
            <input
              id="co-card"
              className={s.coInput}
              inputMode="numeric"
              placeholder={t("studio:checkout.cardPlaceholder")}
              required
            />
          </div>
          <div className={s.coRow}>
            <div className={s.coField}>
              <label className={s.coLabel} htmlFor="co-exp">
                {t("studio:checkout.expiryLabel")}
              </label>
              <input
                id="co-exp"
                className={s.coInput}
                placeholder={t("studio:checkout.expiryPlaceholder")}
                required
              />
            </div>
            <div className={s.coField}>
              <label className={s.coLabel} htmlFor="co-cvc">
                {t("studio:checkout.cvcLabel")}
              </label>
              <input
                id="co-cvc"
                className={s.coInput}
                inputMode="numeric"
                placeholder="123"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className={ss.btP}
            style={{ width: "100%", marginTop: 8 }}
          >
            {t("studio:checkout.payCta", {
              amount: priceLabel,
              cadence: cadenceLabel,
            })}{" "}
            <FiArrowRight aria-hidden />
          </button>
          <p className={s.sumNote}>{t("studio:checkout.prototypeNote")}</p>
        </form>

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
      </div>
    </StudioShell>
  );
}

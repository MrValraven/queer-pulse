import { FormField } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ANCHOR, DAYS, validateSocials } from "./listBusiness.data";
import type { ListingForm } from "./useListingForm";
import { PaneHeader } from "./ListBusinessChrome";
import { ListBusinessLocationField } from "./ListBusinessLocationField";
import styles from "./ListBusinessPage.module.css";

const SOCIALS: {
  key: "instagram" | "website" | "email" | "phone";
  type: string;
  placeholderKey: string;
  errKey: string;
}[] = [
  {
    key: "instagram",
    type: "text",
    placeholderKey: "marketing:listBusiness.social.instagram.placeholder",
    errKey: "",
  },
  {
    key: "website",
    type: "url",
    placeholderKey: "marketing:listBusiness.social.website.placeholder",
    errKey: "marketing:listBusiness.social.website.err",
  },
  {
    key: "email",
    type: "email",
    placeholderKey: "marketing:listBusiness.social.email.placeholder",
    errKey: "marketing:listBusiness.social.email.err",
  },
  {
    key: "phone",
    type: "tel",
    placeholderKey: "marketing:listBusiness.social.phone.placeholder",
    errKey: "marketing:listBusiness.social.phone.err",
  },
];

export function StepPractical({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const { draft, set, setDay, copyMonToAll, clearHours, setSocial } = form;
  const socialOk = validateSocials(draft.social);
  const anyOpen = DAYS.some((d) => draft.hours[d.id]?.open);

  return (
    <div className={styles.stepBody}>
      <PaneHeader
        title={t("marketing:listBusiness.step3.title")}
        em={t("marketing:listBusiness.step3.em")}
        sub={t("marketing:listBusiness.step3.sub")}
      />

      <ListBusinessLocationField draft={draft} set={set} />

      <h3 className={styles.groupH}>
        {t("marketing:listBusiness.step3.hoursHeading")}
      </h3>
      <div className={styles.hoursSection}>
        <div className={styles.hoursTools}>
        <span
          className={[
            styles.openNow,
            anyOpen ? styles.openNowOpen : styles.openNowClosed,
          ].join(" ")}
        >
          {anyOpen
            ? t("marketing:listBusiness.step3.hasOpenHours")
            : t("marketing:listBusiness.step3.allClosed")}
        </span>
        <button
          type="button"
          className={styles.hoursToolBtn}
          onClick={copyMonToAll}
        >
          {t("marketing:listBusiness.step3.copyMonday")}
        </button>
        <button
          type="button"
          className={styles.hoursToolBtn}
          onClick={clearHours}
        >
          {t("marketing:listBusiness.step3.markAllClosed")}
        </button>
      </div>
      <div id={ANCHOR.hours} className={styles.hoursGrid}>
        {DAYS.map((d) => {
          const h = draft.hours[d.id]!;
          const dayLabel = t(d.labelKey);
          return (
            <div key={d.id} className={styles.hrow}>
              <span className={styles.hday}>{dayLabel}</span>
              <button
                type="button"
                aria-pressed={h.open}
                className={[styles.htg, h.open && styles.htgOpen]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setDay(d.id, { open: !h.open })}
              >
                {h.open
                  ? t("marketing:listBusiness.step3.open")
                  : t("marketing:listBusiness.step3.closed")}
              </button>
              <div className={styles.htimes}>
                {h.open ? (
                  <>
                    <input
                      type="time"
                      value={h.from}
                      aria-label={t("marketing:listBusiness.step3.opensAria", {
                        day: dayLabel,
                      })}
                      onChange={(e) => setDay(d.id, { from: e.target.value })}
                    />
                    <span className={styles.dash}>–</span>
                    <input
                      type="time"
                      value={h.to}
                      aria-label={t("marketing:listBusiness.step3.closesAria", {
                        day: dayLabel,
                      })}
                      onChange={(e) => setDay(d.id, { to: e.target.value })}
                    />
                  </>
                ) : (
                  <span className={styles.closedLbl}>
                    {t("marketing:listBusiness.step3.closed")}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        </div>
      </div>
      <FormField
        className={styles.lbField}
        label={t("marketing:listBusiness.step3.hoursNoteLabel")}
      >
        <input
          type="text"
          maxLength={80}
          placeholder={t("marketing:listBusiness.step3.hoursNotePlaceholder")}
          value={draft.hoursNote}
          onChange={(e) => set({ hoursNote: e.target.value })}
        />
      </FormField>

      <h3 className={styles.groupH}>
        {t("marketing:listBusiness.step3.onlineHeading")}
      </h3>
      <p className={styles.onlineHint}>
        {t("marketing:listBusiness.step3.onlineHint")}
      </p>
      <div id={ANCHOR.social} className={styles.twoCol}>
        {SOCIALS.map((s) => {
          const value = draft.social[s.key];
          const valid = socialOk[s.key];
          return (
            <FormField
              key={s.key}
              className={styles.lbField}
              error={!valid && s.errKey ? t(s.errKey) : undefined}
            >
              <input
                type={s.type}
                aria-invalid={!valid}
                placeholder={t(s.placeholderKey)}
                value={value}
                onChange={(e) => setSocial(s.key, e.target.value)}
              />
            </FormField>
          );
        })}
      </div>
    </div>
  );
}

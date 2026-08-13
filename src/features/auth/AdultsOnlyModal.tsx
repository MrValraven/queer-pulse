import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Button, ModalSheet } from "../../shared/components/ui";
import s from "./AdultsOnlyModal.module.css";

/**
 * The "here's why we're 18+" explainer in a bottom-up sheet — so someone at the
 * age check can read why QueerPulse is adults-only without leaving the form and
 * losing what they've typed. `ModalSheet` rises from the bottom on mobile and
 * centers on desktop, scroll-locks the page behind, and traps focus. It carries
 * no built-in title, so we supply the eyebrow/serif title here above the copy.
 */
export function AdultsOnlyModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <ModalSheet onClose={onClose} ariaLabel={t("auth:adultsOnly.ariaLabel")}>
      <div className={s.head}>
        <div className={s.eyebrow}>{t("auth:adultsOnly.eyebrow")}</div>
        <h2 className={s.title}>
          <Translation
            i18nKey="auth:adultsOnly.title"
            components={{ em: <em /> }}
          />
        </h2>
      </div>
      <div className={s.body}>
        <p>{t("auth:adultsOnly.body1")}</p>
        <p>{t("auth:adultsOnly.body2")}</p>
        <p className={s.reassure}>{t("auth:adultsOnly.reassure")}</p>
      </div>
      <div className={s.footer}>
        <Button variant="primary" onClick={onClose}>
          {t("auth:adultsOnly.done")}
        </Button>
      </div>
    </ModalSheet>
  );
}

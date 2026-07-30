import { FiHeart } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import modal from "../economy/ApplicationModals.module.css";

/**
 * Live-mode donation panel. There is no payment processor wired up yet, so in
 * LIVE mode we never render the card/expiry/CVC form (which previously fed a
 * fake `setTimeout` "success" without charging or storing anything). Instead we
 * say so plainly on the plum success surface and point people at the real
 * spending figures. The mock card flow still runs in demo mode.
 */
export function DonateComingSoon() {
  const { t } = useTranslation();
  return (
    <div className={modal.success}>
      <div className={modal.successIcon}>
        <FiHeart size={26} color="var(--jade)" aria-hidden />
      </div>
      <h2>
        <Translation
          i18nKey="marketing:donateModal.comingSoon.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p>{t("marketing:donateModal.comingSoon.body")}</p>
      <div className={modal.successBtn}>
        <Button size="lg" variant="ghost-dark" to={routes.transparencyReport}>
          {t("marketing:donateModal.comingSoon.figuresCta")}
        </Button>
      </div>
    </div>
  );
}

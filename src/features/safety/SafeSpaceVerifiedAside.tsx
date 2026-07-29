import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { type VerifiedSpace } from "./safeSpaces";
import styles from "./SafeSpaceDetailPage.module.css";

/** The right-hand sidebar of a verified safe space: address, at-a-glance
 *  facts, and the copy-link share card. */
export function SafeSpaceVerifiedAside({ space }: { space: VerifiedSpace }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const share = () => {
    if (navigator.clipboard)
      void navigator.clipboard.writeText(window.location.href);
    showToast(t("safety:spaces.detail.linkCopiedToast"), "success");
  };

  return (
    <aside className={styles.side}>
      <div className={styles.sideCard}>
        <h4>{t("safety:spaces.detail.whereTitle")}</h4>
        <div className={styles.addr}>
          <b>{space.name}</b>
          {space.address}
        </div>
        <Button
          variant="ghost"
          className={styles.sideFull}
          to={routes.safeSpaces}
        >
          {t("safety:spaces.detail.backAllCta")}
        </Button>
      </div>

      <div className={styles.sideCard}>
        <h4>{t("safety:spaces.detail.glanceTitle")}</h4>
        {space.glance.map((g) => (
          <div className={styles.sideRow} key={g.label}>
            <span>{g.label}</span>
            <b className={g.accent ? styles.accentV : undefined}>{g.value}</b>
          </div>
        ))}
      </div>

      <div className={[styles.sideCard, styles.sharePlum].join(" ")}>
        <h4>{t("safety:spaces.detail.shareTitle")}</h4>
        <p>{t("safety:spaces.detail.shareBody")}</p>
        <Button variant="ghost-dark" className={styles.sideFull} onClick={share}>
          {t("safety:spaces.detail.copyLinkCta")}
        </Button>
      </div>
    </aside>
  );
}

import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./InvitePage.module.css";

interface SharePreviewCardProps {
  senderName: string;
  description: string;
  url: string;
}

/**
 * Pixel-accurate mock of how the invite link unfurls when pasted into a
 * messaging app — a `summary_large_image` card (hero + title + description +
 * domain). Mirrors the static Open Graph tags in index.html.
 */
export function SharePreviewCard({
  senderName,
  description,
  url,
}: SharePreviewCardProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.previewWrap}>
      <div className={styles.previewHero} aria-hidden>
        <div className={styles.previewHeroBrand}>
          {"Queer"}
          <em>{"Pulse"}</em>
        </div>
        <div className={styles.previewHeroTitle}>
          {t("auth:sharePreview.heroTitle.line1")} <br />
          <Translation
            i18nKey="auth:sharePreview.heroTitle.line2"
            components={{ em: <em /> }}
          />
        </div>
        <div className={styles.previewHeroExplainer}>
          {t("auth:sharePreview.heroExplainer")}
        </div>
        <div className={styles.previewHeroSub}>
          {t("auth:sharePreview.heroSub")}
        </div>
      </div>
      <div className={styles.previewMeta}>
        <div className={styles.previewDomain}>{url.split("/")[0]}</div>
        <div className={styles.previewTitle}>
          {t("auth:sharePreview.title", { senderName })}
        </div>
        <div className={styles.previewDesc}>{description}</div>
      </div>
    </div>
  );
}

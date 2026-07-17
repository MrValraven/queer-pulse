import { FiHeart } from "react-icons/fi";
import { DocPreview } from "./tools/DocPreview";
import { TAX_DISCLAIMER } from "./tax.constants";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SlidingScale } from "./slidingScale.data";
import styles from "./SlidingScalePage.module.css";

interface SlidingScalePreviewProps {
  scale: SlidingScale;
  makerName: string;
}

/** The branded, printable sliding-scale price card. */
export function SlidingScalePreview({
  scale,
  makerName,
}: SlidingScalePreviewProps) {
  const { t } = useTranslation();
  const scaleDisclaimer = `${t("economy:slidingScale.disclaimer")} ${TAX_DISCLAIMER}`;

  return (
    <DocPreview>
      <header className={styles.docHead}>
        <p className={styles.docMaker}>
          {makerName || t("economy:slidingScale.preview.yourNameFallback")}
        </p>
        <p className={styles.docKind}>
          {t("economy:slidingScale.preview.kind")}
        </p>
      </header>

      <h2 className={styles.docTitle}>
        {scale.service ? (
          <>
            <em>{scale.service}</em>
          </>
        ) : (
          t("economy:slidingScale.preview.offeringFallback")
        )}
      </h2>

      {scale.intro.trim() && <p className={styles.docIntro}>{scale.intro}</p>}

      <div className={styles.tiers}>
        {scale.tiers.map((tier) => (
          <div key={tier.id} className={styles.tier}>
            <p className={styles.tierName}>
              {tier.name || t("economy:slidingScale.preview.tierFallback")}
            </p>
            <p className={styles.tierPrice}>
              {tier.price || t("economy:slidingScale.preview.priceFallback")}
            </p>
            <p className={styles.tierFor}>{tier.forWhom}</p>
          </div>
        ))}
      </div>

      <p className={styles.docOutro}>
        <FiHeart className={styles.outroIcon} aria-hidden />{" "}
        {t("economy:slidingScale.preview.outro")}
      </p>

      <footer className={styles.docFoot}>{scaleDisclaimer}</footer>
    </DocPreview>
  );
}

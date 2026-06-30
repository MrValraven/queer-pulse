import { FiHeart } from "react-icons/fi";
import { DocPreview } from "./tools/DocPreview";
import { TAX_DISCLAIMER } from "./tax.constants";
import type { SlidingScale } from "./slidingScale.data";
import styles from "./SlidingScalePage.module.css";

/**
 * Reword the shared tax/legal note as a gentle reminder that these prices are
 * the maker's own choice, not a fixed market rate.
 */
const SCALE_DISCLAIMER =
  "These tiers are this maker’s own pricing — a sliding scale offered in good faith, " +
  "not a fixed market rate or a means test. " +
  TAX_DISCLAIMER;

interface SlidingScalePreviewProps {
  scale: SlidingScale;
  makerName: string;
}

/** The branded, printable sliding-scale price card. */
export function SlidingScalePreview({
  scale,
  makerName,
}: SlidingScalePreviewProps) {
  return (
    <DocPreview>
      <header className={styles.docHead}>
        <p className={styles.docMaker}>{makerName || "Your name"}</p>
        <p className={styles.docKind}>Sliding scale</p>
      </header>

      <h2 className={styles.docTitle}>
        {scale.service ? (
          <>
            <em>{scale.service}</em>
          </>
        ) : (
          "Your offering"
        )}
      </h2>

      {scale.intro.trim() && <p className={styles.docIntro}>{scale.intro}</p>}

      <div className={styles.tiers}>
        {scale.tiers.map((tier) => (
          <div key={tier.id} className={styles.tier}>
            <p className={styles.tierName}>{tier.name || "Tier"}</p>
            <p className={styles.tierPrice}>{tier.price || "—"}</p>
            <p className={styles.tierFor}>{tier.forWhom}</p>
          </div>
        ))}
      </div>

      <p className={styles.docOutro}>
        <FiHeart className={styles.outroIcon} aria-hidden /> Pay the tier
        that&apos;s honest for you. Choosing higher keeps this work open to
        everyone.
      </p>

      <footer className={styles.docFoot}>{SCALE_DISCLAIMER}</footer>
    </DocPreview>
  );
}

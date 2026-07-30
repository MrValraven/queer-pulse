import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SafeSpaceTickIcon } from "./SafeSpaceTickIcon";
import styles from "./SafeSpaceDetailPage.module.css";

interface Props {
  /** Trust tier as a number; the label is composed at render so it localizes.
   * 0 (or falsy) renders the tier-less variant of the title. */
  tier: number;
  reVerified: string;
  verifier: string;
}

/**
 * The "Verified · Trust Tier N" banner atop a verified safe space's detail.
 * Extracted out of `SafeSpaceDetailPage`'s `VerifiedView` so both the
 * safe-spaces hub's own detail page and the directory detail page's inline
 * trust section (`DirectorySpaceTrust`) render the identical trust narrative.
 */
export function SafeSpaceTrustBanner({ tier, reVerified, verifier }: Props) {
  const { t } = useTranslation();
  return (
    <div className={styles.trustBanner}>
      <div className={styles.seal}>
        <SafeSpaceTickIcon />
      </div>
      <div>
        <h3>
          {tier > 0
            ? t("safety:spaces.detail.trust.title", { tier })
            : t("safety:spaces.detail.trust.titleNoTier")}
        </h3>
        <p>
          <Translation
            i18nKey="safety:spaces.detail.trust.body"
            values={{ date: reVerified, verifier }}
            components={{ strong: <strong /> }}
          />
        </p>
      </div>
    </div>
  );
}

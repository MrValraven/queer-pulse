import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SafeSpaceBadgeStatus } from "./SafeSpaceBadgeStatus";
import { SafeSpaceTickIcon } from "./SafeSpaceTickIcon";
import styles from "./SafeSpaceDetailPage.module.css";

interface Props {
  /** Trust tier as a number; the label is composed at render so it localizes.
   * 0 (or falsy) renders the tier-less variant of the title. */
  tier: number;
  reVerified: string;
  verifier: string;
  /**
   * The space's listing slug. WITH it, the banner renders the live badge
   * state instead of the static "verified" narrative, so a suspended badge,
   * one whose annual re-review is overdue, or one still collecting its three
   * independent visits stops reading as fully verified. Without it (the
   * safe-spaces hub's own static demo content) the original banner renders
   * unchanged.
   */
  slug?: string;
  /** The space's name, for the flag control's copy. */
  spaceName?: string;
}

/**
 * The trust banner atop a safe space's detail.
 *
 * `listings.safe_space_status` alone cannot tell the truth here: it still
 * reads `verified` while a suspension stands, says nothing about a badge a
 * year past its re-review, and cannot tell a space still collecting visits
 * from one that met the bar. Passing `slug` swaps this banner for
 * `SafeSpaceBadgeStatus`, which reads `GET /safe-spaces/:slug/badge-state` and
 * renders whichever of those five states is actually true, plus the member's
 * flag affordance.
 */
export function SafeSpaceTrustBanner({
  tier,
  reVerified,
  verifier,
  slug,
  spaceName,
}: Props) {
  const { t } = useTranslation();

  if (slug) {
    return <SafeSpaceBadgeStatus slug={slug} spaceName={spaceName ?? ""} />;
  }

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

import { CheckLine } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AffirmingBaselineNotice } from "./listBusiness/fields/AffirmingBaselineAgreement";
import styles from "./ClaimAffirmingBaselinePledge.module.css";

/**
 * The affirming-baseline pledge inside `DirectoryClaimModal`, extracted as
 * its own component to keep the modal under the 200-line cap.
 *
 * Claiming a listing means becoming its owner, and the API requires
 * `affirmingBaselineAccepted` to be `true` on EVERY claim, including one on a
 * listing that already carries an acceptance: an admin-authored listing is
 * seeded with no acceptance at all (`AdminListingNewPage`), so this is the
 * only place that promise ever gets made for it, and a claim on an
 * already-accepted listing is a re-affirmation by the incoming owner rather
 * than a redundant question. Mirrors `OwnerOfferRow`'s pledge step: the same
 * read-only `AffirmingBaselineNotice` plus a real checkbox, gating the
 * caller's submit button rather than answering for it.
 */
export function ClaimAffirmingBaselinePledge({
  placeName,
  isAgreed,
  isDisabled,
  onChange,
}: {
  placeName: string;
  isAgreed: boolean;
  isDisabled: boolean;
  onChange: (isAgreed: boolean) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className={styles.pledge}>
      <p className={styles.pledgeLead}>
        <Translation
          i18nKey="marketing:directory.detail.claim.pledgeLead"
          values={{ name: placeName }}
          components={{ b: <b /> }}
        />
      </p>
      <AffirmingBaselineNotice />
      <CheckLine
        checked={isAgreed}
        onChange={(isNowAgreed) => {
          if (isDisabled) return;
          onChange(isNowAgreed);
        }}
        title={t("marketing:directory.detail.claim.pledgeAgreeTitle")}
        sub={t("marketing:directory.detail.claim.pledgeAgreeSub")}
      />
    </div>
  );
}

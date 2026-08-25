import { FiHeart } from "react-icons/fi";
import { CheckLine } from "../../../../shared/components/ui";
import { Translation } from "../../../../shared/i18n/Translation";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ANCHOR } from "../listBusiness.data";
import type { ListingForm } from "../useListingForm";
import styles from "./AffirmingBaseline.module.css";

/**
 * The affirming baseline, agreed to as the condition of being listed.
 *
 * This is not a feature the business is opting into and not a badge it earns.
 * Every listing in the directory has agreed to it, which is exactly why it is
 * asked here, once, at submission, and never offered as a per-listing setting
 * afterwards. The API enforces the same thing: it requires the field to be
 * `true` on create and rejects it entirely on update.
 *
 * What is agreed to is a commitment about the business's own conduct toward
 * the people it serves. The copy says plainly that it gives nobody permission
 * to turn anyone away over who they are, because a "we welcome our own"
 * reading of a promise like this is the failure mode worth naming out loud.
 */
export function AffirmingBaselineAgreement({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const { draft, set } = form;

  return (
    <div id={ANCHOR.affirmingBaseline} className={styles.panel}>
      <div className={styles.head}>
        <span className={styles.icon} aria-hidden>
          <FiHeart />
        </span>
        <div className={styles.headText}>
          <h4 className={styles.title}>
            <Translation
              i18nKey="marketing:listBusiness.baseline.title"
              components={{ em: <em /> }}
            />
          </h4>
          <p className={styles.body}>
            {t("marketing:listBusiness.baseline.body")}
          </p>
          <p className={styles.body}>
            {t("marketing:listBusiness.baseline.scope")}
          </p>
        </div>
      </div>

      <CheckLine
        // Coerced, so a draft resumed from before this field existed reads as
        // un-agreed rather than as an undefined the control cannot announce.
        checked={draft.affirmingBaselineAccepted === true}
        onChange={(isAgreed) => set({ affirmingBaselineAccepted: isAgreed })}
        title={t("marketing:listBusiness.baseline.agreeTitle")}
        sub={t("marketing:listBusiness.baseline.agreeSub")}
      />
    </div>
  );
}

/**
 * The same commitment, restated for an owner who is editing a listing that
 * already exists.
 *
 * Read-only on purpose. A listing cannot un-agree to the baseline it only
 * exists because of, so rendering a switch here would turn a condition back
 * into a setting, and the API would reject the change anyway.
 */
export function AffirmingBaselineNotice() {
  const { t } = useTranslation();

  return (
    <p className={styles.notice}>
      <span className={styles.noticeIcon} aria-hidden>
        <FiHeart />
      </span>
      <span>
        <span className={styles.noticeTitle}>
          {t("marketing:listBusiness.baseline.noticeTitle")}
        </span>
        {t("marketing:listBusiness.baseline.noticeBody")}
      </span>
    </p>
  );
}
